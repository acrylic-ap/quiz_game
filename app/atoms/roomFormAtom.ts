import { TopicDecisionType } from "@/app/types/common/room/topicDecision";
import { atom } from "jotai";

// 문제 개수
export const questionCountAtom = atom(10);

// 주제 결정
export const topicDecisionAtom = atom<TopicDecisionType>("random");
