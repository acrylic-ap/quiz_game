"use client";

import { useMutation } from "@tanstack/react-query";
import { ref, update } from "firebase/database";
import { rtdb } from "@/lib/firebase";

export const useGameSettingComplete = (roomId: string | undefined) => {
  return useMutation({
    mutationFn: async () => {
      if (!roomId) {
        throw new Error("방 아이디가 없습니다.");
      }

      console.log("[GameSetting] 구성 완료");
      console.log("[GameSetting] status → playing");

      const roomRef = ref(rtdb, `room_sessions/${roomId}`);

      await update(roomRef, {
        status: "playing",
      });
    },

    onSuccess: () => {
      console.log("[GameSetting] playing 변경 완료");
    },

    onError: (error) => {
      console.error("[GameSetting] 구성 완료 처리 실패:", error);
    },
  });
};
