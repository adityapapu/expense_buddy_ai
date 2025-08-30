"use client"

import { useRef } from "react"
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
} from "chart.js"
import { Bar, Line } from "react-chartjs-2"
import { formatCurrency } from "@/lib/utils"

// Register Chart.js components
Chart.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend)

interface BudgetHistoryChartProps {
  data: any
  type?: "comparison" | "trend" | "category"
  category?: string
  height?: number
}

export function BudgetHistoryChart({ data, type = "comparison", category, height = 400 }: BudgetHistoryChartProps) {
  const chartRef = useRef<Chart | null>(null)

  if (type === "comparison") {
    // Single month comparison chart (budget vs spent by category)
    const chartData = {
      labels: data.categories.map((cat: any) => cat.name),
      datasets: [
        {
          label: "Budgeted",
          data: data.categories.map((cat: any) => cat.budgeted),
          backgroundColor: "rgba(53, 162, 235, 0.5)",
          borderColor: "rgba(53, 162, 235, 1)",
          borderWidth: 1,
        },
        {
          label: "Spent",
          data: data.categories.map((cat: any) => cat.spent),
          backgroundColor: "rgba(255, 99, 132, 0.5)",
          borderColor: "rgba(255, 99, 132, 1)",
          borderWidth: 1,
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
            callback: (value: any) => formatCurrency(value),
          },
        },
      },
    }

    return (
      <div style={{ height: `${height}px` }}>
        <Bar data={chartData} options={options} />
      </div>
    )
  }

  if (type === "trend") {
    // Multi-month trend chart (total budget and spent over time)
    const chartData = {
      labels: data.map((item: any) => item.label),
      datasets: [
        {
          label: "Total Budget",
          data: data.map((item: any) => item.totalBudget),
          borderColor: "rgba(53, 162, 235, 1)",
          backgroundColor: "rgba(53, 162, 235, 0.2)",
          borderWidth: 2,
          fill: true,
        },
        {
          label: "Total Spent",
          data: data.map((item: any) => item.totalSpent),
          borderColor: "rgba(255, 99, 132, 1)",
          backgroundColor: "rgba(255, 99, 132, 0.2)",
          borderWidth: 2,
          fill: true,
        },
      ],
    }

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top" as const,
          display: height > 200,
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
            display: height > 150,
          },
        },
        x: {
          ticks: {
            display: height > 150,
          },
        },
      },
    }

    return (
      <div style={{ height: `${height}px` }}>
        <Line data={chartData} options={options} />
      </div>
    )
  }

  if (type === "category") {
    // Single category trend over time
    const categoryData = data.map((item: any) => {
      const cat = item.categories.find((c: any) => c.name === category)
      return {
        month: item.label,
        budgeted: cat ? cat.budgeted : 0,
        spent: cat ? cat.spent : 0,
      }
    })

    const chartData = {
      labels: categoryData.map((item: any) => item.month),
      datasets: [
        {
          label: "Budgeted",
          data: categoryData.map((item: any) => item.budgeted),
          borderColor: "rgba(53, 162, 235, 1)",
          backgroundColor: "rgba(53, 162, 235, 0.2)",
          borderWidth: 2,
          pointRadius: height < 150 ? 2 : 3,
        },
        {
          label: "Spent",
          data: categoryData.map((item: any) => item.spent),
          borderColor: "rgba(255, 99, 132, 1)",
          backgroundColor: "rgba(255, 99, 132, 0.2)",
          borderWidth: 2,
          pointRadius: height < 150 ? 2 : 3,
        },
      ],
    }

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
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
            display: height > 150,
          },
        },
        x: {
          ticks: {
            display: height > 150,
          },
        },
      },
    }

    return (
      <div style={{ height: `${height}px` }}>
        <Line data={chartData} options={options} />
      </div>
    )
  }

  return null
}

