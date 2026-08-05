import { getUserWithArticles } from "@/features/user/_lib/fetcher";
import {
	isAcquiredByHeroLevel,
	heroLevelAndItemRelation,
	customItemNames,
	customItemDescriptions,
	customItemImages,
	customItemSilhouetteImages,
} from "@/features/items/data/itemsData";
import * as ItemDetail from "@/features/item-detail/components";
import styles from "./ItemDetailCard.module.css";

interface ItemDetailCardProps {
	itemId: number;
}

// データ取得はJSXの構築と分離する。
// try/catch内でJSXを構築しても、Reactは即座にレンダリングしないため
// レンダリング時のエラーはcatchされない (react-hooks/error-boundaries)。
const loadItemDetail = async (itemId: number) => {
	try {
		const { articleCount, isGuestUser } = await getUserWithArticles();
		const currentLevel = isGuestUser ? 1 : articleCount;

		// アイテムの入手状態を判定
		const isAcquired = !isGuestUser && isAcquiredByHeroLevel(itemId, currentLevel);

		// アイテムを入手するために必要なレベル
		const requiredLevel = heroLevelAndItemRelation[itemId] || itemId;

		// レベル差を計算（マイナスにならないようにする）
		const levelDifference = Math.max(0, requiredLevel - currentLevel);

		// アイテムの名前と説明文を取得
		const itemName = isAcquired ? customItemNames[itemId] || `アイテム${itemId}` : null;
		const itemDescription = isAcquired
			? customItemDescriptions[itemId] || `このアイテムの説明はありません。`
			: null;

		// 画像パスを取得
		const acquiredImagePath = customItemImages[itemId]
			? `/images/items-page/acquired-icon/${customItemImages[itemId]}`
			: `/images/items-page/acquired-icon/item-${itemId}.png`;
		const unacquiredImagePath = `/images/items-page/unacquired-icon/${customItemSilhouetteImages[itemId]}`;

		return {
			isAcquired,
			isGuestUser,
			itemName,
			itemDescription,
			requiredLevel,
			levelDifference,
			acquiredImagePath,
			unacquiredImagePath,
		};
	} catch (error) {
		console.error("アイテム詳細データ取得エラー:", error);
		return null;
	}
};

const ItemDetailCard = async ({ itemId }: ItemDetailCardProps) => {
	const data = await loadItemDetail(itemId);

	if (!data) {
		return <p className={styles["error-message"]}>アイテム詳細データの取得に失敗しました。</p>;
	}

	// Client Componentにデータを渡す
	return (
		<ItemDetail.ItemDetailCardClient
			itemId={itemId}
			isAcquired={data.isAcquired}
			isGuestUser={data.isGuestUser}
			itemName={data.itemName}
			itemDescription={data.itemDescription}
			requiredLevel={data.requiredLevel}
			levelDifference={data.levelDifference}
			acquiredImagePath={data.acquiredImagePath}
			unacquiredImagePath={data.unacquiredImagePath}
		/>
	);
};

export default ItemDetailCard;
