"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusIcon } from "lucide-react"

// This would typically come from an API or database
const connectedAccounts = [
  {
    id: "1",
    name: "Google",
    icon: "google",
    status: "connected",
    lastSync: "2 hours ago",
  },
  {
    id: "2",
    name: "Bank of America",
    icon: "bank",
    status: "connected",
    lastSync: "1 day ago",
  },
  {
    id: "3",
    name: "PayPal",
    icon: "paypal",
    status: "disconnected",
    lastSync: null,
  },
]

const availableAccounts = [
  {
    id: "4",
    name: "Chase",
    icon: "bank",
    description: "Connect your Chase bank account",
  },
  {
    id: "5",
    name: "Venmo",
    icon: "venmo",
    description: "Connect your Venmo account",
  },
  {
    id: "6",
    name: "Apple Pay",
    icon: "apple",
    description: "Connect your Apple Pay account",
  },
]

export function ConnectedAccountsSettings() {
  const [accounts, setAccounts] = useState(connectedAccounts)

  const handleDisconnect = (id: string) => {
    setAccounts(
      accounts.map((account) => (account.id === id ? { ...account, status: "disconnected", lastSync: null } : account)),
    )
  }

  const handleConnect = (id: string) => {
    setAccounts(
      accounts.map((account) =>
        account.id === id ? { ...account, status: "connected", lastSync: "Just now" } : account,
      ),
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Connected Accounts</CardTitle>
          <CardDescription>Manage your connected accounts and services.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Your Connected Accounts</h3>
            {accounts.map((account) => (
              <div
                key={account.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-lg border p-4"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    {account.icon === "google" ? (
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
                        <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                        <path d="M12 8v8" />
                        <path d="M8 12h8" />
                      </svg>
                    ) : account.icon === "bank" ? (
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
                        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{account.name}</p>
                    {account.status === "connected" ? (
                      <p className="text-sm text-muted-foreground">Last synced: {account.lastSync}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground">Disconnected</p>
                    )}
                  </div>
                </div>
                <div>
                  {account.status === "connected" ? (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Sync Now
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDisconnect(account.id)}>
                        Disconnect
                      </Button>
                    </div>
                  ) : (
                    <Button variant="outline" size="sm" onClick={() => handleConnect(account.id)}>
                      Connect
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Available Connections</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {availableAccounts.map((account) => (
                <div
                  key={account.id}
                  className="flex flex-col items-center justify-center rounded-lg border p-4 text-center"
                >
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                    {account.icon === "bank" ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-6 w-6"
                      >
                        <path d="M4 10V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2" />
                        <path d="M10 16H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h6" />
                        <path d="M14 16h2" />
                        <path d="M14 12h4" />
                      </svg>
                    ) : account.icon === "venmo" ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-6 w-6"
                      >
                        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-6 w-6"
                      >
                        <path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z" />
                        <path d="M10 2c1 .5 2 2 2 5" />
                      </svg>
                    )}
                  </div>
                  <h4 className="font-medium">{account.name}</h4>
                  <p className="text-sm text-muted-foreground mt-1 mb-3">{account.description}</p>
                  <Button variant="outline" size="sm" className="w-full">
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Connect
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

