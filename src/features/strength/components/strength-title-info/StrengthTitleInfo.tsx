import { getUserWithArticles } from "@/features/user/_lib/fetcher";
import styles from "./StrengthTitleInfo.module.css";
import * as Strength from "@/features/strength/components";

/**
 * StrengthTitleInfo (Server Component)
 *
 * 称号情報を取得してStrengthTitleInfoClientに渡す
 */
// データ取得はJSXの構築と分離する。
// try/catch内でJSXを構築しても、Reactは即座にレンダリングしないため
// レンダリング時のエラーはcatchされない (react-hooks/error-boundaries)。
const loadTitleInfo = async () => {
	try {
		const { articleCount, isGuestUser } = await getUserWithArticles();
		return { heroLevel: Math.max(articleCount, 1), isGuestUser }; // 最低レベル1
	} catch (error) {
		console.error("称号情報の取得エラー:", error);
		return null;
	}
};

const StrengthTitleInfo = async () => {
	const data = await loadTitleInfo();

	if (data) {
		return (
			<Strength.StrengthTitleInfoClient heroLevel={data.heroLevel} isGuestUser={data.isGuestUser} />
		);
	}

	return (
		<div className={styles["strength-title-info"]}>
			<div className={styles["strength-title-info-content"]}>
				<div className={styles["strength-title-box"]}>
					<h2 className={styles["strength-title-title"]}>称号</h2>
					<div className={styles["error-text"]}>データの取得中にエラーが発生しました。</div>
				</div>
			</div>
		</div>
	);
};

export default StrengthTitleInfo;
