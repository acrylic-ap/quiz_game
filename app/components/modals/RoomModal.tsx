import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function RoomModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          className="px-6 py-2 mr-2 rounded-sm
                  text-lg bg-zinc-900
                  hover:bg-zinc-800"
        >
          방 생성
        </button>
      </DialogTrigger>
      <DialogContent className="bg-zinc-950 text-zinc-100">
        <DialogHeader>
          <DialogTitle>방 생성</DialogTitle>
        </DialogHeader>
        <div>어쩔</div>
        {/* 여기에 방 제목 입력, 과목 선택 등의 폼을 넣으면 끝! */}
      </DialogContent>
    </Dialog>
  );
}
