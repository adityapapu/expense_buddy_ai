"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { BellIcon, DollarSignIcon, TrendingDownIcon } from "lucide-react"
import { BudgetAllocationChart } from "./budget-allocation-chart"
import { BudgetSpendingTrend } from "./budget-spending-trend"
import { formatCurrency } from "@/lib/utils"
import { getBudgetSummary, type BudgetSummary } from "@/lib/actions/budgets"

export function BudgetOverview() {
  const [activeTab, setActiveTab] = useState("overview")
  const [budgetSummary, setBudgetSummary] = useState<BudgetSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBudgetSummary = async () => {
      try {
        setLoading(true)
        const data = await getBudgetSummary()
        setBudgetSummary(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load budget summary")
      } finally {
        setLoading(false)
      }
    }

    fetchBudgetSummary()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Budget Overview</CardTitle>
          <CardDescription>Loading budget data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-20 bg-muted animate-pulse rounded"></div>
            <div className="h-32 bg-muted animate-pulse rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Budget Overview</CardTitle>
          <CardDescription>Error loading budget data</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (!budgetSummary) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Budget Overview</CardTitle>
          <CardDescription>No budget data available</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Create your first budget to see spending analysis.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget Overview</CardTitle>
        <CardDescription>Track your spending against your budget allocations</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="allocation">Allocation</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Budgeted</CardTitle>
                  <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(budgetSummary.totalBudgeted)}</div>
                  <p className="text-xs text-muted-foreground">for current period</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                  <TrendingDownIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(budgetSummary.totalSpent)}</div>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(budgetSummary.totalBudgeted - budgetSummary.totalSpent)} remaining
                  </p>
                </CardContent>
              </Card>

              <Card className="col-span-1 md:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Budget Progress</CardTitle>
                  <div className="text-sm font-medium">{budgetSummary.percentageUsed}%</div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Progress
                    value={budgetSummary.percentageUsed}
                    className="h-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <div>{formatCurrency(budgetSummary.totalSpent)} spent</div>
                    <div>{budgetSummary.remainingDays} days remaining</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {budgetSummary.overBudgetCategories.length > 0 && (
              <Alert variant="destructive">
                <BellIcon className="h-4 w-4" />
                <AlertTitle>Budget Alert</AlertTitle>
                <AlertDescription>
                  You&apos;ve exceeded your budget in {budgetSummary.overBudgetCategories.length} categories:
                  <ul className="mt-2 space-y-1">
                    {budgetSummary.overBudgetCategories.map((category) => (
                      <li key={category.name} className="text-sm">
                        {category.name}: {formatCurrency(category.spent)} of {formatCurrency(category.budgeted)} (
                        {category.percentage}%)
                      </li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {budgetSummary.nearLimitCategories.length > 0 && (
              <Alert>
                <BellIcon className="h-4 w-4" />
                <AlertTitle>Budget Warning</AlertTitle>
                <AlertDescription>
                  You&apos;re approaching your budget limit in {budgetSummary.nearLimitCategories.length} categories:
                  <ul className="mt-2 space-y-1">
                    {budgetSummary.nearLimitCategories.map((category) => (
                      <li key={category.name} className="text-sm">
                        {category.name}: {formatCurrency(category.spent)} of {formatCurrency(category.budgeted)} (
                        {category.percentage}%)
                      </li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="allocation">
            <div className="h-[400px]">
              <BudgetAllocationChart />
            </div>
          </TabsContent>

          <TabsContent value="trends">
            <div className="h-[400px]">
              <BudgetSpendingTrend />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

