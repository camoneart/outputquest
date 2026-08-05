import { getUserWithArticles } from "@/features/user/_lib/fetcher";
import { PlatformType } from "@/features/posts/types";
import * as Posts from "@/features/posts/components";
import styles from "./PostsListWithData.module.css";

/**
 * PostsListWithData (Server Component)
 *
 * Zenn記事一覧を取得して表示するServer Component
 */
// データ取得はJSXの構築と分離する。
// try/catch内でJSXを構築しても、Reactは即座にレンダリングしないため
// レンダリング時のエラーはcatchされない (react-hooks/error-boundaries)。
const loadPosts = async () => {
	try {
		const { articles } = await getUserWithArticles();

		// platformType: "zenn" を各記事に設定
		return articles.map((article) => ({
			...article,
			platformType: "zenn" as PlatformType,
		}));
	} catch (error) {
		console.error("Zenn記事の取得エラー:", error);
		return null;
	}
};

const PostsListWithData = async () => {
	const postsData = await loadPosts();

	if (!postsData) {
		return (
			<div className={styles["error-message"]}>
				Zennの記事データの取得中にエラーが発生しました。
			</div>
		);
	}

	return <Posts.PostsList postsData={postsData} />;
};

export default PostsListWithData;
