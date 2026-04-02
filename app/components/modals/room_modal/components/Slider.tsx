"use client";

import { useCallback, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface StepSliderProps {
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: number;
  value?: number;
  onValueChange?: (value: number) => void;
  showLabels?: boolean;
  className?: string;
  maxLabel?: string;
}

export function StepSlider({
  min = 10,
  max = 60,
  step = 10,
  defaultValue,
  value: controlledValue,
  onValueChange,
  showLabels = true,
  className,
  maxLabel = "전체",
}: StepSliderProps) {
  const [internalValue, setInternalValue] = useState(defaultValue ?? min);
  const value = controlledValue ?? internalValue;

  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const steps = Array.from(
    { length: Math.floor((max - min) / step) + 1 },
    (_, i) => min + i * step,
  );

  const getPct = (v: number) => ((v - min) / (max - min)) * 100;

  const valueFromClientX = useCallback(
    (clientX: number) => {
      if (!trackRef.current) return value;
      const rect = trackRef.current.getBoundingClientRect();
      const ratio = Math.max(
        0,
        Math.min(1, (clientX - rect.left) / rect.width),
      );
      const raw = min + ratio * (max - min);
      return Math.round(raw / step) * step;
    },
    [min, max, step, value],
  );

  const setValue = useCallback(
    (v: number) => {
      setInternalValue(v);
      onValueChange?.(v);
    },
    [onValueChange],
  );

  const handleMouseDown = (e: React.MouseEvent) => {
    dragging.current = true;
    setValue(valueFromClientX(e.clientX));

    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      setValue(valueFromClientX(e.clientX));
    };
    const onUp = () => {
      dragging.current = false;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    dragging.current = true;
    setValue(valueFromClientX(e.touches[0].clientX));

    const onMove = (e: TouchEvent) => {
      if (!dragging.current) return;
      setValue(valueFromClientX(e.touches[0].clientX));
    };
    const onEnd = () => {
      dragging.current = false;
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
    };
    window.addEventListener("touchmove", onMove);
    window.addEventListener("touchend", onEnd);
  };

  return (
    <div className={cn("relative w-[60%] pt-5 pb-7.5", className)}>
      {/* 트랙 영역: 클릭/드래그 이벤트 수신 */}
      <div
        ref={trackRef}
        className="relative h-1.5 cursor-pointer"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {/* 트랙 배경 + 마커 (overflow-hidden으로 마커 끝 정리) */}
        <div className="absolute inset-0 rounded-full bg-black overflow-hidden">
          {/* 채워진 범위 */}
          <div
            className="absolute inset-y-0 left-0 bg-zinc-800 rounded-full"
            style={{ width: `${getPct(value)}%` }}
          />
        </div>

        {/* Thumb: track 기준 absolute, top 50% + -translate-y-1/2 로 수직 중앙 */}
        <div
          className="absolute top-1/2 z-10 h-5 w-5
          -translate-y-1/2 -translate-x-1/2 rounded-full
          border-2 border-zinc-900 bg-white shadow-sm
          cursor-grab transition-transform hover:scale-110 active:scale-95 active:cursor-grabbing"
          style={{ left: `${getPct(value)}%` }}
        />
      </div>
      {showLabels && (
        <div className="absolute inset-x-0 bottom-0 h-5">
          {steps.map((v) => (
            <span
              key={v}
              className={cn(
                "absolute text-[11px] select-none tabular-nums transition-colors whitespace-nowrap",
                v === value ? "white" : "text-zinc-700",
              )}
              style={{
                left: `${getPct(v)}%`,
                transform: "translateX(-50%)", // 모든 숫자를 해당 눈금의 정중앙에 배치
                textAlign: "center",
                minWidth: "40px", // 터치/클릭 영역 및 정렬 안정성 확보
              }}
            >
              {v === max ? maxLabel : v}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
