import { mastra } from "@/src/mastra";

export const POST = async (request: Request) => {
  const {
    userPrompt,
    numberOfChapters,
  }: { userPrompt: string; numberOfChapters: number } = await request.json();

  const workflow = mastra.getWorkflow("storyWorkflow");

  const run = await workflow.createRunAsync();

  const stream = run.stream({
    inputData: {
      storyIdea: userPrompt,
      numberOfChapters: numberOfChapters || 3,
    },
  });
};
