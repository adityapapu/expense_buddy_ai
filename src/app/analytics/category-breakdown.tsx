"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Cell, Legend, Pie, PieChart, ResponsiveContainer } from "recharts"
import { formatCurrency } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2 } from "lucide-react"
import type { DateRange } from "react-day-picker"
import { getCategoryBreakdownData, type CategoryBreakdownData as CategoryBreakdownDataType } from "@/lib/actions/analytics"

interface CategoryBreakdownProps {
  selectedCategories: string[]
  detailed?: boolean
  dateRange?: DateRange
}

export function CategoryBreakdown({ selectedCategories, detailed = false, dateRange }: CategoryBreakdownProps) {
  const [categoryData, setCategoryData] = useState<CategoryBreakdownDataType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch category breakdown data when dateRange or selectedCategories change
  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await getCategoryBreakdownData(dateRange, selectedCategories)
        setCategoryData(data)
      } catch (err) {
        console.error("Failed to fetch category breakdown data:", err)
        setError("Failed to load category data")
        setCategoryData([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategoryData()
  }, [dateRange, selectedCategories])

  const totalExpenses = categoryData.reduce((sum, category) => sum + category.value, 0)

  if (detailed) {
    if (isLoading) {
      return (
        <div className="space-y-6 p-6">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading category breakdown...</span>
          </div>
        </div>
      )
    }

    if (error) {
      return (
        <div className="space-y-6 p-6">
          <div className="text-center py-12">
            <p className="text-muted-foreground">{error}</p>
          </div>
        </div>
      )
    }

    if (categoryData.length === 0) {
      return (
        <div className="space-y-6 p-6">
          <div className="text-center py-12">
            <p className="text-muted-foreground">No expense data available for the selected period</p>
          </div>
        </div>
      )
    }

    const largestCategory = categoryData.reduce((max, category) =>
      category.value > max.value ? category : max, categoryData[0]
    )

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
                        {formatCurrency(category.value)} ({Math.round(category.percentage)}%)
                      </div>
                    </div>
                    <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full transition-all rounded-full"
                        style={{
                          width: `${category.percentage}%`,
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
                  <span className="text-2xl">{largestCategory.icon}</span>
                  <div>
                    <div className="font-bold">{largestCategory.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatCurrency(largestCategory.value)} ({Math.round(largestCategory.percentage)}% of total)
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Total Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">💰</span>
                  <div>
                    <div className="font-bold">{formatCurrency(totalExpenses)}</div>
                    <div className="text-sm text-muted-foreground">Across all categories</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Category Breakdown</CardTitle>
          <CardDescription>Where your money is going</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-[300px] w-full flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Category Breakdown</CardTitle>
          <CardDescription>Where your money is going</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-[300px] w-full flex items-center justify-center">
            <p className="text-muted-foreground text-center">{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (categoryData.length === 0) {
    return (
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Category Breakdown</CardTitle>
          <CardDescription>Where your money is going</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-[300px] w-full flex items-center justify-center">
            <p className="text-muted-foreground text-center">No expense data available</p>
          </div>
        </CardContent>
      </Card>
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