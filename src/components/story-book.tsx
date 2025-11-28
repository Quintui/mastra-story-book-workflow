"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight, X, BookOpen } from "lucide-react";
import { ChapterContentEventData } from "../types/story-workflow";
import { paginateContent } from "../lib/paginate-content";

export interface BookPage {
  type: "cover" | "chapter-start" | "content" | "end";
  chapterNumber?: number;
  chapterTitle?: string;
  content?: string;
  pageNumber: number;
}

interface StoryBookProps {
  prompt: string;
  onClose: () => void;
  storyTitle: string;
  chapters: ChapterContentEventData[];
}

export function StoryBook({
  prompt,
  onClose,
  chapters = [],
  storyTitle,
}: StoryBookProps) {
  // Current spread index (0 = cover spread, 1 = first content spread, etc.)
  const [currentSpread, setCurrentSpread] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState<"left" | "right">("right");
  const [isBookOpen, setIsBookOpen] = useState(false);

  const pages = useMemo(
    () => paginateContent(chapters, storyTitle),
    [chapters, prompt],
  );

  console.log(pages);

  const totalSpreads = Math.ceil(pages.length / 2);

  const getLeftPage = useCallback(
    (spreadIndex: number): BookPage | null => {
      if (spreadIndex === 0) {
        return pages[0]; // Cover
      }
      const pageIndex = spreadIndex * 2 - 1;
      return pages[pageIndex] || null;
    },
    [pages],
  );

  const getRightPage = useCallback(
    (spreadIndex: number): BookPage | null => {
      if (spreadIndex === 0) {
        return pages[1] || null;
      }
      const pageIndex = spreadIndex * 2;
      return pages[pageIndex] || null;
    },
    [pages],
  );

  useEffect(() => {
    const timer = setTimeout(() => setIsBookOpen(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const goToSpread = (newSpread: number) => {
    if (newSpread < 0 || newSpread >= totalSpreads || isFlipping) return;

    setFlipDirection(newSpread > currentSpread ? "right" : "left");
    setIsFlipping(true);

    setTimeout(() => {
      setCurrentSpread(newSpread);
      setIsFlipping(false);
    }, 400);
  };

  const nextSpread = () => goToSpread(currentSpread + 1);
  const prevSpread = () => goToSpread(currentSpread - 1);

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

  const leftPage = getLeftPage(currentSpread);
  const rightPage = getRightPage(currentSpread);

  const renderPageContent = (page: BookPage | null, side: "left" | "right") => {
    if (!page) {
      return <div className="h-full" />;
    }

    switch (page.type) {
      case "cover":
        return (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <BookOpen className="w-12 h-12 text-primary/30 mb-4" />
            <div className="font-serif text-2xl text-primary/60 mb-2">
              {storyTitle}
            </div>
            <div className="text-sm text-muted-foreground/60 max-w-[200px] italic">
              "{prompt}"
            </div>
          </div>
        );

      case "chapter-start":
        return (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="text-xs tracking-[0.3em] uppercase text-muted-foreground/60 mb-4">
              Chapter {page.chapterNumber}
            </div>
            <div className="font-serif text-2xl sm:text-3xl text-primary mb-4">
              {page.chapterTitle}
            </div>
            <div className="w-16 h-px bg-primary/30" />
          </div>
        );

      case "content":
        return (
          <div className="h-full flex flex-col">
            <div className="text-xs tracking-[0.2em] uppercase text-muted-foreground/40 mb-4">
              {page.chapterTitle}
            </div>
            <div className="flex-1 text-sm sm:text-base leading-relaxed text-foreground/90 whitespace-pre-line">
              {page.content || (
                <span className="text-muted-foreground italic">
                  Content is being generated...
                </span>
              )}
            </div>
            <div className="text-center text-xs text-muted-foreground/40 mt-4">
              {page.pageNumber}
            </div>
          </div>
        );

      case "end":
        return (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="font-serif text-3xl text-primary/60 mb-4">
              The End
            </div>
            <div className="w-16 h-px bg-primary/30 mb-4" />
            <div className="text-sm text-muted-foreground/60 italic">
              Thank you for reading
            </div>
          </div>
        );

      default:
        return null;
    }
  };

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

          {/* Left page */}
          <div className="absolute left-0 top-0 w-1/2 h-full bg-[var(--book-page)] rounded-l-lg overflow-hidden border-r border-[var(--book-page-edge)]">
            <div className="page-texture h-full p-6 sm:p-8 md:p-10">
              {renderPageContent(leftPage, "left")}
            </div>
          </div>

          {/* Right page */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSpread}
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
              <div className="page-texture h-full p-6 sm:p-8 md:p-10">
                {renderPageContent(rightPage, "right")}
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
          onClick={prevSpread}
          disabled={currentSpread === 0 || isFlipping}
          className="p-3 bg-card border border-border/50 rounded-full text-muted-foreground hover:text-foreground hover:border-primary/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 hover:scale-110"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Progress bar pagination */}
        <div className="flex items-center gap-3 min-w-[120px]">
          <span className="text-xs text-muted-foreground tabular-nums">
            {currentSpread + 1}
          </span>
          <div
            className="relative h-1.5 flex-1 bg-border rounded-full overflow-hidden cursor-pointer min-w-[80px] max-w-[150px]"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const percentage = x / rect.width;
              const newSpread = Math.round(percentage * (totalSpreads - 1));
              goToSpread(newSpread);
            }}
          >
            <motion.div
              className="absolute top-0 left-0 h-full bg-primary rounded-full"
              initial={false}
              animate={{
                width: `${((currentSpread + 1) / totalSpreads) * 100}%`,
              }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          </div>
          <span className="text-xs text-muted-foreground tabular-nums">
            {totalSpreads}
          </span>
        </div>

        <button
          onClick={nextSpread}
          disabled={currentSpread === totalSpreads - 1 || isFlipping}
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
        {currentSpread === 0
          ? "Cover"
          : `Pages ${currentSpread * 2 - 1}-${currentSpread * 2} of ${pages.length - 1}`}
      </motion.div>
    </div>
  );
}
