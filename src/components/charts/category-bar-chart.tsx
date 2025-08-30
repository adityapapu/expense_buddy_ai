"use client"

import { useRef, useState, useEffect } from "react"
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js"
import { Bar } from "react-chartjs-2"

// Register Chart.js components
Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface CategoryData {
  category: string
  amount: number
  percentage: number
  color: string
}

interface CategoryBarChartProps {
  data: CategoryData[]
}

export function CategoryBarChart({ data }: CategoryBarChartProps) {
  const chartRef = useRef<Chart | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  // Safely handle window with useEffect
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    // Set initial value
    handleResize()

    // Add event listener
    window.addEventListener("resize", handleResize)

    // Clean up
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const chartData = {
    labels: data.map((item) => item.category),
    datasets: [
      {
        label: "Amount Spent",
        data: data.map((item) => item.amount),
        backgroundColor: data.map((item) => item.color),
        borderColor: data.map((item) => item.color),
        borderWidth: 1,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: "y" as const,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.dataset.label || ""
            const value = context.raw || 0
            const percentage = ((value / data.reduce((sum, item) => sum + item.amount, 0)) * 100).toFixed(1)
            return `${label}: $${value.toFixed(2)} (${percentage}%)`
          },
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          callback: (value: any) => {
            // Shorter labels on mobile
            return isMobile ? "$" + value : "$" + value
          },
          maxRotation: 0,
          font: {
            size: isMobile ? 9 : 11,
          },
        },
      },
      y: {
        ticks: {
          font: {
            size: isMobile ? 9 : 11,
          },
        },
      },
    },
  }

  return (
    <div className="h-full w-full">
      <Bar data={chartData} options={options} />
    </div>
  )
}

