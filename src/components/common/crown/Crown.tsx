import Image from "next/image";

interface CrownProps {
	width?: number;
	height?: number;
}

const Crown = () => {
	return (
			<Image
				src="/images/crown/crown01.png"
				alt="crown"
				width={100}
				height={100}
			/>
	);
};

export default Crown;
