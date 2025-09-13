"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusIcon, TrashIcon, EditIcon, Loader2 } from "lucide-react"
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
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { type Category, TransactionType } from "@prisma/client"
import {
  createCategory,
  listCategories,
  updateCategory,
  deleteCategory
} from "@/server/services/categoryService"

export function CategorySettings() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [newCategoryIcon, setNewCategoryIcon] = useState("")
  const [newCategoryType, setNewCategoryType] = useState<TransactionType>(TransactionType.EXPENSE)
  const [typeFilter, setTypeFilter] = useState<TransactionType | "ALL">("ALL")
  const { toast } = useToast()

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true)
      const filters: { name?: string; type?: TransactionType } = {}
      if (typeFilter !== "ALL") {
        filters.type = typeFilter
      }

      const response = await listCategories({ pageSize: 100, filters })
      if (response.success && response.categories) {
        setCategories(response.categories)
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load categories",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load categories",
      })
    } finally {
      setLoading(false)
    }
  }, [toast, typeFilter])

  useEffect(() => {
    void loadCategories()
  }, [loadCategories])

  const handleDelete = async (id: string) => {
    try {
      setSubmitting(true)
      const result = await deleteCategory(id)
      if (result.success) {
        setCategories(categories.filter((category) => category.id !== id))
        toast({
          title: "Success",
          description: "Category deleted successfully",
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
        description: "Failed to delete category",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSubmitting(true)
      const result = await createCategory({
        name: newCategoryName,
        icon: newCategoryIcon,
        type: newCategoryType
      })
      if (result.success && result.category) {
        setCategories([result.category, ...categories])
        setNewCategoryName("")
        setNewCategoryIcon("")
        setNewCategoryType(TransactionType.EXPENSE)
        setIsAddDialogOpen(false)
        toast({
          title: "Success",
          description: "Category added successfully",
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
        description: "Failed to add category",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCategory) return

    try {
      setSubmitting(true)
      const result = await updateCategory({
        id: selectedCategory.id,
        name: newCategoryName,
        icon: newCategoryIcon,
        type: newCategoryType
      })
      if (result.success && result.category) {
        setCategories(categories.map((category) =>
          category.id === result.category?.id ? result.category : category
        ))
        setNewCategoryName("")
        setNewCategoryIcon("")
        setNewCategoryType(TransactionType.EXPENSE)
        setSelectedCategory(null)
        setIsEditDialogOpen(false)
        toast({
          title: "Success",
          description: "Category updated successfully",
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
        description: "Failed to update category",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditClick = (category: Category) => {
    setSelectedCategory(category)
    setNewCategoryName(category.name)
    setNewCategoryIcon(category.icon)
    setNewCategoryType(category.type)
    setIsEditDialogOpen(true)
  }

  const getIconElement = (icon?: string | null) => {
    if (icon) {
      return <span className="text-lg">{icon}</span>
    }
    return <div className="h-5 w-5 rounded-full bg-muted" />
  }

  const getTypeColor = (type: TransactionType) => {
    return type === TransactionType.INCOME ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
  }

  const filteredCategories = typeFilter === "ALL"
    ? categories
    : categories.filter(cat => cat.type === typeFilter)

  const categoryStats = {
    total: categories.length,
    income: categories.filter(cat => cat.type === TransactionType.INCOME).length,
    expense: categories.filter(cat => cat.type === TransactionType.EXPENSE).length
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Categories</CardTitle>
              <CardDescription>Manage your income and expense categories for transactions.</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="flex gap-2">
                <Button
                  variant={typeFilter === "ALL" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTypeFilter("ALL")}
                >
                  All ({categoryStats.total})
                </Button>
                <Button
                  variant={typeFilter === TransactionType.INCOME ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTypeFilter(TransactionType.INCOME)}
                >
                  Income ({categoryStats.income})
                </Button>
                <Button
                  variant={typeFilter === TransactionType.EXPENSE ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTypeFilter(TransactionType.EXPENSE)}
                >
                  Expense ({categoryStats.expense})
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : filteredCategories.length > 0 ? (
            <div className="space-y-4">
              {filteredCategories.map((category) => (
                <div
                  key={category.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-lg border p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      {getIconElement(category.icon)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{category.name}</p>
                        <Badge className={getTypeColor(category.type)}>
                          {category.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Created: {new Date(category.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-auto mt-2 sm:mt-0">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEditClick(category)}
                      disabled={submitting}
                    >
                      <EditIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDelete(category.id)}
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
                <div className="h-6 w-6 rounded-full bg-muted" />
              </div>
              <h3 className="text-lg font-medium">
                {typeFilter === "ALL" ? "No Categories" : `No ${typeFilter} Categories`}
              </h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                {typeFilter === "ALL"
                  ? "You haven't added any categories yet."
                  : `You haven't added any ${typeFilter.toLowerCase()} categories yet.`
                }
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full">
                <PlusIcon className="mr-2 h-4 w-4" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add Category</DialogTitle>
                <DialogDescription>Add a new income or expense category.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddCategory}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="category-name">Name</Label>
                    <Input
                      id="category-name"
                      placeholder="Food, Transport, Salary, etc."
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="category-icon">Icon (Optional)</Label>
                    <Input
                      id="category-icon"
                      placeholder="🍔, 🚗, 💰, etc."
                      value={newCategoryIcon}
                      onChange={(e) => setNewCategoryIcon(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="category-type">Type</Label>
                    <Select value={newCategoryType} onValueChange={(value) => setNewCategoryType(value as TransactionType)}>
                      <SelectTrigger id="category-type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={TransactionType.INCOME}>Income</SelectItem>
                        <SelectItem value={TransactionType.EXPENSE}>Expense</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={submitting || !newCategoryName.trim()}>
                    {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Add Category
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Edit Category</DialogTitle>
                <DialogDescription>Update category details.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleEditCategory}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-category-name">Name</Label>
                    <Input
                      id="edit-category-name"
                      placeholder="Food, Transport, Salary, etc."
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-category-icon">Icon (Optional)</Label>
                    <Input
                      id="edit-category-icon"
                      placeholder="🍔, 🚗, 💰, etc."
                      value={newCategoryIcon}
                      onChange={(e) => setNewCategoryIcon(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-category-type">Type</Label>
                    <Select value={newCategoryType} onValueChange={(value) => setNewCategoryType(value as TransactionType)}>
                      <SelectTrigger id="edit-category-type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={TransactionType.INCOME}>Income</SelectItem>
                        <SelectItem value={TransactionType.EXPENSE}>Expense</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={submitting || !newCategoryName.trim()}>
                    {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Update Category
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