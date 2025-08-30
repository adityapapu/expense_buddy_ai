"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"
import { BudgetFormDialog } from "./budget-form-dialog"

export function BudgetCreateButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <PlusIcon className="mr-2 h-4 w-4" />
        New Budget
      </Button>

      <BudgetFormDialog open={open} onOpenChange={setOpen} />
    </>
  )
}

