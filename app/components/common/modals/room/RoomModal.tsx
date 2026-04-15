"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { CircleQuestionMark, User } from "lucide-react";
import { useEffect, useState } from "react";
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
import { getDoc, doc, setDoc, updateDoc } from "firebase/firestore";
import { usePathname, useRouter } from "next/navigation";
import { generateRoomId } from "@/app/lib/utils";
import { DECISION_LIST, DecisionType } from "@/app/atom/lobbyAtom";
import { getDisplayTopic } from "../../utils/topic";
import { useRoomSubscription } from "@/app/hooks/queries/room/useRoomQuery";

export default function RoomModal() {
  const router = useRouter();
  const roomId = usePathname().split("/").pop();

  // Atoms
  const [roomDescription, setRoomDescription] = useAtom(setRoomModalState);
  const [, setAlertModal] = useAtom(alertModalState);
  const [, setShowTopicModal] = useAtom(showTopicModalState);
  const [pickedTopic, setPickedTopic] = useAtom(pickedTopicAtom);
  const [internalValue, setInternalValue] = useAtom(internalValueAtom);

  const { data: room } = useRoomSubscription(roomId);

  // Local States
  const [roomName, setRoomName] = useState("");
  const [decision, setDecision] = useState<DecisionType>("random");
  const [selectedCapacity, setSelectedCapacity] = useState(2);
  const [rank, setRank] = useState<"count" | "time">("count");
  const [showPublic, setShowPublic] = useState(true);
  const [showTopicInfo, setShowTopicInfo] = useState(false);
  const [showScoreInfo, setShowScoreInfo] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // 수정 모드일 때 기존 데이터 세팅
  useEffect(() => {
    if (roomDescription === "edit" && room) {
      setRoomName(room.roomName || "");
      setDecision(room.decision || "random");
      setInternalValue(room.internalValue || 10);
      setShowPublic(room.showPublic ?? true);
      setRank(room.rank || "count");
      setSelectedCapacity(room.maxCapacity || 2);

      if (room.topicItem) {
        setPickedTopic(new Map(room.topicItem));
      }
    } else if (roomDescription === "create") {
      // 생성 모드 진입 시 초기화가 필요하다면 여기서 수행
      setRoomName("");
    }
  }, [roomDescription, room, setInternalValue, setPickedTopic]);

  const isRoomValid = () => {
    if (!roomName.trim()) {
      setAlertModal("방 제목을 입력하세요.");
      return false;
    }
    if (pickedTopic.size === 0) {
      setAlertModal("주제를 선택하세요.");
      return false;
    }
    return true;
  };

  // 방 생성/수정 공통 데이터 객체
  const getRoomPayload = () => ({
    roomName: roomName.trim(),
    maxCapacity: selectedCapacity,
    decision: decision,
    rank: rank,
    showPublic: showPublic,
    topic: [...pickedTopic.keys()].join(", "),
    internalValue: internalValue || "",
    updatedAt: new Date(),
  });

  const handleCreateRoom = async () => {
    if (isProcessing || !isRoomValid()) return;
    setIsProcessing(true);

    try {
      let customId = "";
      let isUnique = false;

      while (!isUnique) {
        customId = generateRoomId();
        const docRef = doc(db, "rooms", customId);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) isUnique = true;
      }

      await setDoc(doc(db, "rooms", customId), {
        ...getRoomPayload(),
        capacity: 1, // 방장은 자동으로 참여하므로 1
        createdAt: new Date(),
        playing: false,
      });

      setRoomDescription(null);
      router.push(`/room/${customId}`);
    } catch (error: any) {
      console.error("방 생성 에러:", error);
      alert("방 생성 중 오류가 발생했습니다.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateRoom = async () => {
    if (isProcessing || !isRoomValid() || !room?.id) return;
    setIsProcessing(true);

    try {
      const docRef = doc(db, "rooms", room.id);
      await updateDoc(docRef, getRoomPayload());
      setRoomDescription(null);
    } catch (error) {
      console.error("방 수정 에러:", error);
      alert("방 정보를 수정하는데 실패했습니다.");
    } finally {
      setIsProcessing(false);
    }
  };

  const isOpen = !!roomDescription;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && setRoomDescription(null)}
    >
      <DialogContent className="bg-zinc-950 text-zinc-100 select-none">
        <DialogHeader className="text-center mt-5">
          <DialogTitle className="text-2xl">
            {roomDescription === "create" ? "방 생성" : "방 수정"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* 방 제목 입력 */}
          <div className="flex flex-col space-y-2 mb-5">
            <input
              type="text"
              placeholder="방 제목을 입력하세요"
              className="bg-zinc-900 text-zinc-100 rounded pl-2 py-3 outline-none placeholder:text-zinc-500"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
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
            <label>{getDisplayTopic(pickedTopic)}</label>
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

          {/* 문제 개수 슬라이더 */}
          <div className="flex flex-row items-center">
            <h2 className="font-bold text-lg mr-12">문제 개수</h2>
            <StepSlider />
          </div>

          {/* 공개 여부 스위치 */}
          <div className="flex flex-row items-center mb-5">
            <h2 className="font-bold text-lg mr-4">공개</h2>
            <Switch
              className="data-[state=unchecked]:bg-zinc-600 data-[state=checked]:bg-zinc-800"
              checked={showPublic}
              onCheckedChange={setShowPublic}
            />
          </div>

          {/* 점수 획득 기준 */}
          <div className="relative flex flex-row items-center">
            <h2 className="font-bold text-lg mr-2">점수 획득 기준</h2>
            <CircleQuestionMark
              size={17}
              className="mr-4 cursor-pointer"
              onClick={() => setShowScoreInfo(!showScoreInfo)}
            />
            {showScoreInfo && (
              <div
                className="absolute -bottom-13 px-2 py-1 rounded bg-zinc-800 text-sm whitespace-pre-wrap z-20"
                onClick={() => setShowScoreInfo(false)}
              >
                {`개수: 맞힌 개수\n시간: 시간 비례 점수`}
              </div>
            )}
            <button
              className={`px-3 py-1 mr-1 rounded hover:bg-zinc-900 transition-colors ${
                rank === "count" ? "bg-zinc-900" : "bg-zinc-800 text-zinc-400"
              }`}
              onClick={() => setRank("count")}
            >
              개수
            </button>
            <button
              className={`px-3 py-1 rounded hover:bg-zinc-900 transition-colors ${
                rank === "time" ? "bg-zinc-900" : "bg-zinc-800 text-zinc-400"
              }`}
              onClick={() => setRank("time")}
            >
              시간
            </button>
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="flex justify-center mt-6">
          <button
            className={`w-30 py-2 rounded text bg-zinc-900 hover:bg-zinc-800 transition-all ${
              isProcessing ? "cursor-not-allowed opacity-50" : ""
            }`}
            onClick={
              roomDescription === "create" ? handleCreateRoom : handleUpdateRoom
            }
            disabled={isProcessing}
          >
            {isProcessing
              ? "처리 중..."
              : roomDescription === "create"
                ? "생성"
                : "수정"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
