"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Loader2Icon, ShieldIcon } from "lucide-react"
import { Separator } from "@/components/ui/separator"

const passwordFormSchema = z
  .object({
    currentPassword: z.string().min(8, {
      message: "Password must be at least 8 characters.",
    }),
    newPassword: z.string().min(8, {
      message: "Password must be at least 8 characters.",
    }),
    confirmPassword: z.string().min(8, {
      message: "Password must be at least 8 characters.",
    }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  })

const securityFormSchema = z.object({
  twoFactorAuth: z.boolean().default(false),
  loginNotifications: z.boolean().default(true),
  sessionTimeout: z.boolean().default(false),
})

type PasswordFormValues = z.infer<typeof passwordFormSchema>
type SecurityFormValues = z.infer<typeof securityFormSchema>

// This would typically come from an API or database
const defaultSecurityValues: Partial<SecurityFormValues> = {
  twoFactorAuth: false,
  loginNotifications: true,
  sessionTimeout: false,
}

export function SecuritySettings() {
  const [isPasswordLoading, setIsPasswordLoading] = useState(false)
  const [isSecurityLoading, setIsSecurityLoading] = useState(false)

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onChange",
  })

  const securityForm = useForm<SecurityFormValues>({
    resolver: zodResolver(securityFormSchema),
    defaultValues: defaultSecurityValues,
    mode: "onChange",
  })

  function onPasswordSubmit(data: PasswordFormValues) {
    setIsPasswordLoading(true)

    // Simulate API call
    setTimeout(() => {
      console.log(data)
      setIsPasswordLoading(false)
      passwordForm.reset()
    }, 1000)
  }

  function onSecuritySubmit(data: SecurityFormValues) {
    setIsSecurityLoading(true)

    // Simulate API call
    setTimeout(() => {
      console.log(data)
      setIsSecurityLoading(false)
    }, 1000)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your password to keep your account secure.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
              <FormField
                control={passwordForm.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormDescription>Password must be at least 8 characters long.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end">
                <Button type="submit" disabled={isPasswordLoading}>
                  {isPasswordLoading && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
                  Update Password
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security Settings</CardTitle>
          <CardDescription>Manage your account security preferences.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...securityForm}>
            <form onSubmit={securityForm.handleSubmit(onSecuritySubmit)} className="space-y-6">
              <div className="space-y-4">
                <FormField
                  control={securityForm.control}
                  name="twoFactorAuth"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base flex items-center">
                          <ShieldIcon className="mr-2 h-4 w-4" />
                          Two-Factor Authentication
                        </FormLabel>
                        <FormDescription>
                          Add an extra layer of security to your account by requiring a verification code.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {securityForm.watch("twoFactorAuth") && (
                  <div className="ml-6 pl-6 border-l">
                    <p className="text-sm text-muted-foreground mb-4">
                      Two-factor authentication is enabled. You'll need to enter a verification code when you sign in.
                    </p>
                    <Button variant="outline" size="sm">
                      Configure 2FA
                    </Button>
                  </div>
                )}

                <FormField
                  control={securityForm.control}
                  name="loginNotifications"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Login Notifications</FormLabel>
                        <FormDescription>
                          Receive email notifications when someone logs into your account.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={securityForm.control}
                  name="sessionTimeout"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Automatic Session Timeout</FormLabel>
                        <FormDescription>Automatically log out after 30 minutes of inactivity.</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Active Sessions</h3>
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg border p-4">
                    <div>
                      <h4 className="font-medium">Current Session</h4>
                      <p className="text-sm text-muted-foreground">
                        Chrome on Windows • New York, USA • IP: 192.168.1.1
                      </p>
                      <p className="text-xs text-muted-foreground">Started 2 hours ago</p>
                    </div>
                    <div className="flex items-center">
                      <span className="inline-flex h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                      <span className="text-sm font-medium">Active Now</span>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg border p-4">
                    <div>
                      <h4 className="font-medium">Mobile App</h4>
                      <p className="text-sm text-muted-foreground">iPhone 13 • San Francisco, USA • IP: 192.168.1.2</p>
                      <p className="text-xs text-muted-foreground">Last active 3 days ago</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Revoke
                    </Button>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button variant="outline">Logout of All Devices</Button>
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={isSecurityLoading}>
                  {isSecurityLoading && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
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

