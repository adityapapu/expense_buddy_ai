"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UpcomingPaymentsTable } from "./upcoming-payments-table"
import { UpcomingPaymentsList } from "./upcoming-payments-list"
import { useMediaQuery } from "@/hooks/use-media-query"

interface UpcomingPaymentsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UpcomingPaymentsDialog({ open, onOpenChange }: UpcomingPaymentsDialogProps) {
  const [activeTab, setActiveTab] = useState("upcoming")
  const isDesktop = useMediaQuery("(min-width: 768px)")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Upcoming Payments</DialogTitle>
          <DialogDescription>View and manage all your upcoming payments and recurring expenses.</DialogDescription>
        </DialogHeader>

        <Tabs
          defaultValue="upcoming"
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 overflow-hidden flex flex-col"
        >
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="recurring">Recurring</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="flex-1 overflow-hidden flex flex-col">
            {isDesktop ? <UpcomingPaymentsTable /> : <UpcomingPaymentsList />}
          </TabsContent>

          <TabsContent value="recurring" className="flex-1 overflow-hidden flex flex-col">
            {isDesktop ? <UpcomingPaymentsTable filter="recurring" /> : <UpcomingPaymentsList filter="recurring" />}
          </TabsContent>

          <TabsContent value="history" className="flex-1 overflow-hidden flex flex-col">
            {isDesktop ? <UpcomingPaymentsTable filter="history" /> : <UpcomingPaymentsList filter="history" />}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

