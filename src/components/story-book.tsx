"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight, X, BookOpen } from "lucide-react";
import {
  ChapterGenerationEventData,
  ChapterContentEventData,
} from "../types/story-workflow";

interface ChapterWithContent {
  chapterNumber: number;
  title: string;
  content: string;
}

interface StoryBookProps {
  prompt: string;
  onClose: () => void;
  outline: ChapterGenerationEventData;
  chapterContents: ChapterContentEventData[];
}

export function StoryBook({
  prompt,
  onClose,
  outline,
  chapterContents,
}: StoryBookProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState<"left" | "right">("right");
  const [isBookOpen, setIsBookOpen] = useState(false);

  // Combine outline chapters with their content
  const chapters: ChapterWithContent[] = (outline.content.chapters || []).map(
    (chapter, index) => ({
      chapterNumber: chapter.chapterNumber || index + 1,
      title: chapter.title || `Chapter ${index + 1}`,
      content: chapterContents[index]?.content || "",
    }),
  );

  const storyTitle = outline.content.storyTitle || "Your Story";
  const totalPages = chapters.length;

  useEffect(() => {
    // Animate book opening
    const timer = setTimeout(() => setIsBookOpen(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const goToPage = (newPage: number) => {
    if (newPage < 0 || newPage >= totalPages || isFlipping) return;

    setFlipDirection(newPage > currentPage ? "right" : "left");
    setIsFlipping(true);

    setTimeout(() => {
      setCurrentPage(newPage);
      setIsFlipping(false);
    }, 400);
  };

  const nextPage = () => goToPage(currentPage + 1);
  const prevPage = () => goToPage(currentPage - 1);

  // Handle empty state
  if (chapters.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={onClose}
          className="fixed top-6 right-6 z-50 p-3 bg-card/80 backdrop-blur-sm border border-border/50 rounded-full text-muted-foreground hover:text-foreground hover:bg-card transition-all duration-200 hover:scale-110"
        >
          <X className="w-5 h-5" />
        </motion.button>
        <BookOpen className="w-16 h-16 text-primary/30 mb-4" />
        <p className="text-muted-foreground">No chapters available yet...</p>
      </div>
    );
  }

  const currentChapter = chapters[currentPage];
  const previousChapter = currentPage > 0 ? chapters[currentPage - 1] : null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      {/* Close button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        onClick={onClose}
        className="fixed top-6 right-6 z-50 p-3 bg-card/80 backdrop-blur-sm border border-border/50 rounded-full text-muted-foreground hover:text-foreground hover:bg-card transition-all duration-200 hover:scale-110"
      >
        <X className="w-5 h-5" />
      </motion.button>

      {/* Book container */}
      <motion.div
        initial={{ rotateX: 90, opacity: 0 }}
        animate={{ rotateX: isBookOpen ? 0 : 90, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="perspective-[2000px]"
      >
        <div className="relative w-[90vw] max-w-4xl aspect-[3/2] book-shadow rounded-lg">
          {/* Book spine */}
          <div className="absolute left-1/2 top-0 bottom-0 w-6 -translate-x-1/2 z-20 bg-gradient-to-r from-[var(--book-spine)] via-[var(--book-cover)] to-[var(--book-spine)] rounded-sm shadow-inner" />

          {/* Left page (previous content or cover interior) */}
          <div className="absolute left-0 top-0 w-1/2 h-full bg-[var(--book-page)] rounded-l-lg overflow-hidden border-r border-[var(--book-page-edge)]">
            <div className="page-texture h-full p-6 sm:p-8 md:p-10 flex flex-col">
              {previousChapter ? (
                <>
                  <div className="text-xs tracking-[0.3em] uppercase text-muted-foreground/60 mb-2">
                    Chapter {previousChapter.chapterNumber}
                  </div>
                  <div className="font-serif text-lg sm:text-xl text-primary/80 mb-4">
                    {previousChapter.title}
                  </div>
                  <div className="flex-1 text-sm sm:text-base leading-relaxed text-foreground/80 overflow-hidden">
                    {previousChapter.content.split("\n\n").slice(-1)[0]}
                  </div>
                  <div className="text-center text-xs text-muted-foreground/40 mt-4">
                    {currentPage}
                  </div>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <BookOpen className="w-12 h-12 text-primary/30 mb-4" />
                  <div className="font-serif text-2xl text-primary/60 mb-2">
                    {storyTitle}
                  </div>
                  <div className="text-sm text-muted-foreground/60 max-w-[200px] italic">
                    "{prompt}"
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right page (current content) */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{
                rotateY: flipDirection === "right" ? -90 : 90,
                opacity: 0.5,
              }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{
                rotateY: flipDirection === "right" ? 90 : -90,
                opacity: 0.5,
              }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              style={{ transformOrigin: "left center" }}
              className="absolute right-0 top-0 w-1/2 h-full bg-[var(--book-page)] rounded-r-lg overflow-hidden"
            >
              <div className="page-texture h-full p-6 sm:p-8 md:p-10 flex flex-col">
                <div className="text-xs tracking-[0.3em] uppercase text-muted-foreground/60 mb-2">
                  Chapter {currentChapter.chapterNumber}
                </div>
                <div className="font-serif text-lg sm:text-xl md:text-2xl text-primary mb-4">
                  {currentChapter.title}
                </div>
                <div className="flex-1 text-sm sm:text-base leading-relaxed text-foreground/90 whitespace-pre-line overflow-y-auto">
                  {currentChapter.content || (
                    <span className="text-muted-foreground italic">
                      Content is being generated...
                    </span>
                  )}
                </div>
                <div className="text-center text-xs text-muted-foreground/40 mt-4">
                  {currentPage + 1}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Page stack effect (right side) */}
          <div className="absolute right-0 top-1 bottom-1 w-2 bg-gradient-to-r from-transparent to-[var(--book-page-edge)] rounded-r-lg pointer-events-none" />

          {/* Page stack effect (left side) */}
          <div className="absolute left-0 top-1 bottom-1 w-2 bg-gradient-to-l from-transparent to-[var(--book-page-edge)] rounded-l-lg pointer-events-none" />
        </div>
      </motion.div>

      {/* Navigation controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="flex items-center gap-4 mt-8"
      >
        <button
          onClick={prevPage}
          disabled={currentPage === 0 || isFlipping}
          className="p-3 bg-card border border-border/50 rounded-full text-muted-foreground hover:text-foreground hover:border-primary/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 hover:scale-110"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Page indicators */}
        <div className="flex items-center gap-2">
          {chapters.map((_, i) => (
            <button
              key={i}
              onClick={() => goToPage(i)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i === currentPage
                  ? "bg-primary w-6"
                  : "bg-border hover:bg-primary/50"
              }`}
            />
          ))}
        </div>

        <button
          onClick={nextPage}
          disabled={currentPage === totalPages - 1 || isFlipping}
          className="p-3 bg-card border border-border/50 rounded-full text-muted-foreground hover:text-foreground hover:border-primary/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 hover:scale-110"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </motion.div>

      {/* Page counter */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-4 text-sm text-muted-foreground"
      >
        Chapter {currentPage + 1} of {totalPages}
      </motion.div>
    </div>
  );
}
