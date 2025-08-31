"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CreditCardIcon, PlusIcon, TrashIcon } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// This would typically come from an API or database
const paymentMethods = [
  {
    id: "1",
    name: "Visa ending in 4242",
    type: "visa",
    expiryDate: "12/2025",
    isDefault: true,
  },
  {
    id: "2",
    name: "Mastercard ending in 5555",
    type: "mastercard",
    expiryDate: "08/2024",
    isDefault: false,
  },
  {
    id: "3",
    name: "Bank Account (****6789)",
    type: "bank",
    expiryDate: null,
    isDefault: false,
  },
]

export function PaymentMethodsSettings() {
  const [methods, setMethods] = useState(paymentMethods)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const handleSetDefault = (id: string) => {
    setMethods(
      methods.map((method) => ({
        ...method,
        isDefault: method.id === id,
      })),
    )
  }

  const handleDelete = (id: string) => {
    setMethods(methods.filter((method) => method.id !== id))
  }

  const handleAddPaymentMethod = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would call an API to add the payment method
    setIsAddDialogOpen(false)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
          <CardDescription>Manage your payment methods for transactions and subscriptions.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {methods.length > 0 ? (
            <div className="space-y-4">
              {methods.map((method) => (
                <div
                  key={method.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-lg border p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      {method.type === "visa" || method.type === "mastercard" ? (
                        <CreditCardIcon className="h-5 w-5" />
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-5 w-5"
                        >
                          <path d="M4 10V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2" />
                          <path d="M10 16H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h6" />
                          <path d="M14 16h2" />
                          <path d="M14 12h4" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{method.name}</p>
                      {method.expiryDate && (
                        <p className="text-sm text-muted-foreground">Expires {method.expiryDate}</p>
                      )}
                      {method.isDefault && (
                        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold mt-1">
                          Default
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-auto mt-2 sm:mt-0">
                    {!method.isDefault && (
                      <Button variant="outline" size="sm" onClick={() => handleSetDefault(method.id)}>
                        Set as Default
                      </Button>
                    )}
                    <Button variant="outline" size="icon" onClick={() => handleDelete(method.id)}>
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <CreditCardIcon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-medium">No Payment Methods</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4">You haven&apos;t added any payment methods yet.</p>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full">
                <PlusIcon className="mr-2 h-4 w-4" />
                Add Payment Method
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add Payment Method</DialogTitle>
                <DialogDescription>Add a new credit card or bank account.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddPaymentMethod}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="payment-type">Payment Type</Label>
                    <Select defaultValue="credit-card">
                      <SelectTrigger id="payment-type">
                        <SelectValue placeholder="Select payment type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="credit-card">Credit Card</SelectItem>
                        <SelectItem value="bank-account">Bank Account</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="card-number">Card Number</Label>
                    <Input id="card-number" placeholder="1234 5678 9012 3456" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="expiry-date">Expiry Date</Label>
                      <Input id="expiry-date" placeholder="MM/YY" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="cvc">CVC</Label>
                      <Input id="cvc" placeholder="123" />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="name">Name on Card</Label>
                    <Input id="name" placeholder="John Doe" />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Add Payment Method</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>
    </div>
  )
}

