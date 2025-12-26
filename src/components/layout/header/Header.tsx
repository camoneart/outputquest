"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import AudioPlayer from "@/components/common/audio/audio-player/AudioPlayer";
import { usePathname } from "next/navigation";
import { useClickSound } from "@/components/common/audio/click-sound/ClickSound";
import HamburgerMenu from "@/components/elements/hamburger-menu/HamburgerMenu";
import Gnav from "@/components/layout/gnav/Gnav";
import styles from "./Header.module.css";
import Crown from "@/components/common/crown/Crown";

export const Header = () => {
	const pathname = usePathname();
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const { playClickSound } = useClickSound({
		soundPath: "/audio/return-sound.mp3",
		volume: 0.5,
	});

	// audioPlayer の定義をここに移動
	const audioPlayer = (
		<AudioPlayer src="/audio/Small_World.mp3" size={17} color="#fff" volume={0.3} />
	);

	const toggleMenu = () => {
		setIsMenuOpen(!isMenuOpen);
	};

	// パスが変更されたときにメニューを閉じる
	useEffect(() => {
		setIsMenuOpen(false);
	}, [pathname]);

	// メニューが開いているときに画面外をクリックすると閉じる
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			const hamburger = document.querySelector(`.hamburger`);

			if (isMenuOpen && hamburger && !hamburger.contains(event.target as Node)) {
				setIsMenuOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);

		// スクロールロックの制御
		if (isMenuOpen) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "";
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
			document.body.style.overflow = "";
		};
	}, [isMenuOpen]);

	return (
		<header className={`${styles["header"]}`}>
			<div className={`${pathname === "/" ? styles[""] : styles["header-bg"]}`}>
				<div
					className={`${styles["header-container"]} ${
						pathname === "/" ? styles["home-header-container"] : styles["child-header-container"]
					}`}
				>
					{pathname !== "/" && (
						<div className={`${styles["header__title"]}`}>
							<Link
								href="/"
								className={`${styles["header__title-link"]}`}
								onClick={() => playClickSound()}
							>
								<div className={`${styles["crown-container"]}`}>
									<Crown />
								</div>
								<span>OUTPUT QUEST</span>
							</Link>
						</div>
					)}
					<div className={`${styles["header__items"]}`}>
						{audioPlayer}
						{pathname !== "/" && <HamburgerMenu toggleMenu={toggleMenu} isOpen={isMenuOpen} />}
					</div>
				</div>
				{pathname !== "/" && (
					<Gnav
						isMenuOpen={isMenuOpen}
						toggleMenu={toggleMenu}
						className={`${styles["header-gnav"]}`}
					/>
				)}
			</div>
		</header>
	);
};
