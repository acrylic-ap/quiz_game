import { atom } from "jotai";
import { Room } from "./lobbyAtom";

export const roomDataState = atom<Room | undefined>();
