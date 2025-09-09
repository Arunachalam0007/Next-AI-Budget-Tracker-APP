"use server";
import db from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

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

export async function createAccount(data) {
  try {
    // Get current user's ID from Clerk
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

    // Convert balance Number to float
    const balanceFloat = parseFloat(data.balance);

    if (isNaN(balanceFloat)) {
      throw new Error("Invalid balance value");
    }

    // Find and update existing accounts
    // If no existing accounts, set the first one as default
    // If there are existing accounts, set the new account as default if specified
    // Otherwise, set the new account as non-default
    const exisitingAccounts = await db.account.findMany({
      where: { userId: loggedInUser.id, isDefault: true },
    });

    const shouldBeDefault =
      exisitingAccounts.length === 0 ? true : data.isDefault;

    if (shouldBeDefault) {
      await db.account.updateMany({
        where: { userId: loggedInUser.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    // Create the new account
    const currentAccount = await db.account.create({
      data: {
        ...data,
        userId: loggedInUser.id,
        balance: balanceFloat,
        isDefault: shouldBeDefault,
      },
    });

    // Serialize the account data convert balance float to number
    const serializedAccount = serializeTransaction(currentAccount);

    // Revalidate the dashboard path to update the cache
    revalidatePath("/dashboard");

    // Return the serialized account data
    return { success: true, data: serializedAccount };
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function getAllAccounts() {
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
      throw new Error("User not found in database");
    }

    const accounts = await db.account.findMany({
      where: { userId: loggedInUser.id },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            transactions: true,
          },
        },
      },
    });

    const serializedAccounts = accounts.map(serializeTransaction);
    return { success: true, data: serializedAccounts };
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function getDashboardData() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Get all user transactions
  const transactions = await db.transaction.findMany({
    where: { userId: user.id },
    orderBy: { date: "desc" },
  });
  return transactions.map(serializeTransaction);
}
