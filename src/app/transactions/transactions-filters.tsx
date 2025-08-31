"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { MultiSelect } from "@/components/ui/multi-select";
import type { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";

export interface FilterState {
  dateRange: DateRange | undefined;
  type: "all" | "income" | "expense";
  categories: string[];
  amountRange: number[];
  paymentMethods: string[];
  searchQuery: string;
}

interface TransactionsFiltersProps {
  categories?: { id: string; name: string }[];
  paymentMethods?: { id: string; name: string }[];
  className?: string;
  onFiltersChange: (filters: FilterState) => void;
  initialFilters: FilterState;
}

export function TransactionsFilters({
  categories,
  paymentMethods,
  className,
  onFiltersChange,
  initialFilters,
}: TransactionsFiltersProps) {
  console.log("categories", categories);
  console.log("paymentMethods", paymentMethods);
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  // Update parent component when filters change
  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setFilters((prev) => ({ ...prev, dateRange: range }));
  };

  const handleCategoriesChange = (selectedCategories: string[]) => {
    setFilters((prev) => ({ ...prev, categories: selectedCategories }));
  };

  const handlePaymentMethodsChange = (selectedMethods: string[]) => {
    setFilters((prev) => ({ ...prev, paymentMethods: selectedMethods }));
  };

  const handleAmountRangeChange = (values: number[]) => {
    setFilters((prev) => ({ ...prev, amountRange: values }));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, searchQuery: e.target.value }));
  };

  const handleReset = () => {
    setFilters({
      dateRange: undefined,
      type: "all",
      categories: [],
      amountRange: [0, 100000],
      paymentMethods: [],
      searchQuery: "",
    });
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="search">Search</Label>
          <Input
            id="search"
            placeholder="Search transactions..."
            value={filters.searchQuery}
            onChange={handleSearchChange}
          />
        </div>

        <div className="space-y-2">
          <Label>Date Range</Label>
          <DatePickerWithRange
            date={filters.dateRange}
            onDateChange={handleDateRangeChange}
          />
        </div>

        <div className="space-y-2">
          <Label>Categories</Label>
          <MultiSelect
            options={(categories ?? []).map((cat) => ({
              label: cat.name,
              value: cat.id,
            }))}
            selected={filters.categories}
            onChange={handleCategoriesChange}
            placeholder="Select categories"
          />
        </div>

        <div className="space-y-2">
          <Label>Payment Methods</Label>
          <MultiSelect
            options={(paymentMethods ?? []).map((method) => ({
              label: method.name,
              value: method.id,
            }))}
            selected={filters.paymentMethods}
            onChange={handlePaymentMethodsChange}
            placeholder="Select payment methods"
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <Label>Amount Range</Label>
          <span className="text-sm text-muted-foreground">
            ₹{filters.amountRange[0]} - ₹{filters.amountRange[1]}
          </span>
        </div>
        <Slider
          defaultValue={[0, 100000]}
          min={0}
          max={100000}
          step={100}
          value={filters.amountRange}
          onValueChange={handleAmountRangeChange}
        />
      </div>

      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={handleReset}>
          Reset Filters
        </Button>
      </div>
    </div>
  );
}
