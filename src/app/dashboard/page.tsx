import { CalendarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { TransactionsTable } from "./transactions-table"
import { SummaryCards } from "./summary-cards"
import { QuickActions } from "./quick-actions"
import { UpcomingPaymentsCard } from "@/components/upcoming-payments/upcoming-payments-card"

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-4 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <CalendarIcon className="mr-2 h-4 w-4" />
            This Month
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        <div className="md:col-span-2 lg:col-span-3">
          <SummaryCards />
        </div>
        <div className="md:col-span-1 lg:col-span-1">
          <UpcomingPaymentsCard />
        </div>
      </div>

      <QuickActions />

      <div className="grid gap-4 md:grid-cols-7 lg:grid-cols-12">
        <Card className="md:col-span-7 lg:col-span-12">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Your recent financial activity</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                Filter
              </Button>
              <Button variant="outline" size="sm">
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <TransactionsTable />
          </CardContent>
          <CardFooter className="flex justify-center border-t p-4">
            <Button variant="outline" size="sm">
              View All Transactions
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

