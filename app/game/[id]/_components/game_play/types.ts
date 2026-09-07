import { Game } from "@/types/game/game";

export interface GameUser {
  id: string;
  nickname: string;
}

export interface GamePlayProps {
  roomId: string;
  userId: string | undefined;
  isOwner: boolean;
  users: GameUser[];
  game: Game;
  serverTimeOffset: number;
}
