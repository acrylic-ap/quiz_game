"use client";

import { useState } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

function FilterIcon() {
  return (
    <svg
      width="18"
      height="13"
      viewBox="0 0 29 21"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M9.66667 19.5C9.66667 19.1022 9.79397 18.7206 10.0206 18.4393C10.2472 18.158 10.5545 18 10.875 18H18.125C18.4455 18 18.7528 18.158 18.9794 18.4393C19.206 18.7206 19.3333 19.1022 19.3333 19.5C19.3333 19.8978 19.206 20.2794 18.9794 20.5607C18.7528 20.842 18.4455 21 18.125 21H10.875C10.5545 21 10.2472 20.842 10.0206 20.5607C9.79397 20.2794 9.66667 19.8978 9.66667 19.5ZM4.83333 10.5C4.83333 10.1022 4.96064 9.72064 5.18725 9.43934C5.41385 9.15804 5.7212 9 6.04167 9H22.9583C23.2788 9 23.5861 9.15804 23.8128 9.43934C24.0394 9.72064 24.1667 10.1022 24.1667 10.5C24.1667 10.8978 24.0394 11.2794 23.8128 11.5607C23.5861 11.842 23.2788 12 22.9583 12H6.04167C5.7212 12 5.41385 11.842 5.18725 11.5607C4.96064 11.2794 4.83333 10.8978 4.83333 10.5ZM0 1.5C0 1.10218 0.127306 0.720645 0.353913 0.43934C0.580519 0.158036 0.887863 0 1.20833 0H27.7917C28.1121 0 28.4195 0.158036 28.6461 0.43934C28.8727 0.720645 29 1.10218 29 1.5C29 1.89782 28.8727 2.27936 28.6461 2.56066C28.4195 2.84196 28.1121 3 27.7917 3H1.20833C0.887863 3 0.580519 2.84196 0.353913 2.56066C0.127306 2.27936 0 1.89782 0 1.5Z"
        fill="#A1A1AA"
      />
    </svg>
  );
}

function ApprovalIcon() {
  return (
    <svg
      width="15"
      height="18"
      viewBox="0 0 22 26"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M20.1667 14.8591H14.6667V11.9791C14.6923 10.7107 15.0597 9.47344 15.7291 8.40104C16.4027 7.25513 16.6461 5.9018 16.4148 4.58893C16.1835 3.27605 15.4929 2.09152 14.4696 1.25228C13.7309 0.642343 12.8483 0.237408 11.9084 0.077209C10.9685 -0.0829897 10.0037 0.00705253 9.10853 0.3385C8.21339 0.669947 7.41871 1.23141 6.80247 1.96779C6.18624 2.70418 5.76962 3.59018 5.5935 4.53885C5.33999 5.87201 5.58434 7.25301 6.27917 8.41404C6.93705 9.45086 7.30166 10.6505 7.33333 11.8826V14.8591H1.83333C1.3471 14.8591 0.880787 15.0547 0.536971 15.4029C0.193154 15.7511 0 16.2234 0 16.7159V20.4295C0.000727375 20.9218 0.194115 21.3936 0.537774 21.7417C0.881433 22.0898 1.34733 22.2856 1.83333 22.2864V24.1432C1.83406 24.6354 2.02745 25.1073 2.37111 25.4553C2.71477 25.8034 3.18066 25.9993 3.66667 26H18.3333C18.8193 25.9993 19.2852 25.8034 19.6289 25.4553C19.9726 25.1073 20.1659 24.6354 20.1667 24.1432V22.2864C20.6527 22.2856 21.1186 22.0898 21.4622 21.7417C21.8059 21.3936 21.9993 20.9218 22 20.4295V16.7159C22 16.2234 21.8068 15.7511 21.463 15.4029C21.1192 15.0547 20.6529 14.8591 20.1667 14.8591ZM7.3975 4.87308C7.49568 4.33971 7.70806 3.83461 8.01969 3.39331C8.33133 2.952 8.73466 2.58522 9.2013 2.31876C9.66794 2.0523 10.1866 1.89264 10.7207 1.851C11.2548 1.80936 11.7914 1.88676 12.2928 2.07776C12.7942 2.26875 13.2482 2.5687 13.6229 2.95651C13.9975 3.34431 14.2837 3.81055 14.4613 4.32242C14.6389 4.83428 14.7037 5.37935 14.6509 5.91928C14.5982 6.4592 14.4293 6.98086 14.1561 7.44757C13.4755 8.57289 13.0448 9.83468 12.8938 11.1454H9.11167C8.96743 9.83587 8.53652 8.57542 7.85033 7.45592C7.38929 6.68129 7.22797 5.76112 7.3975 4.87308ZM12.8333 13.0022V14.8591H9.16667V13.0022H12.8333ZM18.3333 24.1432H3.66667V22.2864H18.3333V24.1432ZM1.83333 20.4295V16.7159H20.1667V20.4295H1.83333Z"
        fill="#D4D4D8"
      />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 26 26"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M16.0278 4.07119L21.3418 9.38522M7.62103 23.106L23.1061 7.62096C23.8315 6.8956 24.1928 6.53424 24.3868 6.14366C24.5685 5.77695 24.663 5.37322 24.663 4.96395C24.663 4.55468 24.5685 4.15095 24.3868 3.78424C24.1928 3.39233 23.8315 3.03097 23.1061 2.30694C22.3821 1.58157 22.0207 1.22022 21.6288 1.02626C21.2621 0.844544 20.8584 0.75 20.4491 0.75C20.0398 0.75 19.6361 0.844544 19.2694 1.02626C18.8788 1.22022 18.5174 1.58157 17.7921 2.30694L2.30701 17.792C1.5378 18.5599 1.15387 18.9438 0.951933 19.4327C0.75 19.9203 0.75 20.4636 0.75 21.5504V24.663H3.86269C4.94941 24.663 5.49144 24.663 5.98033 24.4611C6.46789 24.2592 6.85183 23.8739 7.62103 23.106Z"
        stroke="#D4D4D8"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg
      width="15"
      height="18"
      viewBox="0 0 21 26"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M19.75 2.08333H15L13.6429 0.75H6.85714L5.5 2.08333H0.75V4.75H19.75M2.10714 22.0833C2.10714 22.7906 2.39311 23.4689 2.90214 23.969C3.41117 24.469 4.10155 24.75 4.82143 24.75H15.6786C16.3984 24.75 17.0888 24.469 17.5979 23.969C18.1069 23.4689 18.3929 22.7906 18.3929 22.0833V6.75H2.10714V22.0833Z"
        stroke="#D4D4D8"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 26 26"
      fill="none"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M19.8273 11.3294C19.8273 12.4454 19.6075 13.5504 19.1805 14.5814C18.7533 15.6124 18.1273 16.5492 17.3384 17.3384C16.5492 18.1273 15.6124 18.7533 14.5814 19.1805C13.5504 19.6075 12.4454 19.8273 11.3294 19.8273C10.2134 19.8273 9.10842 19.6075 8.0774 19.1805C7.0464 18.7533 6.10959 18.1273 5.32049 17.3384C4.53138 16.5492 3.90545 15.6124 3.47838 14.5814C3.05131 13.5504 2.83152 12.4454 2.83152 11.3294C2.83152 9.07561 3.72682 6.91415 5.32049 5.32049C6.91415 3.72682 9.07561 2.83152 11.3294 2.83152C13.5832 2.83152 15.7446 3.72682 17.3384 5.32049C18.932 6.91415 19.8273 9.07561 19.8273 11.3294ZM18.2788 20.2805C16.0021 22.0481 13.1373 22.8814 10.2677 22.611C7.39815 22.3408 4.73947 20.987 2.83294 18.8253C0.92639 16.6636 -0.0846734 13.8567 0.00555899 10.9758C0.0958065 8.09492 1.28056 5.35671 3.31864 3.31864C5.35671 1.28056 8.09492 0.0958065 10.9758 0.00555899C13.8567 -0.0846734 16.6636 0.92639 18.8253 2.83294C20.987 4.73947 22.3408 7.39815 22.611 10.2677C22.8814 13.1373 22.0481 16.0021 20.2805 18.2788L25.5492 23.5475C25.6884 23.6772 25.8 23.8336 25.8774 24.0073C25.9548 24.181 25.9964 24.3686 25.9998 24.5587C26.0032 24.7489 25.968 24.9377 25.8969 25.1141C25.8257 25.2905 25.7197 25.4506 25.5851 25.5851C25.4506 25.7197 25.2905 25.8257 25.1141 25.8969C24.9377 25.968 24.7489 26.0032 24.5587 25.9998C24.3686 25.9964 24.181 25.9548 24.0073 25.8774C23.8336 25.8 23.6772 25.6884 23.5475 25.5492L18.2788 20.2805Z"
        fill="#A1A1AA"
      />
    </svg>
  );
}

export function TopicManager({
  topics,
  loading,
  error,
  onEdit,
  onDelete,
}: {
  topics: Topic[];
  loading: boolean;
  error?: Error | null;
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

      {error && (
        <p role="alert" className="mt-[18px] text-[14px] text-red-400">
          {error.message}
        </p>
      )}

      <div className="mt-[24px] min-h-0 flex-1 overflow-y-auto">
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

                <span className={`text-[15px] ${statusColors[approvalStatus]}`}>
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
                    <DeleteIcon />
                  </button>
                </div>
              </div>
            );
          })}

          {!loading && filtered?.length === 0 && (
            <div className="flex h-[80px] items-center text-[14px] text-zinc-500">
              검색 결과가 없습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
