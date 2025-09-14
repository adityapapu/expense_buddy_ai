"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { CalendarIcon, ChevronDown, Loader2 } from "lucide-react"
import type { DateRange } from "react-day-picker"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Badge } from "@/components/ui/badge"
import { getUserCategories, type CategoryData } from "@/lib/actions/analytics"

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
  const [categories, setCategories] = useState<CategoryData[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch user categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoadingCategories(true)
        setError(null)
        const userCategories = await getUserCategories()
        setCategories(userCategories)
      } catch (err) {
        console.error("Failed to fetch categories:", err)
        setError("Failed to load categories")
        setCategories([])
      } finally {
        setIsLoadingCategories(false)
      }
    }

    void fetchCategories()
  }, [])

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
            {isLoadingCategories ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Loading categories...</span>
              </div>
            ) : error ? (
              <div className="text-center py-4 text-sm text-muted-foreground">
                {error}
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-4 text-sm text-muted-foreground">
                No categories found. Create some categories to see them here.
              </div>
            ) : (
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
            )}
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  )
}