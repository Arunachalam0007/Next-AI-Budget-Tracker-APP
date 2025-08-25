"use server";
import db from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function getCurrentBudgetAndExpenseAmountBasedOnDate(
  accountId,
  fromMonth,
  toMonth
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("User Not Authenticated");
    }

    const loggedInUser = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
    });

    if (!loggedInUser) {
      throw new Error("User Not Found in DB");
    }

    const currentBudgetData = await db.budget.findFirst({
      where: {
        userId: loggedInUser.id,
      },
    });

    const currentDate = new Date();
    const startOfMonth = fromMonth
      ? fromMonth
      : new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = toMonth
      ? toMonth
      : new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const currentExpense = await db.transaction.aggregate({
      where: {
        userId: loggedInUser.id,
        accountId,
        type: "EXPENSE",
        date: {
          gte: startOfMonth, // get-> grater Then
          lte: endOfMonth, // lte -> Lesser Then
        },
      },
      _sum: {
        amount: true, // Sum the amount of Expense based on date
      },
    });

    return {
      budget: currentBudgetData
        ? { ...currentBudgetData, amount: currentBudgetData.amount?.toNumber() }
        : null,
      currentExpense: currentExpense._sum.amount
        ? currentExpense._sum.amount.toNumber()
        : 0,
    };
  } catch (error) {
    console.log(
      "DEBUG: getCurrentBudgetAndExpenseAmountBasedOnDate ERROR: ",
      error
    );

    throw error;
  }
}

export async function updateBudget(budgetAmount) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("User Not Authenticated");
    }

    const loggedInUser = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
    });

    if (!loggedInUser) {
      throw new Error("User Not Found in DB");
    }

    const updatedBudget = await db.budget.upsert({
      where: {
        userId: loggedInUser.id,
      },
      update: {
        amount: budgetAmount,
      },
      create: {
        userId: loggedInUser.id,
        amount: budgetAmount,
      },
    });
    revalidatePath("/dashboard");
    return {
      success: true,
      data: { ...updatedBudget, amount: updatedBudget.amount.toNumber() },
    };
  } catch (error) {
    console.log("DEBUG: ERROR in Updating the BUDGET: ", error);
    throw error;
  }
}
