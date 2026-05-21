import { useQuery } from "@tanstack/react-query";
import { db } from "@/app/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Topic } from "@/app/types/common/room/topic";

const fetchTopicList = async (): Promise<Topic[]> => {
  const querySnapshot = await getDocs(collection(db, "topics"));
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    type: doc.data().type as string,
    questionType: doc.data().questionType as "select" | "input",
    topicName: doc.data().topicName as string,
    description: doc.data().description as string,
    category: doc.data().category as string,
  }));
};

export const useTopicQuery = () => {
  return useQuery({
    queryKey: ["topics"],
    queryFn: fetchTopicList,
  });
};
