"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PlusIcon, TrashIcon } from "lucide-react"

interface SplitDetail {
  with: string
  amount: number
}

interface SplitDetailsProps {
  splitDetails: SplitDetail[]
  onAddPerson: () => void
  onRemovePerson: (index: number) => void
  onSplitDetailChange: (index: number, field: "with" | "amount", value: string | number) => void
}

export function SplitDetails({ splitDetails, onAddPerson, onRemovePerson, onSplitDetailChange }: SplitDetailsProps) {
  return (
    <div className="space-y-4 border rounded-md p-4">
      <div className="flex items-center justify-between">
        <Label>Split Details</Label>
        <Button type="button" variant="outline" size="sm" onClick={onAddPerson}>
          <PlusIcon className="h-4 w-4 mr-1" />
          Add Person
        </Button>
      </div>

      {splitDetails.length === 0 ? (
        <p className="text-sm text-muted-foreground">Add people to split this transaction with</p>
      ) : (
        <div className="space-y-3">
          {splitDetails.map((detail, index) => (
            <div key={index} className="grid grid-cols-[1fr,auto,auto] gap-2 items-center">
              <Input
                placeholder="Person's name"
                value={detail.with}
                onChange={(e) => onSplitDetailChange(index, "with", e.target.value)}
              />
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={detail.amount || ""}
                onChange={(e) => onSplitDetailChange(index, "amount", Number.parseFloat(e.target.value))}
                className="w-24"
              />
              <Button type="button" variant="ghost" size="icon" onClick={() => onRemovePerson(index)}>
                <TrashIcon className="h-4 w-4" />
                <span className="sr-only">Remove</span>
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

