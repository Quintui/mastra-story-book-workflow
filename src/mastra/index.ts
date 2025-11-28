import { Mastra } from "@mastra/core/mastra";
import { LibSQLStore } from "@mastra/libsql";
import { workflowRoute } from "@mastra/ai-sdk";

import { chapterGeneratorAgent } from "./agents/chapter-generator-agent";
import { chapterContentAgent } from "./agents/chapter-content-agent";
import { storyWorkflow } from "./workflows/story-workflow";

export const mastra = new Mastra({
  agents: {
    chapterGeneratorAgent,
    chapterContentAgent,
  },
  workflows: { storyWorkflow },
  storage: new LibSQLStore({
    url: ":memory:",
  }),
});
