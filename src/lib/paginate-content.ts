import { BookPage } from "../components/story-book";
import { ChapterContentEventData } from "../types/story-workflow";

const CHARS_PER_PAGE = 1000;

export function paginateContent(
  chapters: ChapterContentEventData[],
  storyTitle: string,
): BookPage[] {
  const pages: BookPage[] = [];
  let pageNumber = 1;

  // Cover page
  pages.push({
    type: "cover",
    content: storyTitle,
    pageNumber: 0,
  });

  // Sort chapters by chapterNumber to ensure correct order
  const sortedChapters = [...chapters].sort((a, b) => {
    const aNum = a.chapterNumber ?? 0;
    const bNum = b.chapterNumber ?? 0;
    return aNum - bNum;
  });

  for (const chapter of sortedChapters) {
    // Chapter title page
    pages.push({
      type: "chapter-start",
      chapterNumber: chapter.chapterNumber,
      chapterTitle: chapter.title,
      pageNumber: pageNumber++,
    });

    // Split content into paragraphs
    const paragraphs = (chapter.content || "").split(/\n\n+/).filter(Boolean);
    let currentPageContent = "";

    for (const paragraph of paragraphs) {
      // Check if adding this paragraph would exceed page limit
      if (currentPageContent.length + paragraph.length + 2 > CHARS_PER_PAGE) {
        // Save current page if it has content
        if (currentPageContent.trim()) {
          pages.push({
            type: "content",
            chapterNumber: chapter.chapterNumber,
            chapterTitle: chapter.title,
            content: currentPageContent.trim(),
            pageNumber: pageNumber++,
          });
        }
        currentPageContent = paragraph;
      } else {
        currentPageContent += (currentPageContent ? "\n\n" : "") + paragraph;
      }
    }

    // Don't forget the last page of content for this chapter
    if (currentPageContent.trim()) {
      pages.push({
        type: "content",
        chapterNumber: chapter.chapterNumber,
        chapterTitle: chapter.title,
        content: currentPageContent.trim(),
        pageNumber: pageNumber++,
      });
    }
  }

  // End page
  pages.push({
    type: "end",
    content: "The End",
    pageNumber: pageNumber,
  });

  return pages;
}
