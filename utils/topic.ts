import { Topic } from "@/types/topic/topic";
import { shuffle } from "./random";

export const getRandomTopic = (topics: Topic[]): Topic | null => {
  if (topics.length === 0) {
    return null;
  }

  return shuffle(topics)[0];
};

interface TopicVote {
  topicId: string;
}

export const countTopicVotes = (
  votes: Record<string, TopicVote>,
): Record<string, number> => {
  const voteCount: Record<string, number> = {};

  Object.values(votes).forEach((vote) => {
    if (!vote.topicId) {
      return;
    }

    voteCount[vote.topicId] = (voteCount[vote.topicId] ?? 0) + 1;
  });

  return voteCount;
};

export const VOTE_TIE_BREAK_DURATION_MS = 3_000;

export const getWinningTopicIds = (
  voteCount: Record<string, number>,
): string[] => {
  const entries = Object.entries(voteCount);

  if (entries.length === 0) {
    return [];
  }

  const maxVotes = Math.max(...entries.map(([, count]) => count));

  return entries
    .filter(([, count]) => count === maxVotes)
    .map(([topicId]) => topicId);
};

export const getWinningTopicId = (
  voteCount: Record<string, number>,
): string | null => {
  const winners = getWinningTopicIds(voteCount);

  if (winners.length === 0) {
    return null;
  }

  const randomIndex = Math.floor(Math.random() * winners.length);

  return winners[randomIndex];
};
