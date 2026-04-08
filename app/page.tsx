"use client";

import { useAtom } from "jotai";
import { Room, roomListState } from "@/app/atom/lobbyAtom";
import RoomCodeModal from "./components/main/modals/room_code/RoomCodeModal";
import { alertModalState, setRoomModalState } from "./atom/modalAtom";
import { useRouter } from "next/navigation";
import { db } from "./lib/firebase";
import { collection, getDocs, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";

export const Header = () => {
  return (
    <div
      className="relative w-full h-[20%]
                flex justify-center items-center"
    >
      <div className="relative w-[75%] h-full">
        <h1 className="absolute left-0 top-[35px] text-4xl font-bold">
          스피드 퀴즈
        </h1>

        <div className="absolute right-0 top-[35px]">
          <button>로그인</button>
        </div>
      </div>
    </div>
  );
};

export const Section = () => {
  const [, setRoomDescription] = useAtom(setRoomModalState);
  const [roomList, setRoomList] = useAtom(roomListState);
  const [, setShowAlertModal] = useAtom(alertModalState);

  const router = useRouter();

  const enterRoom = (
    id: string,
    capacity: number,
    maxCapacity: number,
    played: boolean,
  ) => {
    if (played) {
      setShowAlertModal("이미 진행 중인 방입니다!");
      return;
    }

    if (capacity === maxCapacity) {
      setShowAlertModal("인원이 꽉 찼습니다!");
      return;
    }

    router.push(`/room/${id}`);
  };

  const [topicMap, setTopicMap] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchTopics = async () => {
      const querySnapshot = await getDocs(collection(db, "topics"));
      const mapping: Record<string, string> = {};
      querySnapshot.forEach((doc) => {
        mapping[doc.id] = doc.data().topicName;
      });
      setTopicMap(mapping);
    };
    fetchTopics();
  }, []);

  useEffect(() => {
    // 1. 컬렉션 참조 생성
    const roomsCollection = collection(db, "rooms");

    // 2. 실시간 리스너 연결 (onSnapshot)
    // query를 써서 생성일 순(orderBy)으로 정렬하는 걸 추천하지만, 일단 기본형으로 수정해 드릴게요.
    const unsubscribe = onSnapshot(
      roomsCollection,
      (querySnapshot) => {
        const roomsData: Room[] = querySnapshot.docs.map((doc) => {
          const rawTopic = doc.data().topic || "";
          const topicParts = rawTopic.split(", ");
          const firstTopicName = topicMap[topicParts[0]] || "";

          const topicName =
            topicParts.length > 1
              ? `${firstTopicName} 외 ${topicParts.length - 1}개`
              : firstTopicName;

          return {
            id: doc.id,
            roomName: doc.data().roomName,
            topic: topicName,
            capacity: doc.data().capacity,
            maxCapacity: doc.data().maxCapacity,
            playing: doc.data().playing,
            decision: doc.data().decision,
          };
        });

        // 데이터가 비었을 때 처리
        if (roomsData.length === 0) {
          setRoomList([]);
          console.log("No rooms found.");
        } else {
          setRoomList(roomsData);
        }

        console.log("Real-time rooms update:", roomsData);
      },
      (error) => {
        // 에러 처리 (권한 문제 등)
        console.error("Error fetching rooms in real-time:", error);
      },
    );

    return () => unsubscribe();
  }, [topicMap]);

  return (
    <div
      className="w-full h-[85%]
                flex flex-col items-center"
    >
      <div
        className="w-[75%] mb-3
                  flex justify-end"
      >
        <button
          className="px-8 py-3 mr-2 rounded-sm
                  text-xl select-none bg-zinc-900
                  hover:bg-zinc-800"
          onClick={() => setRoomDescription("create")}
        >
          방 생성
        </button>

        <RoomCodeModal />
      </div>

      <div
        id="room-container"
        className="grid grid-cols-3 gap-5 content-start
                  w-[75%] h-auto select-none"
      >
        {roomList.length ? (
          roomList.map((room) => (
            <div
              role="button"
              onClick={() =>
                enterRoom(
                  room.id,
                  room.capacity,
                  room.maxCapacity,
                  room.playing,
                )
              }
              className={`relative h-[150px]
                      flex flex-col
                      p-5
                      rounded-lg
                      ${room.playing ? "bg-zinc-950" : "bg-zinc-900 hover:bg-zinc-800"}`}
              key={room.id}
            >
              <h2 className="w-full text-xl font-bold">{room.roomName}</h2>
              <p className="w-full text text-zinc-300">{room.topic}</p>
              <div
                className="absolute left-2 bottom-2
                        text mb-1 px-3 py-1
                        text-zinc-400
                        flex items-center justify-center
                        rounded-full"
              >
                10문제
              </div>
              <div
                className={`absolute right-3 bottom-2
                        text ml-5 mb-1 px-3 py-1
                        flex items-center justify-center
                        rounded-full
                        ${room.capacity === room.maxCapacity ? "text-red-500 bg-red-900/20" : "text-white bg-zinc-500/20"}`}
              >
                {room.capacity} / {room.maxCapacity}
              </div>
            </div>
          ))
        ) : (
          <div className="w-full h-full">
            <p className="text-zinc-500 text-lg">생성된 방이 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default function Home() {
  return (
    <div
      className="w-full h-full
                flex flex-col
                font-[Pretendard]"
    >
      <Header />
      <Section />
    </div>
  );
}
