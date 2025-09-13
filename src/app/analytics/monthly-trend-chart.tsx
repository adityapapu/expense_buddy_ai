"use client"

import { useState, useEffect } from "react"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Area, AreaChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { formatCurrency } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2 } from "lucide-react"
import type { DateRange } from "react-day-picker"
import { getUserCategories, type CategoryData, getMonthlyTrendData, type MonthlyTrendData } from "@/lib/actions/analytics"

interface MonthlyTrendChartProps {
  selectedCategories: string[]
  dateRange?: DateRange
}

export function MonthlyTrendChart({ selectedCategories, dateRange }: MonthlyTrendChartProps) {
  const [monthlyData, setMonthlyData] = useState<MonthlyTrendData[]>([])
  const [categories, setCategories] = useState<CategoryData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch categories and monthly trend data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Fetch categories and monthly trend data in parallel
        const [categoriesData, trendData] = await Promise.all([
          getUserCategories(),
          getMonthlyTrendData(dateRange, selectedCategories)
        ])

        setCategories(categoriesData)
        setMonthlyData(trendData)
      } catch (err) {
        console.error("Failed to fetch monthly trend data:", err)
        setError("Failed to load trend data")
        setCategories([])
        setMonthlyData([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [dateRange, selectedCategories])

  // Transform categories to the expected format for the chart
  const filteredCategories = categories
    .map((category, index) => ({
      id: category.id,
      name: category.name,
      key: category.name.toLowerCase().replace(/\s+/g, ""),
      color: `hsl(${(index * 137.5) % 360}, 70%, 50%)`, // Generate distinct colors
    }))
    .filter((category) => selectedCategories.length === 0 || selectedCategories.includes(category.id))

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading trend data...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  if (monthlyData.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">No trend data available for the selected period</p>
        </div>
      </div>
    )
  }

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