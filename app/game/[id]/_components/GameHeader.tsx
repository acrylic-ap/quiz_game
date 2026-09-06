interface GameHeaderProps {
  roomId: string;
  title: string;
}

export const GameHeader = ({ roomId, title }: GameHeaderProps) => {
  return (
    <header className="flex h-[12%] w-full shrink-0 items-center border-b border-zinc-500">
      <div className="flex items-center gap-8 pl-6">
        {/* ID */}
        <span className="text-2xl font-medium text-zinc-400">{roomId}</span>

        {/* 제목 */}
        <span className="text-2xl font-medium text-white">{title}</span>
      </div>
    </header>
  );
};
