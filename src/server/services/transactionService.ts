"use server";
import { getErrorMessage } from '../../utils/error';
import { db } from "../db";
import { getCurrentUser } from "./userService";
import { 
  type Transaction, 
  type TransactionParticipant, 
  type Prisma, 
  TransactionType 
} from '@prisma/client';

// Define types for transaction operations
interface CreateTransactionData {
  description: string;
  totalAmount: number | string;
  date: Date | string;
  referenceNumber?: string;
  notes?: string;
  participants: {
    userId: string;
    amount: number | string;
    type: TransactionType;
    categoryId: string;
    paymentMethodId: string;
    description?: string;
    tagIds?: string[];
  }[];
  recurringExpenseId?: number;
}

interface UpdateTransactionData {
  id: string;
  description: string;
  totalAmount: number | string;
  date: Date | string;
  referenceNumber?: string;
  notes?: string;
  participants: {
    id?: string; // Existing participant ID if updating
    userId: string;
    amount: number | string;
    type: TransactionType;
    categoryId: string;
    paymentMethodId: string;
    description?: string;
    tagIds?: string[];
  }[];
  recurringExpenseId?: number;
}

interface TransactionFilters {
  startDate?: Date;
  endDate?: Date;
  type?: TransactionType;
  categoryId?: string;
  paymentMethodId?: string;
  tagIds?: string[];
  searchTerm?: string;
  minAmount?: number;
  maxAmount?: number;
}

type TransactionWithParticipants = Transaction & {
  participants: (TransactionParticipant & {
    category: { name: string; icon: string };
    paymentMethod: { name: string; icon: string | null };
    tags: { id: string; name: string; color: string | null }[];
  })[];
};

type TransactionResult = {
  success: boolean;
  message: string;
  transaction?: TransactionWithParticipants;
};

interface PaginationOptions {
  cursor?: string;
  pageSize: number;
  filters?: TransactionFilters;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

type ListTransactionsResult = {
  success: boolean;
  message: string;
  transactions?: TransactionWithParticipants[];
  nextCursor?: string | null;
  totalCount?: number;
  summary?: {
    totalIncome: number;
    totalExpense: number;
    balance: number;
  };
};

// Create a new transaction
export const createTransaction = async (data: CreateTransactionData): Promise<TransactionResult> => {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      throw new Error("User not authenticated");
    }

    // Convert string amounts to Decimal
    const totalAmount = typeof data.totalAmount === 'string' 
      ? parseFloat(data.totalAmount) 
      : data.totalAmount;
    
    // Validate the transaction data
    if (!data.description.trim()) {
      throw new Error("Transaction description is required");
    }

    if (isNaN(totalAmount) || totalAmount <= 0) {
      throw new Error("Transaction amount must be a positive number");
    }

    if (!data.participants || data.participants.length === 0) {
      throw new Error("At least one participant is required");
    }

    // Create the transaction and its participants in a transaction
    const transaction = await db.$transaction(async (prisma) => {
      // Create the transaction
      const newTransaction = await prisma.transaction.create({
        data: {
          description: data.description.trim(),
          totalAmount: totalAmount,
          date: new Date(data.date),
          referenceNumber: data.referenceNumber?.trim(),
          notes: data.notes?.trim(),
          creatorId: user.id,
          recurringExpenseId: data.recurringExpenseId,
        },
      });

      // Create participants
      for (const participant of data.participants) {
        const participantAmount = typeof participant.amount === 'string' 
          ? parseFloat(participant.amount) 
          : participant.amount;

        if (isNaN(participantAmount) || participantAmount <= 0) {
          throw new Error("Participant amount must be a positive number");
        }

        // Verify that the category exists and belongs to the user
        const category = await prisma.category.findFirst({
          where: {
            id: participant.categoryId,
            userId: user.id
          }
        });

        if (!category) {
          throw new Error("Selected category not found or unauthorized");
        }

        // Verify that the payment method exists and belongs to the user
        const paymentMethod = await prisma.paymentMethod.findFirst({
          where: {
            id: participant.paymentMethodId,
            userId: user.id
          }
        });

        if (!paymentMethod) {
          throw new Error("Selected payment method not found or unauthorized");
        }

        // Verify that all tags exist and belong to the user
        if (participant.tagIds && participant.tagIds.length > 0) {
          const tags = await prisma.tag.findMany({
            where: {
              id: { in: participant.tagIds },
              userId: user.id
            }
          });

          if (tags.length !== participant.tagIds.length) {
            throw new Error("One or more selected tags not found or unauthorized");
          }
        }

        // Create the participant with verified connections
        await prisma.transactionParticipant.create({
          data: {
            transactionId: newTransaction.id,
            userId: participant.userId,
            amount: participantAmount,
            type: participant.type,
            categoryId: participant.categoryId,
            paymentMethodId: participant.paymentMethodId,
            description: participant.description?.trim(),
            ...(participant.tagIds?.length ? {
              tags: {
                connect: participant.tagIds.map(id => ({ id }))
              }
            } : {})
          }
        });
      }

      // Return the newly created transaction with its participants
      return await prisma.transaction.findUnique({
        where: { id: newTransaction.id },
        include: {
          participants: {
            include: {
              category: {
                select: { name: true, icon: true }
              },
              paymentMethod: {
                select: { name: true, icon: true }
              },
              tags: {
                select: { id: true, name: true, color: true }
              }
            }
          }
        }
      });
    });

    if (!transaction) {
      throw new Error("Failed to create transaction");
    }

    return {
      success: true,
      message: "Transaction created successfully",
      transaction: transaction as TransactionWithParticipants
    };
  } catch (error) {
    console.error('Error creating transaction:', getErrorMessage(error));
    return {
      success: false,
      message: getErrorMessage(error)
    };
  }
};

// Update an existing transaction
export const updateTransaction = async (data: UpdateTransactionData): Promise<TransactionResult> => {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      throw new Error("User not authenticated");
    }

    // Convert string amounts to Decimal
    const totalAmount = typeof data.totalAmount === 'string' 
      ? parseFloat(data.totalAmount) 
      : data.totalAmount;
    
    // Validate the transaction data
    if (!data.description.trim()) {
      throw new Error("Transaction description is required");
    }

    if (isNaN(totalAmount) || totalAmount <= 0) {
      throw new Error("Transaction amount must be a positive number");
    }

    if (!data.participants || data.participants.length === 0) {
      throw new Error("At least one participant is required");
    }

    // Check if transaction exists and belongs to the user
    const existingTransaction = await db.transaction.findFirst({
      where: {
        id: data.id,
        creatorId: user.id
      },
      include: {
        participants: true
      }
    });

    if (!existingTransaction) {
      throw new Error("Transaction not found");
    }

    // Update the transaction in a transaction
    const transaction = await db.$transaction(async (prisma) => {
      // Update the transaction
      const updatedTransaction = await prisma.transaction.update({
        where: { id: data.id },
        data: {
          description: data.description.trim(),
          totalAmount: totalAmount,
          date: new Date(data.date),
          referenceNumber: data.referenceNumber?.trim(),
          notes: data.notes?.trim(),
          recurringExpenseId: data.recurringExpenseId,
        },
      });

      // Get existing participant IDs
      const existingParticipantIds = existingTransaction.participants.map(p => p.id);
      const updatedParticipantIds = data.participants
        .filter(p => p.id)
        .map(p => p.id as string);
      
      // Delete participants that are no longer present
      if (existingParticipantIds.length > 0) {
        await prisma.transactionParticipant.deleteMany({
          where: {
            id: { in: existingParticipantIds },
            id: { notIn: updatedParticipantIds }
          }
        });
      }

      // Update or create participants
      for (const participant of data.participants) {
        const participantAmount = typeof participant.amount === 'string' 
          ? parseFloat(participant.amount) 
          : participant.amount;

        if (isNaN(participantAmount) || participantAmount <= 0) {
          throw new Error("Participant amount must be a positive number");
        }

        // Verify that the category exists and belongs to the user
        const category = await prisma.category.findFirst({
          where: {
            id: participant.categoryId,
            userId: user.id
          }
        });

        if (!category) {
          throw new Error("Selected category not found or unauthorized");
        }

        // Verify that the payment method exists and belongs to the user
        const paymentMethod = await prisma.paymentMethod.findFirst({
          where: {
            id: participant.paymentMethodId,
            userId: user.id
          }
        });

        if (!paymentMethod) {
          throw new Error("Selected payment method not found or unauthorized");
        }

        // Verify that all tags exist and belong to the user
        if (participant.tagIds && participant.tagIds.length > 0) {
          const tags = await prisma.tag.findMany({
            where: {
              id: { in: participant.tagIds },
              userId: user.id
            }
          });

          if (tags.length !== participant.tagIds.length) {
            throw new Error("One or more selected tags not found or unauthorized");
          }
        }

        if (participant.id) {
          // Update existing participant
          await prisma.transactionParticipant.update({
            where: { id: participant.id },
            data: {
              userId: participant.userId,
              amount: participantAmount,
              type: participant.type,
              categoryId: participant.categoryId,
              paymentMethodId: participant.paymentMethodId,
              description: participant.description?.trim(),
              tags: {
                set: participant.tagIds?.map(id => ({ id })) || []
              }
            }
          });
        } else {
          // Create new participant
          await prisma.transactionParticipant.create({
            data: {
              transactionId: data.id,
              userId: participant.userId,
              amount: participantAmount,
              type: participant.type,
              categoryId: participant.categoryId,
              paymentMethodId: participant.paymentMethodId,
              description: participant.description?.trim(),
              ...(participant.tagIds?.length ? {
                tags: {
                  connect: participant.tagIds.map(id => ({ id }))
                }
              } : {})
            }
          });
        }
      }

      // Return the updated transaction with its participants
      return await prisma.transaction.findUnique({
        where: { id: updatedTransaction.id },
        include: {
          participants: {
            include: {
              category: {
                select: { name: true, icon: true }
              },
              paymentMethod: {
                select: { name: true, icon: true }
              },
              tags: {
                select: { id: true, name: true, color: true }
              }
            }
          }
        }
      });
    });

    if (!transaction) {
      throw new Error("Failed to update transaction");
    }

    return {
      success: true,
      message: "Transaction updated successfully",
      transaction: transaction as TransactionWithParticipants
    };
  } catch (error) {
    console.error('Error updating transaction:', getErrorMessage(error));
    return {
      success: false,
      message: getErrorMessage(error)
    };
  }
};

// Get a single transaction by ID
export const getTransaction = async (id: string): Promise<TransactionResult> => {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      throw new Error("User not authenticated");
    }

    const transaction = await db.transaction.findFirst({
      where: {
        id,
        creatorId: user.id,
        isDeleted: false
      },
      include: {
        participants: {
          include: {
            category: {
              select: { name: true, icon: true }
            },
            paymentMethod: {
              select: { name: true, icon: true }
            },
            tags: {
              select: { id: true, name: true, color: true }
            }
          }
        }
      }
    });

    if (!transaction) {
      throw new Error("Transaction not found");
    }

    return {
      success: true,
      message: "Transaction fetched successfully",
      transaction: transaction as TransactionWithParticipants
    };
  } catch (error) {
    console.error('Error fetching transaction:', getErrorMessage(error));
    return {
      success: false,
      message: getErrorMessage(error)
    };
  }
};

// List transactions with pagination and filtering
export const listTransactions = async (options: PaginationOptions): Promise<ListTransactionsResult> => {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      throw new Error("User not authenticated");
    }

    const { cursor, pageSize, filters = {}, sortBy = 'date', sortOrder = 'desc' } = options;

    // Build where clause with filters
    const whereClause: Prisma.TransactionWhereInput = {
      creatorId: user.id,
      isDeleted: false
    };

    if (cursor) {
      whereClause.id = { gt: cursor };
    }

    // Apply date filters
    if (filters.startDate) {
      whereClause.date = { ...whereClause.date, gte: filters.startDate };
    }
    if (filters.endDate) {
      whereClause.date = { ...whereClause.date, lte: filters.endDate };
    }

    // Apply search term filter
    if (filters.searchTerm) {
      whereClause.description = {
        contains: filters.searchTerm,
        mode: 'insensitive'
      };
    }

    // Apply amount range filters
    if (filters.minAmount !== undefined) {
      whereClause.totalAmount = { ...whereClause.totalAmount, gte: filters.minAmount };
    }
    if (filters.maxAmount !== undefined) {
      whereClause.totalAmount = { ...whereClause.totalAmount, lte: filters.maxAmount };
    }

    // Apply more complex filters (category, payment method, tags, type)
    if (filters.type || filters.categoryId || filters.paymentMethodId || filters.tagIds?.length) {
      whereClause.participants = {
        some: {
          userId: user.id,
          ...(filters.type && { type: filters.type }),
          ...(filters.categoryId && { categoryId: filters.categoryId }),
          ...(filters.paymentMethodId && { paymentMethodId: filters.paymentMethodId }),
          ...(filters.tagIds?.length && {
            tags: {
              some: {
                id: { in: filters.tagIds }
              }
            }
          })
        }
      };
    }

    // Get total count for pagination
    const totalCount = await db.transaction.count({
      where: whereClause
    });

    // Generate order by clause
    const orderBy: Prisma.TransactionOrderByWithRelationInput = {
      [sortBy]: sortOrder
    };

    // Get transactions
    const transactions = await db.transaction.findMany({
      where: whereClause,
      orderBy,
      take: pageSize + 1, // Take one extra to check for more pages
      include: {
        participants: {
          include: {
            category: {
              select: { name: true, icon: true }
            },
            paymentMethod: {
              select: { name: true, icon: true }
            },
            tags: {
              select: { id: true, name: true, color: true }
            }
          }
        }
      }
    });

    // Check if there's a next page
    const hasNextPage = transactions.length > pageSize;
    const returnTransactions = hasNextPage ? transactions.slice(0, -1) : transactions;
    const lastTransaction = returnTransactions[returnTransactions.length - 1];

    // Calculate summary statistics
    let totalIncome = 0;
    let totalExpense = 0;

    for (const transaction of returnTransactions) {
      for (const participant of transaction.participants) {
        if (participant.type === TransactionType.INCOME) {
          totalIncome += parseFloat(participant.amount.toString());
        } else {
          totalExpense += parseFloat(participant.amount.toString());
        }
      }
    }

    // Return results
    return {
      success: true,
      message: "Transactions fetched successfully",
      transactions: returnTransactions as TransactionWithParticipants[],
      nextCursor: hasNextPage && lastTransaction ? lastTransaction.id : null,
      totalCount,
      summary: {
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense
      }
    };
  } catch (error) {
    console.error('Error listing transactions:', getErrorMessage(error));
    return {
      success: false,
      message: getErrorMessage(error)
    };
  }
};

// Delete a transaction (soft delete)
export const deleteTransaction = async (id: string): Promise<TransactionResult> => {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      throw new Error("User not authenticated");
    }

    // Check if transaction exists and belongs to the user
    const existingTransaction = await db.transaction.findFirst({
      where: {
        id,
        creatorId: user.id,
        isDeleted: false
      }
    });

    if (!existingTransaction) {
      throw new Error("Transaction not found");
    }

    // Soft delete the transaction
    await db.transaction.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date()
      }
    });

    return {
      success: true,
      message: "Transaction deleted successfully"
    };
  } catch (error) {
    console.error('Error deleting transaction:', getErrorMessage(error));
    return {
      success: false,
      message: getErrorMessage(error)
    };
  }
};