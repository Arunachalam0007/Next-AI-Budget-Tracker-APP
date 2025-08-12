"use server";
import db from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";

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

    return { success: true, data: serializeTransaction(updatedAccount) };
  } catch (error) {
    throw new Error(error.message);
  }
}
