import { Game } from "@/types/game/game";

export type RoomStatus = "waiting" | "setting" | "playing";

export type RankBasis = "count" | "time";

export interface RoomConfig {
  roomName: string;
  capacity: number;
  maxCapacity: number;
  showPublic: boolean;
  ownerId: string;
}

export interface RoomGameConfig {
  lastRound: number;
  topic: Map<string, string>;
  topicDescriptions: Map<string, string>;
  topicCategories: Map<string, string>;
  decision: "random" | "vote" | "always_random";
  rankBasis: RankBasis;
}

export interface RoomUser {
  id: string;
  nickname: string;
  isReady: boolean;
  avatar?: string;
}

export interface Room {
  id: string;
  config: RoomConfig;
  status: RoomStatus;
  users: RoomUser[];
  gameConfig: RoomGameConfig;
  game: Game;
}
