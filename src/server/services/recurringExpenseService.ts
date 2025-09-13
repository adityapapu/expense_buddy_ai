"use server";

import { getErrorMessage } from '../../utils/error';
import { db } from "../db";
import { getCurrentUser } from "./userService";
import type { RecurringExpense, Frequency } from '@prisma/client';

interface CreateRecurringExpenseData {
  description: string;
  amount: number;
  frequency: Frequency;
  startDate: string;
  endDate?: string;
}

interface UpdateRecurringExpenseData {
  id: number;
  description: string;
  amount: number;
  frequency: Frequency;
  startDate: string;
  endDate?: string;
  isActive: boolean;
}

type RecurringExpenseResult = {
  success: boolean;
  message: string;
  recurringExpense?: RecurringExpense;
};

interface CursorPaginationOptions {
  cursor?: number;
  pageSize: number;
  filters?: {
    isActive?: boolean;
    frequency?: Frequency;
  };
}

type ListRecurringExpensesResult = {
  success: boolean;
  message: string;
  recurringExpenses?: RecurringExpense[];
  nextCursor?: number | null;
  totalCount?: number;
};

export const createRecurringExpense = async (data: CreateRecurringExpenseData): Promise<RecurringExpenseResult> => {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      throw new Error("User not authenticated");
    }

    if (!data.description.trim()) {
      throw new Error("Description is required");
    }

    if (data.amount <= 0) {
      throw new Error("Amount must be positive");
    }

    const startDate = new Date(data.startDate);
    if (isNaN(startDate.getTime())) {
      throw new Error("Invalid start date");
    }

    let endDate = null;
    if (data.endDate) {
      endDate = new Date(data.endDate);
      if (isNaN(endDate.getTime())) {
        throw new Error("Invalid end date");
      }
      if (endDate <= startDate) {
        throw new Error("End date must be after start date");
      }
    }

    // Calculate next due date based on frequency
    const nextDueDate = calculateNextDueDate(startDate, data.frequency);

    const newRecurringExpense = await db.recurringExpense.create({
      data: {
        description: data.description.trim(),
        amount: data.amount,
        frequency: data.frequency,
        startDate: startDate,
        endDate: endDate,
        nextDueDate: nextDueDate,
        userId: user.id
      }
    });

    return {
      success: true,
      message: "Recurring expense created successfully",
      recurringExpense: newRecurringExpense
    };

  } catch (error) {
    console.error('Error creating recurring expense:', getErrorMessage(error));
    return {
      success: false,
      message: getErrorMessage(error)
    };
  }
};

export const updateRecurringExpense = async (data: UpdateRecurringExpenseData): Promise<RecurringExpenseResult> => {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      throw new Error("User not authenticated");
    }

    const existingExpense = await db.recurringExpense.findFirst({
      where: {
        id: data.id,
        userId: user.id
      }
    });

    if (!existingExpense) {
      throw new Error("Recurring expense not found");
    }

    if (!data.description.trim()) {
      throw new Error("Description is required");
    }

    if (data.amount <= 0) {
      throw new Error("Amount must be positive");
    }

    const startDate = new Date(data.startDate);
    if (isNaN(startDate.getTime())) {
      throw new Error("Invalid start date");
    }

    let endDate = null;
    if (data.endDate) {
      endDate = new Date(data.endDate);
      if (isNaN(endDate.getTime())) {
        throw new Error("Invalid end date");
      }
      if (endDate <= startDate) {
        throw new Error("End date must be after start date");
      }
    }

    // Calculate next due date based on frequency
    const nextDueDate = calculateNextDueDate(startDate, data.frequency);

    const updatedRecurringExpense = await db.recurringExpense.update({
      where: { id: data.id },
      data: {
        description: data.description.trim(),
        amount: data.amount,
        frequency: data.frequency,
        startDate: startDate,
        endDate: endDate,
        nextDueDate: nextDueDate,
        isActive: data.isActive
      }
    });

    return {
      success: true,
      message: "Recurring expense updated successfully",
      recurringExpense: updatedRecurringExpense
    };

  } catch (error) {
    console.error('Error updating recurring expense:', getErrorMessage(error));
    return {
      success: false,
      message: getErrorMessage(error)
    };
  }
};

export const listRecurringExpenses = async (options: CursorPaginationOptions): Promise<ListRecurringExpensesResult> => {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      throw new Error("User not authenticated");
    }

    const { cursor, pageSize, filters = {} } = options;

    const whereClause: any = {
      userId: user.id,
      isDeleted: false
    };

    if (cursor) {
      whereClause.id = { gt: cursor };
    }

    if (filters.isActive !== undefined) {
      whereClause.isActive = filters.isActive;
    }

    if (filters.frequency) {
      whereClause.frequency = filters.frequency;
    }

    const totalCount = await db.recurringExpense.count({
      where: whereClause
    });

    const recurringExpenses = await db.recurringExpense.findMany({
      where: whereClause,
      take: pageSize + 1,
      orderBy: { nextDueDate: 'asc' }
    });

    const hasNextPage = recurringExpenses.length > pageSize;
    const returnExpenses = hasNextPage ? recurringExpenses.slice(0, -1) : recurringExpenses;
    const lastExpense = returnExpenses[returnExpenses.length - 1];

    return {
      success: true,
      message: "Recurring expenses fetched successfully",
      recurringExpenses: returnExpenses,
      nextCursor: hasNextPage && lastExpense ? lastExpense.id : null,
      totalCount: totalCount
    };

  } catch (error) {
    console.error('Error listing recurring expenses:', getErrorMessage(error));
    return {
      success: false,
      message: getErrorMessage(error)
    };
  }
};

export const deleteRecurringExpense = async (id: number): Promise<RecurringExpenseResult> => {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      throw new Error("User not authenticated");
    }

    const existingExpense = await db.recurringExpense.findFirst({
      where: {
        id: id,
        userId: user.id,
        isDeleted: false
      }
    });

    if (!existingExpense) {
      throw new Error("Recurring expense not found");
    }

    // Soft delete by setting isDeleted flag
    await db.recurringExpense.update({
      where: { id: id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        isActive: false
      }
    });

    return {
      success: true,
      message: "Recurring expense deleted successfully"
    };

  } catch (error) {
    console.error('Error deleting recurring expense:', getErrorMessage(error));
    return {
      success: false,
      message: getErrorMessage(error)
    };
  }
};

export const toggleRecurringExpense = async (id: number): Promise<RecurringExpenseResult> => {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      throw new Error("User not authenticated");
    }

    const existingExpense = await db.recurringExpense.findFirst({
      where: {
        id: id,
        userId: user.id,
        isDeleted: false
      }
    });

    if (!existingExpense) {
      throw new Error("Recurring expense not found");
    }

    const updatedExpense = await db.recurringExpense.update({
      where: { id: id },
      data: {
        isActive: !existingExpense.isActive
      }
    });

    return {
      success: true,
      message: `Recurring expense ${updatedExpense.isActive ? 'activated' : 'deactivated'} successfully`,
      recurringExpense: updatedExpense
    };

  } catch (error) {
    console.error('Error toggling recurring expense:', getErrorMessage(error));
    return {
      success: false,
      message: getErrorMessage(error)
    };
  }
};

// Helper function to calculate next due date
function calculateNextDueDate(startDate: Date, frequency: Frequency): Date {
  const nextDate = new Date(startDate);

  switch (frequency) {
    case 'DAILY':
      nextDate.setDate(nextDate.getDate() + 1);
      break;
    case 'WEEKLY':
      nextDate.setDate(nextDate.getDate() + 7);
      break;
    case 'MONTHLY':
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
    case 'YEARLY':
      nextDate.setFullYear(nextDate.getFullYear() + 1);
      break;
    default:
      throw new Error(`Invalid frequency: ${frequency}`);
  }

  return nextDate;
}