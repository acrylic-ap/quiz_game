"use client";

import { showTopicModalState } from "@/app/atom/modalAtom";
import { pickedTopicAtom, topicListState } from "@/app/atom/topicAtom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAtom } from "jotai";
import {
  BoxSelect,
  Check,
  Filter,
  FormInput,
  Image,
  Music,
  Search,
  Text,
} from "lucide-react";
import { useState } from "react";

export default function TopicModal() {
  const [showTopicModal, setShowTopicModal] = useAtom(showTopicModalState);
  const [topicList] = useAtom(topicListState);
  const [picked, setPicked] = useAtom(pickedTopicAtom);

  const [category, setCategory] = useState("all");

  const [showTypeImage, setShowTypeImage] = useState(true);
  const [showTypeArticle, setShowTypeArticle] = useState(true);
  const [showTypeSound, setShowTypeSound] = useState(true);
  const [showFilter, setShowFilter] = useState(false);

  const [topicName, setTopicName] = useState("");

  const handleTopicNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTopicName(e.target.value);
  };

  const typeImage = (type: string) => {
    switch (type) {
      case "image":
        return <Image size={21} />;
      case "article":
        return <Text size={21} />;
      case "sound":
        return <Music size={21} />;
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
          <DialogTitle className="text-2xl">주제</DialogTitle>
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
              <select
                onChange={(e) => setCategory(e.target.value)}
                value={category}
                className="ml-2 outline-none bg-zinc-900"
              >
                <option value="all">분류</option>
                <option value="국어">국어</option>
                <option value="노래">노래</option>
              </select>
              <label className="ml-2 text">문제 유형</label>
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

        <div
          className="grid grid-cols-2
        w-full h-[200px]
        overflow-y-auto overflow-x-none
        no-scrollbar"
        >
          {filteredTopicList.map((room) => (
            <div
              role="button"
              className={`relative h-full py-4
                      flex flex-col 
                      hover:bg-zinc-800
                      ${picked.has(room.id) ? "bg-zinc-900" : "bg-zinc-950"}`}
              key={room.id}
              onClick={() => chooseTopic(room.id, room.topicName)}
            >
              <div className="flex items-center">
                <div
                  className="w-fit text ml-3
                border rounded
                px-2 py-0.5"
                >
                  {room.category}
                </div>
                <div className="absolute right-3 flex items-center">
                  <div className="ml-3">{typeImage(room.type)}</div>
                </div>
              </div>
              <h2 className="text-lg font-bold mt-1 ml-3 mx-2">
                {room.topicName}
              </h2>
              <p className="text text-zinc-400 ml-3 mx-2">{room.description}</p>
            </div>
          ))}
        </div>

        <div className="flex justify-center">
          <button
            className="w-30 px-6 py-2 rounded
              text bg-zinc-900
              hover:bg-zinc-800"
            onClick={() => setShowTopicModal(false)}
          >
            확인
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
