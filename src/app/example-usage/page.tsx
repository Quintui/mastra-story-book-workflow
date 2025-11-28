"use client";

import { useChat } from "@ai-sdk/react";
import { useState } from "react";
import { DefaultChatTransport } from "ai";

export default function ExampleUsage() {
  const [prompt, setPrompt] = useState("");
  const [numberOfChapters, setNumberOfChapters] = useState(3);

  const { messages, sendMessage, status, error, stop } = useChat({
    transport: new DefaultChatTransport({
      api: "/api",
      prepareSendMessagesRequest({ messages }) {
        // Get the last message content as the user prompt
        const lastMessage = messages[messages.length - 1];
        const userPrompt =
          lastMessage?.parts?.find((p) => p.type === "text")?.text || "";

        return {
          body: {
            userPrompt,
            numberOfChapters,
          },
        };
      },
    }),
  });

  const isLoading = status === "streaming" || status === "submitted";

  console.log("Message", messages);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    sendMessage({ text: prompt });
    setPrompt("");
  };

  return (
    <div className="min-h-screen p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Story Generator</h1>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="mb-8 space-y-4">
        <div className="flex gap-4">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your story idea..."
            className="flex-1 px-4 py-2 border rounded-lg"
            disabled={isLoading}
          />
          <select
            value={numberOfChapters}
            onChange={(e) => setNumberOfChapters(Number(e.target.value))}
            className="px-4 py-2 border rounded-lg"
            disabled={isLoading}
          >
            <option value={2}>2 Chapters</option>
            <option value={3}>3 Chapters</option>
            <option value={5}>5 Chapters</option>
          </select>
        </div>
        <div className="flex gap-4">
          {isLoading ? (
            <button
              type="button"
              onClick={stop}
              className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Stop
            </button>
          ) : (
            <button
              type="submit"
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Generate Story
            </button>
          )}
        </div>
      </form>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-300 rounded-lg text-red-700">
          Error: {error.message}
        </div>
      )}

      {/* Status Indicator */}
      {isLoading && (
        <div className="mb-4 p-3 bg-blue-100 border border-blue-300 rounded-lg">
          <span className="animate-pulse">●</span> Generating story...
        </div>
      )}

      {/* Messages / Workflow Output */}
      <div className="space-y-6">
        {messages.map((message) => (
          <div key={message.id} className="space-y-4">
            {message.parts.map((part, index) => {
              // Handle text parts
              if (part.type === "text") {
                return (
                  <div
                    key={`${message.id}-${index}`}
                    className="p-4 bg-white rounded-lg border shadow-sm"
                  >
                    <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                      {part.text}
                    </div>
                  </div>
                );
              }

              // Handle workflow data parts from @mastra/ai-sdk
              if (part.type === "data-workflow") {
                const workflowData = part.data as {
                  status?: string;
                  steps?: Array<{
                    stepName: string;
                    input?: unknown;
                    output?: unknown;
                  }>;
                  result?: {
                    storyTitle?: string;
                    chapters?: Array<{
                      chapterNumber: number;
                      title: string;
                      premise: string;
                      content: string;
                    }>;
                    totalChapters?: number;
                  };
                };

                return (
                  <div key={`${message.id}-${index}`} className="space-y-4">
                    {/* Show final result if available */}
                    {workflowData.result?.chapters?.map((chapter) => (
                      <article
                        key={chapter.chapterNumber}
                        className="p-6 bg-white rounded-lg border shadow-sm"
                      >
                        <h3 className="text-xl font-serif mb-1">
                          Chapter {chapter.chapterNumber}: {chapter.title}
                        </h3>
                        <p className="text-sm text-gray-500 italic mb-4">
                          {chapter.premise}
                        </p>
                        <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                          {chapter.content}
                        </div>
                      </article>
                    ))}

                    {/* Show workflow status */}
                    {workflowData.status && !workflowData.result && (
                      <div className="text-sm text-gray-500">
                        Status: {workflowData.status}
                      </div>
                    )}
                  </div>
                );
              }

              // Handle any other custom data parts
              if (part.type.startsWith("data-")) {
                return (
                  <div
                    key={`${message.id}-${index}`}
                    className="p-4 bg-gray-50 rounded-lg border text-sm"
                  >
                    <div className="font-mono text-xs text-gray-400 mb-2">
                      {part.type}
                    </div>
                    <pre className="overflow-auto">
                      {JSON.stringify(part.data, null, 2)}
                    </pre>
                  </div>
                );
              }

              return null;
            })}
          </div>
        ))}
      </div>

      {/* Loading State */}
      {isLoading && messages.length === 0 && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Starting story generation...</p>
        </div>
      )}
    </div>
  );
}
