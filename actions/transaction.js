"use server";
import { aj } from "@/lib/arcjet";
import { calculateNextRecurringDate, serializeTransaction } from "@/lib/helper";
import db from "@/lib/prismadb";
import { request } from "@arcjet/next";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function createTransaction(data) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unautherized");

    // Arjet to add the rate limiting
    const req = await request(); // arject Request

    // check rate limit
    const decision = await aj.protect(req, {
      userId,
      request: 1, // how many tokens to consume
    });

    if (decision.isDenied()) {
      //Denied because of ratelimit
      if (decision.reason.isRateLimit()) {
        const { remaining, reset } = decision.reason;

        // console the errors
        console.error({
          code: "RATE_LIMITING_EXCEEDED",
          details: {
            remaining,
            resetInSeconds: reset,
          },
        });

        throw new Error(
          "Arcjet found Too many request, please try again later..."
        );
      }
      throw new Error("Arcjet found Request Block...");
    }

    const loggedInUser = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
    });
    if (!loggedInUser) throw new Error("User not found in DB");

    // Get the account
    const account = await db.account.findUnique({
      where: {
        userId: loggedInUser.id,
        id: data.accountId,
      },
    });

    if (!account) throw new Error("Account Not Found");

    const balanceChange = data.type === "EXPENSE" ? -data.amount : data.amount;
    const newBalance = account.balance.toNumber() + balanceChange;

    // $ resoved operation
    const transaction = await db.$transaction(async (tx) => {
      // Create new Transaction into the transaction table
      const newTransaction = await tx.transaction.create({
        data: {
          ...data,
          userId: loggedInUser.id,
          nextRecurringDate:
            data.isRecurring && data.recurringInterval
              ? calculateNextRecurringDate(data.date, data.recurringInterval)
              : null,
        },
      });

      // Update the balance to the account
      await tx.account.update({
        where: {
          id: data.accountId,
        },
        data: {
          balance: newBalance,
        },
      });

      return newTransaction;
    });

    revalidatePath("/dashboard");
    revalidatePath(`/account/${transaction.accountId}`);

    return { success: true, data: serializeTransaction(transaction) };
  } catch (error) {
    throw new Error(error.message);
  }
}
