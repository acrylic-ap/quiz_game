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
import { Info } from "lucide-react";

export default function AlertModal() {
  const [showAlertModal, setShowAlertModal] = useAtom(alertModalState);

  const isOpen = !!showAlertModal;

  const handleClose = () => setShowAlertModal(null);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="bg-zinc-950 text-zinc-100 select-none">
        <DialogHeader className="flex items-center">
          <DialogTitle className="text-xl flex items-center font-semibold">
            <Info className="mr-2" /> 알림
          </DialogTitle>
        </DialogHeader>

        <DialogDescription className="text-xl text-white text-center my-4">
          {showAlertModal}
        </DialogDescription>

        <div className="flex justify-center">
          <button
            className="w-30 px-5 py-1 rounded
              text-lg outline-none"
            onClick={() => setShowAlertModal(null)}
          >
            확인
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
