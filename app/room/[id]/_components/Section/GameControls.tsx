import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface GameControlsProps {
  isOwner: boolean;
  isReady: boolean;
  onStart: () => void;
  onToggleReady: () => void;
}

export const GameControls = ({
  isOwner,
  isReady,
  onStart,
  onToggleReady,
}: GameControlsProps) => {
  return (
    <div className="h-20 flex items-center justify-center">
      <Button
        variant={!isOwner && isReady ? "ready" : "default"}
        className={cn(
          "w-48 h-12 rounded-xl text-lg font-bold shadow-lg animate-pulse-slow",
          !isOwner && isReady ? "shadow-zinc-500/30" : "shadow-indigo-500/30",
        )}
        onClick={isOwner ? onStart : onToggleReady}
      >
        {isOwner ? "게임 시작" : isReady ? "준비 취소" : "준비"}
      </Button>
    </div>
  );
};
