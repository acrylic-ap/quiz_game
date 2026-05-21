import { atom } from "jotai";

export const pickedTopicAtom = atom<Map<string, string>>(
  new Map<string, string>(),
);
