import { atom } from "jotai";
import { LobbyRoom } from "../types/common/lobby/room";

// 로비 내 방 리스트
export const roomListState = atom<LobbyRoom[]>([]);
