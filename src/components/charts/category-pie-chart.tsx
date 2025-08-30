"use client"

import { useRef, useState, useEffect } from "react"
import { Chart, ArcElement, Tooltip, Legend } from "chart.js"
import { Pie } from "react-chartjs-2"

// Register Chart.js components
Chart.register(ArcElement, Tooltip, Legend)

interface CategoryData {
  category: string
  amount: number
  percentage: number
  color: string
}

interface CategoryPieChartProps {
  data: CategoryData[]
}

export function CategoryPieChart({ data }: CategoryPieChartProps) {
  const chartRef = useRef<Chart | null>(null)
  const [legendPosition, setLegendPosition] = useState<"right" | "bottom">("right")

  // Safely handle window resize with useEffect
  useEffect(() => {
    const handleResize = () => {
      setLegendPosition(window.innerWidth < 768 ? "bottom" : "right")
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
        data: data.map((item) => item.amount),
        backgroundColor: data.map((item) => item.color),
        borderColor: data.map((item) => item.color),
        borderWidth: 1,
        hoverOffset: 10,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: legendPosition,
        labels: {
          boxWidth: 12,
          padding: legendPosition === "bottom" ? 10 : 15,
          font: {
            size: 11,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.label || ""
            const value = context.raw || 0
            const percentage = ((value / data.reduce((sum, item) => sum + item.amount, 0)) * 100).toFixed(1)
            return `${label}: $${value.toFixed(2)} (${percentage}%)`
          },
        },
      },
    },
  }

  return (
    <div className="h-full w-full">
      <Pie data={chartData} options={options} />
    </div>
  )
}

