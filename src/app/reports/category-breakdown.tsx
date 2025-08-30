"use client"

import type { DateRange } from "react-day-picker"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Cell, Legend, Pie, PieChart, ResponsiveContainer } from "recharts"
import { formatCurrency } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"

interface CategoryBreakdownProps {
  dateRange: DateRange | undefined
  selectedCategories: string[]
  detailed?: boolean
}

export function CategoryBreakdown({ dateRange, selectedCategories, detailed = false }: CategoryBreakdownProps) {
  // In a real app, you would fetch this data based on the date range and selected categories
  // This is mock data for demonstration
  const categoryData = [
    { id: "1", name: "Housing", value: 1800, icon: "🏠", color: "#FF6384" },
    { id: "2", name: "Food & Dining", value: 950, icon: "🍔", color: "#36A2EB" },
    { id: "3", name: "Transportation", value: 450, icon: "🚗", color: "#FFCE56" },
    { id: "4", name: "Entertainment", value: 380, icon: "🎬", color: "#4BC0C0" },
    { id: "5", name: "Shopping", value: 620, icon: "🛍️", color: "#9966FF" },
    { id: "6", name: "Utilities", value: 320, icon: "💡", color: "#FF9F40" },
    { id: "7", name: "Healthcare", value: 280, icon: "🏥", color: "#C9CBCF" },
    { id: "8", name: "Travel", value: 520, icon: "✈️", color: "#7BC043" },
  ].filter((category) => selectedCategories.length === 0 || selectedCategories.includes(category.id))

  const totalExpenses = categoryData.reduce((sum, category) => sum + category.value, 0)

  if (detailed) {
    return (
      <div className="space-y-6 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-[300px] w-full">
            <ChartContainer
              config={Object.fromEntries(
                categoryData.map((category) => [
                  category.name.toLowerCase().replace(/\s+/g, "_"),
                  {
                    label: category.name,
                    color: category.color,
                  },
                ]),
              )}
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} name={entry.name} />
                    ))}
                  </Pie>
                  <ChartTooltip
                    content={<ChartTooltipContent formatter={(value) => formatCurrency(Number(value))} />}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">Category Breakdown</h3>
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-4">
                {categoryData.map((category) => (
                  <div key={category.id} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span>{category.icon}</span>
                        <span className="font-medium">{category.name}</span>
                      </div>
                      <div className="text-sm font-medium">
                        {formatCurrency(category.value)} ({Math.round((category.value / totalExpenses) * 100)}%)
                      </div>
                    </div>
                    <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
                      <div 
                        className="h-full transition-all rounded-full"
                        style={{
                          width: `${(category.value / totalExpenses) * 100}%`,
                          backgroundColor: category.color
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Spending Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Largest Expense</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🏠</span>
                  <div>
                    <div className="font-bold">Housing</div>
                    <div className="text-sm text-muted-foreground">{formatCurrency(1800)} (33.8% of total)</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Fastest Growing</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🎬</span>
                  <div>
                    <div className="font-bold">Entertainment</div>
                    <div className="text-sm text-muted-foreground">28.4% increase from last period</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Category Breakdown</CardTitle>
        <CardDescription>Where your money is going</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="h-[300px] w-full">
          <ChartContainer
          config={Object.fromEntries(
            categoryData.map((category) => [
              category.name.toLowerCase().replace(/\s+/g, "_"),
              {
                label: category.name,
                color: category.color,
              },
            ]),
          )}
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} name={entry.name} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent formatter={(value) => formatCurrency(Number(value))} />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
        </div>
      </CardContent>
    </Card>
  )
}

