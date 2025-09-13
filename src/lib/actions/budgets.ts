"use server";

import { db } from "@/server/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export interface Budget {
  id: string;
  categoryId: string;
  amount: number;
  startDate: string;
  endDate: string;
  icon?: string;
  createdAt: string;
  updatedAt: string;
  category: {
    id: string;
    name: string;
  };
}

export interface BudgetSummary {
  totalBudgeted: number;
  totalSpent: number;
  percentageUsed: number;
  remainingDays: number;
  overBudgetCategories: {
    name: string;
    budgeted: number;
    spent: number;
    percentage: number;
  }[];
  nearLimitCategories: {
    name: string;
    budgeted: number;
    spent: number;
    percentage: number;
  }[];
}

export interface BudgetSpending {
  categoryId: string;
  categoryName: string;
  budgetedAmount: number;
  spentAmount: number;
  percentageUsed: number;
  remainingAmount: number;
  isOverBudget: boolean;
  isNearLimit: boolean;
}

const budgetSchema = z.object({
  categoryId: z.string().min(1, "Category is required"),
  amount: z.number().positive("Amount must be positive"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  icon: z.string().optional(),
});

export async function getBudgets(): Promise<Budget[]> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const budgets = await db.budget.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      category: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return budgets.map((budget) => ({
    id: budget.id,
    categoryId: budget.categoryId,
    amount: Number(budget.amount),
    startDate: budget.startDate.toISOString(),
    endDate: budget.endDate.toISOString(),
    icon: budget.icon || undefined,
    createdAt: budget.createdAt.toISOString(),
    updatedAt: budget.updatedAt.toISOString(),
    category: {
      id: budget.category.id,
      name: budget.category.name,
    },
  }));
}

export async function createBudget(data: z.infer<typeof budgetSchema>) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const validatedData = budgetSchema.parse(data);

  // Check if budget already exists for this category in the same period
  const existingBudget = await db.budget.findFirst({
    where: {
      userId: session.user.id,
      categoryId: validatedData.categoryId,
      OR: [
        {
          AND: [
            { startDate: { lte: validatedData.startDate } },
            { endDate: { gte: validatedData.startDate } },
          ],
        },
        {
          AND: [
            { startDate: { lte: validatedData.endDate } },
            { endDate: { gte: validatedData.endDate } },
          ],
        },
      ],
    },
  });

  if (existingBudget) {
    throw new Error("A budget already exists for this category in the selected period");
  }

  const budget = await db.budget.create({
    data: {
      userId: session.user.id,
      categoryId: validatedData.categoryId,
      amount: validatedData.amount,
      startDate: new Date(validatedData.startDate),
      endDate: new Date(validatedData.endDate),
      icon: validatedData.icon,
    },
    include: {
      category: true,
    },
  });

  revalidatePath("/budgets");
  revalidatePath("/dashboard");

  return {
    id: budget.id,
    categoryId: budget.categoryId,
    amount: Number(budget.amount),
    startDate: budget.startDate.toISOString(),
    endDate: budget.endDate.toISOString(),
    icon: budget.icon || undefined,
    createdAt: budget.createdAt.toISOString(),
    updatedAt: budget.updatedAt.toISOString(),
    category: {
      id: budget.category.id,
      name: budget.category.name,
    },
  };
}

export async function updateBudget(id: string, data: z.infer<typeof budgetSchema>) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const validatedData = budgetSchema.parse(data);

  // Check if budget exists and belongs to user
  const existingBudget = await db.budget.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
  });

  if (!existingBudget) {
    throw new Error("Budget not found");
  }

  // Check for overlapping budgets (excluding current budget)
  const overlappingBudget = await db.budget.findFirst({
    where: {
      userId: session.user.id,
      categoryId: validatedData.categoryId,
      id: { not: id },
      OR: [
        {
          AND: [
            { startDate: { lte: validatedData.startDate } },
            { endDate: { gte: validatedData.startDate } },
          ],
        },
        {
          AND: [
            { startDate: { lte: validatedData.endDate } },
            { endDate: { gte: validatedData.endDate } },
          ],
        },
      ],
    },
  });

  if (overlappingBudget) {
    throw new Error("A budget already exists for this category in the selected period");
  }

  const budget = await db.budget.update({
    where: { id },
    data: {
      categoryId: validatedData.categoryId,
      amount: validatedData.amount,
      startDate: new Date(validatedData.startDate),
      endDate: new Date(validatedData.endDate),
      icon: validatedData.icon,
    },
    include: {
      category: true,
    },
  });

  revalidatePath("/budgets");
  revalidatePath("/dashboard");

  return {
    id: budget.id,
    categoryId: budget.categoryId,
    amount: Number(budget.amount),
    startDate: budget.startDate.toISOString(),
    endDate: budget.endDate.toISOString(),
    icon: budget.icon || undefined,
    createdAt: budget.createdAt.toISOString(),
    updatedAt: budget.updatedAt.toISOString(),
    category: {
      id: budget.category.id,
      name: budget.category.name,
    },
  };
}

export async function deleteBudget(id: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Check if budget exists and belongs to user
  const budget = await db.budget.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
  });

  if (!budget) {
    throw new Error("Budget not found");
  }

  await db.budget.delete({
    where: { id },
  });

  revalidatePath("/budgets");
  revalidatePath("/dashboard");

  return { success: true };
}

export async function getBudgetSummary(): Promise<BudgetSummary> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  // Get current month budgets
  const budgets = await db.budget.findMany({
    where: {
      userId: session.user.id,
      startDate: { lte: currentMonthEnd },
      endDate: { gte: currentMonthStart },
    },
    include: {
      category: true,
    },
  });

  // Get spending for current month
  const spending = await db.transactionParticipant.findMany({
    where: {
      transaction: {
        creatorId: session.user.id,
        date: { gte: currentMonthStart, lte: currentMonthEnd },
      },
      userId: session.user.id,
      type: "EXPENSE",
    },
    include: {
      category: true,
    },
  });

  // Calculate spending by category
  const spendingByCategory = spending.reduce((acc, participant) => {
    const categoryId = participant.categoryId;
    if (!acc[categoryId]) {
      acc[categoryId] = 0;
    }
    acc[categoryId] += Number(participant.amount);
    return acc;
  }, {} as Record<string, number>);

  // Calculate budget summary
  let totalBudgeted = 0;
  let totalSpent = 0;
  const overBudgetCategories: BudgetSummary["overBudgetCategories"] = [];
  const nearLimitCategories: BudgetSummary["nearLimitCategories"] = [];

  budgets.forEach((budget) => {
    const budgetedAmount = Number(budget.amount);
    const spentAmount = spendingByCategory[budget.categoryId] || 0;
    const percentageUsed = budgetedAmount > 0 ? (spentAmount / budgetedAmount) * 100 : 0;

    totalBudgeted += budgetedAmount;
    totalSpent += spentAmount;

    if (percentageUsed > 100) {
      overBudgetCategories.push({
        name: budget.category.name,
        budgeted: budgetedAmount,
        spent: spentAmount,
        percentage: Math.round(percentageUsed * 10) / 10,
      });
    } else if (percentageUsed > 80) {
      nearLimitCategories.push({
        name: budget.category.name,
        budgeted: budgetedAmount,
        spent: spentAmount,
        percentage: Math.round(percentageUsed * 10) / 10,
      });
    }
  });

  const percentageUsed = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;
  const remainingDays = Math.ceil((currentMonthEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  return {
    totalBudgeted,
    totalSpent,
    percentageUsed: Math.round(percentageUsed * 10) / 10,
    remainingDays,
    overBudgetCategories,
    nearLimitCategories,
  };
}

export async function getBudgetSpending(): Promise<BudgetSpending[]> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  // Get current month budgets
  const budgets = await db.budget.findMany({
    where: {
      userId: session.user.id,
      startDate: { lte: currentMonthEnd },
      endDate: { gte: currentMonthStart },
    },
    include: {
      category: true,
    },
  });

  // Get spending for current month
  const spending = await db.transactionParticipant.findMany({
    where: {
      transaction: {
        creatorId: session.user.id,
        date: { gte: currentMonthStart, lte: currentMonthEnd },
      },
      userId: session.user.id,
      type: "EXPENSE",
    },
    include: {
      category: true,
    },
  });

  // Calculate spending by category
  const spendingByCategory = spending.reduce((acc, participant) => {
    const categoryId = participant.categoryId;
    if (!acc[categoryId]) {
      acc[categoryId] = 0;
    }
    acc[categoryId] += Number(participant.amount);
    return acc;
  }, {} as Record<string, number>);

  return budgets.map((budget) => {
    const budgetedAmount = Number(budget.amount);
    const spentAmount = spendingByCategory[budget.categoryId] || 0;
    const percentageUsed = budgetedAmount > 0 ? (spentAmount / budgetedAmount) * 100 : 0;
    const remainingAmount = budgetedAmount - spentAmount;

    return {
      categoryId: budget.categoryId,
      categoryName: budget.category.name,
      budgetedAmount,
      spentAmount,
      percentageUsed: Math.round(percentageUsed * 10) / 10,
      remainingAmount,
      isOverBudget: percentageUsed > 100,
      isNearLimit: percentageUsed > 80,
    };
  });
}