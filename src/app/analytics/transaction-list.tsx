"use client"

import { useState, useEffect } from "react"
import type { DateRange } from "react-day-picker"
import { formatCurrency } from "@/lib/utils"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2 } from "lucide-react"
import { format } from "date-fns"
import { getFilteredTransactions, type TransactionListItem } from "@/lib/actions/analytics"

interface TransactionListProps {
  dateRange: DateRange | undefined
  selectedCategories: string[]
}

export function TransactionList({ dateRange, selectedCategories }: TransactionListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("date-desc")
  const [transactions, setTransactions] = useState<TransactionListItem[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [offset, setOffset] = useState(0)
  const limit = 50 // Number of transactions per page

  // Fetch transactions when filters change
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const result = await getFilteredTransactions(
          dateRange,
          selectedCategories,
          searchTerm,
          sortBy,
          limit,
          offset
        )
        setTransactions(result.transactions)
        setTotalCount(result.totalCount)
      } catch (err) {
        console.error("Failed to fetch transactions:", err)
        setError("Failed to load transactions")
        setTransactions([])
        setTotalCount(0)
      } finally {
        setIsLoading(false)
      }
    }

    // Debounce search to avoid too many API calls
    const debounceTimer = setTimeout(() => void fetchTransactions(), searchTerm ? 300 : 0)

    return () => clearTimeout(debounceTimer)
  }, [dateRange, selectedCategories, searchTerm, sortBy, offset])

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    setOffset(0) // Reset to first page when searching
  }

  const handleSortChange = (value: string) => {
    setSortBy(value)
    setOffset(0) // Reset to first page when sorting
  }

  return (
    <div className="space-y-4">
      <div className="p-4 flex flex-col sm:flex-row gap-4 justify-between">
        <Input
          placeholder="Search transactions..."
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="max-w-xs"
        />
        <Select value={sortBy} onValueChange={handleSortChange}>
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
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Loading transactions...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  <p className="text-muted-foreground">{error}</p>
                </TableCell>
              </TableRow>
            ) : transactions.length > 0 ? (
              transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium">{format(new Date(transaction.date), "MMM dd, yyyy")}</TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="flex w-fit items-center gap-1">
                      <span>{transaction.category.icon}</span>
                      <span>{transaction.category.name}</span>
                    </Badge>
                  </TableCell>
                  <TableCell className={`text-right ${transaction.type === "income" ? "text-green-600" : ""}`}>
                    {transaction.type === "income" ? "+" : ""}
                    {formatCurrency(Math.abs(transaction.amount))}
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

      {/* Pagination info */}
      {!isLoading && !error && totalCount > 0 && (
        <div className="text-sm text-muted-foreground text-center py-2">
          Showing {transactions.length} of {totalCount} transactions
          {totalCount > limit && (
            <span className="ml-2">
              (Page {Math.floor(offset / limit) + 1} of {Math.ceil(totalCount / limit)})
            </span>
          )}
        </div>
      )}
    </div>
  )
}