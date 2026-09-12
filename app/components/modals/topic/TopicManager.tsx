"use client";

import { useState } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

import { Topic } from "@/types/topic/topic";

const labels = {
  approved: "승인 허가",
  rejected: "승인 거부",
  pending: "승인 대기 중",
  unregistered: "미등록",
} as const;

const statusColors = {
  approved: "text-[#93C5FD]",
  rejected: "text-[#FECACA]",
  pending: "text-[#71717A]",
  unregistered: "text-[#3F3F46]",
} as const;

import { ApprovalIcon } from "@/components/common/icons/ApprovalIcon";
import { DeleteIcon } from "@/components/common/icons/DeleteIcon";
import { EditIcon } from "@/components/common/icons/EditIcon";
import { FilterIcon } from "@/components/common/icons/FilterIcon";
import { SearchIcon } from "@/components/common/icons/SearchIcon";

export function TopicManager({
  topics,
  loading,
  failed,
  onCreate,
  onEdit,
  onDelete,
}: {
  topics: Topic[];
  loading: boolean;
  failed: boolean;
  onCreate: () => void;
  onEdit: (topic: Topic) => void;
  onDelete: (topic: Topic) => void;
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState(false);
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");

  const displayTopics = topics.length > 0 ? topics : null;

  const filtered = displayTopics?.filter(
    (topic) =>
      topic.topicName.includes(search) &&
      (category === "all" || topic.category === category) &&
      (status === "all" || (topic.approvalStatus ?? "unregistered") === status),
  );

  return (
    <div className="flex h-full min-h-0 flex-col px-[40px] pb-[32px]">
      <div>
        <div className="flex items-center justify-between">
          <div className="relative h-[40px] w-[290px]">
            <div
              className="
              absolute top-1/2 left-[12px]
              flex -translate-y-1/2
              items-center justify-center
            "
            >
              <SearchIcon />
            </div>

            <input
              aria-label="주제 검색"
              placeholder="검색"
              className="
              h-full w-full
              rounded-md
              bg-zinc-900
              pr-[42px] pl-[42px]
              text-[15px] text-zinc-100
              outline-none
              placeholder:text-zinc-500
            "
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <button
              type="button"
              aria-label="필터"
              aria-expanded={filter}
              onClick={() => setFilter((prev) => !prev)}
              className="
              absolute top-1/2 right-[12px]
              flex -translate-y-1/2
              items-center justify-center
            "
            >
              <FilterIcon />
            </button>
          </div>

          <span className="text-[14px] text-zinc-500">
            총 {topics.length}개
          </span>
        </div>

        {filter && (
          <div className="mt-[10px] flex gap-[8px]">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger
                aria-label="카테고리 필터"
                className="
                  h-[34px] w-[135px]
                  border-zinc-700
                  bg-zinc-900
                  text-[13px]
                "
              >
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">카테고리</SelectItem>

                {Array.from(
                  new Set(displayTopics?.map((topic) => topic.category)),
                )
                  .filter(Boolean)
                  .map((value) => (
                    <SelectItem key={value} value={value}>
                      {value}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>

            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger
                aria-label="승인 상태 필터"
                className="
                  h-[34px] w-[135px]
                  border-zinc-700
                  bg-zinc-900
                  text-[13px]
                "
              >
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">승인 상태</SelectItem>

                {Object.entries(labels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {loading && (
        <p className="mt-[18px] text-[14px] text-zinc-500">불러오는 중...</p>
      )}

      <div className="mt-[24px] min-h-0 flex-1 overflow-y-auto">
        {!loading && !failed && topics.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-[14px]">
            <p className="text-[14px] text-zinc-500">등록된 주제가 없습니다.</p>

            <Button
              type="button"
              variant="secondary"
              className="h-[38px] rounded-[8px] px-[18px] text-[14px]"
              onClick={onCreate}
            >
              주제 생성
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-[10px]">
            {filtered?.map((topic) => {
              const approvalStatus = (topic.approvalStatus ??
                "unregistered") as keyof typeof labels;

              return (
                <div
                  key={topic.id}
                  className="
                  grid h-[72px]
                  grid-cols-[90px_minmax(180px,1fr)_90px_130px_130px_110px]
                  items-center
                  rounded-[10px]
                  border border-zinc-500
                  px-[24px]
                  text-[15px]
                "
                >
                  <div className="flex items-center">
                    <span
                      className="
                      inline-flex h-[30px]
                      items-center justify-center
                      rounded-[8px]
                      border border-zinc-500
                      px-[12px]
                      text-[14px] text-zinc-400
                    "
                    >
                      {topic.category}
                    </span>
                  </div>

                  <span className="truncate text-[18px] font-medium text-zinc-100">
                    {topic.topicName}
                  </span>

                  <span className="text-[15px] text-zinc-400">
                    {topic.questionCount ?? 0}문항
                  </span>

                  <span className="text-[15px] text-zinc-500">
                    {topic.updatedAt
                      ? new Date(topic.updatedAt).toLocaleDateString("ko-KR")
                      : "—"}
                  </span>

                  <span
                    className={`text-[15px] ${statusColors[approvalStatus]}`}
                  >
                    {labels[approvalStatus]}
                  </span>

                  <div className="flex items-center justify-end gap-[16px]">
                    <button
                      type="button"
                      aria-label={`${topic.topicName} 승인`}
                      className="
                      flex h-[28px] w-[28px]
                      items-center justify-center
                      opacity-80
                      transition-opacity
                      hover:opacity-100
                    "
                    >
                      <ApprovalIcon />
                    </button>

                    <button
                      type="button"
                      aria-label={`${topic.topicName} 편집`}
                      onClick={() => onEdit(topic)}
                      className="
                      flex h-[28px] w-[28px]
                      items-center justify-center
                      opacity-80
                      transition-opacity
                      hover:opacity-100
                    "
                    >
                      <EditIcon />
                    </button>

                    <button
                      type="button"
                      aria-label={`${topic.topicName} 삭제`}
                      onClick={() => onDelete(topic)}
                      className="
                      flex h-[28px] w-[28px]
                      items-center justify-center
                      opacity-80
                      transition-opacity
                      hover:opacity-100
                    "
                    >
                      <DeleteIcon
                        width="15"
                        height="18"
                        stroke="#D4D4D8"
                        ariaHidden
                      />
                    </button>
                  </div>
                </div>
              );
            })}

            {!loading &&
              !failed &&
              topics.length > 0 &&
              filtered?.length === 0 && (
                <div className="flex h-[80px] items-center text-[14px] text-zinc-500">
                  검색 결과가 없습니다.
                </div>
              )}
          </div>
        )}
      </div>
    </div>
  );
}
