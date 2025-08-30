"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import type { Transaction } from "./transaction-data"
import { SplitIcon } from "lucide-react"

interface TransactionDetailsDialogProps {
  transaction: Transaction
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit: () => void
  onDelete: () => void
}

export function TransactionDetailsDialog({
  transaction,
  open,
  onOpenChange,
  onEdit,
  onDelete,
}: TransactionDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Transaction Details</DialogTitle>
          <DialogDescription>View the details of this transaction</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex flex-col gap-1">
            <h3 className="font-medium text-lg flex items-center gap-2">
              {transaction.description}
              {transaction.isSplit && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <SplitIcon className="h-3 w-3" />
                  <span className="text-xs">Split</span>
                </Badge>
              )}
            </h3>
            <p className="text-sm text-muted-foreground">{transaction.date}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Amount</p>
              <p className={`text-lg font-bold ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}>
                {transaction.type === "income" ? "+" : "-"}
                {formatCurrency(transaction.amount)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Type</p>
              <Badge variant={transaction.type === "income" ? "success" : "destructive"} className="mt-1">
                {transaction.type === "income" ? "Income" : "Expense"}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium">Category</p>
              <Badge variant="secondary" className="mt-1">
                {transaction.category.name}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium">Payment Method</p>
              <p className="text-sm">{transaction.paymentMethod.name}</p>
            </div>
          </div>

          {transaction.tags && transaction.tags.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-1">Tags</p>
              <div className="flex flex-wrap gap-1">
                {transaction.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {transaction.notes && (
            <div>
              <p className="text-sm font-medium mb-1">Notes</p>
              <p className="text-sm">{transaction.notes}</p>
            </div>
          )}

          {transaction.isSplit && transaction.splitDetails && (
            <div>
              <p className="text-sm font-medium mb-1">Split Details</p>
              <div className="space-y-2 border rounded-md p-3">
                {transaction.splitDetails.map((split, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <p className="text-sm">{split.with}</p>
                    <p className="text-sm font-medium">{formatCurrency(split.amount)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" className="sm:w-auto w-full" onClick={onEdit}>
            Edit
          </Button>
          <Button variant="destructive" className="sm:w-auto w-full" onClick={onDelete}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

