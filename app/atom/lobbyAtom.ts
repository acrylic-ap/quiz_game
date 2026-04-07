import { atom } from "jotai";

export interface Room {
  id: string;
  roomName: string;
  topic: string;
  capacity: number;
  maxCapacity: number;
  playing: boolean;
}

export const roomListState = atom<Room[]>([]);
