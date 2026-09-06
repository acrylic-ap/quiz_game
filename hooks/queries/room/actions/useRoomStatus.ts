"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ref, update } from "firebase/database";

import { rtdb } from "@/lib/firebase";

export const useRoomStatus = (roomId: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (status: "waiting" | "setting" | "playing") => {
      if (!roomId) {
        throw new Error("방 아이디가 없습니다.");
      }

      const roomRef = ref(rtdb, `room_sessions/${roomId}`);

      await update(roomRef, {
        status,
      });
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["room", roomId],
      });
    },
  });
};
