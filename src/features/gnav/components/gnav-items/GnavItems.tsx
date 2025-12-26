"use client";

import { navigationItems } from "@/features/navigation/data/navigationItems";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useClickSound } from "@/components/common/audio/click-sound/ClickSound";
import styles from "./GnavItems.module.css";
import Image from "next/image";

const GnavItems = () => {
	const pathname = usePathname();
	const { playClickSound } = useClickSound({
		soundPath: "/audio/click-sound_decision.mp3",
		volume: 0.5,
		delay: 190, // 190ミリ秒 = 0.19秒の遅延
	});

	const handleLinkClick = () => {
		playClickSound();
	};

	return (
		<>
			{navigationItems.map((item) => {
				const isActive = pathname === item.href;

				return (
					<li key={item.href} className={`${styles["gnav-item"]}`}>
						{isActive ? (
							<div
								key={item.href}
								className={`${styles["gnav-item-link-container"]} ${styles["gnav-item-active"]}`}
							>
								<div className={`${styles["gnav-item-not-link"]}`}>
									<div
										className={`${styles["gnav-item-content"]} ${styles["gnav-item-content-active"]}`}
									>
										<Image
											src={item.icon || "/images/nav-icon/default-icon.svg"}
											alt={item.alt || item.title}
											width={item.width || 20}
											height={item.height || 20}
											priority={true}
											className={`${styles["gnav-item-icon"]}`}
											data-nav-id={item.id}
										/>
										<h3 className={`${styles["gnav-item-title"]}`}>{item.title}</h3>
									</div>
								</div>
							</div>
						) : (
							<div
								key={item.href}
								className={`${styles["gnav-item-link-container"]}`}
							>
								<Link
									href={item.href}
									className={`${styles["gnav-item-link"]}`}
									onClick={() => handleLinkClick()}
								>
									<div className={`${styles["gnav-item-content"]}`}
									>
										<Image
											src={item.icon || "/images/nav-icon/default-icon.svg"}
											alt={item.alt || item.title}
											width={item.width || 20}
											height={item.height || 20}
											priority={true}
											className={`${styles["gnav-item-icon"]}`}
											data-nav-id={item.id}
										/>
										<h3 className={`${styles["gnav-item-title"]}`}>{item.title}</h3>
									</div>
								</Link>
							</div>
						)}
					</li>
				);
			})}
		</>
	);
};

export default GnavItems;
