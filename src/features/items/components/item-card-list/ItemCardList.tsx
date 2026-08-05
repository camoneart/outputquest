import { getUserWithArticles } from "@/features/user/_lib/fetcher";
import { updateItemsByLevel } from "@/features/items/data/itemsData";
import * as Items from "@/features/items/components";
import styles from "./ItemCardList.module.css";

/**
 * ItemCardList (Server Component)
 *
 * アイテム一覧を取得して表示するServer Component
 */
// データ取得はJSXの構築と分離する。
// try/catch内でJSXを構築しても、Reactは即座にレンダリングしないため
// レンダリング時のエラーはcatchされない (react-hooks/error-boundaries)。
const loadItems = async () => {
	try {
		const { articleCount, isGuestUser } = await getUserWithArticles();
		return { items: updateItemsByLevel(articleCount), isGuestUser };
	} catch (error) {
		console.error("アイテムデータ取得エラー:", error);
		return null;
	}
};

const ItemCardList = async () => {
	const data = await loadItems();

	if (!data) {
		return <p className={styles["error-message"]}>アイテムデータの取得に失敗しました。</p>;
	}

	return <Items.ItemCardListClient items={data.items} isGuestUser={data.isGuestUser} />;
};

export default ItemCardList;
