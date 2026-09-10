"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Filter, GripVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Topic, Question } from "@/types/topic/topic";
import { auth } from "@/lib/firebase";
import { loadMyTopics, loadQuestions, removeTopic, saveTopic, validateTopicImage } from "@/lib/topics";
import { isChoiceQuestion } from "@/utils/answer";
import { QuestionEditor } from "./QuestionEditor";

const inputClass = "w-full rounded bg-zinc-900 px-3 py-3 outline-none text-zinc-100";
const statusLabels = { approved: "승인 허가", rejected: "승인 거부", pending: "승인 대기 중", unregistered: "미등록" };

export default function TopicSettingsModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [screen, setScreen] = useState<"settings" | "edit" | "manage">("settings");
  const [tab, setTab] = useState<"topic" | "questions">("topic");
  const [topic, setTopic] = useState<Topic | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [image, setImage] = useState<File>();
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState(false);
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [deleting, setDeleting] = useState<Topic | null>(null);
  const dragQuestion = useRef<number | null>(null);
  const queryClient = useQueryClient();
  const userId = auth.currentUser?.uid;
  const list = useQuery({ queryKey: ["my_topics", userId], queryFn: loadMyTopics, enabled: open && screen === "manage" && !!userId });

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  const refresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["topics"] }),
      queryClient.invalidateQueries({ queryKey: ["my_topics"] }),
      queryClient.invalidateQueries({ queryKey: ["topic_questions"] }),
    ]);
  };
  const report = (cause: unknown) => setError(cause instanceof Error ? cause.message : "처리하지 못했습니다. 다시 시도해주세요.");
  const close = (value: boolean) => {
    if (busy) return;
    if (!value) { setScreen("settings"); setTopic(null); setQuestions([]); setImage(undefined); setPreview(""); setError(""); }
    onOpenChange(value);
  };
  const edit = async (existing?: Topic) => {
    setError(""); setBusy(true);
    try {
      const loaded = existing ? await loadQuestions(existing.id) : [];
      setTopic(existing ?? { id: crypto.randomUUID(), topicName: "", category: "", description: "" });
      // Legacy hints may not have ids; assign them once when opening the editor.
      setQuestions(loaded.map((question) => ({ ...question, hints: (question.hints ?? []).map((hint) => ({ ...hint, id: hint.id ?? crypto.randomUUID() })) })));
      setSelected(loaded[0]?.id ?? null); setImage(undefined); setPreview(""); setTab("topic"); setScreen("edit");
    } catch (cause) { report(cause); } finally { setBusy(false); }
  };
  const save = async (requestApproval = false) => {
    if (!topic || busy) return;
    setBusy(true); setError("");
    try {
      const saved = await saveTopic(topic, questions, image, requestApproval);
      setTopic(saved); setImage(undefined); setPreview("");
      await refresh(); setScreen("manage");
    } catch (cause) { report(cause); } finally { setBusy(false); }
  };
  const reorder = (from: number, to: number) => {
    if (from === to || to < 0 || to >= questions.length) return;
    const next = [...questions]; next.splice(to, 0, next.splice(from, 1)[0]); setQuestions(next);
  };
  const activeIndex = questions.findIndex((question) => question.id === selected);
  const active = questions[activeIndex];

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className={`bg-zinc-950 text-zinc-100 max-h-[90vh] overflow-y-auto ${screen !== "settings" ? "sm:max-w-5xl" : ""}`} aria-describedby={undefined} onEscapeKeyDown={(e) => { if (busy) e.preventDefault(); }} onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader><DialogTitle className="text-2xl">{screen === "settings" ? "주제 설정" : screen === "manage" ? "주제 관리" : "주제 생성"}</DialogTitle></DialogHeader>
        <fieldset disabled={busy} className="min-w-0 space-y-4">
          {screen === "settings" && <div className="grid grid-cols-2 gap-3">
            <button className="rounded-md border border-zinc-700 py-12 hover:bg-zinc-900" onClick={() => void edit()}>주제 생성</button>
            <button className="rounded-md border border-zinc-700 py-12 hover:bg-zinc-900" onClick={() => { setError(""); setScreen("manage"); }}>주제 관리</button>
          </div>}
          {screen === "edit" && topic && <>
            <div role="tablist" className="flex gap-4 border-b border-zinc-700">
              <button role="tab" aria-selected={tab === "topic"} className={`py-2 ${tab === "topic" ? "border-b border-zinc-100" : "text-zinc-500"}`} onClick={() => setTab("topic")}>주제</button>
              <button role="tab" aria-selected={tab === "questions"} className={`py-2 ${tab === "questions" ? "border-b border-zinc-100" : "text-zinc-500"}`} onClick={() => setTab("questions")}>문제</button>
            </div>
            {tab === "topic" ? <div className="flex gap-6">
              <label className="flex w-1/3 cursor-pointer flex-col items-center justify-center rounded border border-zinc-700 overflow-hidden">
                {(preview || topic.imageUrl) ?
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={preview || topic.imageUrl} alt="대표 이미지" className="max-h-64 w-full object-contain" /> : <span>대표 이미지 선택</span>}
                <span className="text-sm text-zinc-500">jpg, png</span>
                <input type="file" accept=".jpg,.png,image/jpeg,image/png" className="sr-only" aria-label="대표 이미지 선택" onChange={(e) => {
                  const file = e.target.files?.[0]; if (!file) return;
                  try { validateTopicImage(file); setImage(file); setPreview(URL.createObjectURL(file)); setError(""); } catch (cause) { report(cause); }
                  e.target.value = "";
                }} />
              </label>
              <div className="flex-1 space-y-4">
                <input className={inputClass} placeholder="주제 제목" aria-label="주제 제목" value={topic.topicName} onChange={(e) => setTopic({ ...topic, topicName: e.target.value })} />
                <input className={inputClass} placeholder="카테고리" aria-label="카테고리" value={topic.category} onChange={(e) => setTopic({ ...topic, category: e.target.value })} />
                <textarea className={`${inputClass} min-h-32`} placeholder="주제 설명" aria-label="주제 설명" value={topic.description} onChange={(e) => setTopic({ ...topic, description: e.target.value })} />
              </div>
            </div> : <div className="flex min-h-80 gap-6">
              <div className="w-1/3 min-w-0 space-y-3 border-r border-zinc-700 pr-4">
                <div className="flex flex-wrap items-center justify-between gap-2"><span>총 {questions.length}문항</span>
                  <button className="flex items-center" onClick={() => {
                    const question: Question = { id: crypto.randomUUID(), question: "", type: "text", questionType: "choice", answerType: "single", answerMatch: "exact", options: ["", ""], correctOptions: [], answer: "", difficulty: 3, hints: [] };
                    setQuestions([...questions, question]); setSelected(question.id);
                  }}><Plus size={16} />문제 추가</button>
                </div>
                <div className="max-h-96 space-y-2 overflow-y-auto">
                  {questions.map((question, index) => <div key={question.id} className={`flex items-center gap-2 rounded p-2 ${selected === question.id ? "bg-zinc-800" : "bg-zinc-900"}`} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); if (dragQuestion.current !== null) reorder(dragQuestion.current, index); dragQuestion.current = null; }}>
                    <button draggable aria-label={`${index + 1}번 문제 이동`} onDragStart={(e) => { dragQuestion.current = index; e.dataTransfer.setData("text/plain", question.id); }} onDragEnd={() => { dragQuestion.current = null; }} onKeyDown={(e) => { if (e.altKey && ["ArrowUp", "ArrowDown"].includes(e.key)) { e.preventDefault(); reorder(index, index + (e.key === "ArrowUp" ? -1 : 1)); } }}><GripVertical size={16} /></button>
                    <button className="min-w-0 flex-1 text-left" onClick={() => setSelected(question.id)}>
                      <div className="truncate">{index + 1}. {question.question}</div>
                      <span className="text-xs text-zinc-400">{question.type === "text" ? "텍스트" : question.type === "image" ? "사진" : "소리"} · {isChoiceQuestion(question) ? "객관식" : "주관식"}</span>
                    </button>
                    <button aria-label={`${index + 1}번 문제 삭제`} onClick={() => {
                      const next = questions.filter((item) => item.id !== question.id); setQuestions(next);
                      if (selected === question.id) setSelected(next[Math.min(index, next.length - 1)]?.id ?? null);
                    }}><Trash2 size={16} /></button>
                  </div>)}
                </div>
              </div>
              {active && <QuestionEditor key={active.id} question={active} number={activeIndex + 1} onChange={(value) => setQuestions(questions.map((question) => question.id === value.id ? value : question))} />}
            </div>}
            <div className="flex justify-end gap-3"><Button variant="secondary" onClick={() => void save(true)}>추가 요청</Button><Button variant="secondary" onClick={() => void save()}>저장</Button></div>
          </>}
          {screen === "manage" && <>
            <div className="flex items-center gap-3 bg-zinc-900 rounded pr-3"><input aria-label="주제 검색" placeholder="검색" className={inputClass} value={search} onChange={(e) => setSearch(e.target.value)} /><button aria-label="필터" aria-expanded={filter} onClick={() => setFilter(!filter)}><Filter size={20} /></button></div>
            {filter && <div className="flex gap-3">
              <Select value={category} onValueChange={setCategory}><SelectTrigger aria-label="카테고리 필터"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">카테고리</SelectItem>{Array.from(new Set((list.data ?? []).map((item) => item.category))).filter(Boolean).map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent></Select>
              <Select value={status} onValueChange={setStatus}><SelectTrigger aria-label="승인 상태 필터"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">승인 상태</SelectItem>{Object.entries(statusLabels).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select>
            </div>}
            {list.isLoading && <p className="text-zinc-400">불러오는 중...</p>}
            {list.error && <p role="alert">{list.error.message}</p>}
            <div className="max-h-96 space-y-2 overflow-y-auto">{(list.data ?? []).filter((item) => item.topicName.includes(search) && (category === "all" || item.category === category) && (status === "all" || (item.approvalStatus ?? "unregistered") === status)).map((item) => <div key={item.id} className="flex items-center gap-4 rounded bg-zinc-900 px-3 py-3">
              <span className="text-xs text-zinc-400">{item.category}</span><span className="min-w-0 flex-1 truncate">{item.topicName}</span><span>{item.questionCount ?? 0}문항</span><span className="text-zinc-400">{item.updatedAt ? new Date(item.updatedAt).toLocaleDateString("ko-KR") : "—"}</span><span>{statusLabels[item.approvalStatus ?? "unregistered"]}</span>
              <button aria-label={`${item.topicName} 편집`} onClick={() => void edit(item)}><Pencil size={18} /></button><button aria-label={`${item.topicName} 삭제`} onClick={() => setDeleting(item)}><Trash2 size={18} /></button>
            </div>)}</div>
          </>}
        </fieldset>
        {error && <p role="alert" className="text-red-400">{error}</p>}
        <Dialog open={!!deleting} onOpenChange={(value) => { if (!value && !busy) setDeleting(null); }}>
          <DialogContent className="bg-zinc-950 text-zinc-100" aria-describedby={undefined}>
            <DialogHeader><DialogTitle>주제 삭제</DialogTitle></DialogHeader><p>{deleting?.topicName}</p>
            <div className="flex justify-end gap-3"><Button variant="secondary" disabled={busy} onClick={() => setDeleting(null)}>취소</Button><Button variant="secondary" disabled={busy} onClick={async () => {
              if (!deleting || busy) return; setBusy(true); setError("");
              try { await removeTopic(deleting); setDeleting(null); await refresh(); } catch (cause) { setDeleting(null); report(cause); } finally { setBusy(false); }
            }}>삭제</Button></div>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}
