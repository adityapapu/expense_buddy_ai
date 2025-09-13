"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CameraIcon, Loader2Icon } from "lucide-react"
import { toast } from "sonner"

const profileFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

export function ProfileSettings() {
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      email: "",
    },
    mode: "onChange",
  })

  useEffect(() => {
    async function fetchUserProfile() {
      try {
        const response = await fetch("/api/user/profile")
        if (response.ok) {
          const userData = await response.json()
          form.reset({
            name: userData.name || "",
            email: userData.email || "",
          })
        }
      } catch (error) {
        toast.error("Failed to load profile data")
      } finally {
        setIsFetching(false)
      }
    }

    void fetchUserProfile()
  }, [form])

  async function onSubmit(data: ProfileFormValues) {
    setIsLoading(true)

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: data.name }),
      })

      if (response.ok) {
        toast.success("Profile updated successfully")
      } else {
        toast.error("Failed to update profile")
      }
    } catch (error) {
      toast.error("An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Manage your personal information and how it appears on your account.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
            <div className="flex flex-col items-center gap-2">
              <Avatar className="h-24 w-24">
                <AvatarImage src={form.watch("email") ? `https://api.dicebear.com/7.x/initials/svg?seed=${form.watch("email")}` : ""} alt="Profile" />
                <AvatarFallback className="text-2xl">
                  {form.watch("name")?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <Button variant="outline" size="sm" className="mt-2" disabled>
                <CameraIcon className="mr-2 h-4 w-4" />
                Change Photo
              </Button>
            </div>
            <div className="flex-1 space-y-4 w-full">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your name" {...field} disabled={isFetching} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Your email" 
                              {...field} 
                              disabled 
                              className="bg-muted" 
                            />
                          </FormControl>
                          <FormDescription className="text-xs">
                            Email is managed by your OAuth provider
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit" disabled={isLoading || isFetching}>
                      {isLoading && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
                      Save Changes
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

