import { Question } from "@/types/topic/topic";

export type GameStatus = "waiting" | "playing" | "finished";

export interface TopicVote {
  topicId: string;
}

export interface JoinReady {
  ready: boolean;
}

export interface Game {
  status: GameStatus;
  currentRound: number;
  selectedTopicId?: string;
  questionList: Question[];
  topicVotes?: Record<string, TopicVote>;
  topicVoteStartedAt?: number;
  joinReady?: Record<string, JoinReady>;
}
