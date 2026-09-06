import { atom } from "jotai";
import { Room } from "@/types/room/room";

export const roomDataState = atom<Room | undefined>();
export const currentRoomIdAtom = atom<string>("");
