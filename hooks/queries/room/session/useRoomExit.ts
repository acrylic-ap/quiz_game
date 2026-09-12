import { rtdb } from "@/lib/firebase";
import { ref, remove } from "firebase/database";

export const useRoomExit = (roomId: string, userId?: string) => {
  const exitRoom = async (isOwner: boolean) => {
    if (!roomId || !userId) return;

    if (isOwner) {
      // 방 정보의 실제 저장소는 Realtime Database다.
      await remove(ref(rtdb, `room_sessions/${roomId}`));
    } else {
      // 2. 일반 유저일 경우: 본인 세션만 삭제
      await remove(ref(rtdb, `room_sessions/${roomId}/users/${userId}`));
    }
  };

  return { exitRoom };
};
