"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDownIcon, ArrowUpIcon, IndianRupee } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface SummaryData {
  income: {
    total: number;
    change: number;
  };
  expenses: {
    total: number;
    change: number;
  };
  balance: {
    total: number;
    change: number;
  };
}

interface TransactionStatsProps {
  summary: {
    success: boolean;
    summary?: SummaryData;
  };
}

export function TransactionStats({ summary }: TransactionStatsProps) {
  if (!summary.success || !summary.summary) {
    return <div>Error loading summary data.</div>;
  }

  const { summary: summaryData } = summary;

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Income</CardTitle>
          <ArrowUpIcon className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(summaryData.income.total)}
          </div>
          <p className="text-xs text-muted-foreground">
            {summaryData.income.change.toFixed(2)}% from last month
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          <ArrowDownIcon className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {formatCurrency(summaryData.expenses.total)}
          </div>
          <p className="text-xs text-muted-foreground">
            {summaryData.expenses.change.toFixed(2)}% from last month
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
          <IndianRupee className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(summaryData.balance.total)}
          </div>
          <p className="text-xs text-muted-foreground">
            {summaryData.balance.change.toFixed(2)}% from last month
          </p>
        </CardContent>
      </Card>
    </>
  );
}
