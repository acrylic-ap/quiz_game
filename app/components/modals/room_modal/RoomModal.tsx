"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { CircleQuestionMark, User } from "lucide-react";
import { useState } from "react";
import { StepSlider } from "./components/Slider";
import { useAtom } from "jotai";
import { showTopicModalState } from "@/app/atom/modalAtom";

export default function RoomModal() {
  const [, setShowTopicModal] = useAtom(showTopicModalState);

  const DECISION_LIST = {
    random: { label: "랜덤", next: "vote" },
    vote: { label: "투표", next: "always_random" },
    always_random: { label: "항시 랜덤", next: "random" },
  };

  type DecisionType = keyof typeof DECISION_LIST;

  const [decision, setDecision] = useState<DecisionType>("random");

  const [selectedCapacity, setSelectedCapacity] = useState(2);
  const [rank, setRank] = useState<"count" | "time">("count");
  const [roomName, setRoomName] = useState("");

  const [showTopicInfo, setShowTopicInfo] = useState(false);
  const [showScoreInfo, setShowScoreInfo] = useState(false);

  const handleRoomNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRoomName(e.target.value);
  };

  const createRoom = () => {
    if (!roomName) {
      alert("방 제목을 입력하세요.");
      return;
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          className="px-6 py-2 mr-2 rounded-sm
                  text-lg select-none bg-zinc-900
                  hover:bg-zinc-800"
        >
          방 생성
        </button>
      </DialogTrigger>

      <DialogContent className="bg-zinc-950 text-zinc-100 select-none">
        <DialogHeader className="text-center mt-5">
          <DialogTitle className="text-2xl">방 생성</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-col space-y-2 mb-5">
            <input
              type="text"
              id="room-name"
              placeholder="방 제목을 입력하세요"
              className="bg-zinc-900 text-zinc-100
              rounded pl-2 py-3
              outline-none
              placeholder:text-zinc-500"
              value={roomName}
              onChange={handleRoomNameChange}
            />
          </div>
          <div
            className="relative w-full mb-5
            flex flex-row items-center space-x-2"
          >
            <h2 className="shrink-0 text-lg font-bold">인원</h2>
            <div
              className="group w-full flex flex-row justify-center gap-2
              [&_svg]:group-hover:text-zinc-500
              [&>button:has(~_button:hover)_svg]:text-white
              [&>button:hover_svg]:text-white"
            >
              {Array.from({ length: 8 }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => index >= 1 && setSelectedCapacity(index + 1)}
                  className="group"
                >
                  <User
                    className={`transition-colors duration-200
          ${selectedCapacity >= index + 1 ? "text-white" : "text-zinc-500"}`}
                  />
                </button>
              ))}
            </div>
          </div>
          <div className="relative flex flex-row items-center space-x-2">
            <h2 className="font-bold text-lg mr-2">주제</h2>
            <CircleQuestionMark
              size={17}
              className="mr-4"
              onClick={() => setShowTopicInfo(!showTopicInfo)}
            />
            {showTopicInfo && (
              <div
                className="absolute -bottom-24 px-2 py-1 rounded bg-zinc-800 text-sm whitespace-pre-wrap
                z-11"
                onClick={() => setShowTopicInfo(false)}
              >
                {`복수 주제 선택 시 결정 방식
투표: 하나를 투표로 확정
랜덤: 하나를 뽑아 이번 판 고정
항시 랜덤: 매 라운드마다 무작위 변경`}
              </div>
            )}
            <label>맞춤법 퀴즈 외 2개</label>
            <div className="absolute right-0">
              <button
                className="px-3 py-1 mr-1 rounded
              text bg-zinc-900
              hover:bg-zinc-800"
                onClick={() => setShowTopicModal(true)}
              >
                ...
              </button>
              <button
                className="px-3 py-1 mr-1 rounded
              text bg-zinc-900
              hover:bg-zinc-800"
                onClick={() =>
                  setDecision(DECISION_LIST[decision].next as DecisionType)
                }
              >
                {DECISION_LIST[decision].label}
              </button>
            </div>
          </div>
          <div className="flex flex-row items-center">
            <h2 className="font-bold text-lg mr-12">문제 개수</h2>
            <StepSlider />
          </div>
          <div className="flex flex-row items-center mb-5">
            <h2 className="font-bold text-lg mr-4">공개</h2>
            <Switch className="data-[state=unchecked]:bg-zinc-600 data-[state=checked]:bg-zinc-800" />
          </div>
          <div className="relative flex flex-row items-center">
            <h2 className="font-bold text-lg mr-2">점수 획득 기준</h2>
            <CircleQuestionMark
              size={17}
              className="mr-4"
              onClick={() => setShowScoreInfo(!showScoreInfo)}
            />
            {showScoreInfo && (
              <div
                className="absolute -bottom-13 px-2 py-1 rounded bg-zinc-800 text-sm whitespace-pre-wrap
                z-1"
                onClick={() => setShowScoreInfo(false)}
              >
                {`개수: 맞힌 개수
시간: 시간 비례 점수`}
              </div>
            )}
            <button
              className={`px-3 py-1 mr-1 rounded
              text 
              hover:bg-zinc-900
              ${rank === "count" ? "bg-zinc-900" : "bg-zinc-800"}`}
              onClick={() => setRank("count")}
            >
              개수
            </button>
            <button
              className={`px-3 py-1 mr-1 rounded
              text
              hover:bg-zinc-900
              ${rank === "time" ? "bg-zinc-900" : "bg-zinc-800"}`}
              onClick={() => setRank("time")}
            >
              시간
            </button>
          </div>
        </div>

        <div className="flex justify-center">
          <button
            className="w-30 px-6 py-2 rounded
              text bg-zinc-900
              hover:bg-zinc-800"
            onClick={createRoom}
          >
            방 생성
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
