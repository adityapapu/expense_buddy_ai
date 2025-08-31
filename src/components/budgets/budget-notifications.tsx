"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { BellIcon, BellOffIcon, CheckIcon, EyeIcon } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

// This would typically come from an API or database
const budgetAlerts = [
  {
    id: "1",
    category: { name: "Entertainment", icon: "🎬" },
    budgeted: 150,
    spent: 180,
    percentageUsed: 120,
    timestamp: "2023-05-15T14:30:00Z",
    read: false,
  },
  {
    id: "2",
    category: { name: "Food", icon: "🍔" },
    budgeted: 500,
    spent: 450,
    percentageUsed: 90,
    timestamp: "2023-05-14T10:15:00Z",
    read: true,
  },
  {
    id: "3",
    category: { name: "Transportation", icon: "🚗" },
    budgeted: 200,
    spent: 180,
    percentageUsed: 90,
    timestamp: "2023-05-13T18:45:00Z",
    read: false,
  },
]

export function BudgetNotifications() {
  const [notifications, setNotifications] = useState(budgetAlerts)

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          <BellIcon className="h-5 w-5 text-primary" />
          <CardTitle>Budget Alerts</CardTitle>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllAsRead}>
            <CheckIcon className="mr-2 h-4 w-4" />
            Mark All Read
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div key={notification.id} className={`p-3 rounded-lg border ${!notification.read ? "bg-muted/50" : ""}`}>
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <div className="mr-3 text-2xl">{notification.category.icon}</div>
                    <div>
                      <h4 className="font-medium">
                        {notification.percentageUsed >= 100
                          ? `${notification.category.name} Budget Exceeded`
                          : `${notification.category.name} Budget Alert`}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {new Date(notification.timestamp).toLocaleDateString()} at{" "}
                        {new Date(notification.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  {!notification.read && <div className="h-2 w-2 rounded-full bg-primary"></div>}
                </div>

                <div className="mt-2">
                  <div className="flex justify-between items-center text-sm mb-1">
                    <span>
                      {formatCurrency(notification.spent)} of {formatCurrency(notification.budgeted)}
                    </span>
                    <span className={notification.percentageUsed >= 100 ? "text-red-500" : "text-yellow-500"}>
                      {notification.percentageUsed}%
                    </span>
                  </div>
                  <Progress
                    value={notification.percentageUsed}
                    className="h-1.5"
                  />
                </div>

                <div className="mt-3 flex justify-end">
                  <Button variant="ghost" size="sm" onClick={() => markAsRead(notification.id)}>
                    <EyeIcon className="mr-1 h-3 w-3" />
                    <span className="text-xs">Mark as read</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <BellOffIcon className="h-10 w-10 text-muted-foreground mb-3" />
            <h3 className="font-medium">No Budget Alerts</h3>
            <p className="text-sm text-muted-foreground mt-1">
              You&apos;re doing great! All your spending is within budget limits.
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full">
          View All Notifications
        </Button>
      </CardFooter>
    </Card>
  )
}

