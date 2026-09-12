import { Question } from "@/types/topic/topic";

export type GameStatus = "waiting" | "playing" | "finished";
export type GamePhase = "question" | "result" | "ranking" | "final";
export type SubmissionStatus = "submitted" | "timeout";

export interface TopicVote {
  topicId: string;
}

export interface JoinReady {
  ready: boolean;
}

export interface GameRoundPlayer {
  startedAt: number;
  deadlineAt: number;
}

export interface GameSubmission {
  answer: string | number | number[] | null;
  startedAt: number;
  solveTimestamp: number;
  elapsedTime: number;
  status: SubmissionStatus;
  isCorrect?: boolean;
  earnedScore?: number;
  combo?: number;
}

export interface GameRound {
  players?: Record<string, GameRoundPlayer>;
  submissions?: Record<string, GameSubmission>;
  resultNextRequestedAt?: number;
  rankingNextRequestedAt?: number;
  resultNextReady?: Record<string, boolean>;
  rankingNextReady?: Record<string, boolean>;
}

export interface GameRankingEntry {
  score: number;
  combo: number;
}

export interface Game {
  status: GameStatus;
  phase?: GamePhase;
  currentRound: number;
  selectedTopicId?: string;
  questionList: Question[];
  topicVotes?: Record<string, TopicVote>;
  topicVoteStartedAt?: number;
  joinReady?: Record<string, JoinReady>;
  round?: GameRound;
  ranking?: Record<string, GameRankingEntry>;
  finalReturnReady?: Record<string, boolean>;
}
