import { getAllAccounts } from "@/actions/dashboard";
import AccountsCard from "@/components/accounts-card";
import CreateAccountDrawer from "@/components/create-account-drawer";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import React from "react";

const DashboardPage = async () => {
  const { data: accountsData } = await getAllAccounts();

  console.log("accountsData: ", accountsData);

  return (
    <div className="px-5">
      {/* Budget Progress */}

      {/* Overview */}

      {/* Accounts Grid */}
      <div className="grid max-sm:grid-cols-1 grid-cols-2 md:grid-cols-3 gap-4">
        <CreateAccountDrawer>
          <Card className="cursor-pointer hover:shadow-md transition-shadow border-dashed">
            <CardContent className="flex flex-col items-center justify-center text-muted-foreground h-full pt-5">
              <Plus className="h-10 w-10 mb-2" />
              <p className="text-sm font-medium">Add a new account</p>
            </CardContent>
          </Card>
        </CreateAccountDrawer>

        {/* List of accounts will be displayed here */}
        {accountsData?.length > 0 &&
          accountsData?.map((account) => (
            <AccountsCard key={account.id} account={account} />
          ))}
      </div>
    </div>
  );
};

export default DashboardPage;
