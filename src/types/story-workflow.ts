import { z } from "zod";
import type { WorkflowDataPart } from "@mastra/ai-sdk";
import { UIMessage } from "ai";

export const chapterInfoSchema = z.object({
  chapterNumber: z.number(),
  title: z.string(),
  premise: z.string(),
  characters: z.array(z.string()),
  setting: z.string(),
  emotionalTone: z.string(),
  keyEvents: z.array(z.string()),
  storyConnection: z.string(),
});

export const storyPlanSchema = z.object({
  storyTitle: z.string(),
  chapters: z.array(chapterInfoSchema),
});

export const chapterContentSchema = z.object({
  chapterNumber: z.number(),
  title: z.string(),
  premise: z.string(),
  content: z.string(),
});

export const storyResultSchema = z.object({
  storyTitle: z.string(),
  chapters: z.array(chapterContentSchema),
  totalChapters: z.number(),
});

export const workflowInputSchema = z.object({
  storyIdea: z.string().describe("The story idea or concept"),
  numberOfChapters: z
    .number()
    .default(3)
    .describe("Number of chapters to generate"),
});

export const workflowStateSchema = z.object({
  storyTitle: z.string(),
});

export type ChapterInfo = z.infer<typeof chapterInfoSchema>;
export type StoryPlan = z.infer<typeof storyPlanSchema>;
export type ChapterContent = z.infer<typeof chapterContentSchema>;
export type StoryResult = z.infer<typeof storyResultSchema>;
export type WorkflowState = z.infer<typeof workflowStateSchema>;
export type StreamingStatus = "streaming" | "completed";

export interface ChapterGenerationEventData {
  status: StreamingStatus;
  content: Partial<StoryPlan> | StoryPlan;
}

export interface ChapterContentEventData {
  status: StreamingStatus;
  content: string;
}

export type StoryWorkflowUIMessage = UIMessage<
  unknown,
  {
    "chapter-generation": ChapterGenerationEventData;
    "chapter-content-generation": ChapterContentEventData;
    "number-of-chapters": { count: number };
    workflow: WorkflowDataPart;
  }
>;
