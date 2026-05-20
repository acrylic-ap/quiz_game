import { atom } from "jotai";
import { SelectModalState } from "@/app/types/common/modal";

// 알림용
export const selectModalState = atom<SelectModalState | null>(null);
export const alertModalState = atom<string | null>(null);

// 방 생성
export const setRoomModalState = atom<"create" | "edit" | null>(null);

// 열기용
export const loginModalState = atom<boolean>(false);
export const showTopicModalState = atom<boolean>(false);
export const showBlockedModalState = atom<boolean>(false);

// 특정 방 입장 도중 interaction 방지
export const preventClickState = atom(false);
