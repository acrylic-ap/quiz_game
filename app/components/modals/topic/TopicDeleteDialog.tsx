"use client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Topic } from "@/types/topic/topic";
export function TopicDeleteDialog({ topic, busy, onClose, onDelete }: { topic: Topic | null; busy: boolean; onClose: () => void; onDelete: () => void }) { return <Dialog open={!!topic} onOpenChange={(open) => { if (!open && !busy) onClose(); }}><DialogContent className="bg-zinc-950 text-zinc-100" aria-describedby={undefined}><DialogHeader><DialogTitle>주제 삭제</DialogTitle></DialogHeader><p>{topic?.topicName}</p><div className="flex justify-end gap-3"><Button variant="secondary" disabled={busy} onClick={onClose}>취소</Button><Button variant="secondary" disabled={busy} onClick={onDelete}>삭제</Button></div></DialogContent></Dialog>; }
