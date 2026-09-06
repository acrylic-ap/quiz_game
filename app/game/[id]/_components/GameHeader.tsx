interface GameHeaderProps {
  roomId: string;
  title: string;
}

export const GameHeader = ({ roomId, title }: GameHeaderProps) => {
  return (
    <header className="relative h-[15%] w-full shrink-0">
      {/* ID */}
      <div className="absolute left-[3.75%] top-1/2 -translate-y-1/2">
        <span className="text-2xl font-medium text-zinc-400">{roomId}</span>
      </div>

      {/* 제목 */}
      <div className="absolute left-[17%] top-1/2 -translate-y-1/2">
        <span className="text-2xl font-medium text-white">{title}</span>
      </div>

      {/* 구분선 */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-zinc-500" />
    </header>
  );
};
