"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { CircleQuestionMark, Plus, User } from "lucide-react";
import { useEffect, useState } from "react";
import { StepSlider } from "./_components/Slider";
import { useAtom, useAtomValue } from "jotai";
import {
  alertModalState,
  setRoomModalState,
  showTopicModalState,
} from "@/app/atoms/modalAtom";
import { pickedTopicAtom } from "@/app/atoms/topicAtom";
import { topicDecisionAtom, questionCountAtom } from "@/app/atoms/roomFormAtom";
import { getDisplayTopic } from "@/app/lib/utils";
import { useRoomSubscription } from "@/app/hooks/queries/room/queries/useRoomQuery";
import { useAuth } from "@/app/hooks/queries/common/account/useAuth";
import { currentRoomIdAtom } from "@/app/atoms/roomAtom";
import { useRoomMutation } from "@/app/hooks/queries/room_modal/useRoomMutation";

export default function RoomModal() {
  const roomId = useAtomValue(currentRoomIdAtom);

  // Atoms
  const [roomDescription, setRoomDescription] = useAtom(setRoomModalState);
  const [, setAlertModal] = useAtom(alertModalState);
  const [, setShowTopicModal] = useAtom(showTopicModalState);
  const [pickedTopic, setPickedTopic] = useAtom(pickedTopicAtom);
  const [internalValue, setInternalValue] = useAtom(questionCountAtom);
  const [decision, setDecision] = useAtom(topicDecisionAtom);

  // React Queries
  const { data: room } = useRoomSubscription(roomId);
  const { data: user } = useAuth();
  const { createRoom, updateRoom } = useRoomMutation();

  // Local States
  const [roomName, setRoomName] = useState("");
  const [selectedCapacity, setSelectedCapacity] = useState(2);
  const [rank, setRank] = useState<"count" | "time">("count");
  const [showPublic, setShowPublic] = useState(true);
  const [showScoreInfo, setShowScoreInfo] = useState(false);

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

  const handleCreateRoom = () => {
    if (!isRoomValid() || !user) return;
    createRoom.mutate(getRoomPayload(), {
      onSuccess: () => setRoomDescription(null),
    });
  };

  const handleUpdateRoom = () => {
    if (!isRoomValid() || !room?.id) return;
    updateRoom.mutate(
      { roomId: room.id, data: getRoomPayload() },
      { onSuccess: () => setRoomDescription(null) },
    );
  };

  const isProcessing = createRoom.isPending || updateRoom.isPending;
  const isOpen = !!roomDescription;

  const titleStyle = `text-zinc-300 font-bold text-lg`;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && setRoomDescription(null)}
    >
      <DialogContent className="bg-zinc-950 text-zinc-100 select-none">
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl">
            {roomDescription === "create" ? "방 생성" : "방 수정"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-col space-y-2 mb-5">
            <input
              type="text"
              placeholder="방 제목을 입력하세요"
              className="bg-zinc-900 text-zinc-100 rounded-lg pl-4 py-3 outline-none placeholder:text-zinc-500"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
            />
          </div>

          <div
            className="relative w-full mb-5
            flex flex-row items-center space-x-2"
          >
            <h2 className={`${titleStyle} shrink-0`}>인원</h2>
            <div className="group w-full flex flex-row justify-center gap-2 [&_svg]:group-hover:text-zinc-500 [&>button:has(~_button:hover)_svg]:text-white [&>button:hover_svg]:text-white">
              {Array.from({ length: 8 }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => index >= 1 && setSelectedCapacity(index + 1)}
                  className="group"
                >
                  <User
                    className={`transition-colors duration-200 ${selectedCapacity >= index + 1 ? "text-white" : "text-zinc-500"}`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div
            className="relative flex flex-row
            items-center space-x-2"
          >
            <h2 className={`${titleStyle} mr-4`}>주제</h2>
            <label>{getDisplayTopic(pickedTopic)}</label>
            <div className="absolute right-0">
              <button
                className="flex items-center justify-center
                w-9 h-7 mr-1 rounded-lg
                text bg-zinc-900 hover:bg-zinc-800"
                onClick={() => setShowTopicModal(true)}
              >
                <Plus size={12} />
              </button>
            </div>
          </div>

          <div className="flex flex-row items-center mb-5">
            <h2 className={`${titleStyle} mr-12`}>문제 개수</h2>
            <StepSlider />
          </div>

          <div className="relative flex flex-row items-center mb-5">
            <h2 className={`${titleStyle} mr-2`}>점수 획득 기준</h2>
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
                <div className="flex gap-1">
                  <h2 className="text-zinc-300">개수</h2>
                  <p>맞힌 개수</p>
                </div>
                <div className="flex gap-1">
                  <h2 className="text-zinc-300">시간</h2>
                  <p>시간 비례 점수</p>
                </div>
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

          <div className="flex flex-row items-center">
            <h2 className={`${titleStyle} mr-4`}>공개</h2>
            <Switch
              className="data-[state=unchecked]:bg-zinc-600 data-[state=checked]:bg-zinc-800"
              checked={showPublic}
              onCheckedChange={setShowPublic}
            />
          </div>
        </div>

        <div className="flex justify-center">
          <button
            className={`w-30 py-2 rounded-lg text bg-zinc-900 hover:bg-zinc-800 transition-all ${
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
