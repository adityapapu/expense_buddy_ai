"use client"

// useRef removed as it was unused
import { formatCurrency } from "@/lib/utils";
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar, Line } from 'react-chartjs-2'

// Register Chart.js components
Chart.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend)

interface CategoryData {
  name: string;
  budgeted: number;
  spent: number;
}

interface MonthData {
  label: string;
  categories: CategoryData[];
  totalBudget?: number;
  totalSpent?: number;
}

interface BudgetHistoryChartProps {
  data: MonthData | MonthData[];
  type?: "comparison" | "trend" | "category";
  category?: string;
  height?: number;
}

export function BudgetHistoryChart({ data, type = "comparison", category, height = 400 }: BudgetHistoryChartProps) {
  // Chart ref removed as it was unused

  if (type === "comparison") {
    const comparisonData = data as MonthData;
    // Single month comparison chart (budget vs spent by category)
    const chartData = {
      labels: comparisonData.categories.map((cat) => cat.name),
      datasets: [
        {
          label: "Budgeted",
          data: comparisonData.categories.map((cat) => cat.budgeted),
          backgroundColor: "rgba(53, 162, 235, 0.5)",
          borderColor: "rgba(53, 162, 235, 1)",
          borderWidth: 1,
        },
        {
          label: "Spent",
          data: comparisonData.categories.map((cat) => cat.spent),
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
            callback: (value: any) => formatCurrency(Number(value)),
          },
        },
      },
    }

    return (
      <div style={{ height: `${height}px` }}>
        <Bar data={chartData} options={options as any} />
      </div>
    )
  }

  if (type === "trend") {
    const trendData = data as MonthData[];
    // Multi-month trend chart (total budget and spent over time)
    const chartData = {
      labels: trendData.map((item) => item.label),
      datasets: [
        {
          label: "Total Budget",
          data: trendData.map((item) => item.totalBudget),
          borderColor: "rgba(53, 162, 235, 1)",
          backgroundColor: "rgba(53, 162, 235, 0.2)",
          borderWidth: 2,
          fill: true,
        },
        {
          label: "Total Spent",
          data: trendData.map((item) => item.totalSpent),
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
            callback: (value: any) => formatCurrency(Number(value)),
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
    const categoryTrendData = data as MonthData[];
    // Single category trend over time
    const categoryData = categoryTrendData.map((item) => {
      const cat = item.categories.find((c) => c.name === category)
      return {
        month: item.label,
        budgeted: cat ? cat.budgeted : 0,
        spent: cat ? cat.spent : 0,
      }
    })

    const chartData = {
      labels: categoryData.map((item) => item.month),
      datasets: [
        {
          label: "Budgeted",
          data: categoryData.map((item) => item.budgeted),
          borderColor: "rgba(53, 162, 235, 1)",
          backgroundColor: "rgba(53, 162, 235, 0.2)",
          borderWidth: 2,
          pointRadius: height < 150 ? 2 : 3,
        },
        {
          label: "Spent",
          data: categoryData.map((item) => item.spent),
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
            callback: (value: any) => formatCurrency(Number(value)),
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

