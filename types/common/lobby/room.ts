import { Status } from "../room/room";
import { TopicDecisionType } from "../room/topic";

export interface LobbyRoom {
  id: string;
  roomName: string;
  topicName: string;
  capacity: number;
  maxCapacity: number;
  lastRound: number;
  status: Status;
}
