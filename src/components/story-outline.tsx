"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Scroll,
  PenTool,
  Users,
  MapPin,
  Heart,
  Sparkles,
  Link2,
  ChevronDown,
} from "lucide-react";
import { ChapterGenerationEventData } from "../types/story-workflow";

interface StoryOutlineProps {
  prompt: string;
  chapterCount: number;
  outline: ChapterGenerationEventData;
}

export function StoryOutline({
  prompt,
  chapterCount,
  outline,
}: StoryOutlineProps) {
  const [expandedChapter, setExpandedChapter] = useState<number | null>(null);

  const chapters = outline.content.chapters || [];
  const isComplete = outline.status === "completed";
  const storyTitle = outline.content.storyTitle;

  const toggleExpanded = (chapterNum: number) => {
    setExpandedChapter(expandedChapter === chapterNum ? null : chapterNum);
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <Scroll className="w-6 h-6 text-primary/60" />
          <h2 className="font-serif text-2xl sm:text-3xl">
            {storyTitle || "Crafting Your Story"}
          </h2>
          <Scroll className="w-6 h-6 text-primary/60 scale-x-[-1]" />
        </div>
        <p className="text-muted-foreground text-sm max-w-md italic">
          "{prompt}"
        </p>
      </motion.div>

      {/* Manuscript scroll container */}
      <div className="relative w-full max-w-3xl">
        {/* Scroll top decoration */}
        <div className="h-8 bg-gradient-to-b from-[var(--book-cover)] to-[var(--book-page)] rounded-t-xl border-x-4 border-t-4 border-[var(--book-cover)] relative">
          <div className="absolute left-4 right-4 top-1/2 h-px bg-primary/20" />
          <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-8 h-4 bg-[var(--book-cover)] rounded-full border-2 border-primary/30" />
        </div>

        {/* Main scroll body */}
        <div className="bg-[var(--book-page)] border-x-4 border-[var(--book-cover)] px-4 sm:px-8 py-8 min-h-[400px] page-texture">
          {/* Chapter list */}
          <div className="space-y-4">
            {chapters.map((chapter, index) => (
              <motion.div
                key={chapter.chapterNumber}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.5,
                  ease: [0.22, 1, 0.36, 1],
                  delay: index * 0.1,
                }}
                className="relative"
              >
                {/* Chapter card */}
                <div
                  className={`relative border-2 rounded-xl transition-all duration-300 overflow-hidden ${
                    expandedChapter === chapter.chapterNumber
                      ? "border-primary/40 bg-primary/5"
                      : "border-primary/20 bg-card/50 hover:border-primary/30"
                  }`}
                >
                  {/* Chapter header - always visible */}
                  <button
                    onClick={() => toggleExpanded(chapter.chapterNumber)}
                    className="w-full p-4 sm:p-5 flex items-start gap-4 text-left"
                  >
                    {/* Chapter number */}
                    <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center">
                      <span className="font-serif text-base sm:text-lg text-primary">
                        {chapter.chapterNumber}
                      </span>
                    </div>

                    {/* Title and premise */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-serif text-lg sm:text-xl text-foreground mb-1">
                        {chapter.title}
                      </h3>
                      {chapter.premise && (
                        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                          {chapter.premise}
                        </p>
                      )}
                    </div>

                    {/* Expand indicator */}
                    <motion.div
                      animate={{
                        rotate:
                          expandedChapter === chapter.chapterNumber ? 180 : 0,
                      }}
                      transition={{ duration: 0.2 }}
                      className="flex-shrink-0 mt-1"
                    >
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    </motion.div>
                  </button>

                  {/* Expanded content */}
                  <AnimatePresence>
                    {expandedChapter === chapter.chapterNumber && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 sm:px-5 pb-5 pt-0 grid gap-4 sm:grid-cols-2">
                          {/* Characters */}
                          {chapter.characters &&
                            chapter.characters.length > 0 && (
                              <div className="flex gap-3">
                                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                                  <Users className="w-4 h-4 text-amber-600" />
                                </div>
                                <div className="min-w-0">
                                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                                    Characters
                                  </h4>
                                  <div className="flex flex-wrap gap-1.5">
                                    {chapter.characters.map((char, i) => (
                                      <span
                                        key={i}
                                        className="text-xs px-2 py-1 bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded-full"
                                      >
                                        {char}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}

                          {/* Setting */}
                          {chapter.setting && (
                            <div className="flex gap-3">
                              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                <MapPin className="w-4 h-4 text-emerald-600" />
                              </div>
                              <div className="min-w-0">
                                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                                  Setting
                                </h4>
                                <p className="text-sm text-foreground">
                                  {chapter.setting}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Emotional Tone */}
                          {chapter.emotionalTone && (
                            <div className="flex gap-3">
                              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center">
                                <Heart className="w-4 h-4 text-rose-600" />
                              </div>
                              <div className="min-w-0">
                                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                                  Emotional Tone
                                </h4>
                                <p className="text-sm text-foreground">
                                  {chapter.emotionalTone}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Story Connection */}
                          {chapter.storyConnection && (
                            <div className="flex gap-3">
                              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                <Link2 className="w-4 h-4 text-blue-600" />
                              </div>
                              <div className="min-w-0">
                                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                                  Story Connection
                                </h4>
                                <p className="text-sm text-foreground">
                                  {chapter.storyConnection}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Key Events - full width */}
                          {chapter.keyEvents &&
                            chapter.keyEvents.length > 0 && (
                              <div className="sm:col-span-2 flex gap-3">
                                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                                  <Sparkles className="w-4 h-4 text-violet-600" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                                    Key Events
                                  </h4>
                                  <div className="space-y-1.5">
                                    {chapter.keyEvents.map((event, i) => (
                                      <div
                                        key={i}
                                        className="flex items-center gap-2 text-sm text-foreground"
                                      >
                                        <span className="w-1.5 h-1.5 rounded-full bg-violet-500/60 flex-shrink-0" />
                                        {event}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Loading indicator while generating */}
          {!isComplete && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center gap-2 mt-8 text-muted-foreground"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                }}
              >
                <PenTool className="w-4 h-4" />
              </motion.div>
              <span className="text-sm italic">The quill is writing...</span>
            </motion.div>
          )}
        </div>

        {/* Scroll bottom decoration */}
        <div className="h-8 bg-gradient-to-t from-[var(--book-cover)] to-[var(--book-page)] rounded-b-xl border-x-4 border-b-4 border-[var(--book-cover)] relative">
          <div className="absolute left-4 right-4 top-1/2 h-px bg-primary/20" />
        </div>
      </div>

      {/* Progress indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-4 text-sm text-muted-foreground"
      >
        {isComplete ? (
          <span className="text-primary">
            Outline complete — click chapters to explore details
          </span>
        ) : (
          <span>
            Outlining chapter {chapters.length} of {chapterCount}...
          </span>
        )}
      </motion.div>
    </div>
  );
}
