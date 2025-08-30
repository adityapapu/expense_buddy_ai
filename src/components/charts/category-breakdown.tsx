"use client"

import type React from "react"

import { Progress } from "@/components/ui/progress"
import { formatCurrency } from "@/lib/utils"

interface CategoryData {
  category: string
  amount: number
  percentage: number
  color: string
}

interface CategoryBreakdownProps {
  data: CategoryData[]
  totalSpent: number
}

export function CategoryBreakdown({ data, totalSpent }: CategoryBreakdownProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Category Breakdown</h3>

      <div className="space-y-3 sm:space-y-5">
        {data.map((item) => (
          <div key={item.category} className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-3 w-3 rounded-full mr-2" style={{ backgroundColor: item.color }} />
                <span className="text-sm font-medium truncate max-w-[120px] sm:max-w-none">{item.category}</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-medium">{formatCurrency(item.amount)}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Progress
                value={item.percentage}
                className="h-2 flex-grow"
                style={
                  {
                    "--progress-foreground": item.color,
                  } as React.CSSProperties
                }
              />
              <span className="text-xs text-muted-foreground ml-2 min-w-[40px] text-right">
                {item.percentage.toFixed(1)}%
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Top Categories</span>
          <span className="text-muted-foreground">% of Total</span>
        </div>

        <div className="mt-2 space-y-2">
          {data.slice(0, 3).map((item) => (
            <div key={`top-${item.category}`} className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-2 w-2 rounded-full mr-2" style={{ backgroundColor: item.color }} />
                <span className="text-xs">{item.category}</span>
              </div>
              <span className="text-xs font-medium">{item.percentage.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

