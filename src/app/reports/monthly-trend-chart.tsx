"use client"

import type { DateRange } from "react-day-picker"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Area, AreaChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { formatCurrency } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface MonthlyTrendChartProps {
  dateRange: DateRange | undefined
  selectedCategories: string[]
}

export function MonthlyTrendChart({ dateRange, selectedCategories }: MonthlyTrendChartProps) {
  // In a real app, you would fetch this data based on the date range and selected categories
  // This is mock data for demonstration
  const monthlyData = [
    {
      month: "Jan",
      total: 5100,
      housing: 1800,
      food: 850,
      transportation: 400,
      entertainment: 300,
      shopping: 550,
      utilities: 300,
      healthcare: 250,
      travel: 450,
    },
    {
      month: "Feb",
      total: 5400,
      housing: 1800,
      food: 900,
      transportation: 420,
      entertainment: 320,
      shopping: 600,
      utilities: 310,
      healthcare: 250,
      travel: 500,
    },
    {
      month: "Mar",
      total: 5320,
      housing: 1800,
      food: 950,
      transportation: 450,
      entertainment: 380,
      shopping: 620,
      utilities: 320,
      healthcare: 280,
      travel: 520,
    },
    {
      month: "Apr",
      total: 5600,
      housing: 1850,
      food: 980,
      transportation: 460,
      entertainment: 420,
      shopping: 650,
      utilities: 330,
      healthcare: 290,
      travel: 620,
    },
    {
      month: "May",
      total: 5800,
      housing: 1850,
      food: 1000,
      transportation: 480,
      entertainment: 450,
      shopping: 680,
      utilities: 340,
      healthcare: 300,
      travel: 700,
    },
    {
      month: "Jun",
      total: 6200,
      housing: 1900,
      food: 1050,
      transportation: 500,
      entertainment: 480,
      shopping: 720,
      utilities: 350,
      healthcare: 320,
      travel: 880,
    },
  ]

  // Filter categories based on selection
  const filteredCategories = [
    { id: "1", name: "Housing", key: "housing", color: "#FF6384" },
    { id: "2", name: "Food & Dining", key: "food", color: "#36A2EB" },
    { id: "3", name: "Transportation", key: "transportation", color: "#FFCE56" },
    { id: "4", name: "Entertainment", key: "entertainment", color: "#4BC0C0" },
    { id: "5", name: "Shopping", key: "shopping", color: "#9966FF" },
    { id: "6", name: "Utilities", key: "utilities", color: "#FF9F40" },
    { id: "7", name: "Healthcare", key: "healthcare", color: "#C9CBCF" },
    { id: "8", name: "Travel", key: "travel", color: "#7BC043" },
  ].filter((category) => selectedCategories.length === 0 || selectedCategories.includes(category.id))

  return (
    <div className="space-y-6">
      <Tabs defaultValue="line">
        <TabsList>
          <TabsTrigger value="line">Line Chart</TabsTrigger>
          <TabsTrigger value="area">Area Chart</TabsTrigger>
        </TabsList>

        <TabsContent value="line" className="mt-4">
          <div className="h-[400px] w-full">
            <ChartContainer
            config={Object.fromEntries(
              filteredCategories.map((category) => [
                category.key,
                {
                  label: category.name,
                  color: category.color,
                },
              ]),
            )}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `$${value / 1000}k`} />
                <ChartTooltip content={<ChartTooltipContent formatter={(value) => formatCurrency(Number(value))} />} />
                <Legend />
                {filteredCategories.length === 0 && (
                  <Line type="monotone" dataKey="total" name="Total Expenses" stroke="#8884d8" activeDot={{ r: 8 }} />
                )}
                {filteredCategories.map((category) => (
                  <Line
                    key={category.id}
                    type="monotone"
                    dataKey={category.key}
                    name={category.name}
                    stroke={category.color}
                    activeDot={{ r: 8 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
          </div>
        </TabsContent>

        <TabsContent value="area" className="mt-4">
          <div className="h-[400px] w-full">
            <ChartContainer
            config={Object.fromEntries(
              filteredCategories.map((category) => [
                category.key,
                {
                  label: category.name,
                  color: category.color,
                },
              ]),
            )}
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `$${value / 1000}k`} />
                <ChartTooltip content={<ChartTooltipContent formatter={(value) => formatCurrency(Number(value))} />} />
                <Legend />
                {filteredCategories.length === 0 && (
                  <Area
                    type="monotone"
                    dataKey="total"
                    name="Total Expenses"
                    fill="#8884d8"
                    fillOpacity={0.3}
                    stroke="#8884d8"
                  />
                )}
                {filteredCategories.map((category) => (
                  <Area
                    key={category.id}
                    type="monotone"
                    dataKey={category.key}
                    name={category.name}
                    fill={category.color}
                    fillOpacity={0.3}
                    stroke={category.color}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
          </div>
        </TabsContent>
      </Tabs>

      <div className="text-sm text-muted-foreground">
        <p>
          This chart shows your spending trends over time. You can toggle between line and area views, and filter by
          specific categories using the filters above.
        </p>
      </div>
    </div>
  )
}

