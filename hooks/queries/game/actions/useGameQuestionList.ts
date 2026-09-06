"use client";

import { useMutation } from "@tanstack/react-query";
import { ref, update } from "firebase/database";

import { rtdb } from "@/lib/firebase";
import { Question } from "@/types/topic/topic";

export const useGameQuestionList = (roomId: string | undefined) => {
  return useMutation({
    mutationFn: async (questions: Question[]) => {
      if (!roomId) {
        throw new Error("방 아이디가 없습니다.");
      }

      if (questions.length === 0) {
        throw new Error("문제가 없습니다.");
      }

      const gameRef = ref(rtdb, `room_sessions/${roomId}/game`);

      await update(gameRef, {
        questionList: questions,
      });
    },
  });
};
