"use client";

import { useState } from "react";
import { StoryInput } from "@/src/components/story-input";
import { StoryBook } from "@/src/components/story-book";
import { AnimatePresence, motion } from "motion/react";

export default function Home() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showBook, setShowBook] = useState(false);
  const [storyPrompt, setStoryPrompt] = useState("");

  const handleGenerate = (prompt: string) => {
    setStoryPrompt(prompt);
    setIsGenerating(true);

    // Simulate generation delay
    setTimeout(() => {
      setIsGenerating(false);
      setShowBook(true);
    }, 2000);
  };

  const handleReset = () => {
    setShowBook(false);
    setStoryPrompt("");
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
        {!showBook ? (
          <motion.div
            key="input"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.5 }}
            className="relative z-10"
          >
            <StoryInput
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
            />
          </motion.div>
        ) : (
          <motion.div
            key="book"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10"
          >
            <StoryBook prompt={storyPrompt} onClose={handleReset} />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
