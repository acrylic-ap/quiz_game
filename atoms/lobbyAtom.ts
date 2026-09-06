import { atom } from "jotai";
import { LobbyRoom } from "../types/lobby/room";

// 로비 내 방 리스트
export const roomListState = atom<LobbyRoom[]>([]);
