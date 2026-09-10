import { useQuery } from "@tanstack/react-query";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { mapTopic } from "@/lib/topics";
import { Topic } from "@/types/topic/topic";

const fetchTopicList = async (): Promise<Topic[]> => {
  const querySnapshot = await getDocs(collection(db, "topics"));
  return querySnapshot.docs.map((doc) => mapTopic(doc.id, doc.data()));
};

export const useTopicQuery = () => {
  return useQuery({
    queryKey: ["topics"],
    queryFn: fetchTopicList,
  });
};
