"use client";

import { alertModalState, loginModalState } from "@/atoms/modalAtom";
import { useAuth } from "@/hooks/queries/common/account/useAuth";
import { useSetAtom } from "jotai";
import UserInfoDropdown from "./UserInfoDropdown";
import { useLogout } from "@/hooks/queries/common/account/useLogout";

export const Header = () => {
  const setShowLoginModal = useSetAtom(loginModalState);
  const setAlertModal = useSetAtom(alertModalState);

  const { data: user, isLoading } = useAuth();
  const { handleLogout } = useLogout();

  return (
    <div className="relative w-full h-[20%] flex justify-center items-center">
      <div className="relative w-[75%] h-full">
        <h1 className="absolute left-0 top-[35px] text-4xl font-bold">
          스피드 퀴즈
        </h1>

        <div className="absolute right-0 top-[35px]">
          {isLoading ? (
            <span>...</span>
          ) : user ? (
            <UserInfoDropdown
              user={user}
              onLogout={handleLogout}
              onItemClick={() => setAlertModal("추후에 출시됩니다.")}
            />
          ) : (
            <button onClick={() => setShowLoginModal(true)}>로그인</button>
          )}
        </div>
      </div>
    </div>
  );
};
