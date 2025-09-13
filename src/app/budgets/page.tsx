"use client"

import { Suspense, useState, useEffect } from "react"

import { Button } from "@/components/ui/button"
import { BudgetOverview } from "@/components/budgets/budget-overview"
import { BudgetsList } from "@/components/budgets/budgets-list"
import { BudgetsSkeleton } from "@/components/budgets/budgets-skeleton"
import { BudgetWelcome } from "@/components/budgets/budget-welcome"
import { BudgetHistory } from "@/components/budgets/budget-history"
import { BudgetCarryOver } from "@/components/budgets/budget-carry-over"
import { BudgetEditModal } from "@/components/budgets/budget-edit-modal"
import { getBudgets, type Budget } from "@/lib/actions/budgets"
import { BudgetFormDialog } from "@/components/budgets/budget-form-dialog"
import { useToast } from "@/components/ui/use-toast"

interface PreviousMonthData {
  label: string
  totalBudget: number
  categories: {
    name: string
    icon: string
    budgeted: number
  }[]
}

export default function BudgetsPage() {
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [hasExistingBudgets, setHasExistingBudgets] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isNewMonth, setIsNewMonth] = useState(false)
  const [previousMonth, setPreviousMonth] = useState<PreviousMonthData | null>(null)
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const checkBudgets = async () => {
      try {
        setLoading(true)
        const budgets = await getBudgets()
        setHasExistingBudgets(budgets.length > 0)

        // Check if it's a new month (simple check - can be enhanced)
        const now = new Date()
        const lastDayOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0)
        const isFirstFewDays = now.getDate() <= 7

        setIsNewMonth(isFirstFewDays && budgets.length > 0)

        // For demo purposes, create previous month data if budgets exist
        if (budgets.length > 0) {
          setPreviousMonth({
            label: lastDayOfPrevMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
            totalBudget: budgets.reduce((sum, budget) => sum + budget.amount, 0),
            categories: budgets.slice(0, 5).map(budget => ({
              name: budget.category.name,
              icon: "💰", // Default icon
              budgeted: budget.amount
            }))
          })
        }
      } catch (error) {
        console.error("Failed to load budgets:", error)
        toast({
          title: "Error",
          description: "Failed to load your budgets. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    checkBudgets()
  }, [toast])

  const handleEditBudget = (budget: Budget) => {
    setEditingBudget(budget)
    setEditModalOpen(true)
  }

  const handleCreateBudget = () => {
    setEditingBudget(null)
    setCreateDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-4 p-4 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold tracking-tight">Budgets</h1>
          <div className="h-10 w-32 bg-muted animate-pulse rounded"></div>
        </div>
        <div className="space-y-6">
          <div className="h-64 bg-muted animate-pulse rounded"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-48 bg-muted animate-pulse rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Budgets</h1>
        <div className="flex gap-2">
          {hasExistingBudgets && (
            <Button variant="outline" size="sm" onClick={() => setEditModalOpen(true)}>
              Edit Current Budget
            </Button>
          )}
          <Button size="sm" onClick={handleCreateBudget}>
            Create Budget
          </Button>
        </div>
      </div>

      {!hasExistingBudgets ? (
        <BudgetWelcome />
      ) : isNewMonth && previousMonth ? (
        <BudgetCarryOver
          previousMonth={previousMonth}
          onCarryOver={() => console.log("Budget carried over")}
          onCustomize={() => setEditModalOpen(true)}
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

      {hasExistingBudgets && (
        <BudgetEditModal
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          onEditBudget={handleEditBudget}
        />
      )}

      <BudgetFormDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        editingBudget={editingBudget}
      />
    </div>
  )
}

