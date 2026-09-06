"use client";

import { useEffect, useRef } from "react";
import { useGameSettingComplete } from "./useGameSettingComplete";

interface UseGameSettingWatcherProps {
  roomId: string | undefined;
  status: "waiting" | "setting" | "playing";
  isOwner: boolean;
}

export const useGameSettingWatcher = ({
  roomId,
  status,
  isOwner,
}: UseGameSettingWatcherProps) => {
  const completedRef = useRef(false);

  const { mutate: completeSetting } = useGameSettingComplete(roomId);

  useEffect(() => {
    console.log("[GameSetting] watcher:", {
      roomId,
      status,
      isOwner,
    });

    if (status !== "setting") {
      completedRef.current = false;
      return;
    }

    if (!isOwner) {
      console.log("[GameSetting] 방장이 아니므로 대기");
      return;
    }

    if (completedRef.current) return;

    completedRef.current = true;

    console.log("[GameSetting] 게임 구성 시작");

    // 현재는 실제 구성 작업이 없으므로
    // setting 진입 후 구성 완료 처리
    completeSetting();
  }, [roomId, status, isOwner, completeSetting]);
};
