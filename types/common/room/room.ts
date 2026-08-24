import { TopicDecisionType } from "./topic";

export type Status = "waiting" | "playing";

export interface Room {
  id: string;
  config: Config;
  status: Status;
  users: RoomUser[];
  gameConfig: GameConfig;
}

export interface RoomUser {
  id: string;
  nickname: string;
  isReady: boolean;
  avatar?: string;
}

export interface Config {
  roomName: string;
  capacity: number;
  maxCapacity: number;
  showPublic: boolean;
  ownerId: string;
}

export type RankBasis = "count" | "time";

export interface GameConfig {
  lastRound: number;
  topic: Map<string, string>;
  decision: TopicDecisionType;
  rankBasis: RankBasis;
}
