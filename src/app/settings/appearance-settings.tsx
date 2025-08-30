"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2Icon, MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "next-themes"

const appearanceFormSchema = z.object({
  theme: z.enum(["light", "dark", "system"], {
    required_error: "Please select a theme.",
  }),
  fontSize: z.enum(["small", "medium", "large"], {
    required_error: "Please select a font size.",
  }),
  colorScheme: z.enum(["default", "blue", "green", "purple"], {
    required_error: "Please select a color scheme.",
  }),
})

type AppearanceFormValues = z.infer<typeof appearanceFormSchema>

export function AppearanceSettings() {
  const [isLoading, setIsLoading] = useState(false)
  const { theme, setTheme } = useTheme()

  const form = useForm<AppearanceFormValues>({
    resolver: zodResolver(appearanceFormSchema),
    defaultValues: {
      theme: (theme as "light" | "dark" | "system") || "system",
      fontSize: "medium",
      colorScheme: "default",
    },
    mode: "onChange",
  })

  function onSubmit(data: AppearanceFormValues) {
    setIsLoading(true)

    // Update theme
    setTheme(data.theme)

    // Simulate API call for other settings
    setTimeout(() => {
      console.log(data)
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Customize how the application looks and feels.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="theme"
                render={({ field }) => (
                  <FormItem className="space-y-4">
                    <FormLabel>Theme</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
                      >
                        <FormItem className="flex flex-col items-center space-y-3 space-x-0">
                          <FormControl>
                            <RadioGroupItem value="light" className="sr-only" />
                          </FormControl>
                          <div
                            className={`flex flex-col items-center justify-between rounded-md border-2 border-muted p-4 hover:border-accent ${field.value === "light" ? "border-primary" : ""}`}
                          >
                            <SunIcon className="h-6 w-6 mb-3" />
                            <FormLabel className="font-normal">Light</FormLabel>
                          </div>
                        </FormItem>
                        <FormItem className="flex flex-col items-center space-y-3 space-x-0">
                          <FormControl>
                            <RadioGroupItem value="dark" className="sr-only" />
                          </FormControl>
                          <div
                            className={`flex flex-col items-center justify-between rounded-md border-2 border-muted p-4 hover:border-accent ${field.value === "dark" ? "border-primary" : ""}`}
                          >
                            <MoonIcon className="h-6 w-6 mb-3" />
                            <FormLabel className="font-normal">Dark</FormLabel>
                          </div>
                        </FormItem>
                        <FormItem className="flex flex-col items-center space-y-3 space-x-0">
                          <FormControl>
                            <RadioGroupItem value="system" className="sr-only" />
                          </FormControl>
                          <div
                            className={`flex flex-col items-center justify-between rounded-md border-2 border-muted p-4 hover:border-accent ${field.value === "system" ? "border-primary" : ""}`}
                          >
                            <div className="flex space-x-1 mb-3">
                              <SunIcon className="h-6 w-6" />
                              <MoonIcon className="h-6 w-6" />
                            </div>
                            <FormLabel className="font-normal">System</FormLabel>
                          </div>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormDescription>Select a theme for the application.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fontSize"
                render={({ field }) => (
                  <FormItem className="space-y-4">
                    <FormLabel>Font Size</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
                      >
                        <FormItem className="flex flex-col items-center space-y-3 space-x-0">
                          <FormControl>
                            <RadioGroupItem value="small" className="sr-only" />
                          </FormControl>
                          <div
                            className={`flex flex-col items-center justify-between rounded-md border-2 border-muted p-4 hover:border-accent ${field.value === "small" ? "border-primary" : ""}`}
                          >
                            <span className="text-sm mb-3">Aa</span>
                            <FormLabel className="font-normal">Small</FormLabel>
                          </div>
                        </FormItem>
                        <FormItem className="flex flex-col items-center space-y-3 space-x-0">
                          <FormControl>
                            <RadioGroupItem value="medium" className="sr-only" />
                          </FormControl>
                          <div
                            className={`flex flex-col items-center justify-between rounded-md border-2 border-muted p-4 hover:border-accent ${field.value === "medium" ? "border-primary" : ""}`}
                          >
                            <span className="text-base mb-3">Aa</span>
                            <FormLabel className="font-normal">Medium</FormLabel>
                          </div>
                        </FormItem>
                        <FormItem className="flex flex-col items-center space-y-3 space-x-0">
                          <FormControl>
                            <RadioGroupItem value="large" className="sr-only" />
                          </FormControl>
                          <div
                            className={`flex flex-col items-center justify-between rounded-md border-2 border-muted p-4 hover:border-accent ${field.value === "large" ? "border-primary" : ""}`}
                          >
                            <span className="text-lg mb-3">Aa</span>
                            <FormLabel className="font-normal">Large</FormLabel>
                          </div>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormDescription>Select a font size for the application.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="colorScheme"
                render={({ field }) => (
                  <FormItem className="space-y-4">
                    <FormLabel>Color Scheme</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="grid grid-cols-2 sm:grid-cols-4 gap-4"
                      >
                        <FormItem className="flex flex-col items-center space-y-3 space-x-0">
                          <FormControl>
                            <RadioGroupItem value="default" className="sr-only" />
                          </FormControl>
                          <div
                            className={`flex flex-col items-center justify-between rounded-md border-2 border-muted p-4 hover:border-accent ${field.value === "default" ? "border-primary" : ""}`}
                          >
                            <div className="h-6 w-6 rounded-full bg-primary mb-3" />
                            <FormLabel className="font-normal">Default</FormLabel>
                          </div>
                        </FormItem>
                        <FormItem className="flex flex-col items-center space-y-3 space-x-0">
                          <FormControl>
                            <RadioGroupItem value="blue" className="sr-only" />
                          </FormControl>
                          <div
                            className={`flex flex-col items-center justify-between rounded-md border-2 border-muted p-4 hover:border-accent ${field.value === "blue" ? "border-primary" : ""}`}
                          >
                            <div className="h-6 w-6 rounded-full bg-blue-500 mb-3" />
                            <FormLabel className="font-normal">Blue</FormLabel>
                          </div>
                        </FormItem>
                        <FormItem className="flex flex-col items-center space-y-3 space-x-0">
                          <FormControl>
                            <RadioGroupItem value="green" className="sr-only" />
                          </FormControl>
                          <div
                            className={`flex flex-col items-center justify-between rounded-md border-2 border-muted p-4 hover:border-accent ${field.value === "green" ? "border-primary" : ""}`}
                          >
                            <div className="h-6 w-6 rounded-full bg-green-500 mb-3" />
                            <FormLabel className="font-normal">Green</FormLabel>
                          </div>
                        </FormItem>
                        <FormItem className="flex flex-col items-center space-y-3 space-x-0">
                          <FormControl>
                            <RadioGroupItem value="purple" className="sr-only" />
                          </FormControl>
                          <div
                            className={`flex flex-col items-center justify-between rounded-md border-2 border-muted p-4 hover:border-accent ${field.value === "purple" ? "border-primary" : ""}`}
                          >
                            <div className="h-6 w-6 rounded-full bg-purple-500 mb-3" />
                            <FormLabel className="font-normal">Purple</FormLabel>
                          </div>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormDescription>Select a color scheme for the application.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

