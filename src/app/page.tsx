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
  const [chapterCount, setChapterCount] = useState(3);

  const { send, workflow, reset } = useStoryWorkflow();

  console.log("workflow", workflow);

  // Extract outline data (chapter-generation)
  const chapterOutlines = workflow?.parts.find(
    (item) => item.type === "data-chapter-generation",
  );

  // Extract chapter content data (chapter-content-generation)
  const chapters =
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
    if (!chapterOutlines) return;

    switch (chapterOutlines.data.status) {
      case "streaming": {
        setAppState("outlining");
        break;
      }
      case "completed": {
        setAppState("book");
        break;
      }
    }
  }, [chapterOutlines]);

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

        {appState === "outlining" && chapterOutlines && (
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
              outline={chapterOutlines.data}
            />
          </motion.div>
        )}

        {appState === "book" && chapterOutlines && (
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
              chapters={chapters}
              storyTitle={
                chapterOutlines.data.content.storyTitle || "Your Story"
              }
              onClose={handleReset}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
