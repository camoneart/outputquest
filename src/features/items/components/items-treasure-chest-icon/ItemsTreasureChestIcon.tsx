import Image from "next/image";

interface ItemsTreasureChestProps {
	className?: string;
	classNameClose?: string;
	classNameOpen?: string;
	width?: number;
	height?: number;
}

const ItemsTreasureChestIcon: React.FC<ItemsTreasureChestProps> = ({
	width = 40,
	height = 40,
	className,
	classNameClose,
	classNameOpen,
}) => {
	return (
		<div className={className}>
			<Image
				src="/images/items-page/unacquired-icon/treasure-chest-close01.png"
				alt="未入手のアイテム"
				width={width}
				height={height}
				className={classNameClose}
			/>
			<Image
				src="/images/items-page/unacquired-icon/treasure-chest-open01.png"
				alt="未入手のアイテム"
				width={width}
				height={height}
				className={classNameOpen}
			/>
		</div>
	);
};

export default ItemsTreasureChestIcon;
