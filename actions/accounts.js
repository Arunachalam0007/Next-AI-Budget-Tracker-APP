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

    console.log("DEBUG: userId: ", userId);

    const loggedInUser = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
    });

    console.log("DEBUG: loggedInUser: ", loggedInUser);

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
