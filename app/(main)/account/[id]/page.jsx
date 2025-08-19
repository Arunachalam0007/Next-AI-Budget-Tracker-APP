import { getAccountsWithTransations } from "@/actions/accounts";
import { notFound } from "next/navigation";
import TrasactionsTable from "@/components/transactions-table";
import React, { Suspense } from "react";
import { BarLoader } from "react-spinners";
import { AccountChart } from "@/components/account-chart";

const AccountPage = async ({ params }) => {
  // ✅ await params
  const { id } = await params;
  const accountData = await getAccountsWithTransations(id);

  console.log("accountData: ", accountData);

  if (!accountData) {
    notFound();
  }
  const { transactions, ...account } = accountData;
  return (
    <div className="px-5 space-y-4">
      <div className="flex items-center gap-4 justify-between">
        <div>
          <div className="max-sm:text-sm space-y-8 text-3xl font-bold tracking-tight capitalize bg-clip-text text-transparent bg-gradient-to-br from-pink-600 to-blue-600">
            {account.name}
          </div>
          <div className="text-muted-foreground capitalize">
            {account.type.charAt(0) + account.type.slice(1).toLowerCase()}{" "}
            Account
          </div>
        </div>
        <div className="text-right pb-2">
          <h1 className="max-sm:text-2xl font-bold text-xl">
            ${parseFloat(account.balance).toFixed(2)}
          </h1>
          <h1 className="text-sm text-muted-foreground">
            {account._count.transactions} Transactions
          </h1>
        </div>
      </div>
      {/* Transaction Chart */}
      <Suspense
        fallback={<BarLoader className="mt-4" width={"100%"} color="#9333ea" />}
      >
        <AccountChart transactions={transactions} />
      </Suspense>

      {/* Transactions Filters & Tables*/}
      <Suspense
        fallback={<BarLoader className="mt-4" width={"100%"} color="#9333ea" />}
      >
        <TrasactionsTable transactions={transactions} />
      </Suspense>
    </div>
  );
};

export default AccountPage;
