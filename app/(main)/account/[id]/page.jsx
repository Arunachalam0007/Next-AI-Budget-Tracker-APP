import { getAccountsWithTransations } from "@/actions/accounts";
import { notFound } from "next/navigation";
import TrasactionsTable from "@/components/transactions-table";
import React from "react";

const AccountPage = async ({ params }) => {
  const accountData = await getAccountsWithTransations(params.id);

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

      {/* Transactions Filters & Tables*/}
      <div>
        <TrasactionsTable transactions={transactions} />
      </div>
    </div>
  );
};

export default AccountPage;
