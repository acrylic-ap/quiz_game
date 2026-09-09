export interface Topic {
  id: string;
  topicName: string;
  description: string;
  category: string;
  questions?: Question[];
}

export interface Question {
  id: string;
  question: string;
  type: string;
  questionType?: string;
  answerType?: string;
  options?: string[];
  answer?: string;
  difficulty?: number;
  hints?: Hint[];
}

export interface Hint {
  id: string;
  content?: string;
  revealTime?: number;
  scoreMultiplier?: number;
}

export const TOPIC_DECISION_LIST = {
  random: { label: "랜덤", next: "vote" },
  vote: { label: "투표", next: "always_random" },
  always_random: { label: "항시 랜덤", next: "random" },
};

export type TopicDecisionType = keyof typeof TOPIC_DECISION_LIST;
