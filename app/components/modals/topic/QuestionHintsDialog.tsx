"use client";

import { useEffect, useRef, useState } from "react";

import { DeleteIcon } from "@/components/common/icons/DeleteIcon";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Hint } from "@/types/topic/topic";
import { QUESTION_TIME_LIMIT_MS } from "@/utils/game";

export function QuestionHintsDialog({
  open,
  onOpenChange,
  hints,
  onChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hints: Hint[];
  onChange: (hints: Hint[]) => void;
}) {
  const [draftHints, setDraftHints] = useState<Hint[]>(hints);

  useEffect(() => {
    if (open) {
      setDraftHints(hints);
    }
  }, [open, hints]);

  const handleSave = () => {
    onChange(draftHints);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="
          w-[1200px]
          min-w-[40vw]
          rounded-[16px]
          border-zinc-700
          bg-[#09090B]
          px-[80px]
          pt-[42px]
          pb-[36px]
          text-zinc-100
        "
        aria-describedby={undefined}
      >
        <DialogHeader className="items-center">
          <DialogTitle className="text-center text-[24px] font-semibold">
            힌트 분기
          </DialogTitle>

          <p className="mt-[10px] text-center text-[15px] leading-[1.5] text-zinc-400">
            막대의 빈 공간을 눌러 분기를
            <br />
            추가하세요
          </p>
        </DialogHeader>

        <HintTimeline hints={draftHints} onChange={setDraftHints} />

        <div className="mt-[40px] flex justify-center">
          <button
            type="button"
            className="
              h-[42px]
              w-[132px]
              rounded-[7px]
              bg-zinc-800
              text-[14px]
              font-medium
              text-zinc-200
              transition-colors
              hover:bg-zinc-700
            "
            onClick={handleSave}
          >
            저장
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function HintTimeline({
  hints,
  onChange,
}: {
  hints: Hint[];
  onChange: (hints: Hint[]) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);

  const track = useRef<HTMLDivElement>(null);

  const limit = QUESTION_TIME_LIMIT_MS / 1000;
  const active = hints.find((hint) => hint.id === selected);

  const timeAt = (clientX: number) => {
    const bounds = track.current!.getBoundingClientRect();

    const ratio = Math.min(
      1,
      Math.max(0, (clientX - bounds.left) / bounds.width),
    );

    return Math.round(limit * (1 - ratio));
  };

  const move = (id: string, revealTime: number) => {
    if (
      hints.some((hint) => hint.id !== id && hint.revealTime === revealTime)
    ) {
      return;
    }

    onChange(
      hints.map((hint) => (hint.id === id ? { ...hint, revealTime } : hint)),
    );
  };

  return (
    <div className="mt-[42px]">
      <div className="relative">
        <div
          ref={track}
          className="
            relative
            h-[20px]
            cursor-pointer
            touch-none
          "
          onPointerDown={(e) => {
            if (e.button !== 0) return;

            const revealTime = timeAt(e.clientX);

            if (hints.some((hint) => hint.revealTime === revealTime)) {
              return;
            }

            const id = crypto.randomUUID();

            onChange([
              ...hints,
              {
                id,
                content: "",
                revealTime,
              },
            ]);

            setSelected(id);
          }}
        >
          <div
            className="
              pointer-events-none
              absolute
              top-1/2
              h-[20px]
              w-full
              -translate-y-1/2
              rounded-full
              bg-zinc-900
            "
          />

          {hints.map((hint) => {
            const isSelected = selected === hint.id;

            return (
              <button
                key={hint.id}
                type="button"
                role="slider"
                aria-label="힌트 공개 시간"
                aria-valuemin={0}
                aria-valuemax={limit}
                aria-valuenow={hint.revealTime ?? 0}
                className={`
                  absolute
                  top-1/2
                  h-[20px]
                  w-[20px]
                  -translate-x-1/2
                  -translate-y-1/2
                  rounded-full
                  touch-none
                  transition-colors
                  ${isSelected ? "bg-zinc-100" : "bg-zinc-600"}
                `}
                style={{
                  left: `${(1 - (hint.revealTime ?? 0) / limit) * 100}%`,
                }}
                onFocus={() => setSelected(hint.id)}
                onPointerDown={(e) => {
                  e.stopPropagation();

                  if (e.button !== 0) return;

                  setSelected(hint.id);

                  e.currentTarget.setPointerCapture(e.pointerId);
                }}
                onPointerMove={(e) => {
                  if (
                    !e.currentTarget.hasPointerCapture(e.pointerId) ||
                    !e.buttons
                  ) {
                    return;
                  }

                  setDragging(hint.id);
                  move(hint.id, timeAt(e.clientX));
                }}
                onPointerUp={(e) => {
                  if (e.currentTarget.hasPointerCapture(e.pointerId)) {
                    e.currentTarget.releasePointerCapture(e.pointerId);
                  }

                  setDragging(null);
                }}
                onPointerCancel={() => setDragging(null)}
                onLostPointerCapture={() => setDragging(null)}
              >
                {isSelected && (
                  <span
                    className="
                      pointer-events-none
                      absolute
                      top-[28px]
                      left-1/2
                      -translate-x-1/2
                      whitespace-nowrap
                      text-[14px]
                      text-zinc-300
                    "
                  >
                    {hint.revealTime}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-[10px] flex items-center justify-between">
          <span className="text-[14px] text-zinc-500">{limit}</span>

          <div className="flex items-center gap-[6px]">
            <span className="text-[14px] text-zinc-500">0</span>

            <span className="text-[12px] text-zinc-600">(남은 초)</span>
          </div>
        </div>
      </div>

      {active && (
        <div className="mt-[34px] flex items-center gap-[10px]">
          <input
            aria-label="힌트 내용"
            value={active.content ?? ""}
            placeholder="힌트를 입력하세요"
            onChange={(e) =>
              onChange(
                hints.map((hint) =>
                  hint.id === selected
                    ? {
                        ...hint,
                        content: e.target.value,
                      }
                    : hint,
                ),
              )
            }
            className="
              h-[50px]
              min-w-0
              flex-1
              rounded-[8px]
              border
              border-zinc-600
              bg-[#09090B]
              px-[18px]
              text-[15px]
              text-zinc-300
              outline-none
              placeholder:text-zinc-600
              focus:border-zinc-500
            "
          />

          <button
            type="button"
            aria-label="힌트 삭제"
            className="
              flex
              h-[34px]
              w-[34px]
              shrink-0
              items-center
              justify-center
              text-zinc-500
              transition-colors
              hover:text-red-400
            "
            onClick={() => {
              onChange(hints.filter((hint) => hint.id !== selected));

              setSelected(null);
            }}
          >
            <span className="scale-[0.55]">
              <DeleteIcon width="35" height="35" />
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
