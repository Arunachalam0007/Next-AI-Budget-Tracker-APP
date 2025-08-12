"use client";
import React, { use, useEffect } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Switch } from "./ui/switch";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import useFetchHook from "@/hooks/use-fetch";
import { updateIsDefaultAccount } from "@/actions/accounts";
import { toast } from "sonner";
import { getAllAccounts } from "@/actions/dashboard";

const AccountsCard = ({ account }) => {
  const { name, balance, type, isDefault, id } = account;

  const {
    data: updatedIsDefaultData,
    error: updateIsDefaultError,
    fn: updateFN,
    isLoading: updateIsDefaultLoading,
  } = useFetchHook(updateIsDefaultAccount);

  const handleDefaultChange = async (e) => {
    e.preventDefault();
    if (isDefault) {
      toast.warning("Altlest one account must be default");
      return;
    }
    await updateFN(account);
  };

  useEffect(() => {
    if (updatedIsDefaultData?.success) {
      toast.success("Default account Updated successfully");
    }
  }, [updatedIsDefaultData, updateIsDefaultLoading]);

  useEffect(() => {
    if (updateIsDefaultError) {
      toast.error(
        updateIsDefaultError.message || "Failed to update default account"
      );
    }
  }, [updateIsDefaultError]);

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow group relative">
      {/* <Link href={`/account/${id}`}> */}
      <CardHeader className="flex items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium capitalize">{name}</CardTitle>
        <Switch
          checked={isDefault}
          disabled={updateIsDefaultLoading}
          className=""
          onClick={handleDefaultChange}
        />
      </CardHeader>
      <CardContent>
        <h1 className="text-2xl font-bold">
          ${parseFloat(balance).toFixed(2)}
        </h1>
        <p className="text-muted-foreground text-sm">
          {type.charAt(0) + type.slice(1).toLowerCase()}
        </p>
      </CardContent>
      <CardFooter className="flex justify-between text-muted-foreground text-sm">
        <div className="flex items-center">
          <ArrowUpRight className="text-green-600 mr-1 h-4 w-4" /> Income
        </div>
        <div className="flex items-center">
          <ArrowDownRight className="text-red-600 mr-1 h-4 w-4" /> Expense
        </div>
      </CardFooter>
      {/* </Link> */}
    </Card>
  );
};

export default AccountsCard;
