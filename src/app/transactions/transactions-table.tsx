"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, SplitIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatCurrency } from "@/lib/utils";
import type { Transaction } from "@/lib/actions/transactions";
import type { FilterState } from "./transactions-filters";

interface TransactionsTableProps {
  transactions: Transaction[];
  type: "all" | "income" | "expense";
  filters: FilterState;
  onViewDetails: (transaction: Transaction) => void;
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
}

export function TransactionsTable({
  transactions,
  type,
  filters,
  onViewDetails,
  onEdit,
  onDelete,
}: TransactionsTableProps) {
  const filteredTransactions = transactions.filter(
    (transaction: Transaction) => {
      // Filter by type
      if (type !== "all" && transaction.type !== type) return false;

      // Filter by search query
      if (
        filters.searchQuery &&
        !transaction.description
          .toLowerCase()
          .includes(filters.searchQuery.toLowerCase())
      ) {
        return false;
      }

      // Filter by date range
      if (filters.dateRange?.from || filters.dateRange?.to) {
        const transactionDate = new Date(transaction.date);
        if (filters.dateRange.from && transactionDate < filters.dateRange.from)
          return false;
        if (filters.dateRange.to && transactionDate > filters.dateRange.to)
          return false;
      }

      // Filter by categories
      if (
        filters.categories.length > 0 &&
        !filters.categories.includes(transaction.category.id)
      ) {
        return false;
      }

      // Filter by amount range
      if (
        Math.abs(transaction.amount) < filters.amountRange[0] ||
        Math.abs(transaction.amount) > filters.amountRange[1]
      ) {
        return false;
      }

      // Filter by payment methods
      if (
        filters.paymentMethods.length > 0 &&
        !filters.paymentMethods.includes(transaction.paymentMethod.id)
      ) {
        return false;
      }

      return true;
    },
  );

  if (filteredTransactions.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground">No transactions found</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Payment Method</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredTransactions.map((transaction: Transaction) => (
            <TableRow key={transaction.id}>
              <TableCell>{transaction.date}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {transaction.description}
                  {transaction.isSplit && (
                    <Badge
                      variant="outline"
                      className="flex items-center gap-1"
                    >
                      <SplitIcon className="h-3 w-3" />
                      <span className="text-xs">Split</span>
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="secondary">{transaction.category.name}</Badge>
              </TableCell>
              <TableCell>{transaction.paymentMethod.name}</TableCell>
              <TableCell
                className={`text-right font-medium ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}
              >
                {transaction.type === "income" ? "+" : "-"}
                {formatCurrency(Math.abs(transaction.amount))}
              </TableCell>
              <TableCell>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewDetails(transaction)}
                  >
                    View
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">More options</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(transaction)}>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDelete(transaction)}>
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
