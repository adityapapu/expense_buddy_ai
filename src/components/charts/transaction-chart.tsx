"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PieChart, BarChart3, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { CategoryPieChart } from "./category-pie-chart"
import { CategoryBarChart } from "./category-bar-chart"
import { CategoryBreakdown } from "./category-breakdown"
import { formatCurrency } from "@/lib/utils"
import { Button } from "@/components/ui/button"

// This would typically come from an API or database
const transactionData = [
  {
    id: "1",
    date: "2023-05-01",
    description: "Grocery Shopping",
    category: "Food",
    amount: 120.5,
  },
  {
    id: "2",
    date: "2023-05-03",
    description: "Restaurant Dinner",
    category: "Food",
    amount: 85.75,
  },
  {
    id: "3",
    date: "2023-05-05",
    description: "Grocery Shopping",
    category: "Food",
    amount: 95.25,
  },
  {
    id: "4",
    date: "2023-05-04",
    description: "Uber Ride",
    category: "Transportation",
    amount: 24.99,
  },
  {
    id: "5",
    date: "2023-05-10",
    description: "Gas Station",
    category: "Transportation",
    amount: 45.5,
  },
  {
    id: "6",
    date: "2023-05-15",
    description: "Monthly Rent",
    category: "Housing",
    amount: 1200.0,
  },
  {
    id: "7",
    date: "2023-05-05",
    description: "Netflix Subscription",
    category: "Entertainment",
    amount: 14.99,
  },
  {
    id: "8",
    date: "2023-05-12",
    description: "Movie Tickets",
    category: "Entertainment",
    amount: 32.5,
  },
  {
    id: "9",
    date: "2023-05-18",
    description: "Concert Tickets",
    category: "Entertainment",
    amount: 120.0,
  },
  {
    id: "10",
    date: "2023-05-20",
    description: "Electricity Bill",
    category: "Utilities",
    amount: 95.5,
  },
  {
    id: "11",
    date: "2023-05-22",
    description: "Water Bill",
    category: "Utilities",
    amount: 45.75,
  },
  {
    id: "12",
    date: "2023-05-25",
    description: "Internet Bill",
    category: "Utilities",
    amount: 59.99,
  },
  {
    id: "13",
    date: "2023-05-08",
    description: "Gym Membership",
    category: "Health",
    amount: 45.0,
  },
  {
    id: "14",
    date: "2023-05-16",
    description: "Pharmacy",
    category: "Health",
    amount: 35.25,
  },
  {
    id: "15",
    date: "2023-04-30",
    description: "Clothing Store",
    category: "Shopping",
    amount: 125.75,
  },
]

// Previous month data for comparison
const previousMonthTotal = 1850.75

// Define category colors
export const categoryColors: Record<string, string> = {
  Food: "#FF6384",
  Transportation: "#36A2EB",
  Housing: "#FFCE56",
  Entertainment: "#4BC0C0",
  Utilities: "#9966FF",
  Health: "#FF9F40",
  Shopping: "#8AC926",
  Other: "#C9C9C9",
}

export function TransactionChart() {
  const [period, setPeriod] = useState("month")
  const [chartType, setChartType] = useState("pie")

  // Process transaction data to get category totals
  const { totalSpent, categoryData, percentageChange } = useMemo(() => {
    // Group transactions by category and sum amounts
    const categoryMap = transactionData.reduce(
      (acc, transaction) => {
        const category = transaction.category || "Other"
        if (!acc[category]) {
          acc[category] = 0
        }
        acc[category] += transaction.amount
        return acc
      },
      {} as Record<string, number>,
    )

    // Calculate total spent
    const total = Object.values(categoryMap).reduce((sum, amount) => sum + amount, 0)

    // Format data for charts
    const data = Object.entries(categoryMap).map(([category, amount]) => ({
      category,
      amount,
      percentage: (amount / total) * 100,
      color: categoryColors[category] ?? categoryColors.Other ?? "#C9C9C9",
    }))

    // Sort by amount (highest first)
    data.sort((a, b) => b.amount - a.amount)

    // Calculate percentage change from previous period
    const percentChange = ((total - previousMonthTotal) / previousMonthTotal) * 100

    return {
      totalSpent: total,
      categoryData: data,
      percentageChange: percentChange,
    }
  }, [])

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0 pb-2">
        <div>
          <CardTitle>Spending by Category</CardTitle>
          <CardDescription>Analyze your spending patterns across different categories</CardDescription>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center border rounded-md p-1">
            <Button
              variant={chartType === "pie" ? "secondary" : "ghost"}
              size="sm"
              className="flex items-center gap-1"
              onClick={() => setChartType("pie")}
            >
              <PieChart className="h-4 w-4" />
              <span>Pie</span>
            </Button>
            <Button
              variant={chartType === "bar" ? "secondary" : "ghost"}
              size="sm"
              className="flex items-center gap-1"
              onClick={() => setChartType("bar")}
            >
              <BarChart3 className="h-4 w-4" />
              <span>Bar</span>
            </Button>
          </div>

          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Spent</p>
                <h3 className="text-2xl font-bold">{formatCurrency(totalSpent)}</h3>
              </div>
              <div className="flex items-center space-x-1">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <div className={`flex items-center ${percentageChange >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {percentageChange >= 0 ? (
                    <ArrowUpRight className="h-4 w-4" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4" />
                  )}
                  <span className="text-sm font-medium">{Math.abs(percentageChange).toFixed(1)}%</span>
                </div>
                <span className="text-xs text-muted-foreground">vs last {period}</span>
              </div>
            </div>

            <div className="h-[250px] sm:h-[300px] w-full">
              <Tabs value={chartType} onValueChange={setChartType} className="h-full">
                <TabsContent value="pie" className="h-full mt-0">
                  <CategoryPieChart data={categoryData} />
                </TabsContent>
                <TabsContent value="bar" className="h-full mt-0">
                  <CategoryBarChart data={categoryData} />
                </TabsContent>
              </Tabs>
            </div>
          </div>

          <div>
            <CategoryBreakdown data={categoryData} totalSpent={totalSpent} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

