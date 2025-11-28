import { mastra } from "@/src/mastra";
import { createUIMessageStreamResponse } from "ai";
import { toAISdkFormat } from "@mastra/ai-sdk";

export const POST = async (request: Request) => {
  const {
    userPrompt,
    numberOfChapters,
  }: { userPrompt: string; numberOfChapters: number } = await request.json();

  const workflow = mastra.getWorkflow("storyWorkflow");

  const run = await workflow.createRunAsync();

  const stream = run.streamVNext({
    inputData: {
      storyIdea: userPrompt,
      numberOfChapters: numberOfChapters || 3,
    },
  });

  return createUIMessageStreamResponse({
    stream: toAISdkFormat(stream, {
      from: "workflow",
    }),
  });
};
