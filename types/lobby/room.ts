import { RoomStatus } from "../room/room";

export interface LobbyRoom {
  id: string;
  roomName: string;
  topicName: string;
  capacity: number;
  maxCapacity: number;
  lastRound: number;
  status: RoomStatus;
}
