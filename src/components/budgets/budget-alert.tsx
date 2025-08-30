"use client"

import { useState, useEffect } from "react"
import { ToastAction } from "@/components/ui/toast"
import { useToast } from "@/components/ui/use-toast"
import { formatCurrency } from "@/lib/utils"

interface BudgetAlertProps {
  budget: {
    id: string
    category: { name: string }
    amount: number
    spent: number
    percentageUsed: number
  }
}

export function BudgetAlert({ budget }: BudgetAlertProps) {
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Only show alerts for budgets that are over or near limit
    if (budget.percentageUsed >= 90) {
      const severity = budget.percentageUsed >= 100 ? "critical" : "warning"
      const title = budget.percentageUsed >= 100 ? "Budget Exceeded" : "Budget Limit Approaching"

      toast({
        title,
        description: `Your ${budget.category.name} budget is ${budget.percentageUsed >= 100 ? "over" : "at"} ${budget.percentageUsed}% (${formatCurrency(budget.spent)} of ${formatCurrency(budget.amount)})`,
        variant: severity === "critical" ? "destructive" : "default",
        action: <ToastAction altText="View Details">View Details</ToastAction>,
      })
    }
  }, [budget, toast])

  if (!mounted) return null

  return null
}

