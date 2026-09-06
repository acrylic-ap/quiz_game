"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/hooks/queries/common/account/useAuth";
import { useRoomUsers } from "@/hooks/queries/room/crud/useRoomUsers";
import { RoomInfo } from "./RoomInfo";
import { UserList } from "./UserList";
import { ChatSection } from "./ChatSection";
import { useGameStart } from "@/hooks/queries/room/actions/useGameStart";
import { useGameReady } from "@/hooks/queries/room/actions/useGameReady";
import { useGameSettingWatcher } from "@/hooks/queries/room/actions/useGameSettingWatcher";
import { GameControls } from "./GameControls";
import { useAtom, useAtomValue } from "jotai";
import { currentRoomIdAtom } from "@/atoms/roomAtom";
import { alertModalState } from "@/atoms/modalAtom";
import { useRoomSubscription } from "@/hooks/queries/room/crud/useRoomQuery";

export const Section = () => {
  const router = useRouter();

  const roomId = useAtomValue(currentRoomIdAtom);

  const { data: users = [] } = useRoomUsers(roomId);
  const { data: user } = useAuth();
  const { data: roomData } = useRoomSubscription(roomId);

  const [, setAlertModal] = useAtom(alertModalState);

  const { mutate: startGame } = useGameStart(roomId);

  const { mutate: toggleReady } = useGameReady(roomId, user?.uid);

  const currentUser = users.find((u) => u.id === user?.uid);

  const isOwner = roomData?.config.ownerId === user?.uid;

  // setting → playing 처리
  useGameSettingWatcher({
    roomId,
    status: roomData?.status ?? "waiting",
    isOwner,
  });

  // playing → GamePage 이동
  useEffect(() => {
    console.log("[Room] status:", roomData?.status);

    if (!roomId) return;

    if (roomData?.status !== "playing") {
      return;
    }

    console.log("[Room] 게임 페이지 이동:", `/game/${roomId}`);

    router.replace(`/game/${roomId}`);
  }, [roomData?.status, roomId, router]);

  const handleStartGame = () => {
    if (users.length <= 1) {
      setAlertModal("누구랑 경쟁하시려고요?");
      return;
    }

    const ownerId = roomData?.config.ownerId;

    if (!ownerId) return;

    const participants = users.filter((user) => user.id !== ownerId);

    if (!participants.every((user) => user.isReady)) {
      setAlertModal("준비할 시간을 주세요.");
      return;
    }

    console.log("[Room] 게임 시작");

    startGame();
  };

  // setting 화면
  if (roomData?.status === "setting") {
    return (
      <div className="flex h-[calc(100vh-64px)] w-full items-center justify-center bg-zinc-950 text-zinc-100">
        <div className="text-center">
          <p className="text-3xl font-bold">게임을 구성하고 있습니다</p>

          <p className="mt-3 text-zinc-400">잠시만 기다려주세요...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-[calc(100vh-64px)] w-full flex-col gap-6 bg-zinc-950 p-6 text-zinc-100 md:p-8">
      <RoomInfo />

      <div className="flex min-h-0 flex-1 flex-col gap-6 md:flex-row">
        <UserList />
        <ChatSection />
      </div>

      <div className="flex h-20 flex-row items-center justify-center">
        {currentUser && (
          <GameControls
            isOwner={currentUser.id === roomData?.config.ownerId}
            isReady={currentUser.isReady}
            onStart={handleStartGame}
            onToggleReady={() => toggleReady(currentUser.isReady)}
          />
        )}
      </div>
    </div>
  );
};
