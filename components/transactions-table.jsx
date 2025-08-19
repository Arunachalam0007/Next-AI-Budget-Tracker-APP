"use client";
import React, { useEffect, useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Checkbox } from "./ui/checkbox";
import {
  ChevronDown,
  ChevronUp,
  Clock,
  MoreHorizontal,
  RefreshCcw,
  Search,
  Trash,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { categoryColors } from "@/data/categories";
import { Badge } from "./ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import useFetchHook from "@/hooks/use-fetch";
import { bulkDeleteTransaction } from "@/actions/accounts";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import {
  BarLoader,
  ClimbingBoxLoader,
  DotLoader,
  FadeLoader,
  HashLoader,
} from "react-spinners";

const TrasactionsTable = ({ transactions }) => {
  const RECURRING_INTERVALS = {
    DAILY: "Daily",
    WEEKLY: "Weekly",
    MONTHLY: "Monthly",
    YEARLY: "Yearly",
  };

  const router = useRouter();

  const {
    isLoading: isDeleteTransLoading,
    fn: bulkDeleteFn,
    data: deletedTransaction,
    error: deleteTransError,
  } = useFetchHook(bulkDeleteTransaction);

  const [selectIds, setSelectIds] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    field: "date",
    direction: "desc",
  });

  // Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [recurringFilter, setRecurringFilter] = useState("");

  const filteredAndSortTransactions = useMemo(() => {
    let result = [...transactions];

    // Apply search filter
    if (searchTerm) {
      const searchTermLower = searchTerm.toLowerCase();
      result = result.filter((transaction) =>
        transaction.description?.toLowerCase().includes(searchTermLower)
      );
    }

    // Apply type filter
    if (typeFilter) {
      result = result.filter((transaction) => transaction.type === typeFilter);
    }

    // Apply recurring filter
    if (recurringFilter) {
      result = result.filter((transaction) => {
        if (recurringFilter === "recurring") return transaction.isRecurring;
        return !transaction.isRecurring;
      });
    }

    // Apply Sorting
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortConfig.field) {
        case "date":
          comparison = new Date(a.date) - new Date(b.date);
          break;
        case "amount":
          comparison = a.amount - b.amount;
          break;
        case "category":
          comparison = a.category.localeCompare(b.category);
          break;
        case "description":
          comparison = a.description.localeCompare(b.description);
          break;

        default:
          comparison = 0;
      }
      return sortConfig.direction === "asc" ? comparison : -comparison;
    });

    return result;
  }, [transactions, searchTerm, typeFilter, recurringFilter, sortConfig]);

  useEffect(() => {
    if (deletedTransaction && !isDeleteTransLoading) {
      setSelectIds([]);
      if (deletedTransaction.sucess) {
        toast.success("Transaction Deleted Sucessfully");
      } else if (!deletedTransaction.sucess) {
        toast.error(
          `Unable to delete the transaction: ${deletedTransaction.error}`
        );
      }
    }
  }, [deletedTransaction, isDeleteTransLoading]);

  const handleSelect = (id) => {
    setSelectIds((current) =>
      current.includes(id)
        ? current.filter((item) => item != id)
        : [...current, id]
    );
  };

  const handleSelectAll = () => {
    setSelectIds((current) =>
      current.length === filteredAndSortTransactions.length
        ? []
        : filteredAndSortTransactions.map((t) => t.id)
    );
  };

  const onEditTransaction = (currentTransaction) => {
    router.push(`/transaction/create?edit=${currentTransaction.id}`);
  };

  const handleBulkDeleteTransaction = async (currentTransaction) => {
    bulkDeleteFn(selectIds);
  };
  const handleClearFilters = () => {
    setSearchTerm("");
    setTypeFilter("");
    setRecurringFilter("");
    setSelectIds([]);
  };

  const handleSort = (field) => {
    setSortConfig((current) => ({
      field,
      direction:
        current.field === field && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  return (
    <div className="space-y-4">
      {isDeleteTransLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
          <FadeLoader className="mt-4" size={80} color="#2e0345" />
        </div>
      )}
      {/* Table Filter */}
      <div className="flex max-sm:flex-col gap-2">
        {/* Search Term */}
        <div className="flex-1 items-center relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          {/* Type Filter */}
          <Select
            value={typeFilter}
            onValueChange={(val) => setTypeFilter(val)}
          >
            <SelectTrigger className="">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="INCOME">Income</SelectItem>
              <SelectItem value="EXPENSE">Expense</SelectItem>
            </SelectContent>
          </Select>

          {/* Recurring Filter */}
          <Select
            value={recurringFilter}
            onValueChange={(val) => setRecurringFilter(val)}
          >
            <SelectTrigger className="max-sm:w-[130px]">
              <SelectValue placeholder="All Transactions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recurring">Recurring Only</SelectItem>
              <SelectItem value="non-recurring">Non-recurring Only</SelectItem>
            </SelectContent>
          </Select>

          {/* Delete Transactions */}
          {selectIds.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  className="cursor-pointer"
                  size="sm"
                >
                  <Trash className="h-4 w-4" />
                  <p className="hidden sm:inline">
                    Delete selected ({selectIds.length})
                  </p>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. It will permanently delete{" "}
                    <strong>{selectIds.length}</strong> selected transaction(s).
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-red-500 "
                    onClick={handleBulkDeleteTransaction}
                  >
                    Continue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {/* Clear Filters */}
          {(searchTerm || typeFilter || recurringFilter) && (
            <Button
              variant="outline"
              size="sm"
              title="Clear Filter"
              onClick={handleClearFilters}
            >
              <X className="" />
            </Button>
          )}
        </div>
      </div>

      {/* Transaction Table */}
      <div className="border rounded-lg">
        <Table>
          {/* Table header */}
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  onCheckedChange={() => handleSelectAll()}
                  checked={
                    selectIds.length === filteredAndSortTransactions.length &&
                    filteredAndSortTransactions.length > 0
                  }
                />
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("date")}
              >
                <div className="flex items-center">
                  Date
                  {sortConfig.field === "date" &&
                    (sortConfig.direction === "asc" ? (
                      <ChevronUp className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-1 h-4 w-4" />
                    ))}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("description")}
              >
                <div className="flex items-center">
                  Description
                  {sortConfig.field === "description" &&
                    (sortConfig.direction === "asc" ? (
                      <ChevronUp className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-1 h-4 w-4" />
                    ))}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("category")}
              >
                <div className="flex items-center">
                  Category
                  {sortConfig.field === "category" &&
                    (sortConfig.direction === "asc" ? (
                      <ChevronUp className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-1 h-4 w-4" />
                    ))}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("amount")}
              >
                <div className="flex items-center justify-end">
                  Amount
                  {sortConfig.field === "amount" &&
                    (sortConfig.direction === "asc" ? (
                      <ChevronUp className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-1 h-4 w-4" />
                    ))}
                </div>
              </TableHead>
              <TableHead>
                <div>Recurring</div>
              </TableHead>
              <TableHead className="w-[50px]" />
            </TableRow>
          </TableHeader>

          {/* Table Body */}
          <TableBody>
            {filteredAndSortTransactions.length === 0 ? (
              <TableRow key={filteredAndSortTransactions.length}>
                <TableCell
                  className="text-center p-4 text-muted-foreground"
                  colSpan={7}
                >
                  No Transaction Found
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium">
                    <Checkbox
                      checked={selectIds.includes(transaction.id)}
                      onCheckedChange={() => handleSelect(transaction.id)}
                    />
                  </TableCell>
                  <TableCell>
                    {format(new Date(transaction.date), "PP")}
                  </TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell className="">
                    <span
                      style={{
                        background: categoryColors[transaction.category],
                      }}
                      className="px-2 py-1 text-sm capitalize text-white rounded"
                    >
                      {transaction.category}
                    </span>
                  </TableCell>
                  <TableCell className="text-end">
                    <span
                      style={{
                        color: transaction.type === "EXPENSE" ? "red" : "green",
                      }}
                    >
                      {transaction.type === "EXPENSE" ? "-" : "+"}₹
                      {transaction.amount}
                    </span>
                  </TableCell>
                  <TableCell className="">
                    {transaction.isRecurring ? (
                      <Tooltip>
                        <TooltipTrigger>
                          <Badge className="animate-bounce bg-purple-100 text-purple-800 hover:bg-purple-200">
                            <RefreshCcw />
                            {RECURRING_INTERVALS[transaction.recurringInterval]}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="p-2">
                            <p className="font-medium">Next Date:</p>
                            <h1>
                              {format(
                                new Date(transaction.nextRecurringDate),
                                "PP"
                              )}
                            </h1>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <Badge variant="ghost">
                        <Clock />
                        one-time
                      </Badge>
                    )}
                  </TableCell>

                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuLabel
                          onClick={() => onEditTransaction(transaction)}
                        >
                          Edit
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => bulkDeleteFn([transaction.id])}
                          className="text-red-600"
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TrasactionsTable;
