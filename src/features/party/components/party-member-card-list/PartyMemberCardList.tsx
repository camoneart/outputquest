import { getUserWithArticles } from "@/features/user/_lib/fetcher";
import { updatePartyMembersByLevel } from "@/features/party/data/partyMemberData";
import * as Party from "@/features/party/components";
import styles from "./PartyMemberCardList.module.css";

/**
 * PartyMemberCardList (Server Component)
 *
 * パーティメンバー一覧を取得して表示するServer Component
 */
// データ取得はJSXの構築と分離する。
// try/catch内でJSXを構築しても、Reactは即座にレンダリングしないため
// レンダリング時のエラーはcatchされない (react-hooks/error-boundaries)。
const loadPartyMembers = async () => {
	try {
		const { articleCount, isGuestUser } = await getUserWithArticles();
		return { members: updatePartyMembersByLevel(articleCount), isGuestUser };
	} catch (error) {
		console.error("仲間データ取得エラー:", error);
		return null;
	}
};

const PartyMemberCardList = async () => {
	const data = await loadPartyMembers();

	if (!data) {
		return <p className={styles["error-message"]}>仲間データの取得に失敗しました。</p>;
	}

	return <Party.PartyMemberCardListClient members={data.members} isGuestUser={data.isGuestUser} />;
};

export default PartyMemberCardList;
