"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAtom } from "jotai";
import { loginModalState } from "@/atoms/modalAtom";
import { GoogleLogo } from "@/public/svg/Google";
import { useGoogleLogin } from "@/hooks/queries/common/account/useAuthMutation";

export default function LoginModal() {
  const [showLoginModal, setShowLoginModal] = useAtom(loginModalState);

  const loginMutation = useGoogleLogin();

  const handleGoogleLogin = () => {
    loginMutation.mutate(undefined, {
      onSuccess: () => {
        setShowLoginModal(false);
      },
      onError: (error) => {
        console.error("로그인 실패:", error);
        // 알림 창을 띄우거나 에러 메시지 상태를 업데이트하세요.
      },
    });
  };

  return (
    <Dialog open={showLoginModal} onOpenChange={setShowLoginModal}>
      <DialogContent className="bg-zinc-950 text-zinc-100 select-none">
        <DialogHeader className="flex items-center">
          <DialogTitle className="text-xl flex items-center font-semibold">
            로그인
          </DialogTitle>
        </DialogHeader>

        <div className="w-full flex items-center flex-col">
          <button
            className="bg-zinc-800 w-50 h-[40px] rounded
                        flex justify-center items-center
                        hover:bg-zinc-700
                        outline-none transition-colors"
            onClick={handleGoogleLogin}
            disabled={loginMutation.isPending}
          >
            <div className="flex items-center gap-2">
              <GoogleLogo />
              <p className="text-zinc-300">
                {loginMutation.isPending
                  ? "Connecting..."
                  : "Sign up with Google"}
              </p>
            </div>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
