import { cache } from "react";

/**
 * ユーザー情報の型定義
 */
export type UserInfo = {
	success: boolean;
	user?: {
		zennUsername?: string;
	};
};

/**
 * ユーザー情報を取得する関数（Request Memoization対応）
 *
 * React 19のcache()を使用して、同一リクエスト内で複数回呼び出されても
 * 実際のAPI呼び出しは1回のみ実行される。
 *
 * @returns ユーザー情報
 */
export const getUserInfo = cache(async (): Promise<UserInfo> => {
	try {
		const response = await fetch("/api/user");
		const data = await response.json();
		return data;
	} catch (error) {
		console.error("Failed to fetch user info:", error);
		return { success: false };
	}
});
