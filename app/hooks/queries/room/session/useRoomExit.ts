import { db, rtdb } from "@/app/lib/firebase";
import { ref, remove } from "firebase/database";
import { deleteDoc, doc } from "firebase/firestore";

export const useRoomExit = (roomId: string, userId?: string) => {
  const exitRoom = async (isOwner: boolean) => {
    if (!roomId || !userId) return;

    if (isOwner) {
      // 1. 방장일 경우: 세션과 Firestore 방 자체를 폭파
      await remove(ref(rtdb, `room_sessions/${roomId}`));
      await deleteDoc(doc(db, "rooms", roomId));
    } else {
      // 2. 일반 유저일 경우: 본인 세션만 삭제
      await remove(ref(rtdb, `room_sessions/${roomId}/users/${userId}`));
    }
  };

  return { exitRoom };
};
