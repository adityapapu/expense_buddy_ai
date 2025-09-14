"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { ArrowDownIcon, ArrowUpIcon, TrendingUpIcon, TrendingDownIcon, Loader2 } from "lucide-react"
import type { DateRange } from "react-day-picker"
import { getExpenseSummary, type ExpenseSummaryData } from "@/lib/actions/analytics"

interface ExpenseSummaryProps {
  dateRange?: DateRange
}

export function ExpenseSummary({ dateRange }: ExpenseSummaryProps) {
  const [summaryData, setSummaryData] = useState<ExpenseSummaryData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch expense summary data when dateRange changes
  useEffect(() => {
    const fetchSummaryData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await getExpenseSummary(dateRange)
        setSummaryData(data)
      } catch (err) {
        console.error("Failed to fetch expense summary:", err)
        setError("Failed to load expense summary")
        setSummaryData(null)
      } finally {
        setIsLoading(false)
      }
    }

    void fetchSummaryData()
  }, [dateRange])

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading...
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground">For the selected period</p>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="md:col-span-2 lg:col-span-4 text-center py-8">
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  if (!summaryData) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="md:col-span-2 lg:col-span-4 text-center py-8">
          <p className="text-muted-foreground">No data available</p>
        </div>
      </div>
    )
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
            {summaryData.savingsRate.toFixed(1)}%
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(summaryData.netSavings)}</div>
          <p className="text-xs text-muted-foreground">Savings rate: {summaryData.savingsRate.toFixed(1)}% of income</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monthly Change</CardTitle>
          {summaryData.monthlyChange > 0 ? (
            <TrendingUpIcon className="h-4 w-4 text-green-500" />
          ) : summaryData.monthlyChange < 0 ? (
            <TrendingDownIcon className="h-4 w-4 text-red-500" />
          ) : (
            <div className="h-4 w-4" />
          )}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {summaryData.monthlyChange > 0 ? "+" : ""}
            {summaryData.monthlyChange.toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground">Compared to previous period</p>
        </CardContent>
      </Card>
    </div>
  )
}