export const TOPIC_DECISION_LIST = {
  random: { label: "랜덤", next: "vote" },
  vote: { label: "투표", next: "always_random" },
  always_random: { label: "항시 랜덤", next: "random" },
};

export type TopicDecisionType = keyof typeof TOPIC_DECISION_LIST;
