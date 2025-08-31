"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { ArrowDownIcon, ArrowUpIcon, TrendingUpIcon, TrendingDownIcon } from "lucide-react"
import type { DateRange } from "react-day-picker"

interface ExpenseSummaryProps {
  dateRange?: DateRange
}

export function ExpenseSummary({ dateRange: _dateRange }: ExpenseSummaryProps) {
  // In a real app, you would fetch this data based on the date range
  // This is mock data for demonstration
  const summaryData = {
    totalIncome: 8750.0,
    totalExpenses: 5320.45,
    netSavings: 3429.55,
    savingsRate: 39.2,
    monthlyChange: 12.5,
    largestExpense: {
      category: "Housing",
      amount: 1800.0,
      percentage: 33.8,
    },
    fastestGrowing: {
      category: "Entertainment",
      growth: 28.4,
    },
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Income</CardTitle>
          <ArrowUpIcon className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(summaryData.totalIncome)}</div>
          <p className="text-xs text-muted-foreground">For the selected period</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          <ArrowDownIcon className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(summaryData.totalExpenses)}</div>
          <p className="text-xs text-muted-foreground">For the selected period</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Net Savings</CardTitle>
          <div className="flex items-center rounded-full bg-green-100 dark:bg-green-900/30 px-2 py-1 text-xs font-medium text-green-600 dark:text-green-400">
            {summaryData.savingsRate}%
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(summaryData.netSavings)}</div>
          <p className="text-xs text-muted-foreground">Savings rate: {summaryData.savingsRate}% of income</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monthly Change</CardTitle>
          {summaryData.monthlyChange > 0 ? (
            <TrendingUpIcon className="h-4 w-4 text-green-500" />
          ) : (
            <TrendingDownIcon className="h-4 w-4 text-red-500" />
          )}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {summaryData.monthlyChange > 0 ? "+" : ""}
            {summaryData.monthlyChange}%
          </div>
          <p className="text-xs text-muted-foreground">Compared to previous period</p>
        </CardContent>
      </Card>
    </div>
  )
}

