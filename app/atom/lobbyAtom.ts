import { atom } from "jotai";

interface Room {
  id: string;
  roomName: string;
  subject: string;
  capacity: number;
  maxCapacity: number;
  played: boolean;
}

export const roomListState = atom<Room[]>([
  {
    id: "ASHF2384HSA7",
    roomName: "아무나",
    subject: "사진 보고 아이돌 이름 맞히기",
    capacity: 2,
    maxCapacity: 8,
    played: false,
  },
  {
    id: "ASHF2384HSA8",
    roomName: "ㅎㅇ",
    subject: "개미핥기",
    capacity: 2,
    maxCapacity: 8,
    played: false,
  },
  {
    id: "ASHF2384HSA9",
    roomName: "ㅋㅋ",
    subject: "2000년대 노래 맞히기",
    capacity: 2,
    maxCapacity: 8,
    played: false,
  },
  {
    id: "ASHF2384HSB0",
    roomName: "아무나 들어오세요",
    subject: "2000년대 노래 맞히기",
    capacity: 8,
    maxCapacity: 8,
    played: false,
  },
  {
    id: "ASHF2384HSB1",
    roomName: "들어오지 마",
    subject: "2010년대 노래 맞히기",
    capacity: 8,
    maxCapacity: 8,
    played: true,
  },
]);
