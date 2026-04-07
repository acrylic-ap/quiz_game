"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { CircleQuestionMark, User } from "lucide-react";
import { useState } from "react";
import { StepSlider } from "./components/Slider";
import { useAtom } from "jotai";
import {
  alertModalState,
  setRoomModalState,
  showTopicModalState,
} from "@/app/atom/modalAtom";
import { pickedTopicAtom } from "@/app/atom/topicAtom";
import { internalValueAtom } from "@/app/atom/roomModalAtom";
import { db } from "@/app/lib/firebase";
import { collection, addDoc, getDoc, doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { generateRoomId } from "@/app/lib/utils";

export default function RoomModal() {
  const router = useRouter();

  const [roomDescription, setRoomDescription] = useAtom(setRoomModalState);
  const [, setAlertModal] = useAtom(alertModalState);
  const [, setShowTopicModal] = useAtom(showTopicModalState);

  // decision
  const DECISION_LIST = {
    random: { label: "랜덤", next: "vote" },
    vote: { label: "투표", next: "always_random" },
    always_random: { label: "항시 랜덤", next: "random" },
  };

  type DecisionType = keyof typeof DECISION_LIST;

  const [decision, setDecision] = useState<DecisionType>("random");

  // info tooltip
  const [showTopicInfo, setShowTopicInfo] = useState(false);
  const [showScoreInfo, setShowScoreInfo] = useState(false);

  // room info
  const [selectedCapacity, setSelectedCapacity] = useState(2);
  const [rank, setRank] = useState<"count" | "time">("count");
  const [showPublic, setShowPublic] = useState(true);
  const [pickedTopic] = useAtom(pickedTopicAtom);
  const [internalValue] = useAtom(internalValueAtom);

  const [roomName, setRoomName] = useState("");
  const handleRoomNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRoomName(e.target.value);
  };

  const isRoomValid = () => {
    if (!roomName.length) {
      setAlertModal("방 제목을 입력하세요.");
      return false;
    }

    if (!pickedTopic.size) {
      setAlertModal("주제를 선택하세요.");
      return false;
    }

    return true;
  };

  const [isCreating, setIsCreating] = useState(false); // 로딩 상태 추가

  const createRoom = async () => {
    if (isCreating || !isRoomValid()) return;

    setIsCreating(true);

    let customId = "";
    let isUnique = false;

    // 1. 중복되지 않는 ID를 찾을 때까지 무한 루프 (알고리즘의 BFS/DFS 탐색 느낌)
    while (!isUnique) {
      customId = generateRoomId();
      const docRef = doc(db, "rooms", customId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        isUnique = true; // DB에 없어야만 통과!
      } else {
        console.log(`ID 충돌 발생: ${customId}, 다시 생성합니다.`);
      }
    }

    try {
      await setDoc(doc(db, "rooms", customId), {
        roomName: roomName,
        capacity: 1,
        maxCapacity: selectedCapacity,
        decision: decision ?? "vote",
        rank: rank ?? "count",
        showPublic: showPublic ?? true,
        topic: [...pickedTopic.keys()].join(", "),
        internalValue: internalValue || "",
        createdAt: new Date(),
        playing: false,
      });

      setRoomDescription(null);

      router.push(`/room/${customId}`);
    } catch (error: any) {
      console.error("방 생성 중 에러 발생:", error);

      if (error.code === "permission-denied") {
        alert("방을 만들 권한이 없습니다. 로그인을 확인해주세요.");
      } else {
        alert("네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      }
    } finally {
      setIsCreating(false);
    }
  };

  const updateRoom = () => {
    if (isRoomValid()) return;
  };

  const showTopic = () => {
    if (!pickedTopic.size) return "주제가 선택되지 않았습니다.";

    const firstTopic = pickedTopic.values().next().value;

    if (!firstTopic) return "주제가 선택되지 않았습니다.";

    if (pickedTopic.size === 1) return firstTopic;
    else return `${firstTopic} 외 ${pickedTopic.size - 1}개`;
  };

  const isOpen: boolean = !!roomDescription;

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // 모달을 닫을 때는 무조건 null로 초기화
      setRoomDescription(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-zinc-950 text-zinc-100 select-none">
        <DialogHeader className="text-center mt-5">
          <DialogTitle className="text-2xl">
            {roomDescription === "create" ? "방 생성" : "방 수정"}
          </DialogTitle>
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
            <label>{showTopic()}</label>
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
            <Switch
              className="data-[state=unchecked]:bg-zinc-600 data-[state=checked]:bg-zinc-800"
              checked={showPublic}
              onCheckedChange={setShowPublic}
            />
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
            className={`w-30 px-6 py-2 rounded
              text bg-zinc-900
              hover:bg-zinc-800
              ${isCreating && "cursor-not-allowed opacity-50"}
              `}
            onClick={roomDescription === "create" ? createRoom : updateRoom}
            disabled={isCreating}
          >
            {roomDescription === "create" ? "생성" : "수정"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
