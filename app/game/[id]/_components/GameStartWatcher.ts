"use client";

import { useCallback, useEffect, useRef } from "react";

import { useGameQuestionListQuery } from "@/hooks/queries/game/crud/useGameQuestionListQuery";
import { useGameStatus } from "@/hooks/queries/game/actions/useGameStatus";
import { useGameTopic } from "@/hooks/queries/game/actions/useGameTopic";
import { useGameQuestionList } from "@/hooks/queries/game/actions/useGameQuestionList";
import { useGameSelectedTopic } from "@/hooks/queries/game/crud/useGameSelectedTopic";
import { useGameTopicVotes } from "@/hooks/queries/game/crud/useGameTopicVotes";
import { useTopicQuestions } from "@/hooks/queries/topic/crud/useTopicQuestions";
import { shuffle } from "@/utils/random";
import { countTopicVotes, getWinningTopicId } from "@/utils/topic";

interface GameUser {
  id: string;
}

interface GameStartWatcherProps {
  roomId: string;
  isOwner: boolean;
  decision: "random" | "vote" | "always_random";
  lastRound: number;
  topicIds: string[];
  users: GameUser[];
}

export const GameStartWatcher = ({
  roomId,
  isOwner,
  decision,
  lastRound,
  topicIds,
  users,
}: GameStartWatcherProps) => {
  const { data: questionList = [] } = useGameQuestionListQuery(roomId);

  const { data: selectedTopicId } = useGameSelectedTopic(roomId);

  const { data: topicVotes = {} } = useGameTopicVotes(roomId);

  const availableTopicId =
    selectedTopicId && topicIds.includes(selectedTopicId)
      ? selectedTopicId
      : undefined;

  const { data: topicQuestions = [] } = useTopicQuestions(
    availableTopicId,
  );

  const { mutate: changeGameStatus } = useGameStatus(roomId);

  const { mutate: selectTopic } = useGameTopic(roomId);

  const { mutate: saveQuestionList } = useGameQuestionList(roomId);

  const started = useRef(false);

  const selectingTopic = useRef(false);

  const savingQuestionList = useRef(false);

  const resolveVote = useCallback(() => {
    if (!isOwner || selectedTopicId || selectingTopic.current) {
      return;
    }

    const validVotes = Object.fromEntries(
      Object.entries(topicVotes).filter(([, vote]) =>
        topicIds.includes(vote.topicId),
      ),
    );

    const voteCount = countTopicVotes(validVotes);

    topicIds.forEach((topicId) => {
      voteCount[topicId] ??= 0;
    });

    const winningTopicId = getWinningTopicId(voteCount);

    if (!winningTopicId) {
      return;
    }

    selectingTopic.current = true;

    selectTopic(winningTopicId, {
      onError: () => {
        selectingTopic.current = false;
      },
    });
  }, [isOwner, selectedTopicId, selectTopic, topicIds, topicVotes]);

  useEffect(() => {
    if (!isOwner || selectedTopicId || selectingTopic.current) {
      return;
    }

    const isSingleTopic = topicIds.length === 1;

    const shouldRandomlySelectTopic =
      topicIds.length > 1 &&
      decision === "always_random";

    if (!isSingleTopic && !shouldRandomlySelectTopic) {
      return;
    }

    selectingTopic.current = true;

    const topicId = isSingleTopic ? topicIds[0] : shuffle(topicIds)[0];

    selectTopic(topicId, {
      onError: () => {
        selectingTopic.current = false;
      },
    });
  }, [decision, isOwner, selectedTopicId, selectTopic, topicIds]);

  const allUsersVoted =
    users.length > 0 &&
    users.every((user) => topicVotes[user.id]?.topicId !== undefined);

  useEffect(() => {
    if (
      decision !== "vote" ||
      topicIds.length < 2 ||
      !allUsersVoted
    ) {
      return;
    }

    resolveVote();
  }, [allUsersVoted, decision, resolveVote, topicIds.length]);

  useEffect(() => {
    if (decision !== "vote" || topicIds.length < 2 || selectedTopicId) {
      return;
    }

    const timer = window.setTimeout(resolveVote, 10_000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [decision, resolveVote, selectedTopicId, topicIds.length]);

  useEffect(() => {
    if (!isOwner || !availableTopicId) {
      return;
    }

    if (questionList.length > 0 || topicQuestions.length === 0) {
      return;
    }

    if (savingQuestionList.current) {
      return;
    }

    savingQuestionList.current = true;

    const questionCount =
      lastRound === 60
        ? topicQuestions.length
        : Math.min(lastRound, topicQuestions.length);

    const randomizedQuestionList = shuffle(topicQuestions)
      .slice(0, questionCount)
      .map((question) => ({
        ...question,
        options: question.options ? shuffle(question.options) : question.options,
      }));

    saveQuestionList(randomizedQuestionList, {
      onError: () => {
        savingQuestionList.current = false;
      },
    });
  }, [
    isOwner,
    lastRound,
    questionList.length,
    saveQuestionList,
    availableTopicId,
    topicQuestions,
  ]);

  useEffect(() => {
    if (!isOwner) {
      return;
    }

    if (questionList.length === 0) {
      return;
    }

    if (started.current) {
      return;
    }

    started.current = true;

    const startDelay = decision === "random" ? 5_000 : 3_000;

    const timer = window.setTimeout(() => {
      changeGameStatus("playing");
    }, startDelay);

    return () => {
      window.clearTimeout(timer);
    };
  }, [decision, isOwner, questionList.length, changeGameStatus]);

  return null;
};
