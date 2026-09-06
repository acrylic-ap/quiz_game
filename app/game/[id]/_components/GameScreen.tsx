import { GameHeader } from "./GameHeader";

interface GameScreenProps {
  roomId: string;
  title: string;
  allUsersReady: boolean;
}

export const GameScreen = ({
  roomId,
  title,
  allUsersReady,
}: GameScreenProps) => {
  return (
    <div className="flex h-full w-full flex-col bg-[#09090B]">
      <GameHeader roomId={roomId} title={title} />

      {/* 게임 영역 */}
      <main className="relative flex-1">
        {/* 실제 게임 영역 */}
        <div
          className="
            absolute
            left-[2.71%]
            top-[10.75%]
            h-[74.07%]
            w-[65.73%]
            bg-[#09090B]
          "
        />

        {/* 입장 대기 */}
        <div className="absolute inset-0 flex items-center justify-center">
          {allUsersReady ? (
            <span className="text-6xl font-bold text-white">성공!</span>
          ) : (
            <div className="text-center">
              <p className="text-3xl font-bold text-white">
                게임에 입장하는 중...
              </p>

              <p className="mt-3 text-lg text-zinc-500">
                모든 참가자를 기다리고 있습니다
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
