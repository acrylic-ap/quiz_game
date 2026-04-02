"use client";

import { alertModalState } from "@/app/atom/modalAtom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAtom } from "jotai";

export default function AlertModal() {
  const [showAlertModal, setShowAlertModal] = useAtom(alertModalState);

  const isOpen = !!showAlertModal;

  const handleClose = () => setShowAlertModal(null);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="bg-zinc-950 text-zinc-100 select-none">
        <DialogHeader className="text-center mt-5">
          <DialogTitle className="text-2xl font-bold">스피드 퀴즈</DialogTitle>
        </DialogHeader>

        <DialogDescription className="text-lg text-white text-center mt-2 mb-2">
          {showAlertModal}
        </DialogDescription>

        <div className="flex justify-center">
          <button
            className="w-30 px-5 py-1.5 rounded
              text-lg bg-zinc-900
              hover:bg-zinc-800"
            onClick={() => setShowAlertModal(null)}
          >
            확인
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
