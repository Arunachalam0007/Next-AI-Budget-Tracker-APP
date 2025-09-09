"use server";
import { aj } from "@/lib/arcjet";
import { calculateNextRecurringDate, serializeTransaction } from "@/lib/helper";
import db from "@/lib/prismadb";
import { request } from "@arcjet/next";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { revalidatePath } from "next/cache";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function scanReceipt(file) {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
    });

    // convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    // convert ArrayBuffer to Base64String
    const base64String = Buffer.from(arrayBuffer).toString("base64");

    // Promt for AI to which filed to capture from image
    const prompt = `
      Analyze this receipt image and extract the following information in JSON format:
      - Total amount (just the number)
      - Date (in ISO format)
      - Description or items purchased (brief summary)
      - Merchant/store name
      - Suggested category (one of: housing,transportation,groceries,utilities,entertainment,food,shopping,healthcare,education,personal,travel,insurance,gifts,bills,other-expense )
      
      Only respond with valid JSON in this exact format:
      {
        "amount": number,
        "date": "ISO date string",
        "description": "string",
        "merchantName": "string",
        "category": "string"
      }

      If its not a recipt, return an empty object
    `;
    /**
     * Use the Gemini AI model to generate content from the prompt.
     */
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64String,
          mimeType: file.type,
        },
      },
    ]);

    const response = await result.response;

    const text = response.text();
    // /```JSON BodyContent JSON ```/
    //Remove above bodycontent prefix and suffix
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

    try {
      const data = JSON.parse(cleanedText);

      console.log("DEBUG: Scanned CleanedText: ", cleanedText);

      return {
        amount: parseFloat(data.amount),
        date: new Date(data.date),
        description: data.description,
        category: data.category,
        merchantName: data.merchantName,
      };
    } catch (parseError) {
      console.error("Error parsing JSON response:", parseError);
      throw new Error("Invalid response format from Gemini");
    }
  } catch (error) {
    console.error("Error scanning receipt:", error);
    throw new Error("Failed to scan receipt");
  }
}

export async function createTransaction(data) {
  console.log("DEBUG: createTransaction Data: ", data);

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

export async function getTransaction(id) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  const transaction = await db.transaction.findUnique({
    where: {
      id,
      userId: user.id,
    },
  });

  if (!transaction) throw new Error("Transaction not found");

  return serializeAmount(transaction);
}

export async function updateTransaction(id, data) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    // Get original transaction to calculate balance change
    const originalTransaction = await db.transaction.findUnique({
      where: {
        id,
        userId: user.id,
      },
      include: {
        account: true,
      },
    });

    if (!originalTransaction) throw new Error("Transaction not found");

    // Calculate balance changes
    const oldBalanceChange =
      originalTransaction.type === "EXPENSE"
        ? -originalTransaction.amount.toNumber()
        : originalTransaction.amount.toNumber();

    const newBalanceChange =
      data.type === "EXPENSE" ? -data.amount : data.amount;

    const netBalanceChange = newBalanceChange - oldBalanceChange;

    // Update transaction and account balance in a transaction
    const transaction = await db.$transaction(async (tx) => {
      const updated = await tx.transaction.update({
        where: {
          id,
          userId: user.id,
        },
        data: {
          ...data,
          nextRecurringDate:
            data.isRecurring && data.recurringInterval
              ? calculateNextRecurringDate(data.date, data.recurringInterval)
              : null,
        },
      });

      // Update account balance
      await tx.account.update({
        where: { id: data.accountId },
        data: {
          balance: {
            increment: netBalanceChange,
          },
        },
      });

      return updated;
    });

    revalidatePath("/dashboard");
    revalidatePath(`/account/${data.accountId}`);

    return { success: true, data: serializeAmount(transaction) };
  } catch (error) {
    throw new Error(error.message);
  }
}

const serializeAmount = (obj) => ({
  ...obj,
  amount: obj.amount.toNumber(),
});
