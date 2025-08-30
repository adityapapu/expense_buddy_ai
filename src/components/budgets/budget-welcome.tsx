"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronRightIcon, PiggyBankIcon } from "lucide-react"
import { BudgetSetupWizard } from "./budget-setup-wizard"

interface BudgetWelcomeProps {
  hasExistingBudgets: boolean
}

export function BudgetWelcome({ hasExistingBudgets }: BudgetWelcomeProps) {
  // Set to true to immediately show the setup wizard for testing
  const [showSetupWizard, setShowSetupWizard] = useState(true)

  if (showSetupWizard) {
    return <BudgetSetupWizard onComplete={() => setShowSetupWizard(false)} />
  }

  return (
    <Card className="border-dashed">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <PiggyBankIcon className="h-6 w-6 text-primary" />
          <CardTitle>{hasExistingBudgets ? "Update Your Budget" : "Welcome to Budget Management"}</CardTitle>
        </div>
        <CardDescription>
          {hasExistingBudgets
            ? "It's a new month! Would you like to update your budget allocations?"
            : "Start managing your finances by setting up your first budget."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col items-center text-center p-4 rounded-lg border bg-background/50">
              <div className="rounded-full bg-primary/10 p-3 mb-3">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="font-medium">Plan Your Spending</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Set limits for different categories to keep your finances on track.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-4 rounded-lg border bg-background/50">
              <div className="rounded-full bg-primary/10 p-3 mb-3">
                <span className="text-2xl">📈</span>
              </div>
              <h3 className="font-medium">Track Progress</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Monitor your spending against your budget in real-time.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-4 rounded-lg border bg-background/50">
              <div className="rounded-full bg-primary/10 p-3 mb-3">
                <span className="text-2xl">💰</span>
              </div>
              <h3 className="font-medium">Achieve Goals</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Save more and spend smarter by sticking to your budget plan.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={() => setShowSetupWizard(true)}>
          {hasExistingBudgets ? "Update Monthly Budget" : "Set Up Your First Budget"}
          <ChevronRightIcon className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}

