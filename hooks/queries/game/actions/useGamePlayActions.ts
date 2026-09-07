"use client";

import { useCallback } from "react";
import { ref, runTransaction, serverTimestamp } from "firebase/database";

import { rtdb } from "@/lib/firebase";
import { GameRoundPlayer } from "@/types/game/game";
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

    const result = await runTransaction(playerRef, (currentPlayer) => {
      if (currentPlayer) {
        return currentPlayer;
      }

      const startedAt = Date.now();

      return {
        startedAt,
        deadlineAt: startedAt + QUESTION_TIME_LIMIT_MS,
      };
    });

    return result.snapshot.val() as GameRoundPlayer | null;
  }, [roomId, userId]);

  const submitAnswer = useCallback(
    async (answer: string, player: GameRoundPlayer) => {
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

      const roundRef = ref(rtdb, `room_sessions/${roomId}/game/round`);

      await runTransaction(roundRef, (currentRound) => {
        if (!currentRound) {
          return currentRound;
        }

        return {
          ...currentRound,
          [timestampField]: currentRound[timestampField] ?? serverTimestamp(),
          [readyField]: {
            ...(currentRound[readyField] ?? {}),
            [userId]: true,
          },
        };
      });
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

    const roomRef = ref(rtdb, `room_sessions/${roomId}`);

    await runTransaction(roomRef, (room) => {
      if (!room) {
        return;
      }

      const currentUsers = room.users ?? {};
      const finalReturnReady = {
        ...(room.game?.finalReturnReady ?? {}),
        [userId]: true,
      };
      const allUsersReturned =
        Object.keys(currentUsers).length > 0 &&
        Object.keys(currentUsers).every(
          (currentUserId) => finalReturnReady[currentUserId] === true,
        );

      if (!allUsersReturned) {
        return {
          ...room,
          game: {
            ...room.game,
            finalReturnReady,
          },
        };
      }

      const users = Object.fromEntries(
        Object.entries<Record<string, unknown>>(currentUsers).map(
          ([id, value]) => [
            id,
            {
              ...(value as Record<string, unknown>),
              isReady: false,
            },
          ],
        ),
      );

      return {
        ...room,
        status: "waiting",
        users,
        game: null,
      };
    });
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
