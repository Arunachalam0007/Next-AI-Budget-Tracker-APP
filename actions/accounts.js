"use server";
import db from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { success } from "zod";

const serializeTransaction = (obj) => {
  const serialized = { ...obj };
  if (obj.balance) {
    serialized.balance = obj.balance.toNumber();
  }
  if (obj.amount) {
    serialized.amount = obj.amount.toNumber();
  }
  return serialized;
};

export async function updateIsDefaultAccount(account) {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("User not authenticated");
    }

    const loggedInUser = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
    });

    if (!loggedInUser) {
      throw new Error("User not found in database");
    }

    await db.account.updateMany({
      where: {
        userId: loggedInUser.id,
        isDefault: true,
      },
      data: {
        isDefault: false,
      },
    });

    // Update the isDefault field for the specified account
    const updatedAccount = await db.account.update({
      where: {
        id: account.id,
        userId: loggedInUser.id,
      },
      data: {
        isDefault: true,
        name: account.name,
      },
    });

    // Revalidate the dashboard path to update the cache
    revalidatePath("/dashboard");

    return { success: true, data: serializeTransaction(updatedAccount) };
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function getAccountsWithTransations(accountId) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("User not Authenticated");
    }

    const loggedInUser = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
    });

    if (!loggedInUser) {
      throw new Error("User not found in the database");
    }

    const accountData = await db.account.findUnique({
      where: {
        id: accountId,
        userId: loggedInUser.id,
      },
      include: {
        transactions: {
          orderBy: {
            date: "desc",
          },
        },
        _count: {
          select: {
            transactions: true,
          },
        },
      },
    });

    if (!accountData) return null;
    return {
      ...serializeTransaction(accountData),
      transactions: accountData.transactions.map(serializeTransaction),
    };
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function bulkDeleteTransaction(transactionIds) {
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
      throw new Error("User not found in a DB");
    }

    const transactionData = await db.transaction.findMany({
      where: {
        userId: loggedInUser.id,
        id: {
          in: transactionIds, // in is for array of ids
        },
      },
    });

    // ✅ Fix reduce and typos
    const accountBalanceChanges = transactionData.reduce((acc, transaction) => {
      const change =
        transaction.type === "INCOME"
          ? -transaction.amount // Income reduces balance
          : transaction.amount; // Expense increases balance

      acc[transaction.accountId] = (acc[transaction.accountId] || 0) + change;
      return acc;
    }, {});

    //Delete Transactions and update the account balance in a transaction

    // Here $transaction is Prisma one not Normal table transcation
    // $transaction is used to update and delete all if which is fails can't affect other process
    // $transaction is reserved keyword in prisma
    await db.$transaction(async (tx) => {
      // Delete all the selected transactions
      await tx.transaction.deleteMany({
        where: {
          userId: loggedInUser.id,
          id: {
            in: transactionIds,
          },
        },
      });

      // Update the account balances
      for (const [accountId, balanceChange] of Object.entries(
        accountBalanceChanges
      )) {
        await tx.account.update({
          where: { id: accountId },
          data: {
            balance: {
              increment: balanceChange,
            },
          },
        });
      }
    });

    // Revalidate paths (App Router only)
    // revalidatePath("/dashboard");
    revalidatePath("/account/[id]");

    return { success: true };
  } catch (error) {
    console.log("DEBUG: bulkDeleteTransaction error: ", error);

    return { sucess: false, error: `Sha TEST ${error}` };
  }
}
