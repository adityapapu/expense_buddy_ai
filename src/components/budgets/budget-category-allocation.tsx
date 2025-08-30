"use client"

import { useState } from "react"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { formatCurrency } from "@/lib/utils"

interface BudgetCategoryAllocationProps {
  category: {
    id: string
    name: string
    icon: string
    percentage: number
    amount: number
  }
  totalBudget: number
  onPercentageChange: (percentage: number) => void
  onAmountChange: (amount: number) => void
}

export function BudgetCategoryAllocation({
  category,
  totalBudget,
  onPercentageChange,
  onAmountChange,
}: BudgetCategoryAllocationProps) {
  const [isEditingAmount, setIsEditingAmount] = useState(false)

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <span className="mr-2">{category.icon}</span>
          <span className="font-medium">{category.name}</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-sm font-medium w-16 text-right">{category.percentage.toFixed(1)}%</div>
          {isEditingAmount ? (
            <div className="relative w-24">
              <span className="absolute left-2 top-1.5 text-xs">$</span>
              <Input
                type="number"
                value={category.amount}
                onChange={(e) => onAmountChange(Number.parseFloat(e.target.value) || 0)}
                onBlur={() => setIsEditingAmount(false)}
                className="h-8 pl-5 pr-2 text-right text-sm"
                autoFocus
              />
            </div>
          ) : (
            <div
              className="w-24 text-right cursor-pointer hover:text-primary transition-colors"
              onClick={() => setIsEditingAmount(true)}
            >
              {formatCurrency(category.amount)}
            </div>
          )}
        </div>
      </div>
      <Slider
        value={[category.percentage]}
        max={100}
        step={0.5}
        onValueChange={(values) => onPercentageChange(values[0])}
      />
    </div>
  )
}

