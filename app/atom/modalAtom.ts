import { atom } from "jotai";

interface SelectModalState {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const selectModalState = atom<SelectModalState | null>(null);

export const alertModalState = atom<string | null>(null);
export const loginModalState = atom(false);
export const showTopicModalState = atom(false);
export const setRoomModalState = atom<"create" | "edit" | null>(null);
export const preventClickState = atom(false);
