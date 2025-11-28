import { createWorkflow, createStep } from "@mastra/core/workflows";
import { z } from "zod";

// Schema for chapter planning info (without storyTitle)
const chapterInfoSchema = z.object({
  chapterNumber: z.number(),
  title: z.string(),
  premise: z.string(),
  characters: z.array(z.string()),
  setting: z.string(),
  emotionalTone: z.string(),
  keyEvents: z.array(z.string()),
  storyConnection: z.string(),
});

// Schema for the workflow state - shared across steps
const workflowStateSchema = z.object({
  storyTitle: z.string(),
});

// Step 1: Generate chapter plans with titles, premises, and context
const generateChaptersStep = createStep({
  id: "generate-chapters",
  description:
    "Generates a story plan with title and chapter details based on a story concept",
  inputSchema: z.object({
    storyIdea: z.string(),
    numberOfChapters: z.number().default(3),
  }),
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
          schema: z.object({
            storyTitle: z.string(),
            chapters: z.array(chapterInfoSchema),
          }),
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
        },
      });
    }

    const finalObject = await response.object;

    writer.write({
      id: "chapter-generation",
      type: "data-chapter-generation",
      data: {
        status: "completed",
        content: finalObject,
      },
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
  outputSchema: z.object({
    chapterNumber: z.number(),
    title: z.string(),
    premise: z.string(),
    content: z.string(),
  }),
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
        },
      });
    }

    writer.write({
      id,
      type: "data-chapter-content-generation",
      data: {
        status: "completed",
        content,
      },
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
  inputSchema: z.array(
    z.object({
      chapterNumber: z.number(),
      title: z.string(),
      premise: z.string(),
      content: z.string(),
    }),
  ),
  outputSchema: z.object({
    storyTitle: z.string(),
    chapters: z.array(
      z.object({
        chapterNumber: z.number(),
        title: z.string(),
        premise: z.string(),
        content: z.string(),
      }),
    ),
    totalChapters: z.number(),
  }),
  stateSchema: workflowStateSchema,
  execute: async ({ inputData, state }) => {
    // Sort chapters by chapter number to ensure correct order
    const sortedChapters = [...inputData].sort(
      (a, b) => a.chapterNumber - b.chapterNumber,
    );

    // Get storyTitle from workflow state
    const { storyTitle } = state;

    return {
      storyTitle,
      chapters: sortedChapters,
      totalChapters: sortedChapters.length,
    };
  },
});

// Main story generation workflow
export const storyWorkflow = createWorkflow({
  id: "story-generation-workflow",
  description:
    "Generates a complete story with multiple chapters. First plans all chapters with titles, premises, and context, then generates content for each chapter in parallel, and finally gathers them into a complete story.",
  inputSchema: z.object({
    storyIdea: z.string().describe("The story idea or concept"),
    numberOfChapters: z
      .number()
      .default(3)
      .describe("Number of chapters to generate"),
  }),
  outputSchema: z.object({
    storyTitle: z.string(),
    chapters: z.array(
      z.object({
        chapterNumber: z.number(),
        title: z.string(),
        premise: z.string(),
        content: z.string(),
      }),
    ),
    totalChapters: z.number(),
  }),
  stateSchema: workflowStateSchema,
})
  .then(generateChaptersStep)
  .foreach(generateChapterContentStep, { concurrency: 3 })
  .then(gatherStoryStep)
  .commit();
