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
  topicDescriptions: Record<string, string>;
  topicCategories: Record<string, string>;
  decision: "random" | "vote" | "always_random";
}

export const GameTopicRandomPanel = ({
  roomId,
  isOwner,
  topicIds,
  topicNames,
  topicDescriptions,
  topicCategories,
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

  if (!shouldShow || !showPanel) {
    return null;
  }

  const selectedIndex = selectedTopicId
    ? topicIds.indexOf(selectedTopicId)
    : -1;

  const displayedActiveIndex = selectedIndex >= 0 ? selectedIndex : activeIndex;

  return (
    <div className="flex min-h-0 flex-1 flex-col justify-center">
      <div className="ml-10 flex w-full flex-col items-start">
        <div className="ml-3">
          <p className="text-[24px] font-semibold text-zinc-100">
            {selectedTopicId ? "선택된 주제" : "주제를 랜덤으로 고르는 중..."}
          </p>
        </div>

        <div className="mt-12 w-full overflow-x-auto">
          <div className="flex w-max gap-[36px] pb-2">
            {topicIds.map((topicId, index) => {
              const isActive = displayedActiveIndex === index;

              return (
                <div
                  key={topicId}
                  className={`
                    relative flex h-[240px] w-[232px] shrink-0 flex-col overflow-hidden bg-zinc-950 text-left
                    rounded-[7px] border-2
                    transition duration-100
                    ${isActive ? "border-zinc-400" : "border-zinc-700"}
                  `}
                >
                  {/* 이미지 영역 - 추후 Supabase 이미지 연결 */}
                  <div className="absolute inset-0 bg-zinc-950" />

                  {/* 이미지가 들어왔을 때 사용할 어두운 오버레이 */}
                  <div className="absolute inset-0 bg-black/40" />

                  <div className="relative z-10 flex h-full flex-col p-[13px]">
                    <div className="flex items-start">
                      <div
                        className="
                          flex h-8 min-w-[63px] items-center justify-center bg-[#1E1E1E] px-3
                          rounded-lg border border-zinc-700
                          text-sm font-medium text-zinc-200
                        "
                      >
                        {topicCategories[topicId] ?? ""}
                      </div>
                    </div>

                    <div className="mt-8 mx-3">
                      <p className="line-clamp-2 text-xl font-semibold leading-snug text-zinc-50">
                        {topicNames[topicId] ?? topicId}
                      </p>

                      <p className="mt-2 line-clamp-2 text-sm text-zinc-300">
                        {topicDescriptions[topicId] ?? ""}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
