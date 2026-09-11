"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { XIcon } from "lucide-react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import { auth } from "@/lib/firebase";
import {
  loadMyTopics,
  loadQuestions,
  removeTopic,
  saveTopic,
} from "@/lib/topics";

import { Topic, Question } from "@/types/topic/topic";

import { TopicSettingsMenu } from "./topic/TopicSettingsMenu";
import { TopicEditor } from "./topic/TopicEditor";
import { TopicManager } from "./topic/TopicManager";
import { TopicDeleteDialog } from "./topic/TopicDeleteDialog";

const emptyTopic = () => ({
  id: crypto.randomUUID(),
  topicName: "",
  category: "",
  description: "",
});

export default function TopicSettingsModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [screen, setScreen] = useState<"settings" | "edit" | "manage">(
    "settings",
  );

  const [tab, setTab] = useState<"topic" | "questions">("topic");

  const [topic, setTopic] = useState<Topic | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selected, setSelected] = useState<string | null>(null);

  const [image, setImage] = useState<File>();
  const [preview, setPreview] = useState("");

  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const [deleting, setDeleting] = useState<Topic | null>(null);

  const client = useQueryClient();
  const userId = auth.currentUser?.uid;

  const list = useQuery({
    queryKey: ["my_topics", userId],
    queryFn: loadMyTopics,
    enabled: open && screen === "manage" && !!userId,
  });

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const report = (e: unknown) => {
    setError(
      e instanceof Error
        ? e.message
        : "처리하지 못했습니다. 다시 시도해주세요.",
    );
  };

  const refresh = () =>
    Promise.all([
      client.invalidateQueries({
        queryKey: ["topics"],
      }),
      client.invalidateQueries({
        queryKey: ["my_topics"],
      }),
      client.invalidateQueries({
        queryKey: ["topic_questions"],
      }),
    ]);

  const edit = async (existing?: Topic) => {
    setBusy(true);
    setError("");

    try {
      const loaded = existing ? await loadQuestions(existing.id) : [];

      setTopic(existing ?? emptyTopic());

      setQuestions(
        loaded.map((q) => ({
          ...q,
          hints: (q.hints ?? []).map((h) => ({
            ...h,
            id: h.id ?? crypto.randomUUID(),
          })),
        })),
      );

      setSelected(loaded[0]?.id ?? null);

      setImage(undefined);
      setPreview("");

      setTab("topic");
      setScreen("edit");
    } catch (e) {
      report(e);
    } finally {
      setBusy(false);
    }
  };

  const save = async (requestApproval = false) => {
    if (!topic || busy) return;

    setBusy(true);
    setError("");

    try {
      const saved = await saveTopic(topic, questions, image, requestApproval);

      setTopic(saved);

      setImage(undefined);
      setPreview("");

      await refresh();

      setScreen("manage");
    } catch (e) {
      report(e);
    } finally {
      setBusy(false);
    }
  };

  const resetToSettings = () => {
    setScreen("settings");
    setTopic(null);
    setQuestions([]);
    setImage(undefined);
    setPreview("");
    setError("");
  };

  const close = (value: boolean) => {
    if (busy) return;

    if (!value) {
      resetToSettings();
    }

    onOpenChange(value);
  };

  const reorder = (from: number, to: number) => {
    if (from === to || to < 0 || to >= questions.length) {
      return;
    }

    const next = [...questions];

    next.splice(to, 0, next.splice(from, 1)[0]);

    setQuestions(next);
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent
        showCloseButton={false}
        className="
          flex h-[80vh]
          !w-[70vw] !max-w-[70vw]
          flex-col
          gap-0
          overflow-hidden
          border-zinc-700
          bg-[#09090B]
          p-0
          text-zinc-100
        "
        aria-describedby={undefined}
        onEscapeKeyDown={(e) => {
          if (busy) {
            e.preventDefault();
          }
        }}
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
      >
        {screen === "settings" ? (
          <DialogClose asChild>
            <Button
              type="button"
              variant="simple"
              className="absolute top-4 right-4 z-10"
              size="icon-sm"
            >
              <XIcon />
              <span className="sr-only">Close</span>
            </Button>
          </DialogClose>
        ) : (
          <Button
            type="button"
            variant="simple"
            className="absolute top-4 right-4 z-10"
            size="icon-sm"
            onClick={resetToSettings}
          >
            <XIcon />
            <span className="sr-only">Close</span>
          </Button>
        )}

        {screen === "settings" ? (
          <fieldset
            disabled={busy}
            className="
              flex min-h-0 flex-1
              flex-col
              items-center
              justify-center
              gap-[56px]
            "
          >
            <DialogHeader>
              <DialogTitle className="text-center text-[36px] font-semibold">
                주제 설정
              </DialogTitle>
            </DialogHeader>

            <TopicSettingsMenu
              onCreate={() => {
                void edit();
              }}
              onManage={() => {
                setError("");
                setScreen("manage");
              }}
            />
          </fieldset>
        ) : (
          <>
            <DialogHeader className="shrink-0 px-[40px] pt-[30px]">
              <DialogTitle className="text-left text-[28px] font-semibold">
                {screen === "manage" ? "주제 관리" : "주제 생성"}
              </DialogTitle>
            </DialogHeader>

            <fieldset
              disabled={busy}
              className="min-h-0 flex-1 overflow-y-auto pt-[22px]"
            >
              {screen === "edit" && topic && (
                <TopicEditor
                  topic={topic}
                  questions={questions}
                  tab={tab}
                  selected={selected}
                  preview={preview}
                  onTab={setTab}
                  onTopicChange={setTopic}
                  onImage={(file: File, url: string) => {
                    setImage(file);
                    setPreview(url);
                  }}
                  onError={report}
                  onSelect={setSelected}
                  onAdd={(q: Question) => {
                    setQuestions([...questions, q]);
                    setSelected(q.id);
                  }}
                  onDelete={(id: string) => {
                    const i = questions.findIndex((q) => q.id === id);

                    const next = questions.filter((q) => q.id !== id);

                    setQuestions(next);

                    if (selected === id) {
                      setSelected(
                        next[Math.min(i, next.length - 1)]?.id ?? null,
                      );
                    }
                  }}
                  onReorder={reorder}
                  onQuestionChange={(q: Question) => {
                    setQuestions(questions.map((x) => (x.id === q.id ? q : x)));
                  }}
                  onSave={save}
                />
              )}

              {screen === "manage" && (
                <TopicManager
                  topics={list.data ?? []}
                  loading={list.isLoading}
                  error={list.error as Error | null}
                  onEdit={(t) => {
                    void edit(t);
                  }}
                  onDelete={setDeleting}
                />
              )}
            </fieldset>
          </>
        )}

        {error && (
          <p role="alert" className="shrink-0 px-[40px] pb-[16px] text-red-400">
            {error}
          </p>
        )}

        <TopicDeleteDialog
          topic={deleting}
          busy={busy}
          onClose={() => {
            setDeleting(null);
          }}
          onDelete={async () => {
            if (!deleting || busy) {
              return;
            }

            setBusy(true);
            setError("");

            try {
              await removeTopic(deleting);

              setDeleting(null);

              await refresh();
            } catch (e) {
              setDeleting(null);
              report(e);
            } finally {
              setBusy(false);
            }
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
