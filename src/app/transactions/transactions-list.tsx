"use client";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
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

interface TransactionsListProps {
  transactions: Transaction[];
  type: "all" | "income" | "expense";
  filters: FilterState;
  onViewDetails: (transaction: Transaction) => void;
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
}

export function TransactionsList({
  transactions,
  type,
  filters,
  onViewDetails,
  onEdit,
  onDelete,
}: TransactionsListProps) {
  // Filter transactions based on the type and filters
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
      if (filters.dateRange) {
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
        filters.amountRange?.[0] !== undefined &&
        filters.amountRange?.[1] !== undefined &&
        (Math.abs(transaction.amount) < filters.amountRange[0] ||
          Math.abs(transaction.amount) > filters.amountRange[1])
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
    <div className="space-y-4">
      {filteredTransactions.map((transaction: Transaction) => (
        <Card key={transaction.id} className="overflow-hidden">
          <CardContent className="p-0">
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate font-medium">
                      {transaction.description}
                    </h3>
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
                  <p className="text-sm text-muted-foreground">
                    {transaction.date}
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  <span
                    className={`font-medium ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}
                  >
                    {transaction.type === "income" ? "+" : "-"}
                    {formatCurrency(transaction.amount)}
                  </span>
                  <Badge variant="secondary" className="mt-1">
                    {transaction.category.name}
                  </Badge>
                </div>
              </div>

              {transaction.tags && transaction.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {transaction.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {transaction.isSplit && (
                <div className="mt-2 text-sm text-muted-foreground">
                  <p>
                    Split with:{" "}
                    {transaction.splitDetails
                      ?.map((split) => split.with)
                      .join(", ")}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between bg-muted/50 p-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewDetails(transaction)}
            >
              View Details
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
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
