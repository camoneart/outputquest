"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useEffect, useState } from "react";

type ViewState = "initial" | "video" | "gap" | "image";

export function HeroBg() {
	const [viewState, setViewState] = useState<ViewState>("initial");

	useEffect(() => {
		const hasVisited = sessionStorage.getItem("hero-visited");

		if (!hasVisited) {
			setViewState("video");
			sessionStorage.setItem("hero-visited", "true");
		} else {
			setViewState("image");
		}
	}, []);

	const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
		const video = e.currentTarget;
		// 残り時間が1秒（フェードアウト時間）以下になったらフェードアウト開始
		// これにより動画が止まる前にフェードアウトが始まり、UXが向上する
		if (viewState === "video" && video.duration - video.currentTime <= 1) {
			setViewState("gap");
		}
	};

	return (
		<div className="fixed inset-0 -z-10 overflow-hidden bg-black">
			{/* Image Layer */}
			<motion.div
				className="absolute inset-0 size-full"
				initial={{ opacity: 0 }}
				animate={{ opacity: viewState === "image" ? 1 : 0 }}
				transition={{ duration: 1 }}
			>
				<Image
					src="/images/hero/castle-background.jpg"
					alt=""
					fill
					priority
					sizes="100vw"
					className="object-cover object-center"
				/>
			</motion.div>

			{/* Video Layer */}
			<AnimatePresence
				onExitComplete={() => {
					// 動画が完全に消えたら（exitアニメーション完了後）
					// 0.5秒の暗転期間を経て画像を表示
					setTimeout(() => {
						setViewState("image");
					}, 500);
				}}
			>
				{viewState === "video" && (
					<motion.video
						key="hero-video"
						src="/videos/hero/castle-background.mp4"
						className="absolute inset-0 size-full object-cover"
						autoPlay
						muted
						playsInline
						onTimeUpdate={handleTimeUpdate}
						initial={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 1 }}
					/>
				)}
			</AnimatePresence>

			{/* Overlay */}
			<div className="absolute inset-0 bg-black/70 backdrop-blur-[3px]" />
		</div>
	);
}
