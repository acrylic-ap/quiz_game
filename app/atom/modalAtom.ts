import { atom } from "jotai";

export const alertModalState = atom<string | null>(null);
export const loginModalState = atom(false);
export const showTopicModalState = atom(false);
export const setRoomModalState = atom<"create" | "edit" | null>(null);
