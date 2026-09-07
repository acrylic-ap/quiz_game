"use client";

import { useEffect, useMemo } from "react";

import { useParams } from "next/navigation";

import { useAuth } from "@/hooks/queries/common/account/useAuth";

import { useRoomSubscription } from "@/hooks/queries/room/crud/useRoomQuery";

import { useGameJoinReady } from "@/hooks/queries/game/actions/useGameJoinReady";

import { useGameJoinReadyQuery } from "@/hooks/queries/game/crud/useGameJoinReadyQuery";

import { GameScreen } from "./_components/GameScreen";

export default function GamePage() {
  const params = useParams();

  const roomId = params.id as string;

  const { data: user } = useAuth();

  const { data: roomData } = useRoomSubscription(roomId);

  const { mutate: joinReady } = useGameJoinReady(roomId, user?.uid);

  const { data: joinReadyUsers = {} } = useGameJoinReadyQuery(roomId);

  const users = roomData?.users ?? [];

  const allUsersReady = useMemo(() => {
    if (users.length === 0) {
      return false;
    }

    return users.every(
      (roomUser) => joinReadyUsers[roomUser.id]?.ready === true,
    );
  }, [users, joinReadyUsers]);

  const isOwner = roomData?.config.ownerId === user?.uid;

  useEffect(() => {
    if (!user?.uid) {
      return;
    }

    if (roomData?.status !== "playing") {
      return;
    }

    joinReady();
  }, [roomData?.status, user?.uid, joinReady]);

  const decision = roomData?.gameConfig?.decision ?? "random";

  const lastRound = roomData?.gameConfig?.lastRound ?? 60;

  const topicIds = Array.from(roomData?.gameConfig?.topic.keys() ?? []);

  const topicNames = Object.fromEntries(roomData?.gameConfig?.topic ?? []);

  const topicDescriptions = Object.fromEntries(
    roomData?.gameConfig?.topicDescriptions ?? [],
  );

  const topicCategories = Object.fromEntries(
    roomData?.gameConfig?.topicCategories ?? [],
  );

  return (
    <main className="h-screen w-full overflow-hidden bg-[#09090B] text-white">
      <GameScreen
        roomId={roomId}
        title={roomData?.config.roomName ?? ""}
        allUsersReady={allUsersReady}
        isOwner={isOwner}
        userId={user?.uid}
        users={users}
        decision={decision}
        lastRound={lastRound}
        topicIds={topicIds}
        topicNames={topicNames}
        topicDescriptions={topicDescriptions}
        topicCategories={topicCategories}
      />
    </main>
  );
}
