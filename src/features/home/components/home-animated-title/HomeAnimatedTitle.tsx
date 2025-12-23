"use client";

import { motion } from "motion/react";
import { FC } from "react";
import styles from "./HomeAnimatedTitle.module.css";

interface HomeAnimatedTitleProps {
	delay?: number;
	duration?: number;
}

const HomeAnimatedTitle: FC<HomeAnimatedTitleProps> = ({ delay = 0.2, duration = 6 }) => {
	return (
		<motion.div
			className={`${styles["title-container"]}`}
			initial={{ y: -600 }}
			animate={{ y: 0 }}
			transition={{
				delay: delay,
				duration: duration,
			}}
		>
			<h1 className={`${styles["title"]}`}>
				<span>OUTPUT</span>
				<span>QUEST</span>
			</h1>
			<h2 className={`${styles["subtitle"]}`}>−叡智の継承者−</h2>
		</motion.div>
	);
};

export default HomeAnimatedTitle;
