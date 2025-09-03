import { z } from "zod";
export const accountSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["CURRENT", "SAVINGS"]),
  // balance: z.number().min(1, "Initial Balance is required"),
  balance: z.string().min(1, "Initial Balance is required"),
  isDefault: z.boolean().default(false),
});

export const transactionSchema = z
  .object({
    type: z.enum(["INCOME", "EXPENSE"]),
    amount: z.string().min(1, "Initial balance is required"),
    date: z.date({ required_error: "Date is required" }),
    category: z.string().min(1, "Category is required"),
    accountId: z.string().min(1, "Account is requierd"),
    description: z.string().optional(),
    isRecurring: z.boolean().default(false),
    recurringInterval: z
      .enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"])
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.isRecurring && !data.recurringInterval) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Recurring Interval is required for Recurring Transactions",
        path: ["recurringInterval"],
      });
    }
  });
