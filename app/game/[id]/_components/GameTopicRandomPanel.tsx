"use client";

import { useEffect, useRef, useState } from "react";

import { useGameTopic } from "@/hooks/queries/game/actions/useGameTopic";
import { useGameSelectedTopic } from "@/hooks/queries/game/crud/useGameSelectedTopic";
import { shuffle } from "@/utils/random";

interface GameTopicRandomPanelProps {
  roomId: string;
  isOwner: boolean;
  topicIds: string[];
  topicNames: Record<string, string>;
  decision: "random" | "vote" | "always_random";
}

export const GameTopicRandomPanel = ({
  roomId,
  isOwner,
  topicIds,
  topicNames,
  decision,
}: GameTopicRandomPanelProps) => {
  const { data: selectedTopicId } = useGameSelectedTopic(roomId);

  const { mutate: selectTopic } = useGameTopic(roomId);

  const [activeIndex, setActiveIndex] = useState(0);

  const [showPanel, setShowPanel] = useState(true);

  const deciding = useRef(false);

  const shouldShow = decision === "random" && topicIds.length > 1;

  useEffect(() => {
    if (!shouldShow || selectedTopicId) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveIndex((currentIndex) => (currentIndex + 1) % topicIds.length);
    }, 160);

    return () => {
      window.clearInterval(interval);
    };
  }, [selectedTopicId, shouldShow, topicIds.length]);

  useEffect(() => {
    if (!shouldShow || !isOwner || selectedTopicId || deciding.current) {
      return;
    }

    const timer = window.setTimeout(() => {
      deciding.current = true;

      selectTopic(shuffle(topicIds)[0], {
        onError: () => {
          deciding.current = false;
        },
      });
    }, 3_000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [isOwner, selectedTopicId, selectTopic, shouldShow, topicIds]);

  useEffect(() => {
    if (!shouldShow || !selectedTopicId) {
      return;
    }

    const timer = window.setTimeout(() => {
      setShowPanel(false);
    }, 3_000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [selectedTopicId, shouldShow]);

  if (!shouldShow || !showPanel) return null;

  const selectedIndex = selectedTopicId
    ? topicIds.indexOf(selectedTopicId)
    : -1;

  const displayedActiveIndex =
    selectedIndex >= 0 ? selectedIndex : activeIndex;

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6">
      <p className="text-xl font-semibold text-zinc-100">
        {selectedTopicId ? "선택된 주제" : "주제를 랜덤으로 고르는 중..."}
      </p>

      <div className="flex max-w-full flex-wrap justify-center gap-4">
        {topicIds.map((topicId, index) => (
          <div
            key={topicId}
            className={`w-44 rounded-xl border bg-zinc-900 p-5 transition-colors duration-100 ${
              displayedActiveIndex === index
                ? "border-zinc-100"
                : "border-zinc-700"
            }`}
          >
            <p className="truncate text-base font-semibold text-zinc-100">
              {topicNames[topicId] ?? topicId}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
