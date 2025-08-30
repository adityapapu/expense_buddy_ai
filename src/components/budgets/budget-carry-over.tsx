"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRightIcon, CalendarIcon, CheckIcon, CopyIcon } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface BudgetCarryOverProps {
  previousMonth: {
    label: string
    totalBudget: number
    categories: Array<{
      name: string
      icon: string
      budgeted: number
    }>
  }
  onCarryOver: () => void
  onCustomize: () => void
}

export function BudgetCarryOver({ previousMonth, onCarryOver, onCustomize }: BudgetCarryOverProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleCarryOver = async () => {
    setIsSubmitting(true)
    try {
      // This would typically be an API call to carry over the budget
      await new Promise((resolve) => setTimeout(resolve, 1000))
      onCarryOver()
    } catch (error) {
      console.error("Error carrying over budget:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <CalendarIcon className="h-5 w-5 text-primary" />
          <CardTitle>New Month Started</CardTitle>
        </div>
        <CardDescription>Would you like to carry over your budget from {previousMonth.label}?</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="rounded-lg border p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium">Previous Budget</h3>
              <div className="font-bold">{formatCurrency(previousMonth.totalBudget)}</div>
            </div>

            <div className="space-y-2">
              {previousMonth.categories.map((category) => (
                <div key={category.name} className="flex justify-between items-center">
                  <div className="flex items-center">
                    <span className="mr-2">{category.icon}</span>
                    <span>{category.name}</span>
                  </div>
                  <div>{formatCurrency(category.budgeted)}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="flex flex-col items-center text-center p-4 rounded-lg border bg-muted/50">
              <CopyIcon className="h-8 w-8 text-primary mb-2" />
              <h3 className="font-medium">Automatic Carry-Over</h3>
              <p className="text-sm text-muted-foreground mt-1">
                We'll use the same budget allocations for the current month.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onCustomize}>
          Customize Budget
          <ArrowRightIcon className="ml-2 h-4 w-4" />
        </Button>
        <Button onClick={handleCarryOver} disabled={isSubmitting}>
          {isSubmitting ? "Processing..." : "Use Previous Budget"}
          <CheckIcon className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}

