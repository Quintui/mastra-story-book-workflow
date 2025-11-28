"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Sparkles, Feather, BookOpen, Minus, Plus } from "lucide-react";

interface StoryInputProps {
  onGenerate: (prompt: string, chapterCount: number) => void;
}

export function StoryInput({ onGenerate }: StoryInputProps) {
  const [prompt, setPrompt] = useState("");
  const [chapterCount, setChapterCount] = useState(5);

  const handleSubmit = () => {
    if (prompt.trim()) {
      onGenerate(prompt, chapterCount);
    }
  };

  const adjustChapters = (delta: number) => {
    setChapterCount((prev) => Math.min(12, Math.max(3, prev + delta)));
  };

  const suggestions = [
    { icon: Sparkles, text: "A detective who solves crimes using dreams" },
    { icon: Feather, text: "Letters exchanged between two strangers" },
    { icon: BookOpen, text: "A library where books come alive at midnight" },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      {/* Decorative top flourish */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <svg
          width="120"
          height="40"
          viewBox="0 0 120 40"
          className="text-primary/30"
        >
          <path
            d="M10 20 Q30 5, 60 20 Q90 35, 110 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <circle cx="60" cy="20" r="4" fill="currentColor" />
          <path
            d="M55 20 L50 15 M55 20 L50 25 M65 20 L70 15 M65 20 L70 25"
            stroke="currentColor"
            strokeWidth="1"
          />
        </svg>
      </motion.div>

      {/* Main heading */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-center mb-4 tracking-tight text-balance"
      >
        What story shall we weave?
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-muted-foreground text-lg mb-10 text-center max-w-md"
      >
        Describe your tale, and watch it unfold across the pages
      </motion.p>

      {/* Input area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="w-full max-w-2xl"
      >
        <div className="relative bg-card rounded-2xl border-2 border-border/50 shadow-lg overflow-hidden transition-all duration-300 focus-within:border-primary/30 focus-within:shadow-xl">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="A story about..."
            className="w-full min-h-[140px] p-6 pb-20 bg-transparent resize-none text-lg placeholder:text-muted-foreground/50 focus:outline-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.metaKey) {
                handleSubmit();
              }
            }}
          />

          {/* Bottom bar */}
          <div className="absolute bottom-0 left-0 right-0 px-4 py-3 flex items-center justify-between bg-gradient-to-t from-card via-card to-transparent">
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground hidden sm:inline">
                Chapters:
              </span>
              <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
                <button
                  onClick={() => adjustChapters(-1)}
                  disabled={chapterCount <= 3}
                  className="p-1.5 rounded-md hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-8 text-center font-medium text-sm tabular-nums">
                  {chapterCount}
                </span>
                <button
                  onClick={() => adjustChapters(1)}
                  disabled={chapterCount >= 12}
                  className="p-1.5 rounded-md hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!prompt.trim()}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium transition-all duration-300 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
            >
              <Feather className="w-4 h-4" />
              <span>Begin Story</span>
            </button>
          </div>
        </div>

        {/* Suggestion pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex flex-wrap gap-3 justify-center mt-6"
        >
          {suggestions.map((suggestion, i) => (
            <button
              key={i}
              onClick={() => setPrompt(suggestion.text)}
              className="flex items-center gap-2 px-4 py-2 bg-card border border-border/50 rounded-full text-sm text-muted-foreground hover:border-primary/30 hover:text-foreground transition-all duration-200 hover:scale-105"
            >
              <suggestion.icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{suggestion.text}</span>
              <span className="sm:hidden">
                {suggestion.text.split(" ").slice(0, 3).join(" ")}...
              </span>
            </button>
          ))}
        </motion.div>
      </motion.div>

      {/* Bottom flourish */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-muted-foreground/30 text-sm tracking-widest uppercase"
      >
        Storyweaver
      </motion.div>
    </div>
  );
}
