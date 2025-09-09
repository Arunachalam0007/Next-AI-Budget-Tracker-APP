export const dynamic = "force-dynamic";

import { getAllAccounts } from "@/actions/dashboard";
import { getTransaction } from "@/actions/transaction";
import AddTransactionForm from "@/components/add-transaction-form";
import { defaultCategories } from "@/data/categories";
import React from "react";

const TransactionPage = async ({ searchParams }) => {
  const listOfAccounts = await getAllAccounts();

  const editId = searchParams?.edit;

  let initialData = null;
  if (editId) {
    const transaction = await getTransaction(editId);
    initialData = transaction;
  }

  console.log("DEBUG: SearchParams: ", searchParams);
  console.log("DEBUG: SearchParams: editId: ", editId);

  console.log("DEBUG: listOfAccounts Page: ", listOfAccounts);

  return (
    <div className="max-w-3xl mx-auto px-5">
      <h1 className="text-5xl max-sm:text-2xl mb-3 font-extrabold bg-gradient-to-br animate-bounce from-red-600 to-pink-300 text-transparent bg-clip-text text-a">
        {editId ? "Edit Transaction" : "Add Transaction"}
      </h1>
      <AddTransactionForm
        accounts={listOfAccounts}
        categories={defaultCategories}
        editMode={!!editId}
        initialData={initialData}
      />
    </div>
  );
};

export default TransactionPage;
