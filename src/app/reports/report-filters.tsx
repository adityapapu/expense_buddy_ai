"use client"

import { useState } from "react"
import { format } from "date-fns"
import { CalendarIcon, ChevronDown } from "lucide-react"
import type { DateRange } from "react-day-picker"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Badge } from "@/components/ui/badge"

// Mock categories data - in a real app, this would come from your database
const categories = [
  { id: "1", name: "Food & Dining", icon: "🍔" },
  { id: "2", name: "Transportation", icon: "🚗" },
  { id: "3", name: "Housing", icon: "🏠" },
  { id: "4", name: "Entertainment", icon: "🎬" },
  { id: "5", name: "Shopping", icon: "🛍️" },
  { id: "6", name: "Utilities", icon: "💡" },
  { id: "7", name: "Healthcare", icon: "🏥" },
  { id: "8", name: "Travel", icon: "✈️" },
]

interface ReportFiltersProps {
  dateRange: DateRange | undefined
  onDateRangeChange: (range: DateRange | undefined) => void
  selectedCategories: string[]
  onCategoryChange: (categories: string[]) => void
}

export function ReportFilters({
  dateRange,
  onDateRangeChange,
  selectedCategories,
  onCategoryChange,
}: ReportFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleCategoryToggle = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      onCategoryChange(selectedCategories.filter((id) => id !== categoryId))
    } else {
      onCategoryChange([...selectedCategories, categoryId])
    }
  }

  const clearFilters = () => {
    onCategoryChange([])
    onDateRangeChange({
      from: new Date(new Date().getFullYear(), new Date().getMonth() - 2, 1),
      to: new Date(),
    })
  }

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start text-left font-normal w-full sm:w-auto">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={onDateRangeChange}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>

              <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
                {selectedCategories.length > 0 && (
                  <>
                    {selectedCategories.map((id) => {
                      const category = categories.find((c) => c.id === id)
                      return (
                        <Badge key={id} variant="secondary" className="px-2 py-1">
                          {category?.icon} {category?.name}
                        </Badge>
                      )
                    })}
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7 px-2">
                      Clear
                    </Button>
                  </>
                )}
              </div>
            </div>

            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center gap-1">
                {isOpen ? "Hide Filters" : "Show Filters"}
                <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
              </Button>
            </CollapsibleTrigger>
          </div>

          <CollapsibleContent className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category.id}`}
                    checked={selectedCategories.includes(category.id)}
                    onCheckedChange={() => handleCategoryToggle(category.id)}
                  />
                  <label
                    htmlFor={`category-${category.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {category.icon} {category.name}
                  </label>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  )
}

