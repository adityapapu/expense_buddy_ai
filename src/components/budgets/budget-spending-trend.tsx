"use client"

import { useRef } from "react"
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js"
import { Line } from "react-chartjs-2"
import { formatCurrency } from "@/lib/utils"

// Register Chart.js components
Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

// This would typically come from an API or database
const trendData = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  datasets: [
    {
      label: "Budget",
      data: [2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000],
      borderColor: "#9966FF",
      backgroundColor: "rgba(153, 102, 255, 0.2)",
      borderWidth: 2,
      pointRadius: 3,
      tension: 0.1,
    },
    {
      label: "Actual Spending",
      data: [1850, 1950, 2100, 1900, 1800, 1950, 2200, 2100, 1950, 1850, 1750, 1350],
      borderColor: "#FF6384",
      backgroundColor: "rgba(255, 99, 132, 0.2)",
      borderWidth: 2,
      pointRadius: 3,
      tension: 0.1,
    },
  ],
}

export function BudgetSpendingTrend() {
  const chartRef = useRef<Chart | null>(null)

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
          callback: (value: any) => formatCurrency(value),
        },
      },
    },
  }

  return (
    <div className="h-full w-full">
      <Line data={trendData} options={options} />
    </div>
  )
}

