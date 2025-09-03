
## Used shadcn UI Libraries


badge
calendar
card
checkbox
drawer
dropdown-menu
input
popover
progress
select
switch
table
tooltip
AlertDialog
ProgressBar



## Used Form Validations Packages

react-hook-form
zod
@hookform/resolvers (which is used to connect zod and react-hook-form)

## Used Exernal Packages

react-spinners
date-fns


Auth -> Clerk
DB -> Supabase
Bot Protection - Arcjet
AI RECUURING - Inngest (npx inngest-cli@latest dev)

PRISMA:

npm i -D prisma

npx prisma init

## Push prisma Schema models to Database
npx prisma migrate dev --name create-models

npm install @prisma/client


## Prisma

Aggregate :  which is used to sum of the amount based on grater and lesser date

const oneMonthExpenses = await db.transaction.aggregate({
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


  upsert: is used to find and update the value or if not inster the value

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


## $ prisma reserved keyword
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




## set button prop type ="button" when we use route

 <Button variant="outline"
  type="button"
   onClick={() => router.back()}>
          Cancel
        </Button>


This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
