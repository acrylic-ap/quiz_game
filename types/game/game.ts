import { Question } from "../topic/topic";

export interface Game {
  currentRound: number;
  questionList?: Question[];
}

export interface Ranking {
  score: number;
  combo: number;
  rank: number;
}
