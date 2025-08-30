"use server";

import { db } from "@/server/db";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  category: {
    id: string;
    name: string;
  };
  paymentMethod: {
    id: string;
    name: string;
  };
  tags?: string[];
  isSplit?: boolean;
  splitDetails?: {
    with: string;
    amount: number;
  }[];
  notes?: string;
}

// TODO: Add input validation with Zod

export async function getTransactions(): Promise<Transaction[]> {
  const transactions = await db.transaction.findMany({
    include: {
      participants: {
        include: {
          category: true,
          paymentMethod: true,
          tags: true,
        },
      },
    },
    orderBy: {
      date: "desc",
    },
  });

  // TODO: This is a temporary transformation to match the frontend's expected data structure.
  // In the future, we should update the frontend to handle the normalized data structure.
  return transactions.map((t) => {
    const participant = t.participants[0]; // Assuming single participant for now
    return {
      id: t.id,
      date: t.date.toISOString().split("T")[0],
      description: t.description,
      amount:
        participant.type === "INCOME"
          ? participant.amount.toNumber()
          : -participant.amount.toNumber(),
      type: participant.type.toLowerCase() as "income" | "expense",
      category: {
        id: participant.category.id,
        name: participant.category.name,
      },
      paymentMethod: {
        id: participant.paymentMethod.id,
        name: participant.paymentMethod.name,
      },
      tags: participant.tags.map((tag) => tag.name),
      isSplit: t.participants.length > 1,
      splitDetails:
        t.participants.length > 1
          ? t.participants.map((p) => ({
              with: "Friend", // TODO: Replace with actual friend's name
              amount: p.amount.toNumber(),
            }))
          : undefined,
      notes: t.notes,
    };
  });
}

import { auth } from "@/auth";

export async function createTransaction(formData: FormData) {
  const session = await auth();
  console.log("Session in createTransaction:", session);
  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }

  const rawFormData = {
    description: formData.get("description") as string,
    amount: formData.get("amount") as string,
    date: formData.get("date") as string,
    notes: formData.get("notes") as string,
    type: formData.get("type") as string,
    category: formData.get("category") as string,
    paymentMethod: formData.get("paymentMethod") as string,
  };

  console.log("rawFormData:", rawFormData);

  if (
    !rawFormData.amount ||
    !rawFormData.date ||
    !rawFormData.description ||
    !rawFormData.type ||
    !rawFormData.category ||
    !rawFormData.paymentMethod
  ) {
    throw new Error("Missing required fields");
  }

  const newTransaction = await db.transaction.create({
    data: {
      creatorId: session.user.id,
      description: rawFormData.description as string,
      totalAmount: new Prisma.Decimal(rawFormData.amount as string),
      date: new Date(rawFormData.date as string),
      notes: rawFormData.notes as string,
      participants: {
        create: [
          {
            userId: session.user.id,
            amount: new Prisma.Decimal(rawFormData.amount as string),
            splitAmount: new Prisma.Decimal(rawFormData.amount as string),
            type: rawFormData.type === "income" ? "INCOME" : "EXPENSE",
            categoryId: rawFormData.category as string,
            paymentMethodId: rawFormData.paymentMethod as string,
          },
        ],
      },
    },
  });

  revalidatePath("/transactions");
}

export async function updateTransaction(
  transactionId: string,
  formData: FormData,
) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }

  const rawFormData = {
    description: formData.get("description") as string,
    amount: formData.get("amount") as string,
    date: formData.get("date") as string,
    notes: formData.get("notes") as string,
    type: formData.get("type") as string,
    category: formData.get("category") as string,
    paymentMethod: formData.get("paymentMethod") as string,
  };

  console.log("rawFormData:", rawFormData);

  if (
    !rawFormData.amount ||
    !rawFormData.date ||
    !rawFormData.description ||
    !rawFormData.type ||
    !rawFormData.category ||
    !rawFormData.paymentMethod
  ) {
    throw new Error("Missing required fields");
  }

  const updatedTransaction = await db.transaction.update({
    where: { id: transactionId },
    data: {
      description: rawFormData.description as string,
      totalAmount: new Prisma.Decimal(rawFormData.amount as string),
      date: new Date(rawFormData.date as string),
      notes: rawFormData.notes as string,
      participants: {
        updateMany: {
          where: { transactionId: transactionId },
          data: {
            amount: new Prisma.Decimal(rawFormData.amount as string),
            splitAmount: new Prisma.Decimal(rawFormData.amount as string),
            type: rawFormData.type === "income" ? "INCOME" : "EXPENSE",
            categoryId: rawFormData.category as string,
            paymentMethodId: rawFormData.paymentMethod as string,
          },
        },
      },
    },
  });

  revalidatePath("/transactions");
}

export async function deleteTransaction(transactionId: string) {
  await db.transactionParticipant.deleteMany({
    where: {
      transactionId: transactionId,
    },
  });

  await db.transaction.delete({
    where: {
      id: transactionId,
    },
  });

  revalidatePath("/transactions");
}
