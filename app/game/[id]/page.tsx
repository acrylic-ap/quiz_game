"use client";

import { useEffect, useMemo } from "react";
import { useParams } from "next/navigation";

import { useAuth } from "@/hooks/queries/common/account/useAuth";
import { useRoomSubscription } from "@/hooks/queries/room/crud/useRoomQuery";
import { useGameJoinReady } from "@/hooks/queries/room/actions/useGameJoinReady";
import { useGameJoinReadyQuery } from "@/hooks/queries/room/crud/useGameJoinReadyQuery";

import { GameScreen } from "./_components/GameScreen";

export default function GamePage() {
  const params = useParams();
  const roomId = params.id as string;

  const { data: user } = useAuth();

  const { data: roomData } = useRoomSubscription(roomId);

  const { mutate: joinReady } = useGameJoinReady(roomId, user?.uid);

  const { data: joinReadyUsers = {} } = useGameJoinReadyQuery(roomId);

  // 실제 방에 남아 있는 모든 유저
  const users = roomData?.users ?? [];

  const allUsersReady = useMemo(() => {
    if (users.length === 0) {
      return false;
    }

    return users.every(
      (roomUser) => joinReadyUsers[roomUser.id]?.ready === true,
    );
  }, [users, joinReadyUsers]);

  // GamePage 입장 완료 처리
  useEffect(() => {
    if (!user?.uid) return;

    console.log("[Game] mounted:", roomId);
    console.log("[Game] joinReady:", user.uid);

    joinReady();
  }, [roomId, user?.uid, joinReady]);

  useEffect(() => {
    console.log("[Game] 입장 현황:", joinReadyUsers);

    console.log("[Game] 전체 입장 완료:", allUsersReady);
  }, [joinReadyUsers, allUsersReady]);

  return (
    <main className="h-screen w-full overflow-hidden bg-[#09090B] text-white">
      <GameScreen
        roomId={roomId}
        title={roomData?.config.roomName ?? ""}
        allUsersReady={allUsersReady}
      />
    </main>
  );
}
