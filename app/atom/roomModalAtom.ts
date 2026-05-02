import { atom } from "jotai";
import { DecisionType } from "./lobbyAtom";

export const internalValueAtom = atom(10);
export const decisionAtom = atom<DecisionType>("random");
