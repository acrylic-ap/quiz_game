"use client";

import { useRef, useState } from "react";
import { GripVertical, Lightbulb, Settings, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Hint, Question } from "@/types/topic/topic";
import { isChoiceQuestion, parseAnswers } from "@/utils/answer";
import { QUESTION_TIME_LIMIT_MS } from "@/utils/game";

const inputClass = "w-full rounded bg-zinc-900 px-3 py-3 outline-none text-zinc-100";

export function QuestionEditor({ question, number, onChange }: {
  question: Question; number: number; onChange: (question: Question) => void;
}) {
  const [settings, setSettings] = useState(false);
  const [hints, setHints] = useState(false);
  const dragOption = useRef<number | null>(null);
  const choice = isChoiceQuestion(question);
  const multiple = question.answerType === "multiple";
  const options = question.options ?? [];
  const correct = question.correctOptions ?? options.flatMap((value, i) => value === question.answer ? [i] : []);
  const update = (change: Partial<Question>) => onChange({ ...question, ...change });
  const updateOptions = (values: string[], indices: number[]) => update({ options: values, correctOptions: indices, answer: values[indices[0]] ?? "" });

  return (
    <div className="min-w-0 flex-1 space-y-4">
      <div className="flex items-center justify-between">
        <span>Q {number}</span>
        <div className="flex gap-3">
          <button aria-label="퀴즈 설정" onClick={() => setSettings(true)}><Settings size={20} /></button>
          <button aria-label="힌트 분기" onClick={() => setHints(true)}><Lightbulb size={20} /></button>
        </div>
      </div>
      <input aria-label="문제 제목" placeholder="문제 제목" className={inputClass} value={question.question} onChange={(e) => update({ question: e.target.value })} />
      <div className="flex items-center gap-3">
        <button role="switch" aria-checked={multiple} onClick={() => {
          const indices = correct.slice(0, 1);
          update({ answerType: multiple ? "single" : "multiple", ...(choice && multiple ? { correctOptions: indices, answer: options[indices[0]] ?? "" } : {}) });
        }} className="rounded border border-zinc-700 px-3 py-1">{multiple ? "복수 정답" : "단일 정답"}</button>
      </div>
      {choice ? (
        <div className="space-y-2">
          {options.map((option, index) => (
            <div key={index} className="flex items-center gap-2" onDragOver={(e) => e.preventDefault()} onDrop={(e) => {
              e.preventDefault();
              const from = dragOption.current;
              if (from === null || from === index) return;
              const entries = options.map((value, i) => ({ value, correct: correct.includes(i) }));
              entries.splice(index, 0, entries.splice(from, 1)[0]);
              updateOptions(entries.map((entry) => entry.value), entries.flatMap((entry, i) => entry.correct ? [i] : []));
              dragOption.current = null;
            }}>
              <button draggable aria-label={`${index + 1}번 보기 이동`} onDragStart={(e) => { dragOption.current = index; e.dataTransfer.setData("text/plain", String(index)); }} onDragEnd={() => { dragOption.current = null; }} onKeyDown={(e) => {
                if (!e.altKey || !["ArrowUp", "ArrowDown"].includes(e.key)) return;
                e.preventDefault();
                const to = index + (e.key === "ArrowUp" ? -1 : 1);
                if (to < 0 || to >= options.length) return;
                const entries = options.map((value, i) => ({ value, correct: correct.includes(i) }));
                entries.splice(to, 0, entries.splice(index, 1)[0]);
                updateOptions(entries.map((entry) => entry.value), entries.flatMap((entry, i) => entry.correct ? [i] : []));
              }}><GripVertical size={18} /></button>
              <input className={inputClass} aria-label={`${index + 1}번 보기`} value={option} onChange={(e) => updateOptions(options.map((value, i) => i === index ? e.target.value : value), correct)} />
              <input type="checkbox" aria-label={`${index + 1}번 보기 정답`} checked={correct.includes(index)} onChange={(e) => updateOptions(options, e.target.checked ? (multiple ? [...correct, index] : [index]) : correct.filter((i) => i !== index))} />
              <button aria-label={`${index + 1}번 보기 삭제`} onClick={() => updateOptions(options.filter((_, i) => i !== index), correct.filter((i) => i !== index).map((i) => i > index ? i - 1 : i))}><Trash2 size={18} /></button>
            </div>
          ))}
          <Button variant="secondary" onClick={() => updateOptions([...options, ""], correct)}>정답 추가</Button>
        </div>
      ) : (
        <div className="space-y-2">
          <input className={inputClass} aria-label="주관식 정답" value={question.answer ?? ""} onChange={(e) => update({ answer: e.target.value })} />
          <div aria-label="인식되는 정답" className="flex flex-wrap gap-2 text-zinc-400">
            {parseAnswers(question.answer ?? "", multiple).map((value, index) => <span key={index} className="whitespace-pre-wrap">[{value.replace(/\s/g, "·")}]</span>)}
          </div>
        </div>
      )}
      <Dialog open={settings} onOpenChange={setSettings}>
        <DialogContent className="bg-zinc-950 text-zinc-100" aria-describedby={undefined}>
          <DialogHeader><DialogTitle>퀴즈 설정</DialogTitle></DialogHeader>
          <label className="space-y-2"><span>지문 형식</span>
            <Select value={question.type} onValueChange={(type) => update({ type })}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="text">텍스트</SelectItem><SelectItem value="image" disabled>사진</SelectItem><SelectItem value="sound" disabled>소리</SelectItem></SelectContent>
            </Select>
          </label>
          <label className="space-y-2"><span>문제 유형</span>
            <Select value={choice ? "choice" : "input"} onValueChange={(questionType) => update({ questionType, answer: "", options: questionType === "choice" ? ["", ""] : [], correctOptions: [], answerType: "single", answerMatch: question.answerMatch ?? "exact" })}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="choice">객관식</SelectItem><SelectItem value="input">주관식</SelectItem></SelectContent>
            </Select>
          </label>
          <label className="space-y-2"><span>난이도</span>
            <Select value={String(question.difficulty ?? 3)} onValueChange={(value) => update({ difficulty: Number(value) })}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>{[1, 2, 3, 4, 5].map((value) => <SelectItem key={value} value={String(value)}>{value}</SelectItem>)}</SelectContent>
            </Select>
          </label>
          {!choice && <label className="space-y-2"><span>인정 범위</span>
            <Select value={question.answerMatch ?? "exact"} onValueChange={(value: "exact" | "ignoreWhitespace") => update({ answerMatch: value })}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="exact">일치</SelectItem><SelectItem value="ignoreWhitespace">띄어쓰기 무시</SelectItem></SelectContent>
            </Select>
          </label>}
        </DialogContent>
      </Dialog>
      <Dialog open={hints} onOpenChange={setHints}>
        <DialogContent className="bg-zinc-950 text-zinc-100" aria-describedby={undefined}>
          <DialogHeader><DialogTitle>힌트 분기</DialogTitle></DialogHeader>
          <HintTimeline hints={question.hints ?? []} onChange={(value) => update({ hints: value })} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function HintTimeline({ hints, onChange }: { hints: Hint[]; onChange: (hints: Hint[]) => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const track = useRef<HTMLDivElement>(null);
  const limit = QUESTION_TIME_LIMIT_MS / 1000;
  const active = hints.find((hint) => hint.id === selected);
  const timeAt = (clientX: number) => {
    const bounds = track.current!.getBoundingClientRect();
    return Math.round(limit * (1 - Math.min(1, Math.max(0, (clientX - bounds.left) / bounds.width))));
  };
  const move = (id: string, time: number) => {
    if (hints.some((hint) => hint.id !== id && hint.revealTime === time)) return;
    onChange(hints.map((hint) => hint.id === id ? { ...hint, revealTime: time } : hint));
  };
  return (
    <div>
      <div className="flex justify-between text-zinc-400"><span>{limit}초</span><span>0초</span></div>
      <div ref={track} className="relative my-6 h-8 touch-none cursor-pointer" onPointerDown={(e) => {
        if (e.button !== 0) return;
        const revealTime = timeAt(e.clientX);
        if (hints.some((hint) => hint.revealTime === revealTime)) return;
        const id = crypto.randomUUID();
        onChange([...hints, { id, content: "", revealTime }]);
        setSelected(id);
      }}>
        <div className="pointer-events-none absolute top-1/2 h-1 w-full bg-zinc-700" />
        {hints.map((hint) => (
          <button key={hint.id} role="slider" aria-label="힌트 공개 시간" aria-valuemin={0} aria-valuemax={limit} aria-valuenow={hint.revealTime ?? 0}
            className={`absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full touch-none ${selected === hint.id ? "bg-zinc-100" : "bg-zinc-500"}`}
            style={{ left: `${(1 - (hint.revealTime ?? 0) / limit) * 100}%` }}
            onFocus={() => setSelected(hint.id)}
            onPointerDown={(e) => { e.stopPropagation(); if (e.button !== 0) return; setSelected(hint.id); e.currentTarget.setPointerCapture(e.pointerId); }}
            onPointerMove={(e) => { if (e.currentTarget.hasPointerCapture(e.pointerId) && e.buttons) { setDragging(hint.id); move(hint.id, timeAt(e.clientX)); } }}
            onPointerUp={(e) => { e.currentTarget.releasePointerCapture(e.pointerId); setDragging(null); }}
            onPointerCancel={() => setDragging(null)} onLostPointerCapture={() => setDragging(null)}
            onKeyDown={(e) => { if (["ArrowLeft", "ArrowRight"].includes(e.key)) { e.preventDefault(); move(hint.id, Math.max(0, Math.min(limit, (hint.revealTime ?? 0) + (e.key === "ArrowLeft" ? 1 : -1)))); } }}>
            {dragging === hint.id && <span className="absolute top-5 left-1/2 -translate-x-1/2 text-zinc-100">{hint.revealTime}</span>}
          </button>
        ))}
      </div>
      {active && <div className="flex items-start gap-2">
        <textarea aria-label="힌트 내용" className={inputClass} value={active.content ?? ""} onChange={(e) => onChange(hints.map((hint) => hint.id === selected ? { ...hint, content: e.target.value } : hint))} />
        <button aria-label="힌트 삭제" onClick={() => { onChange(hints.filter((hint) => hint.id !== selected)); setSelected(null); }}><Trash2 size={18} /></button>
      </div>}
    </div>
  );
}
