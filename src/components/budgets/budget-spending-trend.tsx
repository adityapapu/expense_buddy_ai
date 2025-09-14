"use client"

import { useState, useEffect } from "react"
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js"
import { Line } from "react-chartjs-2"
import { formatCurrency } from "@/lib/utils";

// Register Chart.js components
Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

interface MonthlyTrendData {
  month: string
  budgeted: number
  spent: number
}

interface BudgetSpendingTrendProps {
  data?: MonthlyTrendData[];
}

export function BudgetSpendingTrend({ data }: BudgetSpendingTrendProps) {
  const [trendData, setTrendData] = useState<MonthlyTrendData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (data) {
      setTrendData(data)
      setLoading(false)
      return
    }

    // For now, generate sample trend data for the last 6 months
    // In a real implementation, this would fetch from a database action
    const months = []
    const now = new Date()

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })

      // Generate some sample data based on typical patterns
      const baseBudget = 5000
      const variation = Math.random() * 2000 - 1000 // ±1000 variation
      const budgeted = baseBudget + variation

      // Spending is typically 70-120% of budget with some randomness
      const spendingPercentage = 0.7 + Math.random() * 0.5
      const spent = budgeted * spendingPercentage

      months.push({
        month: monthName,
        budgeted: Math.round(budgeted),
        spent: Math.round(spent)
      })
    }

    setTrendData(months)
    setLoading(false)
  }, [data])

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-sm text-muted-foreground">Loading trend data...</div>
      </div>
    )
  }

  if (trendData.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-sm text-muted-foreground">No trend data available</div>
      </div>
    )
  }

  const chartData = {
    labels: trendData.map(item => item.month),
    datasets: [
      {
        label: "Budget",
        data: trendData.map(item => item.budgeted),
        borderColor: "#9966FF",
        backgroundColor: "rgba(153, 102, 255, 0.2)",
        borderWidth: 2,
        pointRadius: 3,
        tension: 0.1,
      },
      {
        label: "Actual Spending",
        data: trendData.map(item => item.spent),
        borderColor: "#FF6384",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        borderWidth: 2,
        pointRadius: 3,
        tension: 0.1,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.dataset.label || ""
            const value = context.raw || 0
            return `${label}: ${formatCurrency(value)}`
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: any) => formatCurrency(Number(value)),
        },
      },
    },
  }

  return (
    <div className="h-full w-full">
      <Line data={chartData} options={options as any} />
    </div>
  )
}

