"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Download, FileSpreadsheet, FileText, Share2 } from "lucide-react"
import { toast } from "sonner"

export function ExportOptions() {
  const handleExport = (format: string) => {
    // In a real app, this would trigger the actual export functionality
    toast.success(`Report exported as ${format}`)
  }

  const handleShare = () => {
    // In a real app, this would open a sharing dialog
    toast.success("Share link copied to clipboard")
  }

  return (
    <div className="flex gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleExport("PDF")}>
            <FileText className="mr-2 h-4 w-4" />
            <span>Export as PDF</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExport("Excel")}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            <span>Export as Excel</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExport("CSV")}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            <span>Export as CSV</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button variant="ghost" size="icon" onClick={handleShare}>
        <Share2 className="h-4 w-4" />
        <span className="sr-only">Share</span>
      </Button>
    </div>
  )
}

