import { TopicDecisionType } from "../room/topicDecision";

export interface LobbyRoom {
  id: string;
  roomName: string;
  topicName: string;
  capacity: number;
  maxCapacity: number;
  playing: boolean;
  internalValue: number;
  decision: TopicDecisionType;
}
