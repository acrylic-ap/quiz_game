// app/room/[id]/_components/RoomProvider.tsx
"use client";

import { useEffect } from "react";
import { useSetAtom } from "jotai";
import { currentRoomIdAtom } from "@/app/atoms/roomAtom"; // 경로는 맞게 조정

export default function RoomProvider({
  children,
  roomId,
}: {
  children: React.ReactNode;
  roomId: string;
}) {
  const setRoomId = useSetAtom(currentRoomIdAtom);

  useEffect(() => {
    setRoomId(roomId);
  }, [roomId]);

  return <>{children}</>;
}
