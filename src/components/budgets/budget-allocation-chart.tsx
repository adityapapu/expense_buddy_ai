"use client"

import React, { useState, useEffect } from "react"
import { Chart, ArcElement, Tooltip, Legend } from "chart.js"
import { Doughnut } from "react-chartjs-2"
import { formatCurrency } from "@/lib/utils";
import { getBudgetSpending, type BudgetSpending } from "@/lib/actions/budgets";

// Register Chart.js components
Chart.register(ArcElement, Tooltip, Legend)

interface TooltipContext {
  label: string;
  raw: unknown;
  dataset: {
    data: number[];
  };
  dataIndex: number;
}

// Color palette for charts
const COLORS = [
  "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF",
  "#FF9F40", "#8AC926", "#1982C4", "#FF6B6B", "#4ECDC4",
  "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD", "#98D8C8"
]

interface BudgetAllocationChartProps {
  data?: BudgetSpending[];
}

export function BudgetAllocationChart({ data }: BudgetAllocationChartProps) {
  const [budgetData, setBudgetData] = useState<BudgetSpending[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (data) {
      setBudgetData(data)
      setLoading(false)
    } else {
      void getBudgetSpending()
        .then(spendingData => {
          setBudgetData(spendingData)
          setLoading(false)
        })
        .catch(error => {
          console.error("Failed to fetch budget spending:", error)
          setLoading(false)
        })
    }
  }, [data])

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-sm text-muted-foreground">Loading chart data...</div>
      </div>
    )
  }

  if (budgetData.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-sm text-muted-foreground">No budget data available</div>
      </div>
    )
  }

  const chartData = {
    labels: budgetData.map((item) => item.categoryName),
    datasets: [
      {
        label: "Budget Allocation",
        data: budgetData.map((item) => item.budgetedAmount),
        backgroundColor: budgetData.map((_, index) => COLORS[index % COLORS.length]),
        borderColor: budgetData.map((_, index) => COLORS[index % COLORS.length]),
        borderWidth: 1,
        hoverOffset: 10,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "60%",
    plugins: {
      legend: {
        position: "right" as const,
        labels: {
          boxWidth: 12,
          padding: 15,
          font: {
            size: 11,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context: TooltipContext) => {
            const label = context.label ?? ""
            const value = typeof context.raw === 'number' ? context.raw : 0
            const dataset = context.dataset
            const total = dataset.data.reduce((acc: number, data: number) => acc + data, 0)
            const percentage = ((value / total) * 100).toFixed(1)
            const budgetItem = budgetData[context.dataIndex]
            const spent = budgetItem?.spentAmount ?? 0
            const spentPercentage = value > 0 ? ((spent / value) * 100).toFixed(1) : "0.0"

            return [
              `${label}: ${formatCurrency(value)} (${percentage}% of total)`,
              `Spent: ${formatCurrency(spent)} (${spentPercentage}% used)`,
            ]
          },
        },
      },
    },
  }

  return (
    <div className="h-full w-full flex flex-col md:flex-row items-center justify-center gap-4">
      <div className="h-[300px] w-full md:w-1/2">
        <Doughnut data={chartData} options={options as any} />
      </div>
      <div className="w-full md:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-2">
        {budgetData.map((item, index) => (
          <div key={item.categoryId} className="flex items-center p-2 rounded-md border">
            <div className="h-3 w-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
            <div className="flex-1">
              <div className="text-sm font-medium">{item.categoryName}</div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>
                  {formatCurrency(item.spentAmount)} of {formatCurrency(item.budgetedAmount)}
                </span>
                <span>{item.percentageUsed.toFixed(0)}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

