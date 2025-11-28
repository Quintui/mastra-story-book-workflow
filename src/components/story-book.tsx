"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import { ChevronLeft, ChevronRight, X, BookOpen } from "lucide-react"

interface StoryBookProps {
  prompt: string
  onClose: () => void
}

// Mock story content
const generateMockStory = (prompt: string) => {
  return [
    {
      chapter: "Chapter One",
      title: "The Beginning",
      content: `In a world where ${prompt.toLowerCase()}, there lived a protagonist whose life was about to change forever. The morning sun cast long shadows across the cobblestone streets, painting everything in hues of gold and amber.\n\nNo one could have predicted what was to come. The wind carried whispers of ancient secrets, and somewhere in the distance, a clock tower struck the hour with a resonance that seemed to reach into the very soul of the city.`,
    },
    {
      chapter: "Chapter Two",
      title: "The Discovery",
      content: `Days passed like pages turning in a well-worn book. Our hero discovered something extraordinary—a truth that had been hidden for generations, waiting for the right moment to reveal itself.\n\nThe discovery came not with fanfare or dramatic revelation, but in the quiet hours of twilight, when the boundary between the possible and impossible grows thin as gossamer.`,
    },
    {
      chapter: "Chapter Three",
      title: "The Journey",
      content: `Armed with newfound knowledge, the journey began. Through enchanted forests where the trees whispered secrets of old, across mountains that touched the very heavens, our protagonist pressed forward.\n\nEach step brought new challenges, new wonders, and slowly but surely, a transformation that would echo through the ages. The path was neither straight nor simple, but it was undeniably their own.`,
    },
    {
      chapter: "Chapter Four",
      title: "The Transformation",
      content: `Change came not like a thunderclap, but like the gradual turning of seasons. What once seemed impossible became merely difficult, and what was difficult became second nature.\n\nIn the crucible of experience, a new self emerged—stronger, wiser, and forever marked by the journey. The world itself seemed different now, viewed through eyes that had seen both darkness and light.`,
    },
    {
      chapter: "Chapter Five",
      title: "The Resolution",
      content: `And so our tale reaches its conclusion, though not its end. For every ending is but a doorway to new beginnings, and every story told plants seeds for stories yet to come.\n\nIn the gentle quiet of resolution, there is peace—not because all questions are answered, but because the asking itself has become the answer. The story continues, even after the final page is turned.\n\n— The End —`,
    },
  ]
}

export function StoryBook({ prompt, onClose }: StoryBookProps) {
  const [currentPage, setCurrentPage] = useState(0)
  const [isFlipping, setIsFlipping] = useState(false)
  const [flipDirection, setFlipDirection] = useState<"left" | "right">("right")
  const [isBookOpen, setIsBookOpen] = useState(false)

  const story = generateMockStory(prompt)
  const totalPages = story.length

  useEffect(() => {
    // Animate book opening
    const timer = setTimeout(() => setIsBookOpen(true), 300)
    return () => clearTimeout(timer)
  }, [])

  const goToPage = (newPage: number) => {
    if (newPage < 0 || newPage >= totalPages || isFlipping) return

    setFlipDirection(newPage > currentPage ? "right" : "left")
    setIsFlipping(true)

    setTimeout(() => {
      setCurrentPage(newPage)
      setIsFlipping(false)
    }, 400)
  }

  const nextPage = () => goToPage(currentPage + 1)
  const prevPage = () => goToPage(currentPage - 1)

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
              {currentPage > 0 ? (
                <>
                  <div className="text-xs tracking-[0.3em] uppercase text-muted-foreground/60 mb-2">
                    {story[currentPage - 1]?.chapter}
                  </div>
                  <div className="font-serif text-lg sm:text-xl text-primary/80 mb-4">
                    {story[currentPage - 1]?.title}
                  </div>
                  <div className="flex-1 text-sm sm:text-base leading-relaxed text-foreground/80 overflow-hidden">
                    {story[currentPage - 1]?.content.split("\n\n").slice(-1)[0]}
                  </div>
                  <div className="text-center text-xs text-muted-foreground/40 mt-4">{currentPage}</div>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <BookOpen className="w-12 h-12 text-primary/30 mb-4" />
                  <div className="font-serif text-2xl text-primary/60 mb-2">Your Story</div>
                  <div className="text-sm text-muted-foreground/60 max-w-[200px] italic">"{prompt}"</div>
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
                  {story[currentPage].chapter}
                </div>
                <div className="font-serif text-lg sm:text-xl md:text-2xl text-primary mb-4">
                  {story[currentPage].title}
                </div>
                <div className="flex-1 text-sm sm:text-base leading-relaxed text-foreground/90 whitespace-pre-line overflow-y-auto">
                  {story[currentPage].content}
                </div>
                <div className="text-center text-xs text-muted-foreground/40 mt-4">{currentPage + 1}</div>
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
          {story.map((_, i) => (
            <button
              key={i}
              onClick={() => goToPage(i)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i === currentPage ? "bg-primary w-6" : "bg-border hover:bg-primary/50"
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
  )
}
