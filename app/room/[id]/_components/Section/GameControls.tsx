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
  const buttonStyle = `w-48 h-12 rounded-xl text-lg font-bold text-white shadow-lg transition active:scale-95 outline-none animate-pulse-slow`;

  return (
    <div className="h-20 flex items-center justify-center">
      <button
        className={`${buttonStyle} ${
          isOwner
            ? "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/30"
            : isReady
              ? "bg-zinc-700 hover:bg-zinc-600 shadow-zinc-500/30"
              : "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/30"
        }`}
        onClick={isOwner ? onStart : onToggleReady}
      >
        {isOwner ? "게임 시작" : isReady ? "준비 취소" : "준비"}
      </button>
    </div>
  );
};
