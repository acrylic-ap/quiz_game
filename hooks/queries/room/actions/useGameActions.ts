// hooks/room/actions/useGameActions.ts
import { RoomUser } from "@/types/common/room/user";
import { useGameMutation } from "./useGameMutation";
import { useAtom } from "jotai";
import { alertModalState } from "@/atoms/modalAtom";
import { rtdb } from "@/lib/firebase";
import { ref, update } from "firebase/database";

export const useGameActions = (roomId: string, userId?: string) => {
  const { startMutation } = useGameMutation(roomId);
  const [, setAlertModal] = useAtom(alertModalState);

  const toggleReady = async (isReady: boolean) => {
    if (!userId) return;
    const userRef = ref(rtdb, `room_sessions/${roomId}/users/${userId}`);
    await update(userRef, { isReady: !isReady });
  };

  const startGame = (users: RoomUser[]) => {
    if (users.length <= 1) return setAlertModal("누구랑 경쟁하시려고요?");
    if (!users.every((u) => u.isReady || u.isOwner))
      return setAlertModal("준비할 시간을 주세요.");

    startMutation.mutate();
  };

  return { toggleReady, startGame };
};
