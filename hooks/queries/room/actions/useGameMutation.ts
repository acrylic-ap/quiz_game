import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ref, get, set } from "firebase/database";
import { doc, updateDoc } from "firebase/firestore";
import { db, rtdb } from "@/lib/firebase";

export const useGameMutation = (roomId: string | undefined) => {
  const queryClient = useQueryClient();

  const startMutation = useMutation({
    mutationFn: async () => {
      if (!roomId) throw new Error("방 아이디가 없습니다.");

      const sessionRef = ref(rtdb, `room_sessions/${roomId}`);
      const snapshot = await get(sessionRef);

      if (!snapshot.exists())
        throw new Error("세션 정보를 불러오지 못했습니다.");

      const sessionData = snapshot.val();
      const gameSessionRef = ref(rtdb, `game_sessions/${roomId}`);
      const roomDocRef = doc(db, "rooms", roomId);

      // RTDB 복사와 Firestore 상태 업데이트를 동시에 진행
      await Promise.all([
        set(gameSessionRef, sessionData),
        updateDoc(roomDocRef, { playing: true }),
      ]);
    },
    onSuccess: () => {
      // 캐시 갱신을 통해 UI에 즉각 반영
      queryClient.invalidateQueries({ queryKey: ["room", roomId] });
    },
  });

  return {
    startMutation,
    isLoading: startMutation.isPending,
    isError: startMutation.isError,
  };
};
