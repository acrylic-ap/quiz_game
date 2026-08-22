export interface RoomUser {
  id: string;
  nickname: string;
  isOwner: boolean;
  isReady: boolean;
  joinedAt: number | object;
  avatar?: string;
}
