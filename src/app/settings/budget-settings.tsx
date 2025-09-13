"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusIcon, TrashIcon, EditIcon, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { type Category } from "@prisma/client"
import {
  createBudget,
  getBudgets,
  updateBudget,
  deleteBudget,
  getBudgetSpending,
  type Budget,
  type BudgetSpending
} from "@/lib/actions/budgets"
import { listCategories } from "@/server/services/categoryService"

export function BudgetSettings() {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [budgetSpending, setBudgetSpending] = useState<BudgetSpending[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [newBudgetAmount, setNewBudgetAmount] = useState("")
  const [newBudgetCategoryId, setNewBudgetCategoryId] = useState("")
  const [newBudgetStartDate, setNewBudgetStartDate] = useState("")
  const [newBudgetEndDate, setNewBudgetEndDate] = useState("")
  const [newBudgetIcon, setNewBudgetIcon] = useState("")
  const { toast } = useToast()

  const loadBudgets = useCallback(async () => {
    try {
      setLoading(true)
      const response = await getBudgets()
      setBudgets(response)

      const spendingResponse = await getBudgetSpending()
      setBudgetSpending(spendingResponse)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load budgets",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  const loadCategories = useCallback(async () => {
    try {
      const response = await listCategories({ pageSize: 100, filters: { type: "EXPENSE" } })
      if (response.success && response.categories) {
        setCategories(response.categories)
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load categories",
      })
    }
  }, [toast])

  useEffect(() => {
    void loadBudgets()
    void loadCategories()
  }, [loadBudgets, loadCategories])

  const handleDelete = async (id: string) => {
    try {
      setSubmitting(true)
      const result = await deleteBudget(id)
      if (result.success) {
        setBudgets(budgets.filter((budget) => budget.id !== id))
        toast({
          title: "Success",
          description: "Budget deleted successfully",
        })
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to delete budget",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete budget",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleAddBudget = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSubmitting(true)
      const result = await createBudget({
        categoryId: newBudgetCategoryId,
        amount: parseFloat(newBudgetAmount),
        startDate: newBudgetStartDate,
        endDate: newBudgetEndDate,
        icon: newBudgetIcon,
      })

      setBudgets([result, ...budgets])
      setNewBudgetAmount("")
      setNewBudgetCategoryId("")
      setNewBudgetStartDate("")
      setNewBudgetEndDate("")
      setNewBudgetIcon("")
      setIsAddDialogOpen(false)
      toast({
        title: "Success",
        description: "Budget added successfully",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add budget",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditBudget = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBudget) return

    try {
      setSubmitting(true)
      const result = await updateBudget(selectedBudget.id, {
        categoryId: newBudgetCategoryId,
        amount: parseFloat(newBudgetAmount),
        startDate: newBudgetStartDate,
        endDate: newBudgetEndDate,
        icon: newBudgetIcon,
      })

      setBudgets(budgets.map((budget) =>
        budget.id === result.id ? result : budget
      ))
      setNewBudgetAmount("")
      setNewBudgetCategoryId("")
      setNewBudgetStartDate("")
      setNewBudgetEndDate("")
      setNewBudgetIcon("")
      setSelectedBudget(null)
      setIsEditDialogOpen(false)
      toast({
        title: "Success",
        description: "Budget updated successfully",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update budget",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditClick = (budget: Budget) => {
    setSelectedBudget(budget)
    setNewBudgetAmount(budget.amount.toString())
    setNewBudgetCategoryId(budget.categoryId)
    setNewBudgetStartDate(budget.startDate.split('T')[0])
    setNewBudgetEndDate(budget.endDate.split('T')[0])
    setNewBudgetIcon(budget.icon || "")
    setIsEditDialogOpen(true)
  }

  const getSpendingForBudget = (budgetId: string) => {
    return budgetSpending.find(spending => spending.categoryId === budgetId)
  }

  const getProgressColor = (percentageUsed: number) => {
    if (percentageUsed > 100) return "bg-red-500"
    if (percentageUsed > 80) return "bg-yellow-500"
    return "bg-green-500"
  }

  const getSpendingStatus = (spending?: BudgetSpending) => {
    if (!spending) return { text: "No spending", color: "bg-gray-100 text-gray-800" }
    if (spending.isOverBudget) return { text: "Over Budget", color: "bg-red-100 text-red-800" }
    if (spending.isNearLimit) return { text: "Near Limit", color: "bg-yellow-100 text-yellow-800" }
    return { text: "On Track", color: "bg-green-100 text-green-800" }
  }

  const totalBudgeted = budgets.reduce((sum, budget) => sum + budget.amount, 0)
  const totalSpent = budgetSpending.reduce((sum, spending) => sum + spending.spentAmount, 0)
  const overallPercentage = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Budgets</CardTitle>
              <CardDescription>Manage your spending limits and track budget progress.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Budget Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-lg border p-4">
              <div className="text-2xl font-bold">₹{totalBudgeted.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Total Budgeted</div>
            </div>
            <div className="rounded-lg border p-4">
              <div className="text-2xl font-bold">₹{totalSpent.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Total Spent</div>
            </div>
            <div className="rounded-lg border p-4">
              <div className="text-2xl font-bold">{overallPercentage.toFixed(1)}%</div>
              <div className="text-sm text-muted-foreground">Budget Used</div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : budgets.length > 0 ? (
            <div className="space-y-4">
              {budgets.map((budget) => {
                const spending = getSpendingForBudget(budget.categoryId)
                const status = getSpendingStatus(spending)
                const percentageUsed = spending ? spending.percentageUsed : 0

                return (
                  <div
                    key={budget.id}
                    className="flex flex-col gap-4 rounded-lg border p-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                          {budget.icon ? (
                            <span className="text-lg">{budget.icon}</span>
                          ) : (
                            <div className="h-5 w-5 rounded-full bg-muted" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{budget.category.name}</p>
                            <Badge className={status.color}>
                              {status.text}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {new Date(budget.startDate).toLocaleDateString()} - {new Date(budget.endDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEditClick(budget)}
                          disabled={submitting}
                        >
                          <EditIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDelete(budget.id)}
                          disabled={submitting}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Progress bar and spending info */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>₹{spending?.spentAmount.toLocaleString() || 0} spent</span>
                        <span>₹{budget.amount.toLocaleString()} budgeted</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${getProgressColor(percentageUsed)}`}
                          style={{ width: `${Math.min(percentageUsed, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{percentageUsed.toFixed(1)}% used</span>
                        <span>
                          {spending ? `₹${Math.abs(spending.remainingAmount).toLocaleString()} ${spending.remainingAmount >= 0 ? 'remaining' : 'over'}` : '₹0 remaining'}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <div className="h-6 w-6 rounded-full bg-muted" />
              </div>
              <h3 className="text-lg font-medium">No Budgets</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                You haven't set any budgets yet. Create budgets to track your spending.
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full">
                <PlusIcon className="mr-2 h-4 w-4" />
                Add Budget
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add Budget</DialogTitle>
                <DialogDescription>Set a spending limit for a category.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddBudget}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="budget-category">Category</Label>
                    <Select value={newBudgetCategoryId} onValueChange={setNewBudgetCategoryId} required>
                      <SelectTrigger id="budget-category">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories
                          .filter(cat => cat.type === "EXPENSE")
                          .map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.icon} {category.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="budget-amount">Amount (₹)</Label>
                    <Input
                      id="budget-amount"
                      type="number"
                      step="0.01"
                      placeholder="1000"
                      value={newBudgetAmount}
                      onChange={(e) => setNewBudgetAmount(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="grid gap-2">
                      <Label htmlFor="budget-start">Start Date</Label>
                      <Input
                        id="budget-start"
                        type="date"
                        value={newBudgetStartDate}
                        onChange={(e) => setNewBudgetStartDate(e.target.value)}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="budget-end">End Date</Label>
                      <Input
                        id="budget-end"
                        type="date"
                        value={newBudgetEndDate}
                        onChange={(e) => setNewBudgetEndDate(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="budget-icon">Icon (Optional)</Label>
                    <Input
                      id="budget-icon"
                      placeholder="💰, 🛒, 🍔, etc."
                      value={newBudgetIcon}
                      onChange={(e) => setNewBudgetIcon(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={submitting || !newBudgetAmount || !newBudgetCategoryId}>
                    {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Add Budget
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Edit Budget</DialogTitle>
                <DialogDescription>Update budget details.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleEditBudget}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-budget-category">Category</Label>
                    <Select value={newBudgetCategoryId} onValueChange={setNewBudgetCategoryId} required>
                      <SelectTrigger id="edit-budget-category">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories
                          .filter(cat => cat.type === "EXPENSE")
                          .map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.icon} {category.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-budget-amount">Amount (₹)</Label>
                    <Input
                      id="edit-budget-amount"
                      type="number"
                      step="0.01"
                      placeholder="1000"
                      value={newBudgetAmount}
                      onChange={(e) => setNewBudgetAmount(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-budget-start">Start Date</Label>
                      <Input
                        id="edit-budget-start"
                        type="date"
                        value={newBudgetStartDate}
                        onChange={(e) => setNewBudgetStartDate(e.target.value)}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-budget-end">End Date</Label>
                      <Input
                        id="edit-budget-end"
                        type="date"
                        value={newBudgetEndDate}
                        onChange={(e) => setNewBudgetEndDate(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-budget-icon">Icon (Optional)</Label>
                    <Input
                      id="edit-budget-icon"
                      placeholder="💰, 🛒, 🍔, etc."
                      value={newBudgetIcon}
                      onChange={(e) => setNewBudgetIcon(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={submitting || !newBudgetAmount || !newBudgetCategoryId}>
                    {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Update Budget
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>
    </div>
  )
}