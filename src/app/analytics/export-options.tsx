"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Download, FileSpreadsheet, FileText, Share2, Loader2 } from "lucide-react"
import { toast } from "sonner"
import type { DateRange } from "react-day-picker"
import { exportTransactionsCSV, exportAnalyticsSummary } from "@/lib/actions/analytics"

interface ExportOptionsProps {
  dateRange?: DateRange
  selectedCategories?: string[]
  searchTerm?: string
  sortBy?: string
}

export function ExportOptions({ dateRange, selectedCategories, searchTerm, sortBy }: ExportOptionsProps) {
  const [isExporting, setIsExporting] = useState<string | null>(null)

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleExport = async (format: string) => {
    try {
      setIsExporting(format)

      if (format === "CSV") {
        const csvContent = await exportTransactionsCSV(dateRange, selectedCategories, searchTerm, sortBy)
        downloadFile(csvContent, `transactions-${new Date().toISOString().split('T')[0]}.csv`, 'text/csv')
        toast.success("Transactions exported successfully")
      } else if (format === "Summary") {
        const { csvContent } = await exportAnalyticsSummary(dateRange)
        downloadFile(csvContent, `analytics-summary-${new Date().toISOString().split('T')[0]}.csv`, 'text/csv')
        toast.success("Analytics summary exported successfully")
      } else if (format === "PDF") {
        // TODO: Implement PDF export with chart images
        toast.info("PDF export coming soon")
      } else if (format === "Excel") {
        // TODO: Implement Excel export (requires xlsx library)
        toast.info("Excel export coming soon")
      }
    } catch (error) {
      console.error("Export failed:", error)
      toast.error("Export failed. Please try again.")
    } finally {
      setIsExporting(null)
    }
  }

  const handleShare = () => {
    // TODO: Implement sharing functionality
    toast.info("Share functionality coming soon")
  }

  return (
    <div className="flex gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2" disabled={isExporting !== null}>
            <Download className="h-4 w-4" />
            <span>Export</span>
            {isExporting && <Loader2 className="h-4 w-4 animate-spin" />}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => handleExport("CSV")}
            disabled={isExporting !== null}
          >
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            <span>Export as CSV</span>
            {isExporting === "CSV" && <Loader2 className="ml-2 h-3 w-3 animate-spin" />}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleExport("Summary")}
            disabled={isExporting !== null}
          >
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            <span>Export Summary</span>
            {isExporting === "Summary" && <Loader2 className="ml-2 h-3 w-3 animate-spin" />}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleExport("PDF")}
            disabled={isExporting !== null || true}
          >
            <FileText className="mr-2 h-4 w-4" />
            <span>Export as PDF (Coming Soon)</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleExport("Excel")}
            disabled={isExporting !== null || true}
          >
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            <span>Export as Excel (Coming Soon)</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button variant="ghost" size="icon" onClick={handleShare} disabled={isExporting !== null}>
        <Share2 className="h-4 w-4" />
        <span className="sr-only">Share</span>
      </Button>
    </div>
  )
}