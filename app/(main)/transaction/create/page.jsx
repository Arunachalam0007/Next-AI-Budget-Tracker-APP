import { getAllAccounts } from "@/actions/dashboard";
import AddTransactionForm from "@/components/add-transaction-form";
import { defaultCategories } from "@/data/categories";
import React from "react";

const TransactionPage = async () => {
  const listOfAccounts = await getAllAccounts();

  console.log("DEBUG: listOfAccounts Page: ", listOfAccounts);

  return (
    <div className="max-w-3xl mx-auto px-5">
      <h1 className="text-5xl max-sm:text-2xl mb-3 font-extrabold bg-gradient-to-br animate-bounce from-red-600 to-pink-300 text-transparent bg-clip-text text-a">
        Add Transaction
      </h1>
      <AddTransactionForm
        accounts={listOfAccounts}
        categories={defaultCategories}
      />
    </div>
  );
};

export default TransactionPage;
