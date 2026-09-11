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

const PhotoIcon = ({ className = "" }: { className?: string }) => {
  return (
    <svg
      width="41"
      height="36"
      viewBox="0 0 41 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M0 5.14286C0 3.77889 0.539954 2.47078 1.50108 1.50631C2.4622 0.541835 3.76577 0 5.125 0H35.875C37.2342 0 38.5378 0.541835 39.4989 1.50631C40.46 2.47078 41 3.77889 41 5.14286V30.8571C41 32.2211 40.46 33.5292 39.4989 34.4937C38.5378 35.4582 37.2342 36 35.875 36H5.125C3.76577 36 2.4622 35.4582 1.50108 34.4937C0.539954 33.5292 0 32.2211 0 30.8571V5.14286ZM2.5625 28.2857V30.8571C2.5625 31.5391 2.83248 32.1932 3.31304 32.6754C3.7936 33.1577 4.44538 33.4286 5.125 33.4286H35.875C36.5546 33.4286 37.2064 33.1577 37.687 32.6754C38.1675 32.1932 38.4375 31.5391 38.4375 30.8571V21.8571L28.7589 16.8506C28.5186 16.7298 28.2466 16.6879 27.9812 16.7308C27.7159 16.7737 27.4707 16.8993 27.2804 17.0897L17.7735 26.6297L10.9572 22.0731C10.7111 21.9087 10.416 21.8348 10.1217 21.8638C9.82748 21.8929 9.55232 22.0232 9.34287 22.2326L2.5625 28.2857ZM15.375 11.5714C15.375 10.5485 14.97 9.56737 14.2492 8.84402C13.5283 8.12066 12.5507 7.71429 11.5312 7.71429C10.5118 7.71429 9.53415 8.12066 8.81331 8.84402C8.09247 9.56737 7.6875 10.5485 7.6875 11.5714C7.6875 12.5944 8.09247 13.5755 8.81331 14.2988C9.53415 15.0222 10.5118 15.4286 11.5312 15.4286C12.5507 15.4286 13.5283 15.0222 14.2492 14.2988C14.97 13.5755 15.375 12.5944 15.375 11.5714Z"
        fill="#D4D4D8"
      />
    </svg>
  );
};

const ChevronDownIcon = () => {
  return (
    <svg
      width="18"
      height="10"
      viewBox="0 0 18 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1 1L9 9L17 1"
        stroke="#52525B"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

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
        max-w-[1120px]
        grid-cols-2
        gap-[48px]
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
