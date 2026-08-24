"use client";

import { showTopicModalState } from "@/atoms/modalAtom";
import { pickedTopicAtom } from "@/atoms/topicAtom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAtom } from "jotai";
import { Filter, Image, Music, Text } from "lucide-react";
import { useRef, useState } from "react";
import { useTopicQuery } from "@/hooks/queries/room_modal/useTopicQuery";
import {
  TOPIC_DECISION_LIST,
  TopicDecisionType,
} from "@/types/common/room/topic";
import { Button } from "@/components/ui/button";
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Select,
} from "@/components/ui/select";

export default function TopicModal() {
  const [showTopicModal, setShowTopicModal] = useAtom(showTopicModalState);
  const [picked, setPicked] = useAtom(pickedTopicAtom);

  const { data: topicList = [] } = useTopicQuery();

  const [showTypeImage, setShowTypeImage] = useState(true);
  const [showTypeArticle, setShowTypeArticle] = useState(true);
  const [showTypeSound, setShowTypeSound] = useState(true);
  const [showFilter, setShowFilter] = useState(false);

  const [category, setCategory] = useState("all");
  const [topicName, setTopicName] = useState("");

  const [decision, setDecision] = useState<TopicDecisionType>("vote");
  const [showTopicInfo, setShowTopicInfo] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    // 500ms(0.5초) 뒤에 띄우기
    timerRef.current = setTimeout(() => {
      setShowTopicInfo(true);
    }, 500);
  };

  const handleMouseLeave = () => {
    // 타이머가 작동 중이면 즉시 취소
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    // 툴팁 끄기
    setShowTopicInfo(false);
  };

  const handleTopicNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTopicName(e.target.value);
  };

  const typeImage = (type: string) => {
    switch (type) {
      case "image":
        return <Image size={21} color="#d4d4d8" />;
      case "article":
        return <Text size={21} color="#d4d4d8" />;
      case "sound":
        return <Music size={21} color="#d4d4d8" />;
    }
  };

  const chooseTopic = (id: string, name: string) => {
    setPicked((prev: Map<string, string>) => {
      const next = new Map(prev);
      next.has(id) ? next.delete(id) : next.set(id, name);
      return next;
    });
  };

  const filteredTopicList = topicList.filter((topic) => {
    if (category !== "all" && topic.category !== category) return false;
    if (!showTypeImage && topic.type === "image") return false;
    if (!showTypeArticle && topic.type === "article") return false;
    if (!showTypeSound && topic.type === "sound") return false;
    if (topicName && !topic.topicName.includes(topicName)) return false;
    return true;
  });

  return (
    <Dialog open={showTopicModal} onOpenChange={setShowTopicModal}>
      <DialogContent className="bg-zinc-950 text-zinc-100 select-none">
        <DialogHeader className="text-center mt-5">
          <DialogTitle className="text-2xl text-zinc-100">주제</DialogTitle>
        </DialogHeader>

        <div>
          <div
            className={`relative w-full h-11 bg-zinc-900
        flex flex-col
        ${showFilter ? "rounded-t" : "rounded"}`}
          >
            <input
              type="text"
              id="room-name"
              placeholder="2자 이상 입력해 주세요"
              className="w-[85%] text-zinc-100
              pl-3 py-3
              outline-none
              placeholder:text-zinc-500"
              value={topicName}
              onChange={handleTopicNameChange}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Filter
                className={`${showFilter ? "text-zinc-300 hover:text-zinc-400" : "text-zinc-400 hover:text-zinc-300"}`}
                onClick={() => setShowFilter(!showFilter)}
              />
            </div>
          </div>

          {showFilter && (
            <div
              className={`w-full h-10 bg-zinc-900 flex flex-row items-center
          ${showFilter ? "rounded-b" : "rounded"}`}
            >
              <Select
                value={category}
                onValueChange={(value) => setCategory(value)}
              >
                <SelectTrigger className="ml-2 outline-none bg-zinc-900 border-none">
                  <SelectValue placeholder="분류" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">분류</SelectItem>
                  <SelectItem value="국어">국어</SelectItem>
                  <SelectItem value="노래">노래</SelectItem>
                </SelectContent>
              </Select>
              <button
                className="ml-3"
                onClick={() => setShowTypeImage(!showTypeImage)}
              >
                <Image
                  size={20}
                  className={`hover:text-zinc-300 ${showTypeImage ? "text-white" : "text-zinc-400"}`}
                />
              </button>
              <button
                className="ml-2"
                onClick={() => setShowTypeArticle(!showTypeArticle)}
              >
                <Text
                  size={20}
                  className={`hover:text-zinc-300 ${showTypeArticle ? "text-white" : "text-zinc-400"}`}
                />
              </button>
              <button
                className="ml-2"
                onClick={() => setShowTypeSound(!showTypeSound)}
              >
                <Music
                  size={20}
                  className={`hover:text-zinc-300 ${showTypeSound ? "text-white" : "text-zinc-400"}`}
                />
              </button>
            </div>
          )}
        </div>

        {picked.size > 1 && (
          <div className="flex items-center relative">
            <h2
              className="text mr-2"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              결정 방식
            </h2>

            <Select
              value={decision}
              onValueChange={(value: TopicDecisionType) => setDecision(value)}
            >
              <SelectTrigger className="px-3 py-1 mr-1">
                <SelectValue placeholder="분류" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TOPIC_DECISION_LIST).map(([key, decision]) => (
                  <SelectItem key={key} value={key}>
                    {(decision as any).label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {showTopicInfo && (
              <div className="absolute -bottom-18 px-2 py-1 border border-zinc-700 rounded bg-zinc-900 text-sm whitespace-pre-wrap z-11">
                <div className="flex gap-1">
                  <h3 className="text-zinc-300">투표</h3>
                  <p>하나를 투표로 확정</p>
                </div>
                <div className="flex gap-1">
                  <h3 className="text-zinc-300">랜덤</h3>
                  <p>하나를 뽑아 이번 판 고정</p>
                </div>
                <div className="flex gap-1">
                  <h3 className="text-zinc-300">항시 랜덤</h3>
                  <p>매 라운드마다 무작위 변경</p>
                </div>
              </div>
            )}
          </div>
        )}

        <div
          className="grid grid-cols-2
        w-full h-[200px]
        overflow-y-auto overflow-x-none
        no-scrollbar gap-3"
        >
          {filteredTopicList.length ? (
            filteredTopicList.map((room) => (
              <div
                role="button"
                className={`relative h-full py-4
                      flex flex-col 
                      border-zinc-700
                      hover:bg-zinc-900
                      border rounded-md
                      ${picked.has(room.id) ? "bg-zinc-900" : "bg-zinc-950"}`}
                key={room.id}
                onClick={() => chooseTopic(room.id, room.topicName)}
              >
                <div className="flex items-center">
                  <div className="w-full flex items-center justify-between">
                    <div
                      className="text-zinc-300 text-xs ml-3
                    border-zinc-300 border rounded
                    px-2 py-0.5
                "
                    >
                      {room.category}
                    </div>
                    <div className="flex items-center mr-3">
                      {typeImage(room.type)}
                    </div>
                  </div>
                </div>
                <h2 className="text-lg font-semibold mt-2 ml-3 mx-2 leading-tight">
                  {room.topicName}
                </h2>
                <p className="text-[13px] text-zinc-400 ml-3 mx-2">
                  {room.description}
                </p>
              </div>
            ))
          ) : (
            <p className="text text-zinc-400 ml-3 mx-2">
              해당하는 주제가 없습니다.
            </p>
          )}
        </div>

        <div className="flex justify-center">
          <Button
            variant="secondary"
            className="w-30 rounded-lg"
            onClick={() => setShowTopicModal(false)}
          >
            선택
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
