"use client";

import { useMutation } from "@tanstack/react-query";
import { ref, update } from "firebase/database";

import { rtdb } from "@/lib/firebase";

export const useGameJoinReady = (
  roomId: string | undefined,
  userId: string | undefined,
) => {
  return useMutation({
    mutationFn: async () => {
      if (!roomId) {
        throw new Error("방 아이디가 없습니다.");
      }

      if (!userId) {
        throw new Error("사용자 정보가 없습니다.");
      }

      const joinReadyRef = ref(
        rtdb,
        `room_sessions/${roomId}/game/joinReady/${userId}`,
      );

      await update(joinReadyRef, {
        ready: true,
      });
    },
  });
};
