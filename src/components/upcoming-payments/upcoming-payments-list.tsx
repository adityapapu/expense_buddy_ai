"use client"

import { useState } from "react"
import { CalendarIcon, CheckCircle, ChevronRightIcon, Clock, RefreshCw, SearchIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatCurrency } from "@/lib/utils"

// This would typically come from an API or database
const allPayments = [
  {
    id: "1",
    name: "Rent",
    dueDate: "2023-05-15",
    amount: 1200,
    category: "Housing",
    status: "upcoming",
    recurring: true,
    frequency: "monthly",
    paymentMethod: "Bank Transfer",
    description: "Monthly apartment rent",
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
    paymentMethod: "Credit Card",
    description: "Fiber internet subscription",
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
    paymentMethod: "Credit Card",
    description: "Monthly gym membership fee",
  },
  {
    id: "4",
    name: "Netflix Subscription",
    dueDate: "2023-05-22",
    amount: 14.99,
    category: "Entertainment",
    status: "upcoming",
    recurring: true,
    frequency: "monthly",
    paymentMethod: "Credit Card",
    description: "Standard HD plan",
  },
  {
    id: "5",
    name: "Phone Bill",
    dueDate: "2023-05-25",
    amount: 85.0,
    category: "Utilities",
    status: "upcoming",
    recurring: true,
    frequency: "monthly",
    paymentMethod: "Credit Card",
    description: "Monthly mobile plan",
  },
  {
    id: "6",
    name: "Car Insurance",
    dueDate: "2023-06-01",
    amount: 120.0,
    category: "Insurance",
    status: "upcoming",
    recurring: true,
    frequency: "monthly",
    paymentMethod: "Bank Transfer",
    description: "Full coverage auto insurance",
  },
  {
    id: "7",
    name: "Electricity Bill",
    dueDate: "2023-05-10",
    amount: 95.5,
    category: "Utilities",
    status: "paid",
    recurring: true,
    frequency: "monthly",
    paymentMethod: "Bank Transfer",
    description: "Monthly electricity bill",
  },
  {
    id: "8",
    name: "Water Bill",
    dueDate: "2023-05-05",
    amount: 45.75,
    category: "Utilities",
    status: "paid",
    recurring: true,
    frequency: "monthly",
    paymentMethod: "Bank Transfer",
    description: "Monthly water utility",
  },
]

interface UpcomingPaymentsListProps {
  filter?: "upcoming" | "recurring" | "history"
}

export function UpcomingPaymentsList({ filter = "upcoming" }: UpcomingPaymentsListProps) {
  const [searchQuery, setSearchQuery] = useState("")

  // Filter data based on the selected tab and search query
  const filteredData = allPayments.filter((payment) => {
    const matchesFilter =
      (filter === "upcoming" && payment.status === "upcoming") ||
      (filter === "recurring" && payment.recurring === true) ||
      (filter === "history" && payment.status === "paid") ||
      filter === undefined

    const matchesSearch =
      payment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.description.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesFilter && (searchQuery === "" || matchesSearch)
  })

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

  return (
    <div className="w-full flex flex-col overflow-hidden">
      <div className="relative mb-4">
        <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search payments..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-2 pr-3">
          {filteredData.length > 0 ? (
            filteredData.map((payment) => (
              <Button key={payment.id} variant="outline" className="w-full justify-start p-3 h-auto" asChild>
                <div className="flex flex-col w-full">
                  <div className="flex justify-between items-center w-full">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                        <span className="text-xs">{payment.category.charAt(0)}</span>
                      </div>
                      <div className="text-left">
                        <p className="font-medium">{payment.name}</p>
                        <p className="text-xs text-muted-foreground">{payment.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(payment.amount)}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <CalendarIcon className="h-3 w-3" />
                        {formatDueDate(payment.dueDate)}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-2 pt-2 border-t w-full">
                    <div className="flex items-center gap-2">
                      {payment.status === "upcoming" ? (
                        <Badge
                          variant="outline"
                          className="flex items-center gap-1 bg-yellow-50 text-yellow-700 border-yellow-200"
                        >
                          <Clock className="h-3 w-3" />
                          Upcoming
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="flex items-center gap-1 bg-green-50 text-green-700 border-green-200"
                        >
                          <CheckCircle className="h-3 w-3" />
                          Paid
                        </Badge>
                      )}

                      {payment.recurring && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <RefreshCw className="h-3 w-3" />
                          <span className="capitalize">{payment.frequency}</span>
                        </div>
                      )}
                    </div>

                    <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </Button>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">No payments found.</div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

