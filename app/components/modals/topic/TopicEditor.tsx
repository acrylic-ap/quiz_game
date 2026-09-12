"use client";

import { Question } from "@/types/topic/topic";
import { QuestionEditor } from "../QuestionEditor";
import { TopicInfoEditor } from "./TopicInfoEditor";
import { QuestionList } from "./QuestionList";
import { Button } from "@/components/ui/button";

export function TopicEditor({
  topic,
  questions,
  categories,
  tab,
  selected,
  preview,
  onTab,
  onTopicChange,
  onImage,
  onError,
  onSelect,
  onAdd,
  onDelete,
  onReorder,
  onQuestionChange,
  onSave,
}: any) {
  const activeIndex = questions.findIndex((q: Question) => q.id === selected);

  const active = questions[activeIndex];

  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      {/* 탭 */}
      <div role="tablist" className="flex shrink-0 gap-[12px] px-[34px]">
        <button
          role="tab"
          aria-selected={tab === "topic"}
          className={`
            h-[40px]
            min-w-[110px]
            rounded-[8px]
            px-[20px]
            text-[15px]
            ${
              tab === "topic"
                ? "bg-zinc-800 text-zinc-100"
                : "border border-zinc-600 text-zinc-400"
            }
          `}
          onClick={() => onTab("topic")}
        >
          주제
        </button>

        <button
          role="tab"
          aria-selected={tab === "questions"}
          className={`
            h-[40px]
            min-w-[110px]
            rounded-[8px]
            px-[20px]
            text-[15px]
            ${
              tab === "questions"
                ? "bg-zinc-800 text-zinc-100"
                : "border border-zinc-600 text-zinc-400"
            }
          `}
          onClick={() => onTab("questions")}
        >
          문제
        </button>
      </div>

      {/* 구분선 */}
      <div className="mt-[20px] h-px shrink-0 bg-zinc-800" />

      {/* 내용 */}
      <div className="min-h-0 flex-1">
        {tab === "topic" ? (
          <div className="flex h-full min-h-0 items-center">
            <TopicInfoEditor
              topic={topic}
              preview={preview}
              categories={categories}
              onTopicChange={onTopicChange}
              onImage={onImage}
              onError={onError}
            />
          </div>
        ) : (
          <div
            className="
              grid h-full min-h-0
              grid-cols-[38%_1fr]
              px-[34px]
              py-[22px]
            "
          >
            {/* 문제 목록 */}
            <div
              className="
                min-h-0 min-w-0
                border-r border-zinc-700
                pr-[24px]
              "
            >
              <QuestionList
                questions={questions}
                selected={selected}
                onSelect={onSelect}
                onAdd={onAdd}
                onDelete={onDelete}
                onReorder={onReorder}
              />
            </div>

            {/* 문제 편집 */}
            <div
              className="
                min-h-0 min-w-0
                pl-[28px]
              "
            >
              {active ? (
                <QuestionEditor
                  key={active.id}
                  question={active}
                  number={activeIndex + 1}
                  onChange={onQuestionChange}
                />
              ) : (
                <div className="flex h-full items-center justify-center text-[13px] text-zinc-600">
                  문제를 선택해 주세요.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 주제 탭에서만 표시 */}
      {tab === "topic" && (
        <div className="flex shrink-0 justify-center gap-[18px] pb-10">
          <Button
            variant="secondary"
            className="
              h-[50px]
              min-w-[160px]
              rounded-[8px]
              text-[16px]
            "
            onClick={() => onSave(true)}
          >
            추가 요청
          </Button>

          <Button
            variant="secondary"
            className="
              h-[50px]
              min-w-[160px]
              rounded-[8px]
              text-[16px]
            "
            onClick={() => onSave(false)}
          >
            저장
          </Button>
        </div>
      )}
    </div>
  );
}
