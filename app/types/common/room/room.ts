import { TopicDecisionType } from "./topicDecision";

export interface Room {
  id: string;
  roomName: string;
  topicItem: Map<string, string>;
  capacity: number;
  maxCapacity: number;
  playing: boolean;
  decision: TopicDecisionType;
  internalValue: number;
  showPublic: boolean;
  ownerId?: string;
  rank: "count" | "time";
}
