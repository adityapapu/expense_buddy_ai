"use client";

import { useSession } from "next-auth/react";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DownloadIcon, FilterIcon, PlusIcon } from "lucide-react";
import { TransactionsTable } from "./transactions-table";
import { TransactionsList } from "./transactions-list";
import { TransactionsFilters, type FilterState } from "./transactions-filters";
import { TransactionStats } from "./transaction-stats";
import { useMediaQuery } from "@/hooks/use-media-query";
import { TransactionFormDialog } from "./transaction-form-dialog";
import { ResponsiveContainer } from "@/components/ui/responsive-container";
import { TransactionDetailsDialog } from "./transaction-details-dialog";
import {
  type Transaction,
  deleteTransaction,
} from "@/lib/actions/transactions"; // Assuming you move the interface there
import { useToast } from "@/components/ui/use-toast";

const DEFAULT_FILTERS: FilterState = {
  dateRange: undefined,
  type: "all",
  categories: [],
  amountRange: [0, 100000],
  paymentMethods: [],
  searchQuery: "",
};

export function TransactionsPageContent({
  transactions,
  categories,
  paymentMethods,
  summary,
}: {
  transactions: Transaction[];
  categories: { id: string; name: string }[];
  paymentMethods: { id: string; name: string }[];
  summary: any;
}) {
  const { data: session } = useSession();
  const [activeView, setActiveView] = useState<"all" | "income" | "expense">(
    "all",
  );
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [isEditTransactionOpen, setIsEditTransactionOpen] = useState(false);
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { toast } = useToast();

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  const handleTabChange = (value: string) => {
    setActiveView(value as "all" | "income" | "expense");
  };

  const handleViewDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsViewDetailsOpen(true);
  };

  const handleEdit = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsEditTransactionOpen(true);
  };

  const [isPending, startTransition] = useTransition();

  const handleDelete = (transaction: Transaction) => {
    startTransition(async () => {
      await deleteTransaction(transaction.id);
      toast({
        title: "Transaction deleted",
        description: `"${transaction.description}" has been deleted.`,
      });
    });
  };

  const handleDownload = () => {
    const json = JSON.stringify(transactions, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "transactions.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <ResponsiveContainer className="py-6 md:py-8">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => {
                setSelectedTransaction(null);
                setIsAddTransactionOpen(true);
              }}
              className="w-full sm:w-auto"
            >
              <PlusIcon className="mr-2 h-4 w-4" />
              Add Transaction
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="hidden md:flex"
              onClick={handleDownload}
            >
              <DownloadIcon className="h-4 w-4" />
              <span className="sr-only">Download</span>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <TransactionStats summary={summary} />
        </div>

        <Card>
          <CardHeader className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>
                View and manage your financial activity
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="w-full sm:w-auto"
              >
                <FilterIcon className="mr-2 h-4 w-4" />
                {isFilterOpen ? "Hide Filters" : "Show Filters"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isFilterOpen && (
              <TransactionsFilters
                categories={categories}
                paymentMethods={paymentMethods}
                className="mb-4"
                onFiltersChange={handleFiltersChange}
                initialFilters={filters}
              />
            )}

            <Tabs
              defaultValue="all"
              value={activeView}
              onValueChange={handleTabChange}
            >
              <TabsList className="mb-4 w-full sm:w-auto">
                <TabsTrigger value="all" className="flex-1 sm:flex-none">
                  All
                </TabsTrigger>
                <TabsTrigger value="income" className="flex-1 sm:flex-none">
                  Income
                </TabsTrigger>
                <TabsTrigger value="expense" className="flex-1 sm:flex-none">
                  Expenses
                </TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="space-y-4">
                {isMobile ? (
                  <TransactionsList
                    transactions={transactions}
                    type="all"
                    filters={filters}
                    onViewDetails={handleViewDetails}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ) : (
                  <TransactionsTable
                    transactions={transactions}
                    type="all"
                    filters={filters}
                    onViewDetails={handleViewDetails}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                )}
              </TabsContent>
              <TabsContent value="income" className="space-y-4">
                {isMobile ? (
                  <TransactionsList
                    transactions={transactions}
                    type="income"
                    filters={filters}
                    onViewDetails={handleViewDetails}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ) : (
                  <TransactionsTable
                    transactions={transactions}
                    type="income"
                    filters={filters}
                    onViewDetails={handleViewDetails}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                )}
              </TabsContent>
              <TabsContent value="expense" className="space-y-4">
                {isMobile ? (
                  <TransactionsList
                    transactions={transactions}
                    type="expense"
                    filters={filters}
                    onViewDetails={handleViewDetails}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ) : (
                  <TransactionsTable
                    transactions={transactions}
                    type="expense"
                    filters={filters}
                    onViewDetails={handleViewDetails}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <TransactionFormDialog
          open={isAddTransactionOpen}
          onOpenChange={setIsAddTransactionOpen}
          categories={categories}
          paymentMethods={paymentMethods}
          session={session}
        />

        {selectedTransaction && (
          <>
            <TransactionDetailsDialog
              transaction={selectedTransaction}
              open={isViewDetailsOpen}
              onOpenChange={setIsViewDetailsOpen}
              onEdit={() => {
                setIsViewDetailsOpen(false);
                setIsEditTransactionOpen(true);
              }}
              onDelete={() => {
                handleDelete(selectedTransaction);
                setIsViewDetailsOpen(false);
              }}
            />

            <TransactionFormDialog
              open={isEditTransactionOpen}
              onOpenChange={setIsEditTransactionOpen}
              transaction={selectedTransaction}
              mode="edit"
              categories={categories}
              paymentMethods={paymentMethods}
              session={session}
            />
          </>
        )}
      </div>
    </ResponsiveContainer>
  );
}
