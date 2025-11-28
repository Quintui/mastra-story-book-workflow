"use client";

import { useState } from "react";
import { StoryInput } from "@/src/components/story-input";
import { StoryOutline } from "@/src/components/story-outline";
import { StoryBook } from "@/src/components/story-book";
import { AnimatePresence, motion } from "motion/react";
import { useStoryWorkflow } from "../hooks/use-story-workflow";

export type ChapterOutline = {
  chapterNumber: number;
  title: string;
  premise: string;
  characters: string[];
  setting: string;
  emotionalTone: string;
  keyEvents: string[];
  storyConnection: string;
};

type AppState = "input" | "outlining" | "book";

export default function Home() {
  const [appState, setAppState] = useState<AppState>("input");
  const [storyPrompt, setStoryPrompt] = useState("");
  const [chapterCount, setChapterCount] = useState(5);
  const [outline, setOutline] = useState<ChapterOutline[]>([]);

  const { send, workflow } = useStoryWorkflow();

  const handleGenerate = (prompt: string, chapters: number) => {
    setStoryPrompt(prompt);
    setChapterCount(chapters);
    setAppState("outlining");
  };

  const handleOutlineComplete = (generatedOutline: ChapterOutline[]) => {
    setOutline(generatedOutline);
    setAppState("book");
  };

  const handleReset = () => {
    setAppState("input");
    setStoryPrompt("");
    setOutline([]);
  };

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Decorative background pattern */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none">
        <svg width="100%" height="100%">
          <pattern
            id="bookPattern"
            x="0"
            y="0"
            width="60"
            height="60"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M30 5 L55 15 L55 50 L30 55 L5 50 L5 15 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
            />
            <line
              x1="30"
              y1="5"
              x2="30"
              y2="55"
              stroke="currentColor"
              strokeWidth="0.5"
            />
          </pattern>
          <rect width="100%" height="100%" fill="url(#bookPattern)" />
        </svg>
      </div>

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

        {appState === "outlining" && (
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
              onComplete={handleOutlineComplete}
              onBack={handleReset}
            />
          </motion.div>
        )}

        {appState === "book" && (
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
              outline={outline}
              onClose={handleReset}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
