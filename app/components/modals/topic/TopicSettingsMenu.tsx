"use client";

import { CreateTopicIcon } from "@/components/common/icons/CreateTopicIcon";
import { ManageTopicIcon } from "@/components/common/icons/ManageTopicIcon";

export function TopicSettingsMenu({
  onCreate,
  onManage,
}: {
  onCreate: () => void;
  onManage: () => void;
}) {
  const buttonClass = `
    group flex h-[170px] w-[170px]
    flex-col items-center justify-center gap-[20px]
    rounded-lg border border-zinc-500 bg-transparent
    text-zinc-500 transition-colors
    hover:border-zinc-300 hover:text-zinc-300
  `;

  return (
    <div className="flex items-center justify-center gap-[36px]">
      <button type="button" className={buttonClass} onClick={onCreate}>
        <CreateTopicIcon />

        <span className="text-[18px] font-medium text-current">주제 생성</span>
      </button>

      <button type="button" className={buttonClass} onClick={onManage}>
        <ManageTopicIcon />

        <span className="text-[18px] font-medium text-current">주제 관리</span>
      </button>
    </div>
  );
}
