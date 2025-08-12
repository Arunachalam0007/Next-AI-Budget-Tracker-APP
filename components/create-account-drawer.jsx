"use client";
import React, { useEffect, useState } from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./ui/drawer";
import { Button } from "./ui/button";
import { useForm } from "react-hook-form";
import { accountSchema } from "@/lib/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Switch } from "./ui/switch";
import useFetchHook from "@/hooks/use-fetch";
import { createAccount } from "@/actions/dashboard";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const CreateAccountDrawer = ({ children }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  // useForm hook for form handling
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    watch,
  } = useForm({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: "",
      type: "CURRENT",
      balance: "",
      isDefault: false,
    },
  });

  // Fetch hook for creating account
  // This will handle the API call and manage loading and error states
  // It will also allow us to reset the form after successful submission
  // and set the new account data if needed
  // The createAccount function should be defined in your actions/dashboard.js file
  // It should return a promise that resolves with the created account data
  const {
    data: newAccountData,
    error: createAccountError,
    fn: createAccountFn,
    isLoading: createAccountIsLoading,
    setData,
  } = useFetchHook(createAccount);

  const onHandleAccountSubmit = async (data) => {
    console.log("Form Data:", data);
    // call the createAccountFn function in the useFetchHook
    // And passing the form data to it as an Argument
    await createAccountFn(data);
  };

  useEffect(() => {
    if (newAccountData && !createAccountIsLoading) {
      toast.success("Account created successfully!");
      reset();
      setDrawerOpen(false);
      // Reset the form after successful submission
    }
  }, [createAccountIsLoading, newAccountData]);

  useEffect(() => {
    if (createAccountError) {
      toast.error(createAccountError.message || "Failed to create account");
    }
  }, [createAccountError]);

  return (
    <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="text-transparent bg-clip-text bg-gradient-to-br from-blue-600 to-pink-600 font-extrabold">
            Create New Account
          </DrawerTitle>
        </DrawerHeader>

        {/* Account Form */}
        <div className="px-5 pb-4">
          <form
            className="space-y-4"
            onSubmit={handleSubmit(onHandleAccountSubmit)}
          >
            {/* Name */}
            <div className="flex flex-col space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Account Name
              </label>
              <Input
                id="name"
                placeholder="e.g, HDFC Salary Account"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            {/* Type */}
            <div className="flex flex-col space-y-2">
              <label htmlFor="type" className="text-sm font-medium">
                Account Type
              </label>
              <Select
                onValueChange={(value) => {
                  setValue("type", value);
                }}
                value={watch("type")}
                defaultValues={watch("type")}
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CURRENT">Current</SelectItem>
                  <SelectItem value="SAVINGS">Savings</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-sm text-red-500">{errors.type.message}</p>
              )}
            </div>

            {/* Balance */}
            <div className="flex flex-col space-y-2">
              <label htmlFor="balance" className="text-sm font-medium">
                Balance
              </label>
              <Input
                id="balance"
                type={"number"}
                placeholder="0.00"
                step="0.01"
                {...register("balance")}
              />
              {errors.balance && (
                <p className="text-sm text-red-500">{errors.balance.message}</p>
              )}
            </div>

            {/* isDefault */}
            <div className="flex justify-between space-y-2 p-2 border rounded-lg">
              <div>
                <label htmlFor="isDefault" className="text-sm font-medium">
                  Set as Default
                </label>
                <p className="text-muted-foreground">
                  This account will be selected by default for transaction
                </p>
              </div>
              <Switch
                id="isDefault"
                onCheckedChange={(checked) => setValue("isDefault", checked)}
                checked={watch("isDefault")}
              />
            </div>

            <div className="flex gap-4 pt-4">
              <DrawerClose asChild>
                <Button variant="outline" className="flex-1">
                  Cancel
                </Button>
              </DrawerClose>
              <Button
                type="submit"
                disabled={createAccountIsLoading}
                className="flex-1 bg-gradient-to-br from-blue-600 to-green-600"
              >
                {createAccountIsLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </div>
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default CreateAccountDrawer;
