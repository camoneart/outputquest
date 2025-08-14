"use client";

import { useEffect, useState } from "react";
import { useUser, useSession } from "@clerk/nextjs";

export function SignOutHandler({ children }: { children: React.ReactNode }) {
	const { user } = useUser();
	const { session } = useSession();
	const [previousSessionId, setPreviousSessionId] = useState<string | null>(
		null
	);
	const [previousUserId, setPreviousUserId] = useState<string | null>(null);

	useEffect(() => {
		// 初回マウント時の処理
		if (previousSessionId === null && session) {
			setPreviousSessionId(session.id);
		}
		if (previousUserId === null && user?.id) {
			setPreviousUserId(user.id);
		}

		// セッションが存在していたが、なくなった場合（サインアウト）
		if (previousSessionId && !session && previousUserId) {
			// ユーザーIDをクリア（状態管理のみ）
			// DBのデータは保持する仕様のため、リセット処理は行わない
			setPreviousUserId(null);
		}

		// 現在のセッションIDとユーザーIDを更新
		if (session?.id) {
			setPreviousSessionId(session.id);
		}
		if (user?.id) {
			setPreviousUserId(user.id);
		}
	}, [session, user, previousSessionId, previousUserId]);

	return <>{children}</>;
}
