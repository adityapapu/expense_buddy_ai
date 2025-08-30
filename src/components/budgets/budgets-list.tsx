"use client"

import { useState } from "react"
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

// This would typically come from an API or database
const budgets = [
  {
    id: "1",
    category: { id: "1", name: "Housing", icon: "🏠" },
    amount: 1000,
    startDate: "2023-05-01",
    endDate: "2023-05-31",
    spent: 950,
    percentageUsed: 95,
  },
  {
    id: "2",
    category: { id: "2", name: "Food", icon: "🍔" },
    amount: 500,
    startDate: "2023-05-01",
    endDate: "2023-05-31",
    spent: 425,
    percentageUsed: 85,
  },
  {
    id: "3",
    category: { id: "3", name: "Transportation", icon: "🚗" },
    amount: 200,
    startDate: "2023-05-01",
    endDate: "2023-05-31",
    spent: 180,
    percentageUsed: 90,
  },
  {
    id: "4",
    category: { id: "4", name: "Entertainment", icon: "🎬" },
    amount: 150,
    startDate: "2023-05-01",
    endDate: "2023-05-31",
    spent: 180,
    percentageUsed: 120,
  },
  {
    id: "5",
    category: { id: "5", name: "Utilities", icon: "💡" },
    amount: 300,
    startDate: "2023-05-01",
    endDate: "2023-05-31",
    spent: 275,
    percentageUsed: 92,
  },
  {
    id: "6",
    category: { id: "6", name: "Healthcare", icon: "🏥" },
    amount: 100,
    startDate: "2023-05-01",
    endDate: "2023-05-31",
    spent: 65,
    percentageUsed: 65,
  },
  {
    id: "7",
    category: { id: "7", name: "Personal", icon: "👤" },
    amount: 150,
    startDate: "2023-05-01",
    endDate: "2023-05-31",
    spent: 125,
    percentageUsed: 83,
  },
  {
    id: "8",
    category: { id: "8", name: "Savings", icon: "💰" },
    amount: 400,
    startDate: "2023-05-01",
    endDate: "2023-05-31",
    spent: 400,
    percentageUsed: 100,
  },
]

export function BudgetsList() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [editBudget, setEditBudget] = useState<(typeof budgets)[0] | null>(null)

  const getBudgetStatusColor = (percentage: number) => {
    if (percentage < 70) return "bg-green-500"
    if (percentage < 90) return "bg-yellow-500"
    return "bg-red-500"
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
                          <div className="text-xl">{budget.category.icon}</div>
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
                            <DropdownMenuItem className="text-red-600">
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
                          indicatorClassName={getBudgetStatusColor(budget.percentageUsed)}
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

