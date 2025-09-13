"use client"

import { useState } from "react"
import type { DateRange } from "react-day-picker"
import { formatCurrency } from "@/lib/utils"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { format } from "date-fns"

interface TransactionListProps {
  dateRange: DateRange | undefined
  selectedCategories: string[]
}

export function TransactionList({ dateRange, selectedCategories }: TransactionListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("date-desc")

  // In a real app, you would fetch this data based on the date range and selected categories
  // This is mock data for demonstration
  const transactions = [
    {
      id: "1",
      date: new Date(2023, 5, 28),
      description: "Monthly Rent",
      category: { id: "1", name: "Housing", icon: "🏠" },
      amount: 1900.0,
      type: "expense",
    },
    {
      id: "2",
      date: new Date(2023, 5, 25),
      description: "Grocery Shopping",
      category: { id: "2", name: "Food & Dining", icon: "🍔" },
      amount: 187.45,
      type: "expense",
    },
    {
      id: "3",
      date: new Date(2023, 5, 22),
      description: "Gas Station",
      category: { id: "3", name: "Transportation", icon: "🚗" },
      amount: 45.8,
      type: "expense",
    },
    {
      id: "4",
      date: new Date(2023, 5, 20),
      description: "Movie Tickets",
      category: { id: "4", name: "Entertainment", icon: "🎬" },
      amount: 32.5,
      type: "expense",
    },
    {
      id: "5",
      date: new Date(2023, 5, 18),
      description: "Online Shopping",
      category: { id: "5", name: "Shopping", icon: "🛍️" },
      amount: 124.99,
      type: "expense",
    },
    {
      id: "6",
      date: new Date(2023, 5, 15),
      description: "Electricity Bill",
      category: { id: "6", name: "Utilities", icon: "💡" },
      amount: 85.32,
      type: "expense",
    },
    {
      id: "7",
      date: new Date(2023, 5, 12),
      description: "Doctor's Visit",
      category: { id: "7", name: "Healthcare", icon: "🏥" },
      amount: 75.0,
      type: "expense",
    },
    {
      id: "8",
      date: new Date(2023, 5, 10),
      description: "Weekend Getaway",
      category: { id: "8", name: "Travel", icon: "✈️" },
      amount: 350.0,
      type: "expense",
    },
    {
      id: "9",
      date: new Date(2023, 5, 5),
      description: "Restaurant Dinner",
      category: { id: "2", name: "Food & Dining", icon: "🍔" },
      amount: 78.5,
      type: "expense",
    },
    {
      id: "10",
      date: new Date(2023, 5, 1),
      description: "Salary Deposit",
      category: { id: "9", name: "Income", icon: "💰" },
      amount: 4500.0,
      type: "income",
    },
  ]

  // Filter transactions based on search term, date range, and selected categories
  const filteredTransactions = transactions.filter((transaction) => {
    // Filter by search term
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase())

    // Filter by date range
    const matchesDateRange = dateRange
      ? dateRange.from && dateRange.to
        ? transaction.date >= dateRange.from && transaction.date <= dateRange.to
        : dateRange.from
          ? transaction.date >= dateRange.from
          : true
      : true

    // Filter by selected categories
    const matchesCategories = selectedCategories.length === 0 || selectedCategories.includes(transaction.category.id)

    return matchesSearch && matchesDateRange && matchesCategories
  })

  // Sort transactions
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    switch (sortBy) {
      case "date-asc":
        return a.date.getTime() - b.date.getTime()
      case "date-desc":
        return b.date.getTime() - a.date.getTime()
      case "amount-asc":
        return a.amount - b.amount
      case "amount-desc":
        return b.amount - a.amount
      default:
        return 0
    }
  })

  return (
    <div className="space-y-4">
      <div className="p-4 flex flex-col sm:flex-row gap-4 justify-between">
        <Input
          placeholder="Search transactions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-xs"
        />
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date-desc">Date (Newest first)</SelectItem>
            <SelectItem value="date-asc">Date (Oldest first)</SelectItem>
            <SelectItem value="amount-desc">Amount (Highest first)</SelectItem>
            <SelectItem value="amount-asc">Amount (Lowest first)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <ScrollArea className="h-[500px]">
        <Table>
          <TableHeader className="sticky top-0 bg-background">
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTransactions.length > 0 ? (
              sortedTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium">{format(transaction.date, "MMM dd, yyyy")}</TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="flex w-fit items-center gap-1">
                      <span>{transaction.category.icon}</span>
                      <span>{transaction.category.name}</span>
                    </Badge>
                  </TableCell>
                  <TableCell className={`text-right ${transaction.type === "income" ? "text-green-600" : ""}`}>
                    {transaction.type === "income" ? "+" : ""}
                    {formatCurrency(transaction.amount)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No transactions found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  )
}

