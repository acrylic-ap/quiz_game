import { atom } from "jotai";

interface Topic {
  id: string;
  type: string;
  questionType: "select" | "input";
  topicName: string;
  description: string;
  category: string;
}

export const topicListState = atom<Topic[]>([
  {
    id: "JD4FH3EU",
    type: "image",
    questionType: "select",
    topicName: "맞춤법 퀴즈",
    description: "표국대 기준으로 함",
    category: "국어",
  },
  {
    id: "JD4FH3EUC",
    type: "article",
    questionType: "select",
    topicName: "띄어쓰기 맞히기",
    description: "표국대 기준으로 함",
    category: "국어",
  },
  {
    id: "JD4FH3EUA",
    type: "sound",
    questionType: "input",
    topicName: "2020년대 노래 제목 맞히기",
    description: "2020~2026년에 나온 노래를 듣고 맞히시면 됩니다.",
    category: "노래",
  },
  {
    id: "JD4FH3EUZ",
    type: "sound",
    questionType: "input",
    topicName: "2010년대 노래 제목 맞히기",
    description: "2010~2019년에 나온 노래를 듣고 맞히시면 됩니다.",
    category: "노래",
  },
]);

export const pickedTopicAtom = atom<Map<string, string>>(
  new Map<string, string>(),
);
