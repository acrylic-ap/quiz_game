import { atom } from "jotai";

export interface Chat {
  id: string;
  username: string;
  text: string;
  time: string;
  isAdmin: boolean;
}

export const DECISION_LIST = {
  random: { label: "랜덤", next: "vote" },
  vote: { label: "투표", next: "always_random" },
  always_random: { label: "항시 랜덤", next: "random" },
};

export type DecisionType = keyof typeof DECISION_LIST;

export interface Room {
  id: string;
  roomName: string;
  topicItem: Map<string, string>;
  capacity: number;
  maxCapacity: number;
  playing: boolean;
  decision: DecisionType;
  internalValue: number;
  showPublic: boolean;
  rank: "count" | "time";
}

// setDecision(room?.decision);
// setInternalValue(room?.internalValue);
// setShowPublic(room?.showPublic);
// setRank(room?.rank);

export const roomListState = atom<Room[]>([]);
