export interface Topic {
  id: string;
  topicName: string;
  description: string;
  category: string;
  questions?: Question[];
  imageUrl?: string;
  imagePath?: string;
  ownerId?: string;
  questionCount?: number;
  updatedAt?: number;
  approvalStatus?: "approved" | "rejected" | "pending" | "unregistered";
}

export interface Question {
  id: string;
  question: string;
  type: string;
  questionType?: string;
  // 객관식: all(다중 정답, 모두 선택) / any(복수 정답, 하나 선택).
  // single/multiple은 주관식 및 이전 데이터용.
  answerType?: "all" | "any" | "single" | "multiple";
  options?: string[];
  answer?: string;
  difficulty?: number;
  hints?: Hint[];
  answerMatch?: "exact" | "ignoreWhitespace";
  correctOptions?: number[];
  order?: number;
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
