"use client";

import { useTransition, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { TagInput } from "@/components/ui/tag-input";
import { SplitDetails } from "@/components/transactions/split-details";
import {
  createTransaction,
  updateTransaction,
  type Transaction,
} from "@/lib/actions/transactions";

interface TransactionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction?: Transaction;
  mode?: "create" | "edit";
  categories: { id: string; name: string }[];
  paymentMethods: { id: string; name: string }[];
  session?: any;
}

export function TransactionFormDialog({
  open,
  onOpenChange,
  transaction,
  mode = "create",
  categories,
  paymentMethods,
  session: _session,
}: TransactionFormDialogProps) {
  const { toast } = useToast();
  const [, startTransition] = useTransition();
  const [isSplit, setIsSplit] = useState(transaction?.isSplit ?? false);
  const [splitDetails, setSplitDetails] = useState(
    transaction?.splitDetails ?? [],
  );
  const [tags, setTags] = useState<string[]>(transaction?.tags ?? []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);

    // Client-side validation
    const description = formData.get("description") as string;
    const amount = formData.get("amount") as string;
    const date = formData.get("date") as string;
    const type = formData.get("type") as string;
    const category = formData.get("category") as string;
    const paymentMethod = formData.get("paymentMethod") as string;

    const missingFields = [];
    if (!amount) missingFields.push("Amount");
    if (!date) missingFields.push("Date");
    if (!description?.trim()) missingFields.push("Description");
    if (!type) missingFields.push("Type");
    if (!category?.trim()) missingFields.push("Category");
    if (!paymentMethod) missingFields.push("Payment Method");

    if (missingFields.length > 0) {
      toast({
        title: "Validation Error",
        description: `Please fill in the following required fields: ${missingFields.join(", ")}`,
        variant: "destructive",
      });
      return;
    }

    startTransition(async () => {
      try {
        if (mode === "create") {
          await createTransaction(formData);
          toast({
            title: "Transaction created",
            description: "Your transaction has been saved successfully.",
          });
        } else if (transaction) {
          await updateTransaction(transaction.id, formData);
          toast({
            title: "Transaction updated",
            description: "Your transaction has been saved successfully.",
          });
        }
        onOpenChange(false);
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to save transaction",
          variant: "destructive",
        });
      }
    });
  };

  const handleAddSplitPerson = () => {
    setSplitDetails([...splitDetails, { with: "", amount: 0 }]);
  };

  const handleRemoveSplitPerson = (index: number) => {
    const newSplitDetails = [...splitDetails];
    newSplitDetails.splice(index, 1);
    setSplitDetails(newSplitDetails);
  };

  const handleSplitDetailChange = (
    index: number,
    field: "with" | "amount",
    value: string | number,
  ) => {
    const newSplitDetails = [...splitDetails];
    const currentDetail = newSplitDetails[index];
    if (field === "with") {
      newSplitDetails[index] = { with: value as string, amount: currentDetail?.amount ?? 0 };
    } else {
      newSplitDetails[index] = { with: currentDetail?.with ?? "", amount: value as number };
    }
    setSplitDetails(newSplitDetails);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Add" : "Edit"} Transaction
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Add a new transaction to your records"
              : "Edit the details of this transaction"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select name="type" defaultValue={transaction?.type ?? "expense"}>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                name="date"
                type="date"
                defaultValue={
                  transaction?.date ?? new Date().toISOString().split("T")[0]
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              name="description"
              placeholder="Enter a description"
              defaultValue={transaction?.description}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              defaultValue={transaction?.amount}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                name="category"
                defaultValue={transaction?.category.id ?? ""}
                required
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.length > 0 ? (
                    categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-categories" disabled>
                      No categories available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Payment Method *</Label>
              <Select
                name="paymentMethod"
                defaultValue={transaction?.paymentMethod.id ?? ""}
                required
              >
                <SelectTrigger id="paymentMethod">
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method.id} value={method.id}>
                      {method.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <TagInput
              id="tags"
              placeholder="Add tags..."
              tags={tags}
              setTags={setTags}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Add any additional notes..."
              defaultValue={transaction?.notes}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="split" checked={isSplit} onCheckedChange={setIsSplit} />
            <Label htmlFor="split">Split transaction</Label>
          </div>

          {isSplit && (
            <SplitDetails
              splitDetails={splitDetails}
              onAddPerson={handleAddSplitPerson}
              onRemovePerson={handleRemoveSplitPerson}
              onSplitDetailChange={handleSplitDetailChange}
            />
          )}

          <DialogFooter className="pt-4">
            <Button type="submit">
              {mode === "create" ? "Add" : "Save"} Transaction
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
