"use client"

import type { DateRange } from "react-day-picker"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { formatCurrency } from "@/lib/utils"

interface IncomeExpenseChartProps {
  dateRange: DateRange | undefined
}

export function IncomeExpenseChart({ dateRange }: IncomeExpenseChartProps) {
  // In a real app, you would fetch this data based on the date range
  // This is mock data for demonstration
  const chartData = [
    { month: "Jan", income: 7500, expenses: 5100 },
    { month: "Feb", income: 8200, expenses: 5400 },
    { month: "Mar", income: 8750, expenses: 5320 },
    { month: "Apr", income: 8750, expenses: 5600 },
    { month: "May", income: 9100, expenses: 5800 },
    { month: "Jun", income: 9100, expenses: 6200 },
  ]

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Income vs Expenses</CardTitle>
        <CardDescription>Compare your income and expenses over time</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="h-[300px] w-full">
          <ChartContainer
          config={{
            income: {
              label: "Income",
              color: "hsl(142, 76%, 36%)",
            },
            expenses: {
              label: "Expenses",
              color: "hsl(346, 87%, 43%)",
            },
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `$${value / 1000}k`} />
              <ChartTooltip content={<ChartTooltipContent formatter={(value) => formatCurrency(Number(value))} />} />
              <Legend />
              <Bar dataKey="income" name="Income" fill="var(--color-income)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" name="Expenses" fill="var(--color-expenses)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
        </div>
      </CardContent>
    </Card>
  )
}

