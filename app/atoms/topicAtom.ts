import { atom } from "jotai";
import { Topic } from "../types/common/room/topic";

export const topicListState = atom<Topic[]>([]);

export const pickedTopicAtom = atom<Map<string, string>>(
  new Map<string, string>(),
);
