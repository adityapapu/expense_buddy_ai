"use client"

import { useState } from "react"
import { ReportFilters } from "./report-filters"
import { ExpenseSummary } from "./expense-summary"
import { IncomeExpenseChart } from "./income-expense-chart"
import { CategoryBreakdown } from "./category-breakdown"
import { MonthlyTrendChart } from "./monthly-trend-chart"
import { TransactionList } from "./transaction-list"
import { ExportOptions } from "./export-options"
import type { DateRange } from "react-day-picker"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useMediaQuery } from "@/hooks/use-media-query"
import { ScrollArea } from "@/components/ui/scroll-area"

export function ReportsPageContent() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), new Date().getMonth() - 2, 1),
    to: new Date(),
  })
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedTab, setSelectedTab] = useState("overview")
  const isMobile = useMediaQuery("(max-width: 768px)")

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range)
  }

  const handleCategoryChange = (categories: string[]) => {
    setSelectedCategories(categories)
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financial Reports</h1>
          <p className="text-muted-foreground">Analyze your financial data and gain valuable insights</p>
        </div>
        <ExportOptions />
      </div>

      <ReportFilters
        dateRange={dateRange}
        onDateRangeChange={handleDateRangeChange}
        selectedCategories={selectedCategories}
        onCategoryChange={handleCategoryChange}
      />

      <Tabs defaultValue="overview" value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <ScrollArea className="w-full" orientation="horizontal">
          <TabsList className="w-full md:w-auto justify-start md:justify-center p-0 h-auto">
            <TabsTrigger value="overview" className="px-4 py-2">
              Overview
            </TabsTrigger>
            <TabsTrigger value="categories" className="px-4 py-2">
              Categories
            </TabsTrigger>
            <TabsTrigger value="trends" className="px-4 py-2">
              Trends
            </TabsTrigger>
            <TabsTrigger value="transactions" className="px-4 py-2">
              Transactions
            </TabsTrigger>
          </TabsList>
        </ScrollArea>

        <TabsContent value="overview" className="mt-6 space-y-6">
          <ExpenseSummary dateRange={dateRange} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <IncomeExpenseChart dateRange={dateRange} />
            <CategoryBreakdown dateRange={dateRange} selectedCategories={selectedCategories} />
          </div>
        </TabsContent>

        <TabsContent value="categories" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Category Analysis</CardTitle>
              <CardDescription>Detailed breakdown of your spending by category</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <CategoryBreakdown dateRange={dateRange} selectedCategories={selectedCategories} detailed={true} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Trends</CardTitle>
              <CardDescription>Track how your spending changes over time</CardDescription>
            </CardHeader>
            <CardContent>
              <MonthlyTrendChart dateRange={dateRange} selectedCategories={selectedCategories} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Transaction Details</CardTitle>
              <CardDescription>View transactions for the selected time period</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <TransactionList dateRange={dateRange} selectedCategories={selectedCategories} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

