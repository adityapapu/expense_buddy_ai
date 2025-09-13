"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CreditCardIcon, PlusIcon, TrashIcon, EditIcon, Loader2 } from "lucide-react"
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
import { useToast } from "@/hooks/use-toast"
import { type PaymentMethod } from "@prisma/client"
import {
  createPaymentMethod,
  listPaymentMethods,
  updatePaymentMethod,
  deletePaymentMethod
} from "@/server/services/paymentMethodService"

export function PaymentMethodsSettings() {
  const [methods, setMethods] = useState<PaymentMethod[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [newMethodName, setNewMethodName] = useState("")
  const [newMethodIcon, setNewMethodIcon] = useState("")
  const { toast } = useToast()

  const loadPaymentMethods = useCallback(async () => {
    try {
      setLoading(true)
      const response = await listPaymentMethods({ pageSize: 50 })
      if (response.success && response.paymentMethods) {
        setMethods(response.paymentMethods)
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load payment methods",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load payment methods",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    void loadPaymentMethods()
  }, [loadPaymentMethods])

  const handleDelete = async (id: string) => {
    try {
      setSubmitting(true)
      const result = await deletePaymentMethod(id)
      if (result.success) {
        setMethods(methods.filter((method) => method.id !== id))
        toast({
          title: "Success",
          description: "Payment method deleted successfully",
        })
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.message,
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete payment method",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleAddPaymentMethod = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSubmitting(true)
      const result = await createPaymentMethod({
        name: newMethodName,
        icon: newMethodIcon || undefined,
      })
      if (result.success && result.paymentMethod) {
        setMethods([result.paymentMethod, ...methods])
        setNewMethodName("")
        setNewMethodIcon("")
        setIsAddDialogOpen(false)
        toast({
          title: "Success",
          description: "Payment method added successfully",
        })
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.message,
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add payment method",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditPaymentMethod = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMethod) return

    try {
      setSubmitting(true)
      const result = await updatePaymentMethod({
        id: selectedMethod.id,
        name: newMethodName,
        icon: newMethodIcon || undefined,
      })
      if (result.success && result.paymentMethod) {
        setMethods(methods.map((method) =>
          method.id === result.paymentMethod?.id ? result.paymentMethod : method
        ))
        setNewMethodName("")
        setNewMethodIcon("")
        setSelectedMethod(null)
        setIsEditDialogOpen(false)
        toast({
          title: "Success",
          description: "Payment method updated successfully",
        })
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.message,
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update payment method",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditClick = (method: PaymentMethod) => {
    setSelectedMethod(method)
    setNewMethodName(method.name)
    setNewMethodIcon(method.icon || "")
    setIsEditDialogOpen(true)
  }

  const getIconElement = (icon?: string | null) => {
    if (icon) {
      return <span className="text-lg">{icon}</span>
    }
    return <CreditCardIcon className="h-5 w-5" />
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
          <CardDescription>Manage your payment methods for transactions and subscriptions.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : methods.length > 0 ? (
            <div className="space-y-4">
              {methods.map((method) => (
                <div
                  key={method.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-lg border p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      {getIconElement(method.icon)}
                    </div>
                    <div>
                      <p className="font-medium">{method.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Created: {new Date(method.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-auto mt-2 sm:mt-0">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEditClick(method)}
                      disabled={submitting}
                    >
                      <EditIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDelete(method.id)}
                      disabled={submitting}
                    >
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
                    <Label htmlFor="method-name">Name</Label>
                    <Input
                      id="method-name"
                      placeholder="Cash, Credit Card, Bank Transfer, etc."
                      value={newMethodName}
                      onChange={(e) => setNewMethodName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="method-icon">Icon (Optional)</Label>
                    <Input
                      id="method-icon"
                      placeholder="💳, 🏦, 💰, etc."
                      value={newMethodIcon}
                      onChange={(e) => setNewMethodIcon(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={submitting || !newMethodName.trim()}>
                    {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Add Payment Method
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Edit Payment Method</DialogTitle>
                <DialogDescription>Update payment method details.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleEditPaymentMethod}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-method-name">Name</Label>
                    <Input
                      id="edit-method-name"
                      placeholder="Cash, Credit Card, Bank Transfer, etc."
                      value={newMethodName}
                      onChange={(e) => setNewMethodName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-method-icon">Icon (Optional)</Label>
                    <Input
                      id="edit-method-icon"
                      placeholder="💳, 🏦, 💰, etc."
                      value={newMethodIcon}
                      onChange={(e) => setNewMethodIcon(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={submitting || !newMethodName.trim()}>
                    {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Update Payment Method
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>
    </div>
  )
}

