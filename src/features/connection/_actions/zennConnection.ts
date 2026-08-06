"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { CacheTags } from "@/lib/cache-tags";
import { UserInfo, ZennArticle } from "@/features/connection/types";
import { cleanUsername, isValidZennUsernameFormat } from "@/features/connection/utils";
import { SUSPICIOUS_FIXED_COUNT } from "@/features/connection/constants";

// Server Action のレスポンス型
export type ZennConnectionState = {
	success: boolean;
	message?: string;
	error?: string;
	user?: UserInfo;
	articleCount?: number;
};

// Zenn API レスポンス型
type ZennApiArticle = {
	id: number;
	post_type: string;
	title: string;
	slug: string;
	emoji: string;
	published_at: string;
	path: string;
	article_type: string;
	user: {
		username: string;
		name: string;
		avatar_small_url: string;
	};
};

type ZennApiResponse = {
	articles: ZennApiArticle[];
	next_page: string | null;
};

// 記事データ変換
const transformZennArticle = (article: ZennApiArticle): ZennArticle => ({
	id: article.id.toString(),
	title: article.title,
	url: `https://zenn.dev${article.path}`,
	category: article.article_type,
	publishedAt: article.published_at,
	date: article.published_at,
	platformType: "zenn" as const,
	emoji: article.emoji,
});

// タイムアウト付き fetch
const fetchWithTimeout = async (url: string, timeout: number = 8000): Promise<Response> => {
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), timeout);

	try {
		const response = await fetch(url, {
			signal: controller.signal,
			headers: {
				"User-Agent": "Mozilla/5.0 (compatible; ZennBot/1.0)",
				"Cache-Control": "no-cache, no-store, must-revalidate",
			},
		});
		return response;
	} finally {
		clearTimeout(timeoutId);
	}
};

// Zenn API から記事を取得
const fetchZennArticles = async (
	username: string
): Promise<{
	success: boolean;
	articles: ZennArticle[];
	totalCount: number;
	error?: string;
}> => {
	try {
		const timestamp = Date.now();
		const randomId = crypto.randomUUID();
		const apiUrl = `https://zenn.dev/api/articles?username=${encodeURIComponent(username)}&_t=${timestamp}&_r=${randomId}`;

		const response = await fetchWithTimeout(apiUrl);

		if (!response.ok) {
			return {
				success: false,
				articles: [],
				totalCount: 0,
				error: `HTTP ${response.status}: ${response.statusText}`,
			};
		}

		const data: ZennApiResponse = await response.json();

		if (!data.articles) {
			return {
				success: true,
				articles: [],
				totalCount: 0,
			};
		}

		const articles = data.articles.map(transformZennArticle);

		return {
			success: true,
			articles,
			totalCount: data.articles.length,
		};
	} catch (error) {
		console.error("Zenn API fetch error:", error);
		return {
			success: false,
			articles: [],
			totalCount: 0,
			error: error instanceof Error ? error.message : "Zenn APIの呼び出しに失敗しました",
		};
	}
};

/**
 * Zennアカウント連携を実行するServer Action
 *
 * 処理フロー:
 * 1. 認証チェック
 * 2. 入力検証
 * 3. Zennアカウント存在確認
 * 4. 疑わしい固定カウントチェック（APIバグ対策）
 * 5. 記事0件チェック
 * 6. プロフィール作成/更新
 * 7. キャッシュ無効化
 */
export async function connectZenn(
	prevState: ZennConnectionState | null,
	formData: FormData
): Promise<ZennConnectionState> {
	try {
		// 1. 認証チェック
		const { userId } = await auth();
		const clerkUser = await currentUser();

		if (!userId || !clerkUser) {
			return { success: false, error: "ログインが必要です" };
		}

		// 2. 入力検証
		const rawUsername = formData.get("zennUsername") as string;

		if (!rawUsername) {
			return { success: false, error: "ユーザー名を入力してください" };
		}

		const username = cleanUsername(rawUsername);

		if (!isValidZennUsernameFormat(username)) {
			return {
				success: false,
				error:
					"ユーザー名が無効です。小文字英数字 (a-z, 0-9)、アンダースコア (_)、ハイフン (-) のみ使用できます。",
			};
		}

		// 3. Zennアカウント存在確認
		const zennResponse = await fetchZennArticles(username);

		if (!zennResponse.success) {
			return {
				success: false,
				error: zennResponse.error || "ユーザー名の検証に失敗しました",
			};
		}

		// 4. 疑わしい固定カウントチェック（APIバグ対策）
		if (zennResponse.totalCount === SUSPICIOUS_FIXED_COUNT) {
			const randomUsername = `test_${crypto.randomUUID().slice(0, 8)}`;
			const testResponse = await fetchZennArticles(randomUsername);

			if (testResponse.success && testResponse.totalCount === SUSPICIOUS_FIXED_COUNT) {
				return {
					success: false,
					error: "存在しないユーザー名です。正しいZennユーザー名を入力してください。",
				};
			}
		}

		// 5. 記事0件チェック
		if (zennResponse.articles.length === 0) {
			return {
				success: false,
				error: "このユーザー名のアカウントは記事を投稿していないため連携できません",
			};
		}

		// 6. プロフィール作成/更新
		const articleCount = zennResponse.totalCount;
		const emailFromClerk =
			clerkUser.emailAddresses.find((email) => email.id === clerkUser.primaryEmailAddressId)
				?.emailAddress || clerkUser.emailAddresses[0]?.emailAddress;

		if (!emailFromClerk) {
			return {
				success: false,
				error: "メールアドレスが取得できませんでした",
			};
		}

		const displayName = clerkUser.firstName
			? `${clerkUser.firstName} ${clerkUser.lastName || ""}`.trim()
			: username;

		// 既存ユーザーをチェック
		const existingUser = await prisma.user.findFirst({
			where: {
				OR: [{ clerkId: userId }, { email: emailFromClerk }],
			},
			select: { id: true },
		});

		let user: UserInfo;

		if (existingUser) {
			// 既存ユーザー更新
			const updatedUser = await prisma.user.update({
				where: { id: existingUser.id },
				data: {
					clerkId: userId,
					email: emailFromClerk,
					zennUsername: username,
					zennArticleCount: articleCount,
					level: articleCount,
					displayName,
					profileImage: clerkUser.imageUrl,
				},
				select: {
					id: true,
					clerkId: true,
					displayName: true,
					zennUsername: true,
					profileImage: true,
					zennArticleCount: true,
					level: true,
				},
			});
			user = updatedUser as UserInfo;
		} else {
			// 新規ユーザー作成
			const newUser = await prisma.user.create({
				data: {
					clerkId: userId,
					username,
					email: emailFromClerk,
					zennUsername: username,
					zennArticleCount: articleCount,
					level: articleCount,
					displayName,
					profileImage: clerkUser.imageUrl,
				},
				select: {
					id: true,
					clerkId: true,
					displayName: true,
					zennUsername: true,
					profileImage: true,
					zennArticleCount: true,
					level: true,
				},
			});
			user = newUser as UserInfo;
		}

		// 7. キャッシュ無効化
		revalidateTag(CacheTags.user(userId), "max");
		revalidateTag(CacheTags.zennArticles(username), "max");
		revalidateTag(CacheTags.dashboard(userId), "max");

		return {
			success: true,
			message: `Zennのアカウント連携が完了しました。${articleCount}件の記事が見つかりました。`,
			user,
			articleCount,
		};
	} catch (error) {
		console.error("Zenn連携エラー:", error);
		return {
			success: false,
			error: "予期しないエラーが発生しました。時間をおいて再度お試しください。",
		};
	}
}

/**
 * Zenn記事を同期するServer Action
 */
export async function syncZennArticles(zennUsername: string): Promise<ZennConnectionState> {
	try {
		// 認証チェック
		const { userId } = await auth();

		if (!userId) {
			return { success: false, error: "ログインが必要です" };
		}

		// ユーザー名検証
		if (!zennUsername) {
			return { success: false, error: "Zennユーザー名が設定されていません" };
		}

		const username = cleanUsername(zennUsername);

		if (!isValidZennUsernameFormat(username)) {
			return {
				success: false,
				error: "ユーザー名が無効です",
			};
		}

		// Zenn API呼び出し
		const zennResponse = await fetchZennArticles(username);

		if (!zennResponse.success) {
			return {
				success: false,
				error: zennResponse.error || "記事の取得に失敗しました",
			};
		}

		// 疑わしい固定カウントチェック
		if (zennResponse.totalCount === SUSPICIOUS_FIXED_COUNT) {
			const randomUsername = `test_${crypto.randomUUID().slice(0, 8)}`;
			const testResponse = await fetchZennArticles(randomUsername);

			if (testResponse.success && testResponse.totalCount === SUSPICIOUS_FIXED_COUNT) {
				return {
					success: false,
					error: "Zennとの連携に失敗しました。存在しないユーザー名です。",
				};
			}
		}

		const articleCount = zennResponse.totalCount;

		// 記事数が0件の場合の処理
		if (articleCount === 0) {
			// 連携を自動解除
			const user = await prisma.user.update({
				where: { clerkId: userId },
				data: {
					zennUsername: "",
					zennArticleCount: 0,
					level: 1,
				},
				select: {
					id: true,
					clerkId: true,
					displayName: true,
					zennUsername: true,
					profileImage: true,
					zennArticleCount: true,
					level: true,
				},
			});

			// キャッシュ無効化
			revalidateTag(CacheTags.user(userId), "max");
			revalidateTag(CacheTags.zennArticles(username), "max");
			revalidateTag(CacheTags.dashboard(userId), "max");

			return {
				success: true,
				message: "連携中のアカウントの記事数が0件になったため連携を解除しました",
				user: user as UserInfo,
				articleCount: 0,
			};
		}

		// 記事数を更新
		const user = await prisma.user.update({
			where: { clerkId: userId },
			data: {
				zennArticleCount: articleCount,
				level: articleCount,
			},
			select: {
				id: true,
				clerkId: true,
				displayName: true,
				zennUsername: true,
				profileImage: true,
				zennArticleCount: true,
				level: true,
			},
		});

		// キャッシュ無効化
		revalidateTag(CacheTags.user(userId), "max");
		revalidateTag(CacheTags.zennArticles(username), "max");
		revalidateTag(CacheTags.dashboard(userId), "max");

		return {
			success: true,
			message: `同期が完了しました。${articleCount}件の記事が見つかりました。`,
			user: user as UserInfo,
			articleCount,
		};
	} catch (error) {
		console.error("Zenn同期エラー:", error);

		// ユーザーが見つからない場合
		if (error && typeof error === "object" && "code" in error && error.code === "P2025") {
			return {
				success: false,
				error: "ユーザー情報が見つかりません。再度ログインしてください。",
			};
		}

		return {
			success: false,
			error: "同期中にエラーが発生しました。時間をおいて再度お試しください。",
		};
	}
}

/**
 * Zenn連携を解除するServer Action
 */
export async function releaseZennConnection(): Promise<ZennConnectionState> {
	try {
		// 認証チェック
		const { userId } = await auth();

		if (!userId) {
			return { success: false, error: "ログインが必要です" };
		}

		// 現在のユーザー情報を取得（キャッシュ無効化用）
		const currentUserData = await prisma.user.findUnique({
			where: { clerkId: userId },
			select: { zennUsername: true },
		});

		const oldZennUsername = currentUserData?.zennUsername;

		// 連携解除（データリセット）
		const user = await prisma.user.update({
			where: { clerkId: userId },
			data: {
				zennUsername: "",
				zennArticleCount: 0,
				level: 1,
			},
			select: {
				id: true,
				clerkId: true,
				displayName: true,
				zennUsername: true,
				profileImage: true,
				zennArticleCount: true,
				level: true,
			},
		});

		// キャッシュ無効化
		revalidateTag(CacheTags.user(userId), "max");
		revalidateTag(CacheTags.dashboard(userId), "max");
		if (oldZennUsername) {
			revalidateTag(CacheTags.zennArticles(oldZennUsername), "max");
		}

		return {
			success: true,
			message: "Zennアカウントの連携を解除しました",
			user: user as UserInfo,
			articleCount: 0,
		};
	} catch (error) {
		console.error("連携解除エラー:", error);

		// ユーザーが見つからない場合
		if (error && typeof error === "object" && "code" in error && error.code === "P2025") {
			return {
				success: false,
				error: "ユーザー情報が見つかりません。再度ログインしてください。",
			};
		}

		return {
			success: false,
			error: "連携解除中にエラーが発生しました。時間をおいて再度お試しください。",
		};
	}
}
