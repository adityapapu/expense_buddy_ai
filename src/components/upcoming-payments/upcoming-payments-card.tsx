"use client"

import { useState } from "react"
import { CalendarIcon, ChevronRightIcon } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UpcomingPaymentsDialog } from "./upcoming-payments-dialog"
import { formatCurrency } from "@/lib/utils"

// This would typically come from an API or database
const upcomingPaymentsSummary = [
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
]

export function UpcomingPaymentsCard() {
  const [dialogOpen, setDialogOpen] = useState(false)

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
  const totalUpcoming = upcomingPaymentsSummary.reduce((sum, payment) => sum + payment.amount, 0)

  return (
    <>
      <Card className="h-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Upcoming Payments</CardTitle>
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {upcomingPaymentsSummary.map((payment) => (
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
                <div className="text-sm font-medium">{formatCurrency(payment.amount)}</div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Total upcoming</span>
              <span className="text-sm font-bold">{formatCurrency(totalUpcoming)}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full flex justify-between items-center"
            onClick={() => setDialogOpen(true)}
          >
            <span>View All Payments</span>
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>

      <UpcomingPaymentsDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  )
}

