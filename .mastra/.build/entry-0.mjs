import { Mastra } from '@mastra/core/mastra';
import { LibSQLStore } from '@mastra/libsql';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { Agent } from '@mastra/core/agent';
import { createWorkflow, createStep } from '@mastra/core/workflows';
import { z } from 'zod';

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY
});

const chapterGeneratorAgent = new Agent({
  name: "chapter-generator-agent",
  model: openrouter("google/gemini-2.5-flash-lite"),
  instructions: `You are a creative story architect specializing in chapter planning.
When given a story theme or concept, you generate detailed chapter plans.

For each chapter, you provide:
- A compelling chapter title
- A premise (2-3 sentences describing what happens in this chapter)
- Key context including:
  - Main characters involved
  - Setting/location
  - Emotional tone
  - Key plot points or events
  - How it connects to the overall story arc

Your chapters should flow naturally from one to the next, building tension and developing characters progressively.
Ensure each chapter has a distinct purpose in the overall narrative.
Be creative and imaginative while maintaining internal consistency.`
});

const chapterContentAgent = new Agent({
  name: "chapter-content-agent",
  model: openrouter("google/gemini-2.5-flash-lite"),
  instructions: `You are a talented creative writer specializing in chapter writing for novels and stories.

Given a chapter title, premise, and context, you write engaging, well-crafted chapter content.

Your writing should:
- Follow the provided premise and context closely
- Use vivid descriptions and sensory details
- Create believable, natural dialogue when appropriate
- Maintain consistent tone matching the emotional context provided
- Develop characters through their actions, thoughts, and dialogue
- Build tension and pacing appropriate to the chapter's role in the story
- End the chapter in a way that makes readers want to continue

Write in a compelling narrative style that immerses readers in the story.
Each chapter should be approximately 800-1500 words.
Ensure continuity with the overall story arc and character development.`
});

const chapterInfoSchema = z.object({
  chapterNumber: z.number(),
  title: z.string(),
  premise: z.string(),
  characters: z.array(z.string()),
  setting: z.string(),
  emotionalTone: z.string(),
  keyEvents: z.array(z.string()),
  storyConnection: z.string()
});
const generateChaptersStep = createStep({
  id: "generate-chapters",
  description: "Generates an array of chapter plans with titles, premises, and context based on a story concept",
  inputSchema: z.object({
    storyTitle: z.string(),
    storyConcept: z.string(),
    numberOfChapters: z.number().default(3)
  }),
  outputSchema: z.object({
    storyTitle: z.string(),
    chapters: z.array(chapterInfoSchema)
  }),
  execute: async ({ inputData, mastra }) => {
    const { storyTitle, storyConcept, numberOfChapters } = inputData;
    const chapterAgent = mastra.getAgent("chapterGeneratorAgent");
    const response = await chapterAgent.generate(
      `Create a ${numberOfChapters}-chapter story plan for the following:

**Story Title:** ${storyTitle}

**Story Concept:** ${storyConcept}

For each chapter, provide:
1. Chapter number
2. Chapter title
3. Premise (2-3 sentences describing what happens)
4. Main characters involved
5. Setting/location
6. Emotional tone
7. Key events (3-5 bullet points)
8. How it connects to the overall story arc

Ensure the chapters flow naturally and build a complete narrative arc.`,
      {
        structuredOutput: {
          schema: z.object({
            chapters: z.array(chapterInfoSchema)
          })
        }
      }
    );
    return {
      storyTitle,
      chapters: response.object?.chapters || []
    };
  }
});
const prepareChaptersStep = createStep({
  id: "prepare-chapters",
  description: "Extracts chapters array for parallel processing",
  inputSchema: z.object({
    storyTitle: z.string(),
    chapters: z.array(chapterInfoSchema)
  }),
  outputSchema: z.array(chapterInfoSchema),
  execute: async ({ inputData }) => {
    return inputData.chapters;
  }
});
const gatherStoryStep = createStep({
  id: "gather-story",
  description: "Gathers all generated chapters into a complete story",
  inputSchema: z.array(
    z.object({
      chapterNumber: z.number(),
      title: z.string(),
      premise: z.string(),
      content: z.string()
    })
  ),
  outputSchema: z.object({
    chapters: z.array(
      z.object({
        chapterNumber: z.number(),
        title: z.string(),
        premise: z.string(),
        content: z.string()
      })
    ),
    totalChapters: z.number()
  }),
  execute: async ({ inputData }) => {
    const sortedChapters = [...inputData].sort(
      (a, b) => a.chapterNumber - b.chapterNumber
    );
    return {
      chapters: sortedChapters,
      totalChapters: sortedChapters.length
    };
  }
});
const generateChapterContentStep = createStep({
  id: "generate-chapter-content",
  description: "Generates the full chapter content based on the chapter info (title, premise, context)",
  inputSchema: chapterInfoSchema,
  outputSchema: z.object({
    chapterNumber: z.number(),
    title: z.string(),
    premise: z.string(),
    content: z.string()
  }),
  execute: async ({ inputData, mastra }) => {
    const {
      chapterNumber,
      title,
      premise,
      characters,
      setting,
      emotionalTone,
      keyEvents,
      storyConnection
    } = inputData;
    const contentAgent = mastra.getAgent("chapterContentAgent");
    const response = await contentAgent.generate(
      `Write Chapter ${chapterNumber} of the story with the following details:

**Chapter Title:** ${title}

**Premise:** ${premise}

**Context:**
- Characters involved: ${characters.join(", ")}
- Setting/Location: ${setting}
- Emotional tone: ${emotionalTone}
- Key events to include: ${keyEvents.join("; ")}
- Connection to overall story: ${storyConnection}

Please write an engaging chapter (800-1500 words) that brings this premise to life.`
    );
    return {
      chapterNumber,
      title,
      premise,
      content: response.text
    };
  }
});
const storyWorkflow = createWorkflow({
  id: "story-generation-workflow",
  description: "Generates a complete story with multiple chapters. First plans all chapters with titles, premises, and context, then generates content for each chapter in parallel, and finally gathers them into a complete story.",
  inputSchema: z.object({
    storyTitle: z.string().describe("The title of the story"),
    storyConcept: z.string().describe("The main concept, theme, or premise of the story"),
    numberOfChapters: z.number().default(3).describe("Number of chapters to generate")
  }),
  outputSchema: z.object({
    chapters: z.array(
      z.object({
        chapterNumber: z.number(),
        title: z.string(),
        premise: z.string(),
        content: z.string()
      })
    ),
    totalChapters: z.number()
  })
}).then(generateChaptersStep).then(prepareChaptersStep).foreach(generateChapterContentStep, { concurrency: 10 }).then(gatherStoryStep).commit();

const mastra = new Mastra({
  agents: {
    chapterGeneratorAgent,
    chapterContentAgent
  },
  workflows: {
    storyWorkflow
  },
  storage: new LibSQLStore({
    // stores observability, scores, ... into memory storage, if it needs to persist, change to file:../mastra.db
    url: ":memory:"
  }),
  observability: {
    // Enables DefaultExporter and CloudExporter for AI tracing
    default: {
      enabled: true
    }
  }
});

export { mastra };
