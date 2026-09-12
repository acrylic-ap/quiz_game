"use client";

import { useMemo, useState } from "react";

import { validateTopicImage } from "@/lib/topics";
import { Topic } from "@/types/topic/topic";

const inputClass = `
  w-full
  rounded-[10px]
  border border-zinc-400
  bg-[#09090B]
  px-[22px]
  text-[16px]
  text-zinc-200
  outline-none
  placeholder:text-zinc-500
  focus:border-zinc-300
`;

import { ChevronDownIcon } from "@/components/common/icons/ChevronDownIcon";
import { PhotoIcon } from "@/components/common/icons/PhotoIcon";

export function TopicInfoEditor({
  topic,
  preview,
  categories,
  onTopicChange,
  onImage,
  onError,
}: {
  topic: Topic;
  preview: string;
  categories: string[];
  onTopicChange: (topic: Topic) => void;
  onImage: (file: File, preview: string) => void;
  onError: (error: unknown) => void;
}) {
  const [categoryOpen, setCategoryOpen] = useState(false);

  const filteredCategories = useMemo(() => {
    const keyword = topic.category.toLowerCase();

    return categories.filter((category) =>
      category.toLowerCase().includes(keyword),
    );
  }, [categories, topic.category]);

  const categoryExists = categories.some(
    (category) => category === topic.category,
  );

  const imageSrc = preview || topic.imageUrl;

  return (
    <div
      className="
        mx-auto
        grid
        w-full
        max-w-[900px]
        grid-cols-[0.85fr_0.85fr]
        gap-20
        px-[40px]
        py-[48px]
      "
    >
      <label
        className="
          flex
          aspect-[519/319]
          w-full
          cursor-pointer
          items-center
          justify-center
          overflow-hidden
          rounded-[10px]
          border border-dashed border-zinc-400
        "
      >
        {imageSrc ? (
          <img
            src={imageSrc}
            alt="대표 이미지"
            className="h-full w-full object-contain"
          />
        ) : (
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-[14px]">
              <PhotoIcon />

              <span className="text-[22px] font-medium text-zinc-300">
                이미지 선택
              </span>
            </div>

            <div className="mt-[20px] space-y-[6px] text-[14px] text-zinc-400">
              <p>• 확장자: jpg, png</p>
              <p>• 권장 사이즈: 360 × 720</p>
              <p>• 최대 용량: 64KB 이하</p>
            </div>
          </div>
        )}

        <input
          type="file"
          accept=".jpg,.png,image/jpeg,image/png"
          className="sr-only"
          aria-label="대표 이미지 선택"
          onChange={(e) => {
            const file = e.target.files?.[0];

            if (!file) {
              return;
            }

            try {
              validateTopicImage(file);
              onImage(file, URL.createObjectURL(file));
            } catch (cause) {
              onError(cause);
            }

            e.target.value = "";
          }}
        />
      </label>

      <div className="flex min-w-0 flex-col gap-[20px]">
        <input
          className={`${inputClass} h-[58px]`}
          placeholder="주제 제목을 입력해 주세요"
          aria-label="주제 제목"
          value={topic.topicName}
          onChange={(e) =>
            onTopicChange({
              ...topic,
              topicName: e.target.value,
            })
          }
        />

        <div className="relative">
          <input
            className={`${inputClass} h-[58px] pr-[58px]`}
            placeholder="카테고리를 입력해 주세요"
            aria-label="카테고리"
            value={topic.category}
            autoComplete="off"
            onFocus={() => setCategoryOpen(true)}
            onChange={(e) => {
              onTopicChange({
                ...topic,
                category: e.target.value,
              });

              setCategoryOpen(true);
            }}
            onBlur={() => {
              window.setTimeout(() => {
                setCategoryOpen(false);
              }, 100);
            }}
          />

          <button
            type="button"
            aria-label="카테고리 목록 열기"
            className="
              absolute top-0 right-0
              flex h-[58px] w-[58px]
              items-center justify-center
            "
            onMouseDown={(e) => {
              e.preventDefault();
            }}
            onClick={() => {
              setCategoryOpen((prev) => !prev);
            }}
          >
            <ChevronDownIcon />
          </button>

          {categoryOpen && (
            <div
              className="
                absolute top-[66px] right-0 left-0
                z-30
                max-h-[220px]
                overflow-y-auto
                rounded-[10px]
                border border-zinc-700
                bg-[#09090B]
                py-[6px]
              "
            >
              <button
                type="button"
                className="
                  w-full
                  px-[20px] py-[11px]
                  text-left text-[15px]
                  text-zinc-200
                  hover:bg-zinc-800
                "
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  if (!topic.category || categoryExists) {
                    return;
                  }

                  setCategoryOpen(false);
                }}
              >
                {topic.category && !categoryExists
                  ? `+ "${topic.category}" 추가`
                  : "+ 추가"}
              </button>

              <div className="my-[4px] border-t border-zinc-800" />

              {filteredCategories.map((category) => (
                <button
                  key={category}
                  type="button"
                  className="
                    w-full
                    px-[20px] py-[11px]
                    text-left text-[15px]
                    text-zinc-400
                    hover:bg-zinc-800
                    hover:text-zinc-200
                  "
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    onTopicChange({
                      ...topic,
                      category,
                    });

                    setCategoryOpen(false);
                  }}
                >
                  {category}
                </button>
              ))}
            </div>
          )}
        </div>

        <textarea
          className={`${inputClass} min-h-0 flex-1 resize-none py-[17px]`}
          placeholder="주제 설명을 입력해 주세요"
          aria-label="주제 설명"
          value={topic.description}
          onChange={(e) =>
            onTopicChange({
              ...topic,
              description: e.target.value,
            })
          }
        />
      </div>
    </div>
  );
}
