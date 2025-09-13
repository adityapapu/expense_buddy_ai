"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { ProfileSettings } from "./profile-settings"
import { NotificationSettings } from "./notification-settings"
import { PaymentMethodsSettings } from "./payment-methods-settings"
import { CategorySettings } from "./category-settings"
import { BudgetSettings } from "./budget-settings"
import { TagSettings } from "./tag-settings"
import { RecurringExpensesSettings } from "./recurring-expenses-settings"
import { FriendsSettings } from "./friends-settings"
import { DataSettings } from "./data-settings"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile")

  return (
    <div className="flex flex-col gap-4 p-4 md:p-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences.</p>
      </div>

      <Separator />

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex flex-col space-y-8 md:space-y-0 w-full"
        orientation="vertical"
      >
        {/* Mobile tabs - horizontal scrolling */}
        <div className="md:hidden overflow-x-auto pb-2">
          <TabsList className="inline-flex h-10 items-center justify-start rounded-md bg-muted p-1 text-muted-foreground w-auto">
            <TabsTrigger value="profile" className="px-3 py-1.5 text-sm">
              Profile
            </TabsTrigger>
            <TabsTrigger value="payment-methods" className="px-3 py-1.5 text-sm">
              Payment
            </TabsTrigger>
            <TabsTrigger value="categories" className="px-3 py-1.5 text-sm">
              Categories
            </TabsTrigger>
            <TabsTrigger value="budgets" className="px-3 py-1.5 text-sm">
              Budgets
            </TabsTrigger>
            <TabsTrigger value="tags" className="px-3 py-1.5 text-sm">
              Tags
            </TabsTrigger>
            <TabsTrigger value="recurring-expenses" className="px-3 py-1.5 text-sm">
              Recurring Expenses
            </TabsTrigger>
            <TabsTrigger value="friends" className="px-3 py-1.5 text-sm">
              Friends
            </TabsTrigger>
            <TabsTrigger value="notifications" className="px-3 py-1.5 text-sm">
              Notifications
            </TabsTrigger>
            <TabsTrigger value="data" className="px-3 py-1.5 text-sm">
              Data
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex flex-col md:flex-row md:space-x-8 space-y-8 md:space-y-0">
          {/* Desktop sidebar - vertical tabs */}
          <div className="hidden md:block md:w-1/4 lg:w-1/5">
            <TabsList className="flex flex-col items-start justify-start h-full space-y-1 bg-transparent p-0">
              <TabsTrigger value="profile" className="w-full justify-start px-3 py-2 data-[state=active]:bg-muted">
                Profile
              </TabsTrigger>
              <TabsTrigger
                value="payment-methods"
                className="w-full justify-start px-3 py-2 data-[state=active]:bg-muted"
              >
                Payment Methods
              </TabsTrigger>
              <TabsTrigger
                value="categories"
                className="w-full justify-start px-3 py-2 data-[state=active]:bg-muted"
              >
                Categories
              </TabsTrigger>
              <TabsTrigger
                value="budgets"
                className="w-full justify-start px-3 py-2 data-[state=active]:bg-muted"
              >
                Budgets
              </TabsTrigger>
              <TabsTrigger
                value="tags"
                className="w-full justify-start px-3 py-2 data-[state=active]:bg-muted"
              >
                Tags
              </TabsTrigger>
              <TabsTrigger
                value="recurring-expenses"
                className="w-full justify-start px-3 py-2 data-[state=active]:bg-muted"
              >
                Recurring Expenses
              </TabsTrigger>
              <TabsTrigger
                value="friends"
                className="w-full justify-start px-3 py-2 data-[state=active]:bg-muted"
              >
                Friends
              </TabsTrigger>
              <TabsTrigger
                value="notifications"
                className="w-full justify-start px-3 py-2 data-[state=active]:bg-muted"
              >
                Notifications
              </TabsTrigger>
              <TabsTrigger value="data" className="w-full justify-start px-3 py-2 data-[state=active]:bg-muted">
                Data & Privacy
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Content area */}
          <div className="flex-1">
            <TabsContent value="profile" className="space-y-6 mt-0">
              <ProfileSettings />
            </TabsContent>
            <TabsContent value="payment-methods" className="space-y-6 mt-0">
              <PaymentMethodsSettings />
            </TabsContent>
            <TabsContent value="categories" className="space-y-6 mt-0">
              <CategorySettings />
            </TabsContent>
            <TabsContent value="budgets" className="space-y-6 mt-0">
              <BudgetSettings />
            </TabsContent>
            <TabsContent value="tags" className="space-y-6 mt-0">
              <TagSettings />
            </TabsContent>
            <TabsContent value="recurring-expenses" className="space-y-6 mt-0">
              <RecurringExpensesSettings />
            </TabsContent>
            <TabsContent value="friends" className="space-y-6 mt-0">
              <FriendsSettings />
            </TabsContent>
            <TabsContent value="notifications" className="space-y-6 mt-0">
              <NotificationSettings />
            </TabsContent>
            <TabsContent value="data" className="space-y-6 mt-0">
              <DataSettings />
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  )
}

