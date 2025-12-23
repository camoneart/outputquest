import Image from "next/image";
import styles from "./Crown.module.css";

const Crown = () => {
	return (
		<div className={`${styles["crown-container"]}`}>
			<Image
				src="/images/crown/crown.png"
				alt="crown"
				width={50}
				height={50}
				className={`${styles["crown"]}`}
			/>
		</div>
	);
};

export default Crown;
