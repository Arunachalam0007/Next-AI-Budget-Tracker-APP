import { inngest } from "@/lib/inngest/client";
import {
  generateMonthlyReports,
  processRecurringTransaction,
  triggerAlertBudgetCheck,
  triggerRecurringTransactions,
} from "@/lib/inngest/functions";
import { serve } from "inngest/next";

// Create an API that serves zero functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    /* your functions will be passed here later! */
    triggerAlertBudgetCheck,
    triggerRecurringTransactions,
    processRecurringTransaction,
    generateMonthlyReports,
  ],
});
