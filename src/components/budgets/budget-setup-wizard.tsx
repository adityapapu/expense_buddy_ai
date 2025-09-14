"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon, PiggyBankIcon, PlusIcon } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { BudgetCategoryAllocation } from "./budget-category-allocation"
import { createBudget } from "@/lib/actions/budgets"
import { getCategories } from "@/lib/actions/filters"
import { createCategory } from "@/server/services/categoryService"
import { useToast } from "@/components/ui/use-toast"
import { type TransactionType } from "@prisma/client"

// Suggested budget categories with icons and percentages
const suggestedCategories = [
  { name: "Housing", icon: "🏠", percentage: 30, keywords: ["house", "rent", "home"] },
  { name: "Food", icon: "🍔", percentage: 15, keywords: ["food", "groceries", "restaurant", "dining"] },
  { name: "Transportation", icon: "🚗", percentage: 10, keywords: ["transport", "travel", "fuel", "auto", "car"] },
  { name: "Utilities", icon: "💡", percentage: 10, keywords: ["utility", "bill", "electric", "water"] },
  { name: "Entertainment", icon: "🎬", percentage: 5, keywords: ["entertainment", "movie", "game", "subscription"] },
  { name: "Healthcare", icon: "🏥", percentage: 5, keywords: ["health", "medical", "doctor", "medicine"] },
  { name: "Personal", icon: "👤", percentage: 5, keywords: ["personal", "shopping", "clothes", "misc"] },
  { name: "Savings", icon: "💰", percentage: 20, keywords: ["saving", "investment", "emergency", "fund"] },
]

interface BudgetSetupWizardProps {
  onComplete: () => void
}

interface BudgetCategory {
  id: string
  name: string
  icon: string
  percentage: number
  amount: number
  realCategoryId?: string
  isNew?: boolean
}

export function BudgetSetupWizard({ onComplete }: BudgetSetupWizardProps) {
  const [step, setStep] = useState(1)
  const [totalBudget, setTotalBudget] = useState(5000)
  const [categories, setCategories] = useState<BudgetCategory[]>([])
  const [realCategories, setRealCategories] = useState<{ id: string; name: string }[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  // Initialize categories with real user data
  useEffect(() => {
    void getCategories()
      .then(categoryData => {
        setRealCategories(categoryData)

        // Auto-map suggested categories to real categories
        const mappedCategories = suggestedCategories.map(suggested => {
          const realCategory = categoryData.find(real =>
            suggested.keywords.some(keyword =>
              real.name.toLowerCase().includes(keyword)
            )
          )

          return {
            id: suggested.name.toLowerCase().replace(/\s+/g, '-'),
            name: suggested.name,
            icon: suggested.icon,
            percentage: suggested.percentage,
            amount: (suggested.percentage / 100) * totalBudget,
            realCategoryId: realCategory?.id,
            isNew: !realCategory
          }
        })

        setCategories(mappedCategories)
        setLoadingCategories(false)
      })
      .catch(error => {
        console.error("Failed to fetch categories:", error)
        setLoadingCategories(false)
      })
  }, [totalBudget])

  // Calculate total allocated percentage
  const totalAllocated = categories.reduce((sum, cat) => sum + cat.percentage, 0)
  const totalAllocatedAmount = categories.reduce((sum, cat) => sum + cat.amount, 0)

  // Update category amounts when total budget changes
  const updateCategoryAmounts = (newTotal: number) => {
    setCategories((cats) =>
      cats.map((cat) => ({
        ...cat,
        amount: (cat.percentage / 100) * newTotal,
      })),
    )
  }

  // Handle total budget change
  const handleTotalBudgetChange = (value: number) => {
    setTotalBudget(value)
    updateCategoryAmounts(value)
  }

  // Handle category percentage change
  const handleCategoryChange = (id: string, percentage: number) => {
    setCategories((cats) =>
      cats.map((cat) => {
        if (cat.id === id) {
          return {
            ...cat,
            percentage,
            amount: (percentage / 100) * totalBudget,
          }
        }
        return cat
      }),
    )
  }

  // Handle category amount change
  const handleCategoryAmountChange = (id: string, amount: number) => {
    setCategories((cats) =>
      cats.map((cat) => {
        if (cat.id === id) {
          const percentage = (amount / totalBudget) * 100
          return {
            ...cat,
            amount,
            percentage,
          }
        }
        return cat
      }),
    )
  }

  // Handle creating a new category
  const handleCreateCategory = async (name: string, budgetCategory: BudgetCategory) => {
    try {
      const result = await createCategory({
        name,
        icon: budgetCategory.icon,
        type: "EXPENSE" as TransactionType,
      })

      if (result.success && result.category) {
        // Update real categories list
        setRealCategories(prev => [...prev, { id: result.category!.id, name: result.category!.name }])

        // Map the budget category to the newly created category
        setCategories(cats =>
          cats.map(cat =>
            cat.id === budgetCategory.id
              ? { ...cat, realCategoryId: result.category!.id, isNew: false }
              : cat
          )
        )

        toast({
          title: "Category Created",
          description: `"${name}" category has been created and mapped.`,
        })
      } else {
        throw new Error(result.message || "Failed to create category")
      }
    } catch (error) {
      console.error("Error creating category:", error)
      toast({
        title: "Error",
        description: "Failed to create category. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Handle form submission
  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM format
      const monthStart = new Date(currentMonth + "-01")
      const monthEnd = new Date(new Date(currentMonth + "-01").setMonth(monthStart.getMonth() + 1) - 1)

      // Convert dates to ISO string format for the server action
      const startDateString = monthStart.toISOString()
      const endDateString = monthEnd.toISOString()

      // Filter categories that have real category mappings and non-zero amounts
      const validCategories = categories.filter(cat => cat.realCategoryId && cat.amount > 0)

      if (validCategories.length === 0) {
        throw new Error("No valid categories found. Please map categories to your actual categories first.")
      }

      // Create budgets for each valid category
      for (const category of validCategories) {
        if (category.realCategoryId && category.amount > 0) {
          await createBudget({
            categoryId: category.realCategoryId,
            amount: category.amount,
            startDate: startDateString,
            endDate: endDateString,
            icon: category.icon,
          })
        }
      }

      toast({
        title: "Budget Created",
        description: `Your monthly budget of ${formatCurrency(totalBudget)} has been successfully set up with ${validCategories.length} categories!`,
      })

      onComplete()
    } catch (error) {
      console.error("Error saving budget:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save your budget. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loadingCategories) {
    return (
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <PiggyBankIcon className="h-6 w-6 text-primary" />
            <CardTitle>Budget Setup</CardTitle>
          </div>
          <CardDescription>Loading your categories...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-32 bg-muted animate-pulse rounded"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <PiggyBankIcon className="h-6 w-6 text-primary" />
            <CardTitle>Budget Setup</CardTitle>
          </div>
          <div className="text-sm text-muted-foreground">Step {step} of 4</div>
        </div>
        <CardDescription>
          {step === 1 && "Let&apos;s start by setting your total monthly budget."}
          {step === 2 && "Now, allocate your budget across different categories."}
          {step === 3 && "Map budget categories to your actual categories or create new ones."}
          {step === 4 && "Review your budget allocation before saving."}
        </CardDescription>
        <Progress value={(step / 4) * 100} className="h-1" />
      </CardHeader>

      <CardContent>
        {step === 1 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="total-budget">Total Monthly Budget</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5">₹</span>
                <Input
                  id="total-budget"
                  type="number"
                  value={totalBudget}
                  onChange={(e) => handleTotalBudgetChange(Number.parseFloat(e.target.value) ?? 0)}
                  className="pl-7"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                This is the total amount you plan to spend this month across all categories.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Adjust your budget</Label>
              <Slider
                defaultValue={[totalBudget]}
                max={10000}
                step={100}
                onValueChange={(values) => handleTotalBudgetChange(values[0] ?? 0)}
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>₹1,000</span>
                <span>₹5,000</span>
                <span>₹10,000</span>
              </div>
            </div>

            <div className="rounded-lg border p-4 bg-muted/50">
              <h3 className="font-medium mb-2">Budget Tips</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Consider using the 50/30/20 rule: 50% for needs, 30% for wants, 20% for savings</li>
                <li>• Include all regular expenses like rent, utilities, groceries, and transportation</li>
                <li>• Don&apos;t forget to budget for irregular expenses like annual subscriptions</li>
                <li>• Be realistic about your spending habits to create a sustainable budget</li>
              </ul>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Category Allocation</h3>
              <div className="text-sm font-medium">{totalAllocated}% allocated</div>
            </div>

            <Progress
              value={totalAllocated}
              className="h-2"
            />

            <div className="space-y-4">
              {categories.map((category) => (
                <BudgetCategoryAllocation
                  key={category.id}
                  category={category}
                  totalBudget={totalBudget}
                  onPercentageChange={(percentage) => handleCategoryChange(category.id, percentage)}
                  onAmountChange={(amount) => handleCategoryAmountChange(category.id, amount)}
                />
              ))}
            </div>

            <div className="flex justify-between items-center pt-2 border-t">
              <span className="font-medium">Total</span>
              <div className="text-right">
                <div className={`font-bold ${totalAllocated > 100 ? "text-red-500" : ""}`}>
                  {formatCurrency(totalAllocatedAmount)} ({totalAllocated.toFixed(1)}%)
                </div>
                <div className="text-sm text-muted-foreground">
                  {totalAllocated > 100
                    ? `${formatCurrency(totalAllocatedAmount - totalBudget)} over budget`
                    : totalAllocated < 100
                      ? `${formatCurrency(totalBudget - totalAllocatedAmount)} unallocated`
                      : "Perfectly allocated"}
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Category Mapping</h3>
              <div className="text-sm text-muted-foreground">
                {categories.filter(cat => cat.realCategoryId).length} of {categories.length} mapped
              </div>
            </div>

            <div className="space-y-4">
              {categories.map((category) => (
                <div key={category.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{category.icon}</span>
                      <div>
                        <h4 className="font-medium">{category.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(category.amount)} ({category.percentage.toFixed(1)}%)
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {category.realCategoryId ? (
                        <span className="text-sm text-green-600">✓ Mapped</span>
                      ) : (
                        <span className="text-sm text-orange-600">⚠ Not mapped</span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Map to existing category or create new:</Label>
                    <div className="flex space-x-2">
                      <Select
                        value={category.realCategoryId || ""}
                        onValueChange={(value) => {
                          setCategories(cats =>
                            cats.map(cat =>
                              cat.id === category.id
                                ? { ...cat, realCategoryId: value || undefined, isNew: false }
                                : cat
                            )
                          )
                        }}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {realCategories
                            .filter(realCat =>
                              !categories.find(cat => cat.realCategoryId === realCat.id && cat.id !== category.id)
                            )
                            .map(realCat => (
                              <SelectItem key={realCat.id} value={realCat.id}>
                                {realCat.name}
                              </SelectItem>
                            ))
                          }
                        </SelectContent>
                      </Select>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const categoryName = prompt(`Enter name for new "${category.name}" category:`, category.name)
                          if (categoryName?.trim()) {
                            void handleCreateCategory(categoryName.trim(), category)
                          }
                        }}
                      >
                        <PlusIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-lg border p-4 bg-blue-50">
              <h3 className="font-medium mb-2 text-blue-800">Why mapping matters</h3>
              <ul className="space-y-1 text-sm text-blue-700">
                <li>• Your transactions will be categorized correctly</li>
                <li>• Budget tracking will be accurate</li>
                <li>• Reports will show meaningful data</li>
              </ul>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <div className="rounded-lg border p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">Monthly Budget Summary</h3>
                <div className="font-bold">{formatCurrency(totalBudget)}</div>
              </div>

              <div className="space-y-3">
                {categories.filter(cat => cat.realCategoryId).map((category) => (
                  <div key={category.id} className="flex justify-between items-center">
                    <div className="flex items-center">
                      <span className="mr-2">{category.icon}</span>
                      <span>{category.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(category.amount)}</div>
                      <div className="text-xs text-muted-foreground">{category.percentage.toFixed(1)}%</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t flex justify-between items-center">
                <span className="font-medium">Total Allocated</span>
                <div className={`font-bold ${totalAllocated !== 100 ? "text-yellow-500" : ""}`}>
                  {formatCurrency(totalAllocatedAmount)} ({totalAllocated.toFixed(1)}%)
                </div>
              </div>
            </div>

            {totalAllocated !== 100 && (
              <div
                className={`rounded-lg p-4 ${totalAllocated > 100 ? "bg-red-50 text-red-800 border-red-200" : "bg-yellow-50 text-yellow-800 border-yellow-200"} border`}
              >
                <h3 className="font-medium mb-1">
                  {totalAllocated > 100 ? "Budget Overallocated" : "Budget Underallocated"}
                </h3>
                <p className="text-sm">
                  {totalAllocated > 100
                    ? `You&apos;ve allocated ${(totalAllocated - 100).toFixed(1)}% (${formatCurrency(totalAllocatedAmount - totalBudget)}) more than your total budget.`
                    : `You&apos;ve only allocated ${totalAllocated.toFixed(1)}% of your budget. ${formatCurrency(totalBudget - totalAllocatedAmount)} remains unallocated.`}
                </p>
                <Button variant="outline" size="sm" className="mt-2" onClick={() => setStep(2)}>
                  Adjust Allocation
                </Button>
              </div>
            )}

            <div className="rounded-lg border p-4 bg-muted/50">
              <h3 className="font-medium mb-2">What happens next?</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Your budget will be set for the current month</li>
                <li>• You can track your spending against these categories</li>
                <li>• You&apos;ll receive alerts when approaching category limits</li>
                <li>• You can adjust your budget at any time</li>
                <li>• Next month, we&apos;ll suggest a new budget based on this one</li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between">
        {step > 1 ? (
          <Button variant="outline" onClick={() => setStep(step - 1)}>
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back
          </Button>
        ) : (
          <Button variant="outline" onClick={onComplete}>
            Cancel
          </Button>
        )}

        {step < 4 ? (
          <Button
            onClick={() => setStep(step + 1)}
            disabled={step === 3 && categories.filter(cat => cat.realCategoryId).length === 0}
          >
            Next
            <ArrowRightIcon className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || categories.filter(cat => cat.realCategoryId && cat.amount > 0).length === 0}
          >
            {isSubmitting ? "Saving..." : "Save Budget"}
            <CheckIcon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

