"use client";
import { transactionSchema } from "@/lib/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Input } from "./ui/input";
import CreateAccountDrawer from "./create-account-drawer";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "./ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Switch } from "./ui/switch";
import { useRouter } from "next/navigation";
import { RECURRING_INTERVALS } from "@/lib/helper";
import useFetchHook from "@/hooks/use-fetch";
import { createTransaction } from "@/actions/transaction";
import { toast } from "sonner";

const AddTransactionForm = ({ accounts, categories }) => {
  const {
    register,
    getValues,
    setValue,
    watch,
    reset,
    formState: { errors },
    handleSubmit,
  } = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: "EXPENSE",
      amountId: "",
      date: new Date(),
      category: "",
      accountId: accounts?.data?.find((acc) => acc.isDefault)?.id,
      isRecurring: false,
      description: "",
    },
  });

  const router = useRouter();

  const {
    data: transactionResultData,
    error: transactionError,
    fn: createTransFn,
    isLoading: isTransactionOperationLoading,
  } = useFetchHook(createTransaction);

  const type = watch("type"); // To monitor select type change
  const date = watch("date"); // To monitor select type change
  const isRecurring = watch("isRecurring");

  const filteredCategory = categories.filter(
    (category) => category.type === type
  );

  useEffect(() => {
    if (transactionResultData?.success && !isTransactionOperationLoading) {
      reset();
      toast.success("Transaction created successfully");
      router.push(`/account/${transactionResultData.data.accountId}`);
    }
  }, [transactionResultData, isTransactionOperationLoading]);

  const createTransactionFormSubmit = async (data) => {
    const formData = { ...data, amount: parseFloat(data.amount) };
    createTransFn(formData);
  };

  return (
    <form
      className="flex flex-col space-y-6"
      onSubmit={handleSubmit(createTransactionFormSubmit)}
    >
      {/* TODO */}
      {/* AI Recipt Scanner */}
      {/* Type Field */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Type</label>
        <Select
          defaultValue={type}
          onValueChange={(val) => {
            setValue("type", val);
            setValue("category", "");
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Account Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="INCOME">INCOME</SelectItem>
            <SelectItem value="EXPENSE">EXPENSE</SelectItem>
          </SelectContent>
        </Select>

        {errors.type && (
          <p className="text-sm text-red-500">{errors.type.message}</p>
        )}
      </div>

      {/* Amount & Account Field */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Amount Field */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Amount</label>
          <Input
            type="number"
            step="0.01"
            placeholder="0.0"
            {...register("amount")}
          />
          {errors.amount && (
            <p className="text-sm text-red-500">{errors.amount.message}</p>
          )}
        </div>

        {/* Account Field */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Account</label>
          <Select
            defaultValue={getValues("accountId")}
            onValueChange={(val) => setValue("accountId", val)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select your account" />
            </SelectTrigger>
            <SelectContent>
              {accounts?.data?.map((acc) => (
                <SelectItem key={acc.id} value={acc.id}>
                  {acc.name} (₹{parseFloat(acc.balance).toFixed(2)})
                </SelectItem>
              ))}
              <CreateAccountDrawer>
                <Button className=" w-full select-none items-center">
                  Create Account
                </Button>
              </CreateAccountDrawer>
            </SelectContent>
          </Select>
          {errors.accountId && (
            <p className="text-sm text-red-500">{errors.accountId.message}</p>
          )}
        </div>
      </div>

      {/* Category Field */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Category</label>
        <Select
          defaultValue={getValues("category")}
          onValueChange={(val) => setValue("category", val)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select the category" />
          </SelectTrigger>
          <SelectContent>
            {filteredCategory.map((category) => (
              <SelectItem key={category.id} value={category.name}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {errors.category && (
          <p className="text-sm text-red-500">{errors.category.message}</p>
        )}
      </div>

      {/* Date Field */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Date</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant={"outline"}>
              {date ? format(date, "PPP") : <span>Pick a date</span>}
              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(val) => setValue("date", val)}
              disabled={(date) =>
                date > new Date() || date < new Date("1900-01-01")
              }
              captionLayout="dropdown"
            />
          </PopoverContent>
        </Popover>

        {errors.date && (
          <p className="text-sm text-red-500">{errors.date.message}</p>
        )}
      </div>

      {/* Description Field */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Description</label>
        <Input placeholder="Enter description" {...register("description")} />
        {errors.description && (
          <p className="text-sm text-red-500">{errors.description.message}</p>
        )}
      </div>

      {/* Recurring Field */}
      <div className="flex justify-between space-y-2 p-2 border rounded-lg">
        <div>
          <label htmlFor="isDefault" className="text-sm font-medium">
            Set as Default
          </label>
          <p className="text-muted-foreground">
            Set up recurring transaction for this transaction
          </p>
        </div>
        <Switch
          id="isRecurring"
          onCheckedChange={(checked) => setValue("isRecurring", checked)}
          checked={isRecurring}
        />
      </div>

      {/* RecurringInterval Field */}
      {isRecurring && (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">RecurringInterval</label>
          <Select onValueChange={(val) => setValue("recurringInterval", val)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select the recurring interval" />
            </SelectTrigger>
            <SelectContent>
              {RECURRING_INTERVALS.map((recurring, index) => (
                <SelectItem key={index} value={recurring}>
                  {recurring}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {errors.recurringInterval && (
            <p className="text-sm text-red-500">
              {errors.recurringInterval.message}
            </p>
          )}
        </div>
      )}
      {/* Submit and Cancel Btn */}
      <div className="grid grid-cols-2 gap-6">
        <Button
          disabled={isTransactionOperationLoading}
          variant="outline"
          type="button"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button
          disabled={isTransactionOperationLoading}
          type="submit"
          className=""
        >
          Create Transaction
        </Button>
      </div>
    </form>
  );
};

export default AddTransactionForm;
