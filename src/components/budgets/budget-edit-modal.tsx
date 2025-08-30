"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { CheckIcon, PiggyBankIcon, XIcon } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { BudgetCategoryAllocation } from "./budget-category-allocation";

// Sample data - in a real app, this would come from your API
const currentBudget = {
  totalBudget: 2000,
  categories: [
    { id: "1", name: "Housing", icon: "🏠", percentage: 30, amount: 600 },
    { id: "2", name: "Food", icon: "🍔", percentage: 15, amount: 300 },
    {
      id: "3",
      name: "Transportation",
      icon: "🚗",
      percentage: 10,
      amount: 200,
    },
    { id: "4", name: "Utilities", icon: "💡", percentage: 10, amount: 200 },
    { id: "5", name: "Entertainment", icon: "🎬", percentage: 5, amount: 100 },
    { id: "6", name: "Healthcare", icon: "🏥", percentage: 5, amount: 100 },
    { id: "7", name: "Personal", icon: "👤", percentage: 5, amount: 100 },
    { id: "8", name: "Savings", icon: "💰", percentage: 15, amount: 300 },
  ],
  month: "May 2023",
  spent: 850,
  daysRemaining: 18,
};

interface BudgetEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BudgetEditModal({ open, onOpenChange }: BudgetEditModalProps) {
  const [totalBudget, setTotalBudget] = useState(currentBudget.totalBudget);
  const [categories, setCategories] = useState(currentBudget.categories);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate total allocated percentage and amount
  const totalAllocated = categories.reduce(
    (sum, cat) => sum + cat.percentage,
    0,
  );
  const totalAllocatedAmount = categories.reduce(
    (sum, cat) => sum + cat.amount,
    0,
  );
  const unallocatedAmount = totalBudget - totalAllocatedAmount;
  const unallocatedPercentage = 100 - totalAllocated;

  // Update category amounts when total budget changes
  const updateCategoryAmounts = (newTotal: number) => {
    setCategories((cats) =>
      cats.map((cat) => ({
        ...cat,
        amount: (cat.percentage / 100) * newTotal,
      })),
    );
  };

  // Handle total budget change
  const handleTotalBudgetChange = (value: number) => {
    setTotalBudget(value);
    updateCategoryAmounts(value);
  };

  // Handle category percentage change
  const handleCategoryChange = (id: string, percentage: number) => {
    setCategories((cats) =>
      cats.map((cat) => {
        if (cat.id === id) {
          return {
            ...cat,
            percentage,
            amount: (percentage / 100) * totalBudget,
          };
        }
        return cat;
      }),
    );
  };

  // Handle category amount change
  const handleCategoryAmountChange = (id: string, amount: number) => {
    setCategories((cats) =>
      cats.map((cat) => {
        if (cat.id === id) {
          const percentage = (amount / totalBudget) * 100;
          return {
            ...cat,
            amount,
            percentage,
          };
        }
        return cat;
      }),
    );
  };

  // Handle form submission
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // This would typically be an API call to update the budget
      console.log("Updating budget:", {
        totalBudget,
        categories,
        month: currentBudget.month,
      });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      onOpenChange(false);
    } catch (error) {
      console.error("Error updating budget:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-auto sm:max-w-[700px]">
        <Card className="border-0 shadow-none">
          <CardHeader className="px-0 pt-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <PiggyBankIcon className="h-6 w-6 text-primary" />
                <CardTitle>Edit Budget for {currentBudget.month}</CardTitle>
              </div>
            </div>
            <CardDescription>
              Adjust your monthly budget allocation to match your financial
              goals.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 px-0">
            {/* Budget Overview Section */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Total Budget</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="relative">
                      <span className="absolute left-3 top-2.5">₹</span>
                      <Input
                        id="total-budget"
                        type="number"
                        value={totalBudget}
                        onChange={(e) =>
                          handleTotalBudgetChange(
                            Number.parseFloat(e.target.value) || 0,
                          )
                        }
                        className="pl-7"
                      />
                    </div>
                    <Slider
                      defaultValue={[totalBudget]}
                      max={5000}
                      step={100}
                      onValueChange={(values) =>
                        handleTotalBudgetChange(values[0])
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Spent So Far</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(currentBudget.spent)}
                  </div>
                  <Progress
                    value={(currentBudget.spent / totalBudget) * 100}
                    className="mt-2 h-2"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatCurrency(totalBudget - currentBudget.spent)}{" "}
                    remaining
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Budget Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">Allocated</div>
                      <div className="text-lg font-bold">
                        {totalAllocated.toFixed(1)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Unallocated</div>
                      <div
                        className={`text-lg font-bold ${unallocatedAmount < 0 ? "text-red-500" : ""}`}
                      >
                        {formatCurrency(unallocatedAmount)}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    {currentBudget.daysRemaining} days remaining in this month
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Allocation Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="font-medium">Category Allocation</Label>
                <div className="text-sm font-medium">
                  {totalAllocated.toFixed(1)}% allocated
                </div>
              </div>

              <Progress
                value={totalAllocated}
                className="h-2"
                indicatorClassName={
                  totalAllocated > 100
                    ? "bg-red-500"
                    : totalAllocated === 100
                      ? "bg-green-500"
                      : "bg-yellow-500"
                }
              />

              {totalAllocated !== 100 && (
                <div
                  className={`text-sm ${totalAllocated > 100 ? "text-red-500" : "text-yellow-500"}`}
                >
                  {totalAllocated > 100
                    ? `You've overallocated by ${(totalAllocated - 100).toFixed(1)}% (${formatCurrency(Math.abs(unallocatedAmount))})`
                    : `You have ${unallocatedPercentage.toFixed(1)}% (${formatCurrency(unallocatedAmount)}) unallocated`}
                </div>
              )}
            </div>

            {/* Category Allocations */}
            <div className="space-y-4">
              <Label className="font-medium">Adjust Category Allocations</Label>
              {categories.map((category) => (
                <BudgetCategoryAllocation
                  key={category.id}
                  category={category}
                  totalBudget={totalBudget}
                  onPercentageChange={(percentage) =>
                    handleCategoryChange(category.id, percentage)
                  }
                  onAmountChange={(amount) =>
                    handleCategoryAmountChange(category.id, amount)
                  }
                />
              ))}
            </div>

            {/* Total Summary */}
            <div className="flex items-center justify-between border-t pt-2">
              <span className="font-medium">Total</span>
              <div className="text-right">
                <div
                  className={`font-bold ${totalAllocated > 100 ? "text-red-500" : ""}`}
                >
                  {formatCurrency(totalAllocatedAmount)} (
                  {totalAllocated.toFixed(1)}%)
                </div>
                <div className="text-sm text-muted-foreground">
                  {totalAllocated > 100
                    ? `${formatCurrency(Math.abs(unallocatedAmount))} over budget`
                    : totalAllocated < 100
                      ? `${formatCurrency(unallocatedAmount)} unallocated`
                      : "Perfectly allocated"}
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-between px-0 pb-0">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              <XIcon className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Budget"}
              <CheckIcon className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
