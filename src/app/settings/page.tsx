"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { ProfileSettings } from "./profile-settings"
import { AccountSettings } from "./account-settings"
import { NotificationSettings } from "./notification-settings"
import { SecuritySettings } from "./security-settings"
import { PaymentMethodsSettings } from "./payment-methods-settings"
import { ConnectedAccountsSettings } from "./connected-accounts-settings"
import { AppearanceSettings } from "./appearance-settings"
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
            <TabsTrigger value="account" className="px-3 py-1.5 text-sm">
              Account
            </TabsTrigger>
            <TabsTrigger value="notifications" className="px-3 py-1.5 text-sm">
              Notifications
            </TabsTrigger>
            <TabsTrigger value="security" className="px-3 py-1.5 text-sm">
              Security
            </TabsTrigger>
            <TabsTrigger value="payment-methods" className="px-3 py-1.5 text-sm">
              Payment
            </TabsTrigger>
            <TabsTrigger value="connected-accounts" className="px-3 py-1.5 text-sm">
              Connections
            </TabsTrigger>
            <TabsTrigger value="appearance" className="px-3 py-1.5 text-sm">
              Appearance
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
              <TabsTrigger value="account" className="w-full justify-start px-3 py-2 data-[state=active]:bg-muted">
                Account
              </TabsTrigger>
              <TabsTrigger
                value="notifications"
                className="w-full justify-start px-3 py-2 data-[state=active]:bg-muted"
              >
                Notifications
              </TabsTrigger>
              <TabsTrigger value="security" className="w-full justify-start px-3 py-2 data-[state=active]:bg-muted">
                Security
              </TabsTrigger>
              <TabsTrigger
                value="payment-methods"
                className="w-full justify-start px-3 py-2 data-[state=active]:bg-muted"
              >
                Payment Methods
              </TabsTrigger>
              <TabsTrigger
                value="connected-accounts"
                className="w-full justify-start px-3 py-2 data-[state=active]:bg-muted"
              >
                Connected Accounts
              </TabsTrigger>
              <TabsTrigger value="appearance" className="w-full justify-start px-3 py-2 data-[state=active]:bg-muted">
                Appearance
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
            <TabsContent value="account" className="space-y-6 mt-0">
              <AccountSettings />
            </TabsContent>
            <TabsContent value="notifications" className="space-y-6 mt-0">
              <NotificationSettings />
            </TabsContent>
            <TabsContent value="security" className="space-y-6 mt-0">
              <SecuritySettings />
            </TabsContent>
            <TabsContent value="payment-methods" className="space-y-6 mt-0">
              <PaymentMethodsSettings />
            </TabsContent>
            <TabsContent value="connected-accounts" className="space-y-6 mt-0">
              <ConnectedAccountsSettings />
            </TabsContent>
            <TabsContent value="appearance" className="space-y-6 mt-0">
              <AppearanceSettings />
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

