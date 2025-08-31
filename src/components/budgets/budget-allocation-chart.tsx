"use client"

import React from "react"
import { Chart, ArcElement, Tooltip, Legend } from "chart.js"
import { Doughnut } from "react-chartjs-2"
import { formatCurrency } from "@/lib/utils";

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

// This would typically come from an API or database
const budgetData = [
  { category: "Housing", amount: 1000, color: "#FF6384", spent: 950 },
  { category: "Food", amount: 500, color: "#36A2EB", spent: 425 },
  { category: "Transportation", amount: 200, color: "#FFCE56", spent: 180 },
  { category: "Entertainment", amount: 150, color: "#4BC0C0", spent: 180 },
  { category: "Utilities", amount: 300, color: "#9966FF", spent: 275 },
  { category: "Healthcare", amount: 100, color: "#FF9F40", spent: 65 },
  { category: "Personal", amount: 150, color: "#8AC926", spent: 125 },
  { category: "Savings", amount: 400, color: "#1982C4", spent: 400 },
]

export function BudgetAllocationChart() {
  // Chart ref removed as it was unused

  const chartData = {
    labels: budgetData.map((item) => item.category),
    datasets: [
      {
        label: "Budget Allocation",
        data: budgetData.map((item) => item.amount),
        backgroundColor: budgetData.map((item) => item.color),
        borderColor: budgetData.map((item) => item.color),
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
            const spent = budgetData[context.dataIndex]?.spent ?? 0
            const spentPercentage = ((spent / value) * 100).toFixed(1)

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
        {budgetData.map((item) => (
          <div key={item.category} className="flex items-center p-2 rounded-md border">
            <div className="h-3 w-3 rounded-full mr-2" style={{ backgroundColor: item.color }} />
            <div className="flex-1">
              <div className="text-sm font-medium">{item.category}</div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>
                  {formatCurrency(item.spent)} of {formatCurrency(item.amount)}
                </span>
                <span>{((item.spent / item.amount) * 100).toFixed(0)}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

