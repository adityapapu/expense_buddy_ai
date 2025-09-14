"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AlertCircleIcon, CheckCircleIcon, EditIcon, MoreHorizontalIcon, SearchIcon, TrashIcon } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { BudgetEditDialog } from "./budget-edit-dialog"
import { getBudgets, getBudgetSpending, deleteBudget, type Budget } from "@/lib/actions/budgets"
import { useToast } from "@/components/ui/use-toast"

interface BudgetWithSpending extends Budget {
  spent: number;
  percentageUsed: number;
  isOverBudget: boolean;
  isNearLimit: boolean;
}

export function BudgetsList() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [budgets, setBudgets] = useState<BudgetWithSpending[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editBudget, setEditBudget] = useState<BudgetWithSpending | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        setLoading(true)
        const [budgetData, spendingData] = await Promise.all([
          getBudgets(),
          getBudgetSpending()
        ])

        // Combine budget data with spending information
        const budgetsWithSpending = budgetData.map(budget => {
          const spending = spendingData.find(s => s.categoryId === budget.categoryId)
          return {
            ...budget,
            spent: spending?.spentAmount || 0,
            percentageUsed: spending?.percentageUsed || 0,
            isOverBudget: spending?.isOverBudget || false,
            isNearLimit: spending?.isNearLimit || false
          }
        })

        setBudgets(budgetsWithSpending)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load budgets")
      } finally {
        setLoading(false)
      }
    }

    void fetchBudgets()
  }, [])

  const handleDeleteBudget = async (budgetId: string) => {
    try {
      await deleteBudget(budgetId)
      setBudgets(prev => prev.filter(b => b.id !== budgetId))
      toast({
        title: "Budget deleted",
        description: "The budget has been successfully deleted.",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to delete budget",
        variant: "destructive",
      })
    }
  }

  const getBudgetStatusIcon = (percentage: number) => {
    if (percentage >= 100) {
      return <AlertCircleIcon className="h-4 w-4 text-red-500" />
    }
    if (percentage >= 90) {
      return <AlertCircleIcon className="h-4 w-4 text-yellow-500" />
    }
    return <CheckCircleIcon className="h-4 w-4 text-green-500" />
  }

  // Filter budgets based on search query and active tab
  const filteredBudgets = budgets.filter((budget) => {
    const matchesSearch = budget.category.name.toLowerCase().includes(searchQuery.toLowerCase())

    if (activeTab === "all") return matchesSearch
    if (activeTab === "over") return matchesSearch && budget.percentageUsed >= 100
    if (activeTab === "near") return matchesSearch && budget.percentageUsed >= 80 && budget.percentageUsed < 100
    if (activeTab === "under") return matchesSearch && budget.percentageUsed < 80

    return matchesSearch
  })

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Budgets</CardTitle>
          <CardDescription>Loading your budgets...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-32 bg-muted animate-pulse rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Budgets</CardTitle>
          <CardDescription>Error loading budgets</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
          <div>
            <CardTitle>Your Budgets</CardTitle>
            <CardDescription>Manage and track your budget allocations</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search budgets..."
                className="pl-8 w-[200px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select defaultValue="month">
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid grid-cols-4 w-full max-w-md">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="over">Over Budget</TabsTrigger>
              <TabsTrigger value="near">Near Limit</TabsTrigger>
              <TabsTrigger value="under">Under Budget</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredBudgets.length > 0 ? (
                  filteredBudgets.map((budget) => (
                    <Card key={budget.id} className="overflow-hidden">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div className="flex items-center space-x-2">
                          <div className="text-xl">{budget.icon || "💰"}</div>
                          <CardTitle className="text-sm font-medium">{budget.category.name}</CardTitle>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontalIcon className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => setEditBudget(budget)}>
                              <EditIcon className="mr-2 h-4 w-4" />
                              Edit Budget
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDeleteBudget(budget.id)}
                            >
                              <TrashIcon className="mr-2 h-4 w-4" />
                              Delete Budget
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </CardHeader>
                      <CardContent className="pb-3">
                        <div className="flex justify-between items-center mb-2">
                          <div className="text-2xl font-bold">{formatCurrency(budget.amount)}</div>
                          <div className="flex items-center space-x-1">
                            {getBudgetStatusIcon(budget.percentageUsed)}
                            <span className="text-sm font-medium">{budget.percentageUsed}%</span>
                          </div>
                        </div>
                        <Progress
                          value={budget.percentageUsed}
                          className="h-2"
                        />
                        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                          <span>
                            {formatCurrency(budget.spent)} of {formatCurrency(budget.amount)} used
                          </span>
                          <span>{formatCurrency(budget.amount - budget.spent)} left</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full text-center py-8 text-muted-foreground">
                    No budgets found. Try adjusting your search or filters.
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {editBudget && (
        <BudgetEditDialog
          budget={editBudget}
          open={!!editBudget}
          onOpenChange={(open) => !open && setEditBudget(null)}
        />
      )}
    </>
  )
}

