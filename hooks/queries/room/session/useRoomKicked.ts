import { rtdb } from "@/lib/firebase";
import { onValue, ref } from "firebase/database";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAtom } from "jotai";
import { alertModalState } from "@/atoms/modalAtom";

export const useRoomKicked = (roomId: string, userId?: string) => {
  const router = useRouter();
  const [, setAlertModal] = useAtom(alertModalState);

  useEffect(() => {
    if (!roomId || !userId) return;

    const kickedRef = ref(rtdb, `room_sessions/${roomId}/kicked/${userId}`);

    const unsubscribe = onValue(kickedRef, (snapshot) => {
      if (snapshot.exists() && snapshot.val() === true) {
        unsubscribe(); // 리스너 해제
        setAlertModal("방장에 의해 강제 퇴장당했습니다.");
        router.replace("/");
      }
    });

    return () => unsubscribe();
  }, [roomId, userId, router, setAlertModal]);
};
