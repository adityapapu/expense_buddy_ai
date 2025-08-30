"use client"

import { Suspense, useState } from "react"

import { Button } from "@/components/ui/button"
import { BudgetOverview } from "@/components/budgets/budget-overview"
import { BudgetsList } from "@/components/budgets/budgets-list"
import { BudgetsSkeleton } from "@/components/budgets/budgets-skeleton"
import { BudgetWelcome } from "@/components/budgets/budget-welcome"
import { BudgetHistory } from "@/components/budgets/budget-history"
import { BudgetCarryOver } from "@/components/budgets/budget-carry-over"
import { BudgetEditModal } from "@/components/budgets/budget-edit-modal"

// This would typically come from an API or database
const hasExistingBudgets = true // Set to false to always show the welcome screen
const isNewMonth = false // Set to true to show the carry-over prompt
const previousMonth = {
  label: "April 2023",
  totalBudget: 2000,
  categories: [
    { name: "Housing", icon: "🏠", budgeted: 1000 },
    { name: "Food", icon: "🍔", budgeted: 500 },
    { name: "Transportation", icon: "🚗", budgeted: 200 },
    { name: "Entertainment", icon: "🎬", budgeted: 150 },
    { name: "Utilities", icon: "💡", budgeted: 150 },
  ],
}

export default function BudgetsPage() {
  const [editModalOpen, setEditModalOpen] = useState(false)

  return (
    <div className="flex flex-col gap-4 p-4 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Budgets</h1>
        {hasExistingBudgets && (
          <Button variant="outline" size="sm" onClick={() => setEditModalOpen(true)}>
            Edit Current Budget
          </Button>
        )}
      </div>

      {!hasExistingBudgets ? (
        <BudgetWelcome hasExistingBudgets={false} />
      ) : isNewMonth ? (
        <BudgetCarryOver
          previousMonth={previousMonth}
          onCarryOver={() => console.log("Budget carried over")}
          onCustomize={() => console.log("Customize budget")}
        />
      ) : (
        <>
          <Suspense fallback={<BudgetsSkeleton />}>
            <BudgetOverview />
          </Suspense>

          <Suspense fallback={<BudgetsSkeleton />}>
            <BudgetsList />
          </Suspense>

          <Suspense fallback={<BudgetsSkeleton />}>
            <BudgetHistory />
          </Suspense>
        </>
      )}
      {hasExistingBudgets && <BudgetEditModal open={editModalOpen} onOpenChange={setEditModalOpen} />}
    </div>
  )
}

