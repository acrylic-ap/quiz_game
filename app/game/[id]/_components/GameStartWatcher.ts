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
import { buildGameQuestionList } from "@/utils/gameQuestions";
import {
  VOTE_TIE_BREAK_DURATION_MS,
  countTopicVotes,
  getWinningTopicIds,
} from "@/utils/topic";

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
  topicVoteStartedAt: number | null;
  serverTimeOffset: number;
}

export const GameStartWatcher = ({
  roomId,
  isOwner,
  decision,
  lastRound,
  topicIds,
  users,
  topicVoteStartedAt,
  serverTimeOffset,
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

  const voteResolutionTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (voteResolutionTimer.current !== null) {
        window.clearTimeout(voteResolutionTimer.current);
      }
    };
  }, []);

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

    const winningTopicIds = getWinningTopicIds(voteCount);

    if (winningTopicIds.length === 0) {
      return;
    }

    selectingTopic.current = true;

    const selectWinningTopic = () => {
      const winningTopicId =
        winningTopicIds.length === 1
          ? winningTopicIds[0]
          : shuffle(winningTopicIds)[0];

      selectTopic(winningTopicId, {
        onError: () => {
          selectingTopic.current = false;
        },
      });
    };

    if (winningTopicIds.length === 1) {
      selectWinningTopic();
      return;
    }

    voteResolutionTimer.current = window.setTimeout(
      selectWinningTopic,
      VOTE_TIE_BREAK_DURATION_MS,
    );
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
      !topicVoteStartedAt ||
      !allUsersVoted
    ) {
      return;
    }

    resolveVote();
  }, [
    allUsersVoted,
    decision,
    resolveVote,
    topicIds.length,
    topicVoteStartedAt,
  ]);

  useEffect(() => {
    if (
      decision !== "vote" ||
      topicIds.length < 2 ||
      !topicVoteStartedAt ||
      selectedTopicId
    ) {
      return;
    }

    const remainingTime = Math.max(
      0,
      topicVoteStartedAt + 10_000 - (Date.now() + serverTimeOffset),
    );

    const timer = window.setTimeout(resolveVote, remainingTime);

    return () => {
      window.clearTimeout(timer);
    };
  }, [
    decision,
    resolveVote,
    selectedTopicId,
    serverTimeOffset,
    topicIds.length,
    topicVoteStartedAt,
  ]);

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

    const randomizedQuestionList = buildGameQuestionList(topicQuestions, lastRound);

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
      started.current = false;
    };
  }, [decision, isOwner, questionList.length, changeGameStatus]);

  return null;
};
