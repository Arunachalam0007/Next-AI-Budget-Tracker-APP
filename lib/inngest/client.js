import { Inngest } from "inngest";

// Create a client to send and receive events
export const inngest = new Inngest({
  id: "ai-budget-tracker-app",
  name: "ai-budget-tracker-app",

  //Retry function for retrying once it get failed
  retryFunction: async (attempt) => ({
    delay: Math.pow(2, attempt) * 1000,
    maxAttempts: 2,
  }),
});
