// UserInfoDropdown.tsx
"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { User } from "lucide-react";

const DROPDOWN_ITEMS = [
  { label: "전적" },
  { label: "퀴즈 관리" },
  { label: "로그아웃", isLogout: true },
];

interface Props {
  user: { nickname: string };
  onLogout: () => void;
  onItemClick: () => void;
}

export default function UserInfoDropdown({
  user,
  onLogout,
  onItemClick,
}: Props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="text-zinc-100">
          <span className="truncate">{user.nickname}</span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="bg-zinc-800 text-zinc-100 border-zinc-700"
      >
        {/* 내 정보 - Dialog 트리거 */}
        <Dialog>
          <DialogTrigger asChild>
            <DropdownMenuItem
              className="flex justify-center hover:bg-zinc-700 cursor-pointer"
              onSelect={(e) => e.preventDefault()}
            >
              {user.nickname}
              <User size={14} />
            </DropdownMenuItem>
          </DialogTrigger>
          <DialogContent className="bg-zinc-950 text-zinc-100">
            <DialogHeader>
              <DialogTitle>내 정보</DialogTitle>
            </DialogHeader>
          </DialogContent>
        </Dialog>

        <DropdownMenuSeparator className="bg-zinc-700" />

        {DROPDOWN_ITEMS.map((item) => (
          <DropdownMenuItem
            key={item.label}
            className="flex justify-center hover:bg-zinc-700 cursor-pointer"
            onClick={item.isLogout ? onLogout : onItemClick}
          >
            {item.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
