"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { formatCurrency } from "@/lib/utils"
import { Loader2 } from "lucide-react"
import type { DateRange } from "react-day-picker"
import { getIncomeExpenseChartData, type IncomeExpenseChartData } from "@/lib/actions/analytics"

interface IncomeExpenseChartProps {
  dateRange?: DateRange
}

export function IncomeExpenseChart({ dateRange }: IncomeExpenseChartProps) {
  const [chartData, setChartData] = useState<IncomeExpenseChartData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch chart data when dateRange changes
  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await getIncomeExpenseChartData(dateRange)
        setChartData(data)
      } catch (err) {
        console.error("Failed to fetch income expense chart data:", err)
        setError("Failed to load chart data")
        setChartData([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchChartData()
  }, [dateRange])

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Income vs Expenses</CardTitle>
        <CardDescription>Compare your income and expenses over time</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        {isLoading ? (
          <div className="h-[300px] w-full flex items-center justify-center">
            <div className="flex items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Loading chart data...</span>
            </div>
          </div>
        ) : error ? (
          <div className="h-[300px] w-full flex items-center justify-center">
            <p className="text-muted-foreground text-center">{error}</p>
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-[300px] w-full flex items-center justify-center">
            <p className="text-muted-foreground text-center">No data available for the selected period</p>
          </div>
        ) : (
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
                  <YAxis tickFormatter={(value) => `${value / 1000}k`} />
                  <ChartTooltip content={<ChartTooltipContent formatter={(value) => formatCurrency(Number(value))} />} />
                  <Legend />
                  <Bar dataKey="income" name="Income" fill="var(--color-income)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" name="Expenses" fill="var(--color-expenses)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}