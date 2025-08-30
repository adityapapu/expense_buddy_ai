"use client"

import {
  ArrowDownIcon,
  ArrowUpIcon,
  CalendarIcon,
  CreditCardIcon,
  DollarSignIcon,
  TrendingUpIcon,
  WalletIcon,
} from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatCurrency } from "@/lib/utils"

// This would typically come from an API or database
const summaryData = {
  income: {
    total: 4250.0,
    change: 12.5,
    period: "This Month",
  },
  expenses: {
    total: 1823.75,
    change: -8.3,
    period: "This Month",
  },
  budget: {
    used: 65,
    spent: 1250,
    total: 2000,
    period: "This Month",
  },
  upcomingPayments: [
    {
      id: "1",
      name: "Rent",
      dueDate: "2023-05-15",
      amount: 1200,
      category: "Housing",
      status: "upcoming",
      recurring: true,
      frequency: "monthly",
    },
    {
      id: "2",
      name: "Internet Bill",
      dueDate: "2023-05-18",
      amount: 59.99,
      category: "Utilities",
      status: "upcoming",
      recurring: true,
      frequency: "monthly",
    },
    {
      id: "3",
      name: "Gym Membership",
      dueDate: "2023-05-20",
      amount: 45.0,
      category: "Health",
      status: "upcoming",
      recurring: true,
      frequency: "monthly",
    },
  ],
}

export function DashboardSummaryCards() {
  const [upcomingPaymentsDialogOpen, setUpcomingPaymentsDialogOpen] = useState(false)
  const [netBalanceDialogOpen, setNetBalanceDialogOpen] = useState(false)

  const getBudgetColor = (percentage: number) => {
    if (percentage < 70) return "bg-green-500"
    if (percentage < 90) return "bg-yellow-500"
    return "bg-red-500"
  }

  // Calculate net balance
  const netBalance = summaryData.income.total - summaryData.expenses.total
  const netBalancePercentage = (netBalance / summaryData.income.total) * 100

  // Format the due date to a more readable format
  const formatDueDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (date.toDateString() === today.toDateString()) {
      return "Today"
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow"
    } else {
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    }
  }

  // Calculate total upcoming payments
  const totalUpcoming = summaryData.upcomingPayments.reduce((sum, payment) => sum + payment.amount, 0)

  return (
    <>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
        {/* Income Summary Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Income</CardTitle>
            <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${summaryData.income.total.toLocaleString()}</div>
            <div className="flex items-center pt-1">
              {summaryData.income.change > 0 ? (
                <ArrowUpIcon className="mr-1 h-4 w-4 text-green-500" />
              ) : (
                <ArrowDownIcon className="mr-1 h-4 w-4 text-red-500" />
              )}
              <span className={`text-xs ${summaryData.income.change > 0 ? "text-green-500" : "text-red-500"}`}>
                {Math.abs(summaryData.income.change)}%
              </span>
              <span className="text-xs text-muted-foreground ml-1">from last period</span>
            </div>
            <div className="mt-3 h-[40px] w-full bg-muted rounded-md overflow-hidden">
              {/* Placeholder for sparkline chart */}
              <div className="h-full w-full bg-gradient-to-r from-green-100 to-green-500 opacity-20"></div>
            </div>
          </CardContent>
          <CardFooter className="p-2">
            <span className="text-xs text-muted-foreground">{summaryData.income.period}</span>
          </CardFooter>
        </Card>

        {/* Expense Summary Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expenses</CardTitle>
            <CreditCardIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${summaryData.expenses.total.toLocaleString()}</div>
            <div className="flex items-center pt-1">
              {summaryData.expenses.change > 0 ? (
                <ArrowUpIcon className="mr-1 h-4 w-4 text-red-500" />
              ) : (
                <ArrowDownIcon className="mr-1 h-4 w-4 text-green-500" />
              )}
              <span className={`text-xs ${summaryData.expenses.change > 0 ? "text-red-500" : "text-green-500"}`}>
                {Math.abs(summaryData.expenses.change)}%
              </span>
              <span className="text-xs text-muted-foreground ml-1">from last period</span>
            </div>
            <div className="mt-3 h-[40px] w-full bg-muted rounded-md overflow-hidden">
              {/* Placeholder for sparkline chart */}
              <div className="h-full w-full bg-gradient-to-r from-red-100 to-red-500 opacity-20"></div>
            </div>
          </CardContent>
          <CardFooter className="p-2">
            <span className="text-xs text-muted-foreground">{summaryData.expenses.period}</span>
          </CardFooter>
        </Card>

        {/* Budget Summary Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Status</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center">
            <div className="relative h-24 w-24">
              <svg className="h-24 w-24" viewBox="0 0 100 100">
                <circle
                  className="text-muted stroke-current"
                  strokeWidth="10"
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                ></circle>
                <circle
                  className={`stroke-current ${getBudgetColor(summaryData.budget.used)}`}
                  strokeWidth="10"
                  strokeLinecap="round"
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  strokeDasharray={`${summaryData.budget.used * 2.51} 251.2`}
                  transform="rotate(-90 50 50)"
                ></circle>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold">{summaryData.budget.used}%</span>
              </div>
            </div>
            <div className="mt-2 text-center">
              <div className="text-sm font-medium">
                ${summaryData.budget.spent.toLocaleString()} of ${summaryData.budget.total.toLocaleString()}
              </div>
            </div>
          </CardContent>
          <CardFooter className="p-2">
            <span className="text-xs text-muted-foreground">{summaryData.budget.period}</span>
          </CardFooter>
        </Card>

        {/* Upcoming Payments Card */}
        <Card
          className="cursor-pointer hover:bg-accent/50 transition-colors"
          onClick={() => setUpcomingPaymentsDialogOpen(true)}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Payments</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {summaryData.upcomingPayments.slice(0, 2).map((payment) => (
                <div key={payment.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-xs">{payment.category.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium leading-none">{payment.name}</p>
                      <p className="text-xs text-muted-foreground">{formatDueDate(payment.dueDate)}</p>
                    </div>
                  </div>
                  <div className="text-sm font-medium">${payment.amount}</div>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total upcoming</span>
                <span className="text-sm font-bold">${totalUpcoming}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="p-2 flex justify-center">
            <span className="text-xs text-primary">Click to view all</span>
          </CardFooter>
        </Card>

        {/* Net Balance Summary Card */}
        <Card
          className="cursor-pointer hover:bg-accent/50 transition-colors"
          onClick={() => setNetBalanceDialogOpen(true)}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
            <WalletIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netBalance >= 0 ? "text-green-500" : "text-red-500"}`}>
              {formatCurrency(netBalance)}
            </div>
            <div className="flex items-center pt-1">
              <TrendingUpIcon className="mr-1 h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{netBalancePercentage.toFixed(1)}% of income</span>
            </div>
            <div className="mt-3 space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span>Income</span>
                <span className="font-medium">{formatCurrency(summaryData.income.total)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span>Expenses</span>
                <span className="font-medium">{formatCurrency(summaryData.expenses.total)}</span>
              </div>
              <Progress
                value={netBalancePercentage}
                className="h-2"
                indicatorClassName={netBalance >= 0 ? "bg-green-500" : "bg-red-500"}
              />
            </div>
          </CardContent>
          <CardFooter className="p-2 flex justify-center">
            <span className="text-xs text-primary">Click for details</span>
          </CardFooter>
        </Card>
      </div>

      {/* Upcoming Payments Dialog */}
      <Dialog open={upcomingPaymentsDialogOpen} onOpenChange={setUpcomingPaymentsDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Upcoming Payments</DialogTitle>
            <DialogDescription>View and manage all your upcoming payments and recurring expenses.</DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="upcoming" className="flex-1 overflow-hidden flex flex-col">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="recurring">Recurring</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="flex-1 overflow-auto">
              <div className="space-y-4 p-2">
                {summaryData.upcomingPayments.map((payment) => (
                  <Card key={payment.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                            <span>{payment.category.charAt(0)}</span>
                          </div>
                          <div>
                            <h4 className="font-medium">{payment.name}</h4>
                            <p className="text-sm text-muted-foreground">{payment.category}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">${payment.amount}</p>
                          <p className="text-sm text-muted-foreground">{formatDueDate(payment.dueDate)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="recurring" className="flex-1 overflow-auto">
              <div className="p-4 text-center text-muted-foreground">Recurring payments will be shown here.</div>
            </TabsContent>

            <TabsContent value="history" className="flex-1 overflow-auto">
              <div className="p-4 text-center text-muted-foreground">Payment history will be shown here.</div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Net Balance Dialog */}
      <Dialog open={netBalanceDialogOpen} onOpenChange={setNetBalanceDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Net Balance Details</DialogTitle>
            <DialogDescription>Detailed breakdown of your income and expenses.</DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="summary" className="flex-1 overflow-hidden flex flex-col">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="income">Income</TabsTrigger>
              <TabsTrigger value="expenses">Expenses</TabsTrigger>
            </TabsList>

            <TabsContent value="summary" className="flex-1 overflow-auto">
              <div className="space-y-6 p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Income</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-500">
                        {formatCurrency(summaryData.income.total)}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Expenses</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-500">
                        {formatCurrency(summaryData.expenses.total)}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Net Balance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className={`text-2xl font-bold ${netBalance >= 0 ? "text-green-500" : "text-red-500"}`}>
                        {formatCurrency(netBalance)}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Balance Trend</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[300px] flex items-center justify-center">
                    <div className="text-muted-foreground">Balance trend chart will be displayed here.</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Savings Potential</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>Current Savings Rate</span>
                        <span className="font-medium">{netBalancePercentage.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Recommended Savings Rate</span>
                        <span className="font-medium">20.0%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Potential Monthly Savings</span>
                        <span className="font-medium">{formatCurrency(netBalance)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Projected Annual Savings</span>
                        <span className="font-medium">{formatCurrency(netBalance * 12)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="income" className="flex-1 overflow-auto">
              <div className="p-4 text-center text-muted-foreground">Detailed income breakdown will be shown here.</div>
            </TabsContent>

            <TabsContent value="expenses" className="flex-1 overflow-auto">
              <div className="p-4 text-center text-muted-foreground">
                Detailed expense breakdown will be shown here.
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  )
}

