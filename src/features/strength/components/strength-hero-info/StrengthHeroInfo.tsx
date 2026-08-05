import Image from "next/image";
import { getUserWithArticles } from "@/features/user/_lib/fetcher";
import { strengthHeroData } from "@/features/strength/data/strengthHeroData";
import heroPlateImage from "@/../public/images/hero/hero_plate.png";
import crown01EdgeImage from "@/../public/images/crown/crown01-edge.png";
import styles from "./StrengthHeroInfo.module.css";

/**
 * StrengthHeroInfo (Server Component)
 *
 * 勇者のレベル情報を取得して表示する
 */
// データ取得はJSXの構築と分離する。
// try/catch内でJSXを構築しても、Reactは即座にレンダリングしないため
// レンダリング時のエラーはcatchされない (react-hooks/error-boundaries)。
const loadHeroInfo = async () => {
	try {
		const { zennUsername, articleCount } = await getUserWithArticles();

		// レベル計算（1投稿 = 1レベル）
		const calculatedLevel = Math.max(articleCount, 1); // 最低レベル1

		const heroData = {
			...strengthHeroData,
			level: calculatedLevel,
			currentExp: 40,
			nextLevelExp: 100,
			remainingArticles: 1,
		};

		// 経験値の進捗率をパーセンテージで計算
		const expProgressPercent = (heroData.currentExp / heroData.nextLevelExp) * 100;

		return { zennUsername, heroData, expProgressPercent };
	} catch (error) {
		console.error("Zenn記事の取得エラー:", error);
		return null;
	}
};

const StrengthHeroInfo = async () => {
	const data = await loadHeroInfo();

	if (!data) {
		return (
			<div className={styles["strength-hero-info"]}>
				<div className={styles["strength-hero-info-content"]}>
					<h2 className={styles["strength-hero-info-title"]}>勇者のレベル</h2>
					<div className={styles["error-text"]}>データの取得中にエラーが発生しました。</div>
				</div>
			</div>
		);
	}

	const { zennUsername, heroData, expProgressPercent } = data;

	return (
		<div className={styles["strength-hero-info"]}>
			<div className={styles["strength-hero-info-content"]}>
				<h2 className={styles["strength-hero-info-title"]}>勇者のレベル</h2>
				<div className={styles["strength-hero-info-content-head"]}>
					{/* 勇者のアイコン　*/}
					<div className={styles["strength-hero-box"]}>
						<div className={styles["strength-hero-icon-box"]}>
							<Image
								src={heroPlateImage}
								alt={"勇者"}
								width={250}
								height={250}
								preload={true}
								className={`${styles["strength-hero-icon-image"]}`}
							/>
						</div>
						<div className={styles["strength-hero-name-box"]}>
							<h3 className={`${styles["strength-hero-name"]}`}>
								<Image
									src={crown01EdgeImage}
									alt="王冠"
									width={100}
									height={100}
									preload={true}
									className={`${styles["strength-hero-name-icon"]}`}
								/>
								<span>
									{heroData.name}(@{zennUsername})
								</span>
							</h3>
						</div>
					</div>
					{/* レベル表示 */}
					<div className={styles["strength-level-info"]}>
						<div className={`${styles["strength-level-display-box"]}`}>
							<div className={`${styles["strength-level-display"]}`}>
								<span className={`${styles["strength-level-display-text"]}`}>Lv</span>
								<span className={`${styles["strength-level-display-value"]}`}>
									{heroData.level}
								</span>
							</div>
						</div>
					</div>
				</div>
				{/* 経験値バー */}
				<div className={styles["strength-level-progress-info"]}>
					<div className={`${styles["strength-level-progress-box"]}`}>
						<div className={`${styles["strength-level-progress-content"]}`}>
							<span className={`${styles["strength-level-progress-text"]}`}>次のレベルまで：</span>
							<div className={`${styles["strength-level-progress-info-remaining-articles"]}`}>
								<em className={`${styles["strength-level-progress-info-remaining-articles-em"]}`}>
									{heroData.remainingArticles}
								</em>
								<span
									className={`${styles["strength-level-progress-info-remaining-articles-unit"]}`}
								>
									記事
								</span>
							</div>
						</div>
						<div className={`${styles["strength-level-progress-gauge-container"]}`}>
							<Image
								src="/images/common/exp.svg"
								alt="EXP"
								width={35}
								height={35}
								preload={true}
								className={`${styles["strength-level-progress-exp-icon"]}`}
							/>
							<div className={`${styles["strength-level-progress-gauge-box"]}`}>
								<div
									className={`${styles["strength-level-progress-gauge"]}`}
									style={{ width: `${expProgressPercent}%` }}
								></div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default StrengthHeroInfo;
