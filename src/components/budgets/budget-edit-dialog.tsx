"use client"

import { BudgetFormDialog } from "./budget-form-dialog"

interface BudgetEditDialogProps {
  budget: {
    id: string
    category: { id: string; name: string; icon: string }
    amount: number
    startDate: string
    endDate: string
    spent: number
    percentageUsed: number
  }
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BudgetEditDialog({ budget, open, onOpenChange }: BudgetEditDialogProps) {
  // Convert string dates to Date objects
  const defaultValues = {
    categoryId: budget.category.id,
    amount: budget.amount,
    startDate: new Date(budget.startDate),
    endDate: new Date(budget.endDate),
    icon: budget.category.icon,
  }

  return <BudgetFormDialog open={open} onOpenChange={onOpenChange} defaultValues={defaultValues} />
}

