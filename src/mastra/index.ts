import { Mastra } from "@mastra/core/mastra";
import { PinoLogger } from "@mastra/loggers";
import { LibSQLStore } from "@mastra/libsql";

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
    // stores observability, scores, ... into memory storage, if it needs to persist, change to file:../mastra.db
    url: ":memory:",
  }),
  observability: {
    // Enables DefaultExporter and CloudExporter for AI tracing
    default: { enabled: true },
  },
});
