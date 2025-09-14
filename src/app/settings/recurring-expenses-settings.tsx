"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusIcon, TrashIcon, EditIcon, Loader2, ToggleLeft, ToggleRight, Calendar, DollarSign } from "lucide-react"
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
import { Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import {
  createRecurringExpense,
  listRecurringExpenses,
  updateRecurringExpense,
  deleteRecurringExpense,
  toggleRecurringExpense,
  type RecurringExpenseResult,
  type ListRecurringExpensesResult
} from "@/server/services/recurringExpenseService"
import { type Frequency } from "@prisma/client"

const FREQUENCY_OPTIONS = [
  { value: "DAILY", label: "Daily" },
  { value: "WEEKLY", label: "Weekly" },
  { value: "MONTHLY", label: "Monthly" },
  { value: "YEARLY", label: "Yearly" },
]

export function RecurringExpensesSettings() {
  const [recurringExpenses, setRecurringExpenses] = useState<any[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all")
  const [filterFrequency, setFilterFrequency] = useState<string>("all")
  const [newExpense, setNewExpense] = useState({
    description: "",
    amount: "",
    frequency: "MONTHLY" as Frequency,
    startDate: "",
    endDate: ""
  })
  const { toast } = useToast()

  const loadRecurringExpenses = useCallback(async () => {
    try {
      setLoading(true)
      const filters: any = {}
      if (filterStatus !== "all") {
        filters.isActive = filterStatus === "active"
      }
      if (filterFrequency !== "all") {
        filters.frequency = filterFrequency
      }

      const response: ListRecurringExpensesResult = await listRecurringExpenses({
        pageSize: 100,
        filters
      })
      if (response.success && response.recurringExpenses) {
        const filteredExpenses = response.recurringExpenses.filter(expense =>
          expense.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
        setRecurringExpenses(filteredExpenses)
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load recurring expenses",
      })
    } finally {
      setLoading(false)
    }
  }, [toast, searchQuery, filterStatus, filterFrequency])

  useEffect(() => {
    void loadRecurringExpenses()
  }, [loadRecurringExpenses])

  const handleDelete = async (id: number) => {
    try {
      setSubmitting(true)
      const result: RecurringExpenseResult = await deleteRecurringExpense(id)
      if (result.success) {
        setRecurringExpenses(recurringExpenses.filter((expense) => expense.id !== id))
        toast({
          title: "Success",
          description: "Recurring expense deleted successfully",
        })
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.message,
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete recurring expense",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggle = async (id: number) => {
    try {
      const result: RecurringExpenseResult = await toggleRecurringExpense(id)
      if (result.success && result.recurringExpense) {
        setRecurringExpenses(recurringExpenses.map((expense) =>
          expense.id === result.recurringExpense?.id ? result.recurringExpense : expense
        ))
        toast({
          title: "Success",
          description: result.message,
        })
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.message,
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to toggle recurring expense",
      })
    }
  }

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSubmitting(true)
      const result: RecurringExpenseResult = await createRecurringExpense({
        description: newExpense.description,
        amount: parseFloat(newExpense.amount),
        frequency: newExpense.frequency,
        startDate: newExpense.startDate,
        endDate: newExpense.endDate || undefined
      })
      if (result.success && result.recurringExpense) {
        setRecurringExpenses([result.recurringExpense, ...recurringExpenses])
        setNewExpense({
          description: "",
          amount: "",
          frequency: "MONTHLY",
          startDate: "",
          endDate: ""
        })
        setIsAddDialogOpen(false)
        toast({
          title: "Success",
          description: "Recurring expense added successfully",
        })
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.message,
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add recurring expense",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditExpense = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedExpense) return

    try {
      setSubmitting(true)

      // Ensure ID is a number
      const expenseId = typeof selectedExpense.id === 'string' ? parseInt(selectedExpense.id) : selectedExpense.id

      if (isNaN(expenseId)) {
        throw new Error("Invalid expense ID")
      }

      console.log("Updating recurring expense:", {
        id: expenseId,
        description: newExpense.description,
        amount: parseFloat(newExpense.amount),
        frequency: newExpense.frequency,
        startDate: newExpense.startDate,
        endDate: newExpense.endDate || undefined,
        isActive: selectedExpense.isActive
      })

      const result: RecurringExpenseResult = await updateRecurringExpense({
        id: expenseId,
        description: newExpense.description,
        amount: parseFloat(newExpense.amount),
        frequency: newExpense.frequency,
        startDate: newExpense.startDate,
        endDate: newExpense.endDate || undefined,
        isActive: selectedExpense.isActive
      })

      console.log("Update result:", result)

      if (result.success && result.recurringExpense) {
        setRecurringExpenses(recurringExpenses.map((expense) =>
          expense.id === result.recurringExpense?.id ? result.recurringExpense : expense
        ))
        setNewExpense({
          description: "",
          amount: "",
          frequency: "MONTHLY",
          startDate: "",
          endDate: ""
        })
        setSelectedExpense(null)
        setIsEditDialogOpen(false)
        toast({
          title: "Success",
          description: "Recurring expense updated successfully",
        })
      } else {
        console.error("Update failed:", result.message)
        toast({
          variant: "destructive",
          title: "Error",
          description: result.message || "Failed to update recurring expense",
        })
      }
    } catch (error) {
      console.error("Update error:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update recurring expense",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditClick = (expense: any) => {
    setSelectedExpense(expense)
    // Handle date formatting properly
    const formatDate = (dateString: string) => {
      if (!dateString) return ""
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return dateString.split('T')[0] || dateString
      return date.toISOString().split('T')[0]
    }

    setNewExpense({
      description: expense.description,
      amount: expense.amount.toString(),
      frequency: expense.frequency,
      startDate: formatDate(expense.startDate) || "",
      endDate: formatDate(expense.endDate) || ""
    })
    setIsEditDialogOpen(true)
  }

  const getFrequencyLabel = (frequency: Frequency) => {
    const option = FREQUENCY_OPTIONS.find(opt => opt.value === frequency)
    return option?.label || frequency
  }

  const getStatusBadge = (isActive: boolean) => {
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        isActive
          ? "bg-green-100 text-green-800"
          : "bg-gray-100 text-gray-800"
      }`}>
        {isActive ? "Active" : "Inactive"}
      </span>
    )
  }

  const getNextDueStatus = (nextDueDate: string, isActive: boolean) => {
    if (!isActive) return { text: "Inactive", color: "text-gray-500" }

    const dueDate = new Date(nextDueDate)
    const today = new Date()
    const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    if (daysUntilDue < 0) return { text: "Overdue", color: "text-red-600 font-semibold" }
    if (daysUntilDue === 0) return { text: "Due Today", color: "text-orange-600 font-semibold" }
    if (daysUntilDue <= 3) return { text: `Due in ${daysUntilDue} day${daysUntilDue > 1 ? 's' : ''}`, color: "text-yellow-600" }
    return { text: `Due in ${daysUntilDue} days`, color: "text-green-600" }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Recurring Expenses</CardTitle>
              <CardDescription>Manage your recurring payments and subscriptions.</CardDescription>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Input
                placeholder="Search expenses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-48"
              />
              <Select value={filterStatus} onValueChange={(value: "all" | "active" | "inactive") => setFilterStatus(value)}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterFrequency} onValueChange={setFilterFrequency}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Frequencies</SelectItem>
                  <SelectItem value="DAILY">Daily</SelectItem>
                  <SelectItem value="WEEKLY">Weekly</SelectItem>
                  <SelectItem value="MONTHLY">Monthly</SelectItem>
                  <SelectItem value="YEARLY">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : recurringExpenses.length > 0 ? (
            <div className="space-y-3">
              {recurringExpenses.map((expense) => {
                const dueStatus = getNextDueStatus(expense.nextDueDate, expense.isActive)
                return (
                  <div
                    key={expense.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-lg border p-4"
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <div className="flex flex-col gap-1 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{expense.description}</h3>
                          {getStatusBadge(expense.isActive)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            <span>₹{expense.amount.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{getFrequencyLabel(expense.frequency)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground">Next due:</span>
                          <span className={dueStatus.color}>
                            {new Date(expense.nextDueDate).toLocaleDateString()} ({dueStatus.text})
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const id = typeof expense.id === 'string' ? parseInt(expense.id) : expense.id
                          void handleToggle(id)
                        }}
                        disabled={submitting}
                      >
                        {expense.isActive ? (
                          <ToggleRight className="h-4 w-4 text-green-600" />
                        ) : (
                          <ToggleLeft className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEditClick(expense)}
                        disabled={submitting}
                      >
                        <EditIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          const id = typeof expense.id === 'string' ? parseInt(expense.id) : expense.id
                          void handleDelete(id)
                        }}
                        disabled={submitting}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium">No Recurring Expenses</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                You haven't set up any recurring expenses yet. Add subscriptions and regular payments to track them automatically.
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full">
                <PlusIcon className="mr-2 h-4 w-4" />
                Add Recurring Expense
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add Recurring Expense</DialogTitle>
                <DialogDescription>Create a new recurring expense for regular payments.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddExpense}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      placeholder="Netflix, Spotify, Rent, etc."
                      value={newExpense.description}
                      onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="amount">Amount (₹)</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={newExpense.amount}
                      onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="frequency">Frequency</Label>
                    <Select value={newExpense.frequency} onValueChange={(value: Frequency) => setNewExpense({...newExpense, frequency: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FREQUENCY_OPTIONS.map((frequency) => (
                          <SelectItem key={frequency.value} value={frequency.value}>
                            {frequency.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="start-date">Start Date</Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={newExpense.startDate}
                      onChange={(e) => setNewExpense({...newExpense, startDate: e.target.value})}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="end-date">End Date (Optional)</Label>
                    <Input
                      id="end-date"
                      type="date"
                      value={newExpense.endDate}
                      onChange={(e) => setNewExpense({...newExpense, endDate: e.target.value})}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={submitting || !newExpense.description.trim() || !newExpense.amount}>
                    {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Add Expense
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Edit Recurring Expense</DialogTitle>
                <DialogDescription>Update recurring expense details.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleEditExpense}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-description">Description</Label>
                    <Input
                      id="edit-description"
                      placeholder="Netflix, Spotify, Rent, etc."
                      value={newExpense.description}
                      onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-amount">Amount (₹)</Label>
                    <Input
                      id="edit-amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={newExpense.amount}
                      onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-frequency">Frequency</Label>
                    <Select value={newExpense.frequency} onValueChange={(value: Frequency) => setNewExpense({...newExpense, frequency: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FREQUENCY_OPTIONS.map((frequency) => (
                          <SelectItem key={frequency.value} value={frequency.value}>
                            {frequency.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-start-date">Start Date</Label>
                    <Input
                      id="edit-start-date"
                      type="date"
                      value={newExpense.startDate}
                      onChange={(e) => setNewExpense({...newExpense, startDate: e.target.value})}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-end-date">End Date (Optional)</Label>
                    <Input
                      id="edit-end-date"
                      type="date"
                      value={newExpense.endDate}
                      onChange={(e) => setNewExpense({...newExpense, endDate: e.target.value})}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={submitting || !newExpense.description.trim() || !newExpense.amount}>
                    {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Update Expense
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