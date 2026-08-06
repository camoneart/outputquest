"use client";

import "client-only";

import { useEffect, Dispatch, SetStateAction } from "react";
import type { UserResource } from "@clerk/nextjs/types";
import { SESSION_ID_KEY, LOGOUT_FLAG_KEY } from "@/features/connection/constants";
import { storage } from "@/utils/storage";

interface UseSessionManagementProps {
	user: UserResource | null | undefined;
	isLoaded: boolean;
	setWasLoggedOut: Dispatch<SetStateAction<boolean>>;
	setIsNewSession: Dispatch<SetStateAction<boolean>>;
	setZennUsername: Dispatch<SetStateAction<string>>;
}

export const useSessionManagement = ({
	user,
	isLoaded,
	setWasLoggedOut,
	setIsNewSession,
	setZennUsername,
}: UseSessionManagementProps) => {
	useEffect(() => {
		if (typeof window !== "undefined") {
			if (user) {
				// ユーザーがログインしている場合
				const currentSessionId = storage.get(SESSION_ID_KEY);
				const logoutFlag = storage.get(LOGOUT_FLAG_KEY);

				// ログアウトフラグがある場合またはセッションIDが変更された場合
				if (logoutFlag === "true" || !currentSessionId || currentSessionId !== user.id) {
					// フラグをクリア
					storage.remove(LOGOUT_FLAG_KEY);
					storage.remove("zenn_previous_user");
					storage.set(SESSION_ID_KEY, user.id);

					// DBのデータは保持するため、リセット処理は行わない
					// フラグのみ設定してuseUserInfoでDBから既存のデータを取得させる
					setWasLoggedOut(true);
					setIsNewSession(true);
				}
			} else if (isLoaded && !user) {
				// ユーザーがログアウトしている場合はセッションIDを削除
				storage.remove(SESSION_ID_KEY);
				// ログアウト時にZennユーザー名をクリア（UIのみ）
				setZennUsername("");
				// ログアウト時に必ずフラグを設定
				storage.set(LOGOUT_FLAG_KEY, "true");
			}
		}
	}, [user, isLoaded, setWasLoggedOut, setIsNewSession, setZennUsername]);
};
