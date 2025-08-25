"use client";
import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Check, Pencil, X } from "lucide-react";
import useFetchHook from "@/hooks/use-fetch";
import { updateBudget } from "@/actions/budget";
import { toast } from "sonner";
import { Progress } from "./ui/progress";

const BudgetProgress = ({ initialBudget, currentExpense }) => {
  const [newBudgetAmount, setNewBudgetAmount] = useState(
    initialBudget?.amount?.toString() || ""
  );
  const [isEditing, setIsEditing] = useState(false);

  const percentageUsed = initialBudget
    ? (currentExpense / initialBudget.amount) * 100
    : 0;

  console.log("initialBudget: ", initialBudget);

  const {
    isLoading,
    fn: updateBudgetFn,
    error: updateBugetError,
    data: updatedBudgetData,
  } = useFetchHook(updateBudget);

  const handleUpdateBudget = async () => {
    const amount = parseFloat(newBudgetAmount);

    console.log("DEBUG:handleUpdateBudget Amount: ", amount);

    if (isNaN(newBudgetAmount) || newBudgetAmount <= 0) {
      toast.error("Please enter a valid amount");
    } else {
      await updateBudgetFn(amount);
    }
  };

  const handleCancleBudget = () => {
    setNewBudgetAmount(initialBudget?.amount?.toString() || "");
    setIsEditing(false);
  };

  useEffect(() => {
    console.log("DEBUG: updatedBudgetData: ", updatedBudgetData);

    if (updatedBudgetData?.success) {
      setIsEditing(false);
      toast.success("Budget updated Successfully");
    }
  }, [updatedBudgetData]);

  useEffect(() => {
    if (updateBugetError) {
      setIsEditing(false);
      toast.error(updateBugetError.message || "Failed to update budget");
    }
  }, [updateBugetError]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Monthly Budget (Default Account)</CardTitle>
        <div className="mt-2 ">
          {isEditing ? (
            <div className="flex gap-2 ">
              <Input
                type="number"
                value={newBudgetAmount}
                onChange={(e) => setNewBudgetAmount(e.target.value)}
                className="w-40"
                placeholder="Enter Amount"
                autoFocus
              />
              <Button variant="ghost" size="icon" onClick={handleUpdateBudget}>
                <Check className="h-4 w-4 text-green-500" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleCancleBudget}>
                <X className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          ) : (
            <div className="flex gap-5">
              <CardDescription>
                {initialBudget
                  ? `$${currentExpense} of $${initialBudget.amount}`
                  : "NO Budget Found"}
              </CardDescription>
              <Button
                variant={"ghost"}
                size="icon"
                onClick={() => setIsEditing(true)}
                className="h-6 w-6"
              >
                <Pencil className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Progress
            value={Math.min(percentageUsed, 100)}
            extraStyles={`${
              percentageUsed >= 90
                ? "bg-red-500"
                : percentageUsed >= 50
                ? "bg-yellow-500"
                : "bg-green-500"
            }`}
          />
          <p className="text-xs text-muted-foreground text-right ">
            {percentageUsed.toFixed()}% used
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default BudgetProgress;
