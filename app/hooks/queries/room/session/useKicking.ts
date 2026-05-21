import { selectModalState } from "@/app/atoms/modalAtom";
import { rtdb } from "@/app/lib/firebase";
import { useMutation } from "@tanstack/react-query";
import { ref, set, update } from "firebase/database";
import { useAtom } from "jotai";

// hooks/room/useKicking.ts
export const useKicking = (roomId: string) => {
  const [, setSelectModal] = useAtom(selectModalState);
  const { mutate: performKick } = useMutation({
    mutationFn: async (userId: string) => {
      await set(ref(rtdb, `room_sessions/${roomId}/users/${userId}`), null);
      await update(ref(rtdb, `room_sessions/${roomId}/kicked`), {
        [userId]: true,
      });
    },
  });

  // 강퇴 버튼 클릭 시 실행할 함수 (모달을 띄우는 역할)
  const openKickModal = (userId: string, nickname: string) => {
    setSelectModal({
      message: `${nickname} 님을 강제 퇴장하시겠습니까?`,
      onConfirm: () => {
        performKick(userId);
        setSelectModal(null);
      },
      onCancel: () => setSelectModal(null),
    });
  };

  return { openKickModal };
};
