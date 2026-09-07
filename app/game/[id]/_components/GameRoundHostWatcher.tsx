"use client";

import { useEffect, useRef } from "react";
import { ref, runTransaction } from "firebase/database";

import { rtdb } from "@/lib/firebase";
import { Game } from "@/types/game/game";
import {
  PHASE_TRANSITION_MS,
  calculateQuestionScore,
  isCorrectAnswer,
  isSubmissionComplete,
} from "@/utils/game";

interface GameUser {
  id: string;
}

interface GameRoundHostWatcherProps {
  roomId: string;
  isOwner: boolean;
  users: GameUser[];
  game: Game;
  serverTimeOffset: number;
}

export const GameRoundHostWatcher = ({
  roomId,
  isOwner,
  users,
  game,
  serverTimeOffset,
}: GameRoundHostWatcherProps) => {
  const processingRound = useRef<number | null>(null);

  useEffect(() => {
    if (!isOwner || game.status !== "playing" || game.phase) {
      return;
    }

    const gameRef = ref(rtdb, `room_sessions/${roomId}/game`);

    void runTransaction(gameRef, (currentGame) => {
      if (!currentGame || currentGame.status !== "playing" || currentGame.phase) {
        return;
      }

      const ranking = { ...(currentGame.ranking ?? {}) };

      users.forEach((user) => {
        ranking[user.id] ??= { score: 0, combo: 0 };
      });

      return {
        ...currentGame,
        phase: "question",
        currentRound: currentGame.currentRound ?? 0,
        ranking,
      };
    });
  }, [game.phase, game.status, isOwner, roomId, users]);

  useEffect(() => {
    if (!isOwner || game.phase !== "question") {
      return;
    }

    const submissions = game.round?.submissions ?? {};
    const allPlayersComplete =
      users.length > 0 &&
      users.every((user) => isSubmissionComplete(submissions[user.id]));

    if (!allPlayersComplete || processingRound.current === game.currentRound) {
      return;
    }

    processingRound.current = game.currentRound;

    const gameRef = ref(rtdb, `room_sessions/${roomId}/game`);

    void runTransaction(gameRef, (currentGame) => {
      if (!currentGame || currentGame.phase !== "question") {
        return;
      }

      const question = currentGame.questionList?.[currentGame.currentRound];
      const currentSubmissions = currentGame.round?.submissions ?? {};

      if (
        !question ||
        !users.every((user) =>
          isSubmissionComplete(currentSubmissions[user.id]),
        )
      ) {
        return;
      }

      const correctUserIds = users
        .filter((user) => {
          const submission = currentSubmissions[user.id];

          return (
            submission.status === "submitted" &&
            isCorrectAnswer(question, submission.answer)
          );
        })
        .map((user) => user.id);

      const correctUsers = new Set(correctUserIds);
      const ranking = { ...(currentGame.ranking ?? {}) };
      const gradedSubmissions = { ...currentSubmissions };

      users.forEach((user) => {
        const submission = currentSubmissions[user.id];
        const previousRanking = ranking[user.id] ?? { score: 0, combo: 0 };
        const isCorrect = correctUsers.has(user.id);
        const combo = isCorrect ? previousRanking.combo + 1 : 0;
        const earnedScore = isCorrect
          ? calculateQuestionScore({
              elapsedTime: submission.elapsedTime,
              correctCount: correctUserIds.length,
              participantCount: users.length,
              difficulty: question.difficulty,
              combo,
            })
          : 0;

        gradedSubmissions[user.id] = {
          ...submission,
          isCorrect,
          earnedScore,
          combo,
        };

        ranking[user.id] = {
          score: previousRanking.score + earnedScore,
          combo,
        };
      });

      return {
        ...currentGame,
        phase: "result",
        round: {
          ...currentGame.round,
          submissions: gradedSubmissions,
        },
        ranking,
      };
    }).finally(() => {
      processingRound.current = null;
    });
  }, [game.currentRound, game.phase, game.round?.submissions, isOwner, roomId, users]);

  useEffect(() => {
    const requestedAt = game.round?.resultNextRequestedAt;

    if (!isOwner || game.phase !== "result" || !requestedAt) {
      return;
    }

    const readyUsers = game.round?.resultNextReady ?? {};
    const allUsersReady =
      users.length > 0 && users.every((user) => readyUsers[user.id] === true);
    const remainingTime = allUsersReady
      ? 0
      : Math.max(
          0,
          requestedAt + PHASE_TRANSITION_MS - (Date.now() + serverTimeOffset),
        );

    const timer = window.setTimeout(() => {
      const gameRef = ref(rtdb, `room_sessions/${roomId}/game`);

      void runTransaction(gameRef, (currentGame) => {
        if (
          !currentGame ||
          currentGame.phase !== "result" ||
          currentGame.round?.resultNextRequestedAt !== requestedAt
        ) {
          return;
        }

        const isLastRound =
          currentGame.currentRound >= currentGame.questionList.length - 1;

        return {
          ...currentGame,
          phase: isLastRound ? "final" : "ranking",
          round: {
            ...currentGame.round,
            resultNextRequestedAt: null,
            resultNextReady: null,
          },
        };
      });
    }, remainingTime);

    return () => window.clearTimeout(timer);
  }, [
    game.phase,
    game.round?.resultNextRequestedAt,
    game.round?.resultNextReady,
    isOwner,
    roomId,
    serverTimeOffset,
    users,
  ]);

  useEffect(() => {
    const requestedAt = game.round?.rankingNextRequestedAt;

    if (!isOwner || game.phase !== "ranking" || !requestedAt) {
      return;
    }

    const readyUsers = game.round?.rankingNextReady ?? {};
    const allUsersReady =
      users.length > 0 && users.every((user) => readyUsers[user.id] === true);
    const remainingTime = allUsersReady
      ? 0
      : Math.max(
          0,
          requestedAt + PHASE_TRANSITION_MS - (Date.now() + serverTimeOffset),
        );

    const timer = window.setTimeout(() => {
      const gameRef = ref(rtdb, `room_sessions/${roomId}/game`);

      void runTransaction(gameRef, (currentGame) => {
        if (
          !currentGame ||
          currentGame.phase !== "ranking" ||
          currentGame.round?.rankingNextRequestedAt !== requestedAt
        ) {
          return;
        }

        return {
          ...currentGame,
          currentRound: currentGame.currentRound + 1,
          phase: "question",
          round: null,
        };
      });
    }, remainingTime);

    return () => window.clearTimeout(timer);
  }, [
    game.phase,
    game.round?.rankingNextRequestedAt,
    game.round?.rankingNextReady,
    isOwner,
    roomId,
    serverTimeOffset,
    users,
  ]);

  return null;
};
