"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon, PiggyBankIcon } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { BudgetCategoryAllocation } from "./budget-category-allocation"

// Default categories with icons and suggested percentages
const defaultCategories = [
  { id: "1", name: "Housing", icon: "🏠", percentage: 30, amount: 0 },
  { id: "2", name: "Food", icon: "🍔", percentage: 15, amount: 0 },
  { id: "3", name: "Transportation", icon: "🚗", percentage: 10, amount: 0 },
  { id: "4", name: "Utilities", icon: "💡", percentage: 10, amount: 0 },
  { id: "5", name: "Entertainment", icon: "🎬", percentage: 5, amount: 0 },
  { id: "6", name: "Healthcare", icon: "🏥", percentage: 5, amount: 0 },
  { id: "7", name: "Personal", icon: "👤", percentage: 5, amount: 0 },
  { id: "8", name: "Savings", icon: "💰", percentage: 20, amount: 0 },
]

interface BudgetSetupWizardProps {
  onComplete: () => void
}

export function BudgetSetupWizard({ onComplete }: BudgetSetupWizardProps) {
  const [step, setStep] = useState(1)
  const [totalBudget, setTotalBudget] = useState(2000)
  const [categories, setCategories] = useState(() => {
    // Initialize category amounts based on percentages
    return defaultCategories.map((cat) => ({
      ...cat,
      amount: (cat.percentage / 100) * totalBudget,
    }))
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  // Handle form submission
  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      // This would typically be an API call to save the budget
      console.log("Saving budget:", {
        totalBudget,
        categories,
        month: new Date().toISOString().slice(0, 7), // YYYY-MM format
      })

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      onComplete()
    } catch (error) {
      console.error("Error saving budget:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <PiggyBankIcon className="h-6 w-6 text-primary" />
            <CardTitle>Budget Setup</CardTitle>
          </div>
          <div className="text-sm text-muted-foreground">Step {step} of 3</div>
        </div>
        <CardDescription>
          {step === 1 && "Let's start by setting your total monthly budget."}
          {step === 2 && "Now, allocate your budget across different categories."}
          {step === 3 && "Review your budget allocation before saving."}
        </CardDescription>
        <Progress value={(step / 3) * 100} className="h-1" />
      </CardHeader>

      <CardContent>
        {step === 1 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="total-budget">Total Monthly Budget</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5">$</span>
                <Input
                  id="total-budget"
                  type="number"
                  value={totalBudget}
                  onChange={(e) => handleTotalBudgetChange(Number.parseFloat(e.target.value) || 0)}
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
                onValueChange={(values) => handleTotalBudgetChange(values[0])}
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>$1,000</span>
                <span>$5,000</span>
                <span>$10,000</span>
              </div>
            </div>

            <div className="rounded-lg border p-4 bg-muted/50">
              <h3 className="font-medium mb-2">Budget Tips</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Consider using the 50/30/20 rule: 50% for needs, 30% for wants, 20% for savings</li>
                <li>• Include all regular expenses like rent, utilities, groceries, and transportation</li>
                <li>• Don't forget to budget for irregular expenses like annual subscriptions</li>
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
              indicatorClassName={
                totalAllocated > 100 ? "bg-red-500" : totalAllocated === 100 ? "bg-green-500" : "bg-yellow-500"
              }
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
            <div className="rounded-lg border p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">Monthly Budget Summary</h3>
                <div className="font-bold">{formatCurrency(totalBudget)}</div>
              </div>

              <div className="space-y-3">
                {categories.map((category) => (
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
                    ? `You've allocated ${(totalAllocated - 100).toFixed(1)}% (${formatCurrency(totalAllocatedAmount - totalBudget)}) more than your total budget.`
                    : `You've only allocated ${totalAllocated.toFixed(1)}% of your budget. ${formatCurrency(totalBudget - totalAllocatedAmount)} remains unallocated.`}
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
                <li>• You'll receive alerts when approaching category limits</li>
                <li>• You can adjust your budget at any time</li>
                <li>• Next month, we'll suggest a new budget based on this one</li>
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

        {step < 3 ? (
          <Button onClick={() => setStep(step + 1)}>
            Next
            <ArrowRightIcon className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Budget"}
            <CheckIcon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

