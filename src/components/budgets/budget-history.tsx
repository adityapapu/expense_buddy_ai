"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BarChart, Calendar, ChevronLeftIcon, ChevronRightIcon, DownloadIcon, LineChart } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { BudgetHistoryChart } from "./budget-history-chart"

// This would typically come from an API or database
const budgetHistory = [
  {
    month: "2023-05",
    label: "May 2023",
    totalBudget: 2000,
    totalSpent: 1950,
    categories: [
      { name: "Housing", icon: "🏠", budgeted: 1000, spent: 1000 },
      { name: "Food", icon: "🍔", budgeted: 500, spent: 525 },
      { name: "Transportation", icon: "🚗", budgeted: 200, spent: 180 },
      { name: "Entertainment", icon: "🎬", budgeted: 150, spent: 175 },
      { name: "Utilities", icon: "💡", budgeted: 150, spent: 70 },
    ],
  },
  {
    month: "2023-06",
    label: "June 2023",
    totalBudget: 2000,
    totalSpent: 1875,
    categories: [
      { name: "Housing", icon: "🏠", budgeted: 1000, spent: 1000 },
      { name: "Food", icon: "🍔", budgeted: 500, spent: 480 },
      { name: "Transportation", icon: "🚗", budgeted: 200, spent: 190 },
      { name: "Entertainment", icon: "🎬", budgeted: 150, spent: 135 },
      { name: "Utilities", icon: "💡", budgeted: 150, spent: 70 },
    ],
  },
  {
    month: "2023-07",
    label: "July 2023",
    totalBudget: 2100,
    totalSpent: 2050,
    categories: [
      { name: "Housing", icon: "🏠", budgeted: 1000, spent: 1000 },
      { name: "Food", icon: "🍔", budgeted: 550, spent: 575 },
      { name: "Transportation", icon: "🚗", budgeted: 200, spent: 210 },
      { name: "Entertainment", icon: "🎬", budgeted: 200, spent: 195 },
      { name: "Utilities", icon: "💡", budgeted: 150, spent: 70 },
    ],
  },
  {
    month: "2023-08",
    label: "August 2023",
    totalBudget: 2100,
    totalSpent: 1980,
    categories: [
      { name: "Housing", icon: "🏠", budgeted: 1000, spent: 1000 },
      { name: "Food", icon: "🍔", budgeted: 550, spent: 525 },
      { name: "Transportation", icon: "🚗", budgeted: 200, spent: 185 },
      { name: "Entertainment", icon: "🎬", budgeted: 200, spent: 175 },
      { name: "Utilities", icon: "💡", budgeted: 150, spent: 95 },
    ],
  },
]

export function BudgetHistory() {
  const [viewType, setViewType] = useState("table")
  const [selectedMonth, setSelectedMonth] = useState(budgetHistory[budgetHistory.length - 1]?.month ?? "")

  const selectedMonthData = budgetHistory.find((item) => item.month === selectedMonth) ?? budgetHistory[0] ?? { month: "", label: "", totalBudget: 0, totalSpent: 0, categories: [] }
  const selectedMonthIndex = budgetHistory.findIndex((item) => item.month === selectedMonth)

  const handlePreviousMonth = () => {
    if (selectedMonthIndex > 0) {
      setSelectedMonth(budgetHistory[selectedMonthIndex - 1]?.month ?? "")
    }
  }

  const handleNextMonth = () => {
    if (selectedMonthIndex < budgetHistory.length - 1) {
      setSelectedMonth(budgetHistory[selectedMonthIndex + 1]?.month ?? "")
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
        <div>
          <CardTitle>Budget History</CardTitle>
          <CardDescription>Review and compare your past budget allocations</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center border rounded-md p-1">
            <Button
              variant={viewType === "table" ? "secondary" : "ghost"}
              size="sm"
              className="flex items-center gap-1"
              onClick={() => setViewType("table")}
            >
              <Calendar className="h-4 w-4" />
              <span className="sr-only sm:not-sr-only">Table</span>
            </Button>
            <Button
              variant={viewType === "chart" ? "secondary" : "ghost"}
              size="sm"
              className="flex items-center gap-1"
              onClick={() => setViewType("chart")}
            >
              <BarChart className="h-4 w-4" />
              <span className="sr-only sm:not-sr-only">Chart</span>
            </Button>
            <Button
              variant={viewType === "trend" ? "secondary" : "ghost"}
              size="sm"
              className="flex items-center gap-1"
              onClick={() => setViewType("trend")}
            >
              <LineChart className="h-4 w-4" />
              <span className="sr-only sm:not-sr-only">Trend</span>
            </Button>
          </div>

          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              {budgetHistory.map((item) => (
                <SelectItem key={item.month} value={item.month}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon">
            <DownloadIcon className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {viewType === "table" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Button variant="outline" size="sm" onClick={handlePreviousMonth} disabled={selectedMonthIndex === 0}>
                <ChevronLeftIcon className="h-4 w-4 mr-1" />
                Previous
              </Button>

              <h3 className="font-medium text-lg">{selectedMonthData.label}</h3>

              <Button
                variant="outline"
                size="sm"
                onClick={handleNextMonth}
                disabled={selectedMonthIndex === budgetHistory.length - 1}
              >
                Next
                <ChevronRightIcon className="h-4 w-4 ml-1" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Total Budget</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(selectedMonthData.totalBudget)}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Total Spent</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(selectedMonthData.totalSpent)}
                    <span className="text-sm font-normal text-muted-foreground ml-2">
                      ({((selectedMonthData.totalSpent / selectedMonthData.totalBudget) * 100).toFixed(1)}%)
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Budgeted</TableHead>
                    <TableHead className="text-right">Spent</TableHead>
                    <TableHead className="text-right">Difference</TableHead>
                    <TableHead className="text-right">% Used</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedMonthData.categories.map((category) => {
                    const difference = category.budgeted - category.spent
                    const percentUsed = (category.spent / category.budgeted) * 100

                    return (
                      <TableRow key={category.name}>
                        <TableCell>
                          <div className="flex items-center">
                            <span className="mr-2">{category.icon}</span>
                            <span>{category.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{formatCurrency(category.budgeted)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(category.spent)}</TableCell>
                        <TableCell className="text-right">
                          <span className={difference >= 0 ? "text-green-500" : "text-red-500"}>
                            {difference >= 0 ? "+" : ""}
                            {formatCurrency(difference)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span
                            className={
                              percentUsed > 100
                                ? "text-red-500"
                                : percentUsed >= 90
                                  ? "text-yellow-500"
                                  : "text-green-500"
                            }
                          >
                            {percentUsed.toFixed(1)}%
                          </span>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {viewType === "chart" && (
          <div className="h-[400px]">
            <BudgetHistoryChart data={selectedMonthData} />
          </div>
        )}

        {viewType === "trend" && (
          <div className="space-y-4">
            <div className="h-[400px]">
              <BudgetHistoryChart data={budgetHistory} type="trend" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {["Housing", "Food", "Transportation", "Entertainment"].map((category) => (
                <Card key={category}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">{category} Trend</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[100px]">
                    <BudgetHistoryChart data={budgetHistory} type="category" category={category} height={100} />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

