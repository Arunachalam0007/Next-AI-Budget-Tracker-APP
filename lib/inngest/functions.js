import db from "../prismadb";
import { isNewBudgetMonth } from "../utils";
import { inngest } from "./client";

export const triggerAlertBudgetCheck = inngest.createFunction(
  { id: "Check Budget Alert" },
  //  { event: "budget/budgetAlertChecker" },
  { cron: "0 */6 * * *" }, //Which will run every 6 hrs
  async ({ step }) => {
    // Step is unsed to run single steps

    // fetch the budget for all users whos have default account
    const usersBudget = await step.run("fetch-users-budget", async () => {
      return await db.budget.findMany({
        include: {
          user: {
            include: {
              accounts: {
                // it should be pural
                where: {
                  isDefault: true,
                },
              },
            },
          },
        },
      });
    });
    for (const budget of usersBudget) {
      const defaultAccount = budget.user.accounts[0];
      console.log("DEBUG: usersBudget: defaultAccount ", defaultAccount);
      if (!defaultAccount) continue;

      await step.run(`check-budget-${budget.id}`, async () => {
        const currentDate = new Date();
        const startMonth = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          1
        );
        const endMonth = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() + 1,
          0
        );

        console.log("DEBUG: currentDate: ", currentDate.toString());
        console.log("DEBUG: startMonth: ", startMonth.toString());
        console.log("DEBUG: endMonth: ", endMonth.toString());

        const expenses = await db.transaction.aggregate({
          where: {
            userId: budget.userId,
            accountId: defaultAccount.id,
            type: "EXPENSE",
            date: {
              gte: startMonth,
              lte: endMonth,
            },
          },
          _sum: {
            amount: true,
          },
        });

        const totalExpenses = expenses._sum.amount?.toNumber() || 0;
        const budgetAmount = budget.amount;

        const percentageUsed = (totalExpenses / budgetAmount) * 100;

        console.log("DEBUG: PercentageUsed: ", percentageUsed);

        if (
          percentageUsed > 80 &&
          (!budget.lastAlertSent ||
            isNewBudgetMonth(new Date(budget.lastAlertSent), new Date()))
        ) {
          // Send Email

          //Update LastAlertSent
          await db.budget.update({
            where: {
              id: budget.id,
            },
            data: {
              lastAlertSent: new Date(),
            },
          });
        }
      });
    }
    console.log("DEBUG: usersBudget Val:  ", usersBudget);
    return { usersBudget };
  }
);
