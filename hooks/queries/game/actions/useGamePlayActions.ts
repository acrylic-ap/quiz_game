"use client";

import { useCallback } from "react";
import { ref, runTransaction, serverTimestamp, set } from "firebase/database";

import { rtdb } from "@/lib/firebase";
import { GameRoundPlayer, GameSubmission } from "@/types/game/game";
import {
  PHASE_TRANSITION_MS,
  QUESTION_TIME_LIMIT_MS,
} from "@/utils/game";

export const useGamePlayActions = (
  roomId: string | undefined,
  userId: string | undefined,
) => {
  const startQuestion = useCallback(async () => {
    if (!roomId || !userId) {
      return null;
    }

    const playerRef = ref(
      rtdb,
      `room_sessions/${roomId}/game/round/players/${userId}`,
    );

    const startedAt = Date.now();

    const result = await runTransaction(playerRef, (currentPlayer) => {
      if (currentPlayer) {
        return currentPlayer;
      }

      return {
        startedAt,
        deadlineAt: startedAt + QUESTION_TIME_LIMIT_MS,
      };
    });

    return result.snapshot.val() as GameRoundPlayer | null;
  }, [roomId, userId]);

  const submitAnswer = useCallback(
    async (answer: NonNullable<GameSubmission["answer"]>, player: GameRoundPlayer) => {
      if (!roomId || !userId) {
        return;
      }

      const submissionRef = ref(
        rtdb,
        `room_sessions/${roomId}/game/round/submissions/${userId}`,
      );

      const solveTimestamp = Date.now();
      const isTimeout = solveTimestamp >= player.deadlineAt;

      await runTransaction(submissionRef, (currentSubmission) => {
        if (currentSubmission) {
          return;
        }

        return {
          answer: isTimeout ? null : answer,
          startedAt: player.startedAt,
          solveTimestamp,
          elapsedTime: Math.max(0, solveTimestamp - player.startedAt),
          status: isTimeout ? "timeout" : "submitted",
        };
      });
    },
    [roomId, userId],
  );

  const submitTimeout = useCallback(
    async (player: GameRoundPlayer) => {
      if (!roomId || !userId) {
        return;
      }

      const submissionRef = ref(
        rtdb,
        `room_sessions/${roomId}/game/round/submissions/${userId}`,
      );

      const solveTimestamp = Date.now();

      await runTransaction(submissionRef, (currentSubmission) => {
        if (currentSubmission) {
          return;
        }

        return {
          answer: null,
          startedAt: player.startedAt,
          solveTimestamp,
          elapsedTime: Math.max(0, solveTimestamp - player.startedAt),
          status: "timeout",
        };
      });
    },
    [roomId, userId],
  );

  const requestTransition = useCallback(
    async (
      timestampField: "resultNextRequestedAt" | "rankingNextRequestedAt",
      readyField: "resultNextReady" | "rankingNextReady",
    ) => {
      if (!roomId || !userId) {
        return;
      }

      const timestampRef = ref(
        rtdb,
        `room_sessions/${roomId}/game/round/${timestampField}`,
      );
      const readyRef = ref(
        rtdb,
        `room_sessions/${roomId}/game/round/${readyField}/${userId}`,
      );

      await runTransaction(timestampRef, (currentTimestamp) =>
        currentTimestamp ?? serverTimestamp(),
      );
      await set(readyRef, true);
    },
    [roomId, userId],
  );

  const requestResultNext = useCallback(
    () => requestTransition("resultNextRequestedAt", "resultNextReady"),
    [requestTransition],
  );

  const requestRankingNext = useCallback(
    () => requestTransition("rankingNextRequestedAt", "rankingNextReady"),
    [requestTransition],
  );

  const returnToRoom = useCallback(async () => {
    if (!roomId || !userId) {
      return;
    }

    await set(
      ref(rtdb, `room_sessions/${roomId}/game/finalReturnReady/${userId}`),
      true,
    );
  }, [roomId, userId]);

  return {
    startQuestion,
    submitAnswer,
    submitTimeout,
    requestResultNext,
    requestRankingNext,
    returnToRoom,
    transitionDuration: PHASE_TRANSITION_MS,
  };
};
