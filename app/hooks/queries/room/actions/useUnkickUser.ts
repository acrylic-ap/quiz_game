import { useMutation } from "@tanstack/react-query";
import { rtdb } from "@/app/lib/firebase";
import { ref, remove } from "firebase/database";
import { useAtomValue, useAtom } from "jotai";
import { currentRoomIdAtom } from "@/app/atoms/roomAtom";
import { selectModalState } from "@/app/atoms/modalAtom";

export const useUnkickUser = () => {
  const roomId = useAtomValue(currentRoomIdAtom);
  const [, setSelectedModal] = useAtom(selectModalState);

  const { mutate } = useMutation({
    mutationFn: async (userId: string) => {
      if (!roomId) throw new Error("roomId가 없습니다.");
      const kickedUsersRef = ref(
        rtdb,
        `room_sessions/${roomId}/kicked/${userId}`,
      );
      await remove(kickedUsersRef);
    },
    onError: (error: any) => {
      console.error("차단 해제 에러:", error);
    },
  });

  const handleUnkickUser = (username: string, userId: string) => {
    setSelectedModal({
      message: `[${username}]\n해당 유저를 차단 해제하시겠습니까?`,
      onConfirm: () => {
        mutate(userId);
        setSelectedModal(null);
      },
    });
  };

  return { handleUnkickUser };
};
