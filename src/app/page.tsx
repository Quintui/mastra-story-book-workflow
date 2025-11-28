"use client";

import { useEffect, useState } from "react";
import { StoryInput } from "@/src/components/story-input";
import { StoryOutline } from "@/src/components/story-outline";
import { StoryBook } from "@/src/components/story-book";
import { AnimatePresence, motion } from "motion/react";
import { useStoryWorkflow } from "../hooks/use-story-workflow";

type AppState = "input" | "outlining" | "book";

export default function Home() {
  const [appState, setAppState] = useState<AppState>("input");
  const [storyPrompt, setStoryPrompt] = useState("");
  const [chapterCount, setChapterCount] = useState(5);

  const { send, workflow, reset } = useStoryWorkflow();

  // Extract outline data (chapter-generation)
  const chapterGeneration = workflow?.parts.find(
    (item) => item.type === "data-chapter-generation",
  );

  // Extract chapter content data (chapter-content-generation)
  const chapterContents =
    workflow?.parts
      .filter((item) => item.type === "data-chapter-content-generation")
      .map((item) => item.data) || [];

  const handleGenerate = (prompt: string, chapters: number) => {
    send({ numberOfChapters: chapters, userPrompt: prompt });
    setStoryPrompt(prompt);
    setChapterCount(chapters);
    setAppState("outlining");
  };

  const handleReset = () => {
    setAppState("input");
    setStoryPrompt("");
    reset();
  };

  useEffect(() => {
    if (!chapterGeneration) return;

    switch (chapterGeneration.data.status) {
      case "streaming": {
        setAppState("outlining");
        break;
      }
      case "completed": {
        setAppState("book");
        break;
      }
    }
  }, [chapterGeneration]);

  return (
    <main className="min-h-screen relative overflow-hidden">
      <AnimatePresence mode="wait">
        {appState === "input" && (
          <motion.div
            key="input"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.5 }}
            className="relative z-10"
          >
            <StoryInput onGenerate={handleGenerate} />
          </motion.div>
        )}

        {appState === "outlining" && chapterGeneration && (
          <motion.div
            key="outline"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10"
          >
            <StoryOutline
              prompt={storyPrompt}
              chapterCount={chapterCount}
              outline={chapterGeneration.data}
            />
          </motion.div>
        )}

        {appState === "book" && chapterGeneration && (
          <motion.div
            key="book"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10"
          >
            <StoryBook
              prompt={storyPrompt}
              outline={chapterGeneration.data}
              chapterContents={chapterContents}
              onClose={handleReset}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
