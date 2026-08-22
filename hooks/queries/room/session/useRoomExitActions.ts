// hooks/room/session/useRoomExitActions.ts
import { useAtom } from "jotai";
import { selectModalState } from "@/atoms/modalAtom";
import { useRoomExit } from "./useRoomExit"; // 기존의 순수 삭제 훅

export const useRoomExitActions = (roomId: string, userId?: string) => {
  const [, setSelectModal] = useAtom(selectModalState);
  const { exitRoom } = useRoomExit(roomId, userId);

  const confirmAndExit = (isOwner: boolean, onExitSuccess: () => void) => {
    if (isOwner) {
      setSelectModal({
        message: "방장이 방을 나가면 방이 삭제됩니다.\n정말 나가시겠습니까?",
        onConfirm: async () => {
          await exitRoom(true);
          setSelectModal(null);
          onExitSuccess();
        },
      });
    } else {
      exitRoom(false);
      onExitSuccess();
    }
  };

  return { confirmAndExit };
};
