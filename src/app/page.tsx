import dynamic from "next/dynamic";
import styles from "./Home.module.css";
import * as Home from "@/features/home/components/index";
import * as Hero from "@/features/hero/components";
import Crown from "@/components/common/crown/Crown";

// Motion使用コンポーネントを動的インポート（Client Bundleを最小化）
const HomeAnimatedTitle = dynamic(
	() =>
		import("@/features/home/components/home-animated-title/HomeAnimatedTitle")
);

export default function HomePage() {
	return (
		<main className={`${styles["main"]}`}>
			<Hero.HeroBg />
			<div className={`${styles["main-container"]}`}>
				<Crown />
				<HomeAnimatedTitle />
				<Home.HomeStartButton />
			</div>
		</main>
	);
}
