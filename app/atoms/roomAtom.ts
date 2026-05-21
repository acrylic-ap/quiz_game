import { atom } from "jotai";
import { Room } from "@/app/types/common/room/room";

export const roomDataState = atom<Room | undefined>();
export const currentRoomIdAtom = atom<string>("");
