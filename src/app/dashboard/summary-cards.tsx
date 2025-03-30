"use client"

import { Button } from "@/components/ui/button"

import { ArrowDownIcon, ArrowUpIcon, CalendarIcon, CreditCardIcon, DollarSignIcon } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

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
      name: "Rent",
      dueDate: "Tomorrow",
      amount: 1200,
      category: "Housing",
    },
    {
      name: "Internet Bill",
      dueDate: "May 15",
      amount: 59.99,
      category: "Utilities",
    },
    {
      name: "Gym Membership",
      dueDate: "May 20",
      amount: 45.0,
      category: "Health",
    },
  ],
}

export function SummaryCards() {
  const getBudgetColor = (percentage: number) => {
    if (percentage < 70) return "bg-green-500"
    if (percentage < 90) return "bg-yellow-500"
    return "bg-red-500"
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Upcoming Payments</CardTitle>
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {summaryData.upcomingPayments.map((payment, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-xs">{payment.category.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium leading-none">{payment.name}</p>
                    <p className="text-xs text-muted-foreground">{payment.dueDate}</p>
                  </div>
                </div>
                <div className="text-sm font-medium">${payment.amount}</div>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="p-2">
          <Button variant="ghost" size="sm" className="w-full">
            View All
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

