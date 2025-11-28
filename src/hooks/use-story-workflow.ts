"use client";

import { useChat } from "@ai-sdk/react";
import { useCallback, useMemo, useRef } from "react";
import { DefaultChatTransport } from "ai";
import { StoryWorkflowUIMessage } from "@/src/types/story-workflow";

interface SendOptions {
  userPrompt: string;
  numberOfChapters: number;
}

export function useStoryWorkflow() {
  const { messages, sendMessage, setMessages, status, error, stop } =
    useChat<StoryWorkflowUIMessage>({
      transport: new DefaultChatTransport({
        api: "/api/story-workflow",
        prepareSendMessagesRequest({ messages }) {
          const lastMessage = messages[messages.length - 1];
          const userPrompt =
            lastMessage?.parts?.find((p) => p.type === "text")?.text || "";

          const numberOfChaptersPart = lastMessage?.parts?.find(
            (p) => p.type === "data-number-of-chapters",
          );

          const numberOfChapters = numberOfChaptersPart?.data.count || 3;

          return {
            body: {
              userPrompt,
              numberOfChapters,
            },
          };
        },
      }),
    });

  const send = useCallback(
    ({ userPrompt, numberOfChapters }: SendOptions) => {
      if (!userPrompt.trim()) return;

      sendMessage({
        parts: [
          { type: "text", text: userPrompt },
          {
            type: "data-number-of-chapters",
            data: { count: numberOfChapters },
          },
        ],
      });
    },
    [sendMessage],
  );

  const reset = () => {
    setMessages([]);
  };

  const workflow = useMemo(() => {
    const assistantMessages = messages.filter((m) => m.role === "assistant");
    const lastAssistantMessage =
      assistantMessages[assistantMessages.length - 1];

    if (!lastAssistantMessage) return null;

    return lastAssistantMessage;
  }, [messages]);

  return {
    send,
    status,
    error,
    stop,
    workflow,
    reset,
  };
}
