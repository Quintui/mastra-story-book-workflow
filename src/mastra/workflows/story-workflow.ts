import { createWorkflow, createStep } from "@mastra/core/workflows";
import { z } from "zod";
import {
  chapterInfoSchema,
  storyPlanSchema,
  chapterContentSchema,
  storyResultSchema,
  workflowInputSchema,
  workflowStateSchema,
  ChapterGenerationEventData,
} from "@/src/types/story-workflow";

// Step 1: Generate chapter plans with titles, premises, and context
const generateChaptersStep = createStep({
  id: "generate-chapters",
  description:
    "Generates a story plan with title and chapter details based on a story concept",
  inputSchema: workflowInputSchema,
  outputSchema: z.array(chapterInfoSchema),
  stateSchema: workflowStateSchema,
  execute: async ({ inputData, mastra, setState, state, writer }) => {
    const { storyIdea, numberOfChapters } = inputData;

    const chapterAgent = mastra.getAgent("chapterGeneratorAgent");
    const response = await chapterAgent.stream(
      `Create a ${numberOfChapters}-chapter story plan for the following:

      <story_idea>${storyIdea}</story_idea>

      <rules>
      First, create a compelling story title.

      For each chapter provide:
      1. Chapter number (starting from 1)
      2. Chapter title
      3. Premise (2-3 sentences describing what happens)
      4. Main characters involved
      5. Setting/location
      6. Emotional tone
      7. Key events (3-5 bullet points)
      8. How it connects to the overall story arc
      9. Ensure the chapters flow naturally and build a complete narrative arc.
      </rules>
`,
      {
        structuredOutput: {
          schema: storyPlanSchema,
        },
      },
    );

    for await (const chunk of response.objectStream) {
      writer.write({
        id: "chapter-generation",
        type: "data-chapter-generation",
        data: {
          status: "streaming",
          content: chunk,
        } as ChapterGenerationEventData,
      });
    }

    const finalObject = await response.object;

    writer.write({
      id: `chapter-generation`,
      type: "data-chapter-generation",
      data: {
        status: "completed",
        content: finalObject,
      } as ChapterGenerationEventData,
    });

    const storyTitle = finalObject.storyTitle || "Untitled Story";

    // Store storyTitle in workflow state
    setState({
      ...state,
      storyTitle,
    });

    return finalObject?.chapters || [];
  },
});

// Step 2: Generate chapter content from chapter info
const generateChapterContentStep = createStep({
  id: "generate-chapter-content",
  description:
    "Generates the full chapter content based on the chapter info (title, premise, context)",
  inputSchema: chapterInfoSchema,
  outputSchema: chapterContentSchema,
  stateSchema: workflowStateSchema,
  execute: async ({ inputData, mastra, state, writer }) => {
    const {
      chapterNumber,
      title,
      premise,
      characters,
      setting,
      emotionalTone,
      keyEvents,
      storyConnection,
    } = inputData;

    // Get storyTitle from workflow state
    const { storyTitle } = state;

    const contentAgent = mastra.getAgent("chapterContentAgent");
    const response = await contentAgent.stream(
      `Write Chapter ${chapterNumber} of "${storyTitle}" with the following details:

<chapter_title>${title}</chapter_title>

<premise>${premise}</premise>

<context>
- Characters involved: ${characters.join(", ")}
- Setting/Location: ${setting}
- Emotional tone: ${emotionalTone}
- Key events to include: ${keyEvents.join("; ")}
- Connection to overall story: ${storyConnection}
</context>

<rules>
1. Please write an engaging chapter (800-1500 words) that brings this premise to life.
2. Always output in makrdown format.
3. Avoid saying "Chapter ${chapterNumber}" in the content.
</rules>
`,
    );

    let content = "";

    const id = `chapter-${chapterNumber}-content`;

    for await (const chunk of response.textStream) {
      content += chunk;
      writer.write({
        id,
        type: "data-chapter-content-generation",
        data: {
          status: "streaming",
          content,
          chapterNumber,
          title,
        } as ChapterGenerationEventData,
      });
    }

    writer.write({
      id,
      type: "data-chapter-content-generation",
      data: {
        status: "completed",
        content,
        chapterNumber,
        title,
      } as ChapterGenerationEventData,
    });

    return {
      chapterNumber,
      title,
      premise,
      content,
    };
  },
});

// Step 3: Gather all chapter content into the final story
const gatherStoryStep = createStep({
  id: "gather-story",
  description: "Gathers all generated chapters into a complete story",
  inputSchema: z.array(chapterContentSchema),
  outputSchema: storyResultSchema,
  stateSchema: workflowStateSchema,
  execute: async ({ inputData, state }) => {
    const sortedChapters = [...inputData].sort(
      (a, b) => a.chapterNumber - b.chapterNumber,
    );

    const { storyTitle } = state;

    return {
      storyTitle,
      chapters: sortedChapters,
      totalChapters: sortedChapters.length,
    };
  },
});

export const storyWorkflow = createWorkflow({
  id: "story-generation-workflow",
  description:
    "Generates a complete story with multiple chapters. First plans all chapters with titles, premises, and context, then generates content for each chapter in parallel, and finally gathers them into a complete story.",
  inputSchema: workflowInputSchema,
  outputSchema: storyResultSchema,
  stateSchema: workflowStateSchema,
})
  .then(generateChaptersStep)
  .foreach(generateChapterContentStep, { concurrency: 10 })
  .then(gatherStoryStep)
  .commit();
