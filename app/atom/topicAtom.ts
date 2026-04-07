import { atom } from "jotai";

export interface Topic {
  id: string;
  type: string;
  questionType: "select" | "input";
  topicName: string;
  description: string;
  category: string;
}

export const topicListState = atom<Topic[]>([]);

export const pickedTopicAtom = atom<Map<string, string>>(
  new Map<string, string>(),
);
