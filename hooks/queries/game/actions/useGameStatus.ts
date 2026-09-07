"use client";

import { useMutation } from "@tanstack/react-query";
import { ref, update } from "firebase/database";

import { rtdb } from "@/lib/firebase";

export const useGameStatus = (roomId: string | undefined) => {
  return useMutation({
    mutationFn: async (status: "playing") => {
      if (!roomId) {
        throw new Error("방 아이디가 없습니다.");
      }

      const gameRef = ref(rtdb, `room_sessions/${roomId}/game`);

      await update(gameRef, {
        status,
        currentRound: 0,
        phase: "question",
      });
    },
  });
};
