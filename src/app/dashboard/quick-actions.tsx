"use client"

import { PlusIcon, ScanIcon, UsersIcon, QrCode } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function QuickActions() {
  const router = useRouter()
  const [openAddTransaction, setOpenAddTransaction] = useState(false)
  const [openSplitBill, setOpenSplitBill] = useState(false)
  const [openScanReceipt, setOpenScanReceipt] = useState(false)

  return (
    <div className="flex flex-wrap gap-2">
      {/* Scan & Pay QR Code Button */}
      <Button 
        variant="outline" 
        className="gap-2" 
        onClick={() => router.push('/scan')}
      >
        <QrCode className="h-4 w-4" />
        Scan & Pay
      </Button>
      {/* Add Transaction Button */}
      <Dialog open={openAddTransaction} onOpenChange={setOpenAddTransaction}>
        <DialogTrigger asChild>
          <Button className="gap-2">
            <PlusIcon className="h-4 w-4" />
            Add Transaction
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Transaction</DialogTitle>
            <DialogDescription>Enter the details of your transaction below.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Amount
              </Label>
              <Input id="amount" type="number" step="0.01" placeholder="0.00" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Input id="description" placeholder="Transaction description" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Category
              </Label>
              <Select>
                <SelectTrigger id="category" className="col-span-3">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="food">Food & Dining</SelectItem>
                  <SelectItem value="transportation">Transportation</SelectItem>
                  <SelectItem value="entertainment">Entertainment</SelectItem>
                  <SelectItem value="utilities">Utilities</SelectItem>
                  <SelectItem value="shopping">Shopping</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Date
              </Label>
              <Input
                id="date"
                type="date"
                defaultValue={new Date().toISOString().split("T")[0]}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Save Transaction</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Split Bill Button */}
      <Dialog open={openSplitBill} onOpenChange={setOpenSplitBill}>
        <DialogTrigger asChild>
          <Button variant="outline" className="gap-2">
            <UsersIcon className="h-4 w-4" />
            Split Bill
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Split a Bill</DialogTitle>
            <DialogDescription>Enter the bill details and select friends to split with.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="bill-amount" className="text-right">
                Total Amount
              </Label>
              <Input id="bill-amount" type="number" step="0.01" placeholder="0.00" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="bill-description" className="text-right">
                Description
              </Label>
              <Input id="bill-description" placeholder="Bill description" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="split-type" className="text-right">
                Split Type
              </Label>
              <Select>
                <SelectTrigger id="split-type" className="col-span-3">
                  <SelectValue placeholder="Select split type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="equal">Equal</SelectItem>
                  <SelectItem value="amount">By Amount</SelectItem>
                  <SelectItem value="percentage">By Percentage</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="friends" className="text-right">
                Friends
              </Label>
              <Select>
                <SelectTrigger id="friends" className="col-span-3">
                  <SelectValue placeholder="Select friends" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="friend1">John Doe</SelectItem>
                  <SelectItem value="friend2">Jane Smith</SelectItem>
                  <SelectItem value="friend3">Alex Johnson</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Split Bill</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Scan Receipt Button */}
      <Dialog open={openScanReceipt} onOpenChange={setOpenScanReceipt}>
        <DialogTrigger asChild>
          <Button variant="outline" className="gap-2">
            <ScanIcon className="h-4 w-4" />
            Scan Receipt
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Scan Receipt</DialogTitle>
            <DialogDescription>
              Upload a photo of your receipt to automatically extract transaction details.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="border-2 border-dashed rounded-lg p-12 text-center">
              <ScanIcon className="mx-auto h-8 w-8 text-muted-foreground" />
              <div className="mt-4 text-sm text-muted-foreground">
                Drag and drop a receipt image, or click to browse
              </div>
              <Button variant="outline" size="sm" className="mt-4">
                Upload Receipt
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled>
              Process Receipt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

