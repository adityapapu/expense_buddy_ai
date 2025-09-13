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
import { type Tag } from "@prisma/client"
import {
  createTag,
  listTags,
  updateTag,
  deleteTag,
  type TagResult,
  type ListTagsResult
} from "@/server/services/tagService"

// Color options for tags
const COLOR_OPTIONS = [
  { name: "Red", value: "bg-red-100 text-red-800" },
  { name: "Blue", value: "bg-blue-100 text-blue-800" },
  { name: "Green", value: "bg-green-100 text-green-800" },
  { name: "Yellow", value: "bg-yellow-100 text-yellow-800" },
  { name: "Purple", value: "bg-purple-100 text-purple-800" },
  { name: "Pink", value: "bg-pink-100 text-pink-800" },
  { name: "Indigo", value: "bg-indigo-100 text-indigo-800" },
  { name: "Gray", value: "bg-gray-100 text-gray-800" },
]

// Icon options for tags
const ICON_OPTIONS = [
  { value: "🏷️", label: "Tag" },
  { value: "⭐", label: "Star" },
  { value: "❤️", label: "Heart" },
  { value: "🔥", label: "Fire" },
  { value: "💎", label: "Diamond" },
  { value: "🎯", label: "Target" },
  { value: "📌", label: "Pin" },
  { value: "🏠", label: "Home" },
  { value: "🚗", label: "Car" },
  { value: "✈️", label: "Plane" },
  { value: "🍕", label: "Food" },
  { value: "🎮", label: "Gaming" },
  { value: "💻", label: "Tech" },
  { value: "🎵", label: "Music" },
  { value: "📚", label: "Books" },
  { value: "🏃", label: "Fitness" },
]

export function TagSettings() {
  const [tags, setTags] = useState<Tag[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [newTagName, setNewTagName] = useState("")
  const [newTagColor, setNewTagColor] = useState(COLOR_OPTIONS[0].value)
  const [newTagIcon, setNewTagIcon] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()

  const loadTags = useCallback(async () => {
    try {
      setLoading(true)
      const response: ListTagsResult = await listTags({ pageSize: 100 })
      if (response.success && response.tags) {
        setTags(response.tags)
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load tags",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    void loadTags()
  }, [loadTags])

  const handleDelete = async (id: string) => {
    try {
      setSubmitting(true)
      const result: TagResult = await deleteTag(id)
      if (result.success) {
        setTags(tags.filter((tag) => tag.id !== id))
        toast({
          title: "Success",
          description: "Tag deleted successfully",
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
        description: "Failed to delete tag",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleAddTag = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSubmitting(true)
      const result: TagResult = await createTag({
        name: newTagName,
        color: newTagColor,
        icon: newTagIcon === "none" ? "" : newTagIcon,
      })
      if (result.success && result.tag) {
        setTags([result.tag, ...tags])
        setNewTagName("")
        setNewTagColor(COLOR_OPTIONS[0].value)
        setNewTagIcon("")
        setIsAddDialogOpen(false)
        toast({
          title: "Success",
          description: "Tag added successfully",
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
        description: "Failed to add tag",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditTag = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTag) return

    try {
      setSubmitting(true)
      const result: TagResult = await updateTag({
        id: selectedTag.id,
        name: newTagName,
        color: newTagColor,
        icon: newTagIcon === "none" ? "" : newTagIcon,
      })
      if (result.success && result.tag) {
        setTags(tags.map((tag) =>
          tag.id === result.tag?.id ? result.tag : tag
        ))
        setNewTagName("")
        setNewTagColor(COLOR_OPTIONS[0].value)
        setNewTagIcon("")
        setSelectedTag(null)
        setIsEditDialogOpen(false)
        toast({
          title: "Success",
          description: "Tag updated successfully",
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
        description: "Failed to update tag",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditClick = (tag: Tag) => {
    setSelectedTag(tag)
    setNewTagName(tag.name)
    setNewTagColor(tag.color || COLOR_OPTIONS[0].value)
    setNewTagIcon(tag.icon || "")
    setIsEditDialogOpen(true)
  }

  const filteredTags = tags.filter(tag =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getTagElement = (tag: Tag) => {
    const colorClass = tag.color || COLOR_OPTIONS[0].value
    return (
      <Badge className={colorClass}>
        {tag.icon && <span className="mr-1">{tag.icon}</span>}
        {tag.name}
      </Badge>
    )
  }

  const getColorPreview = (colorClass: string) => {
    const colors = {
      "bg-red-100 text-red-800": { bg: "#fee2e2", text: "#991b1b" },
      "bg-blue-100 text-blue-800": { bg: "#dbeafe", text: "#1e40af" },
      "bg-green-100 text-green-800": { bg: "#dcfce7", text: "#166534" },
      "bg-yellow-100 text-yellow-800": { bg: "#fef3c7", text: "#92400e" },
      "bg-purple-100 text-purple-800": { bg: "#f3e8ff", text: "#6b21a8" },
      "bg-pink-100 text-pink-800": { bg: "#fce7f3", text: "#9f1239" },
      "bg-indigo-100 text-indigo-800": { bg: "#e0e7ff", text: "#3730a3" },
      "bg-gray-100 text-gray-800": { bg: "#f3f4f6", text: "#1f2937" },
    }
    const colorsForClass = colors[colorClass as keyof typeof colors] || colors["bg-gray-100 text-gray-800"]

    return (
      <div
        className="w-8 h-8 rounded-md border"
        style={{ backgroundColor: colorsForClass.bg }}
      />
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Tags</CardTitle>
              <CardDescription>Manage your tags for organizing and labeling transactions.</CardDescription>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Search tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-48"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : filteredTags.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredTags.map((tag) => (
                <div
                  key={tag.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-lg border p-4"
                >
                  <div className="flex items-center gap-3">
                    {getTagElement(tag)}
                    <div>
                      <p className="font-medium">{tag.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Created: {new Date(tag.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEditClick(tag)}
                      disabled={submitting}
                    >
                      <EditIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDelete(tag.id)}
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
                {searchQuery ? "No Tags Found" : "No Tags"}
              </h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                {searchQuery
                  ? "No tags match your search."
                  : "You haven't created any tags yet. Create tags to organize your transactions."
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
                Add Tag
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add Tag</DialogTitle>
                <DialogDescription>Create a new tag for organizing your transactions.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddTag}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="tag-name">Name</Label>
                    <Input
                      id="tag-name"
                      placeholder="Food, Travel, Work, etc."
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="tag-color">Color</Label>
                    <Select value={newTagColor} onValueChange={setNewTagColor}>
                      <SelectTrigger id="tag-color">
                        <SelectValue placeholder="Select a color" />
                      </SelectTrigger>
                      <SelectContent>
                        {COLOR_OPTIONS.map((color) => (
                          <SelectItem key={color.value} value={color.value}>
                            <div className="flex items-center gap-2">
                              {getColorPreview(color.value)}
                              <span>{color.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="tag-icon">Icon (Optional)</Label>
                    <Select value={newTagIcon} onValueChange={setNewTagIcon}>
                      <SelectTrigger id="tag-icon">
                        <SelectValue placeholder="Select an icon" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Icon</SelectItem>
                        {ICON_OPTIONS.map((icon) => (
                          <SelectItem key={icon.value} value={icon.value}>
                            <div className="flex items-center gap-2">
                              <span>{icon.value}</span>
                              <span>{icon.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={submitting || !newTagName.trim()}>
                    {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Add Tag
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Edit Tag</DialogTitle>
                <DialogDescription>Update tag details.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleEditTag}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-tag-name">Name</Label>
                    <Input
                      id="edit-tag-name"
                      placeholder="Food, Travel, Work, etc."
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-tag-color">Color</Label>
                    <Select value={newTagColor} onValueChange={setNewTagColor}>
                      <SelectTrigger id="edit-tag-color">
                        <SelectValue placeholder="Select a color" />
                      </SelectTrigger>
                      <SelectContent>
                        {COLOR_OPTIONS.map((color) => (
                          <SelectItem key={color.value} value={color.value}>
                            <div className="flex items-center gap-2">
                              {getColorPreview(color.value)}
                              <span>{color.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-tag-icon">Icon (Optional)</Label>
                    <Select value={newTagIcon} onValueChange={setNewTagIcon}>
                      <SelectTrigger id="edit-tag-icon">
                        <SelectValue placeholder="Select an icon" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Icon</SelectItem>
                        {ICON_OPTIONS.map((icon) => (
                          <SelectItem key={icon.value} value={icon.value}>
                            <div className="flex items-center gap-2">
                              <span>{icon.value}</span>
                              <span>{icon.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={submitting || !newTagName.trim()}>
                    {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Update Tag
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