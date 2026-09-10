import { GameRankingEntry, GameSubmission } from "@/types/game/game";
import { matchesAnswer } from "@/utils/answer";

export const QUESTION_TIME_LIMIT_MS = 30_000;
export const PHASE_TRANSITION_MS = 10_000;

const DIFFICULTY_MULTIPLIER: Record<number, number> = {
  1: 0.8,
  2: 0.9,
  3: 1,
  4: 1.2,
  5: 1.5,
};

export const isCorrectAnswer = matchesAnswer;

export const getComboMultiplier = (combo: number) =>
  2 - 1 / (combo + 1);

export const calculateQuestionScore = ({
  elapsedTime,
  correctCount,
  participantCount,
  difficulty,
  combo,
}: {
  elapsedTime: number;
  correctCount: number;
  participantCount: number;
  difficulty?: number;
  combo: number;
}) => {
  const elapsedRatio =
    Math.min(Math.max(elapsedTime, 0), QUESTION_TIME_LIMIT_MS) /
    QUESTION_TIME_LIMIT_MS;
  const timeMultiplier = 1 - 0.7 * elapsedRatio;
  const playerMultiplier =
    1 + (1 - correctCount / Math.max(participantCount, 1));
  const difficultyMultiplier = DIFFICULTY_MULTIPLIER[difficulty ?? 3] ?? 1;
  const comboMultiplier = getComboMultiplier(combo);

  return Math.round(
    1000 *
      timeMultiplier *
      playerMultiplier *
      difficultyMultiplier *
      comboMultiplier,
  );
};

export const getRankedEntries = (
  ranking: Record<string, GameRankingEntry>,
) => {
  const sorted = Object.entries(ranking).sort(
    ([, left], [, right]) => right.score - left.score,
  );

  return sorted.map(([userId, entry], index) => ({
    userId,
    ...entry,
    rank:
      index > 0 && sorted[index - 1][1].score === entry.score
        ? sorted.findIndex(([, item]) => item.score === entry.score) + 1
        : index + 1,
  }));
};

export const isSubmissionComplete = (
  submission: GameSubmission | undefined,
) =>
  submission?.status === "submitted" || submission?.status === "timeout";
