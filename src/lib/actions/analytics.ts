"use server";

import { db } from "@/server/db";
import { auth } from "@/auth";
import { Prisma } from "@prisma/client";
import type { DateRange } from "react-day-picker";

// Types for analytics data
export interface CategoryData {
  id: string;
  name: string;
  icon: string;
  type: "INCOME" | "EXPENSE";
}

export interface ExpenseSummaryData {
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  savingsRate: number;
  monthlyChange: number;
  largestExpense: {
    category: string;
    amount: number;
    percentage: number;
  };
}

export interface IncomeExpenseChartData {
  month: string;
  income: number;
  expenses: number;
}

export interface CategoryBreakdownData {
  id: string;
  name: string;
  value: number;
  icon: string;
  color: string;
  percentage: number;
}

export interface MonthlyTrendData {
  month: string;
  total: number;
  [key: string]: number; // For dynamic category keys
}

export interface TransactionListItem {
  id: string;
  date: string;
  description: string;
  category: {
    id: string;
    name: string;
    icon: string;
  };
  amount: number;
  type: "income" | "expense";
}

// Get authenticated user or throw error
async function getAuthenticatedUser() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }
  return session.user;
}

// Get user categories for filtering
export async function getUserCategories(): Promise<CategoryData[]> {
  const user = await getAuthenticatedUser();

  const categories = await db.category.findMany({
    where: {
      userId: user.id,
    },
    select: {
      id: true,
      name: true,
      icon: true,
      type: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  return categories.map(cat => ({
    id: cat.id,
    name: cat.name,
    icon: cat.icon,
    type: cat.type,
  }));
}

// Get expense summary data
export async function getExpenseSummary(dateRange?: DateRange): Promise<ExpenseSummaryData> {
  const user = await getAuthenticatedUser();

  // Build date filter
  const dateFilter = dateRange?.from && dateRange?.to ? {
    date: {
      gte: dateRange.from,
      lte: dateRange.to,
    },
  } : {};

  // Get total income
  const totalIncomeResult = await db.transactionParticipant.aggregate({
    where: {
      userId: user.id,
      type: "INCOME",
      transaction: {
        isDeleted: false,
        ...dateFilter,
      },
    },
    _sum: {
      amount: true,
    },
  });

  // Get total expenses
  const totalExpenseResult = await db.transactionParticipant.aggregate({
    where: {
      userId: user.id,
      type: "EXPENSE",
      transaction: {
        isDeleted: false,
        ...dateFilter,
      },
    },
    _sum: {
      amount: true,
    },
  });

  const totalIncome = totalIncomeResult._sum.amount?.toNumber() || 0;
  const totalExpenses = totalExpenseResult._sum.amount?.toNumber() || 0;
  const netSavings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

  // Calculate monthly change (comparing to previous period)
  const monthlyChange = 0; // TODO: Implement previous period comparison

  // Get largest expense
  const largestExpenseResult = await db.transactionParticipant.findFirst({
    where: {
      userId: user.id,
      type: "EXPENSE",
      transaction: {
        isDeleted: false,
        ...dateFilter,
      },
    },
    include: {
      category: true,
    },
    orderBy: {
      amount: "desc",
    },
  });

  const largestExpense = largestExpenseResult ? {
    category: largestExpenseResult.category.name,
    amount: largestExpenseResult.amount.toNumber(),
    percentage: totalExpenses > 0 ? (largestExpenseResult.amount.toNumber() / totalExpenses) * 100 : 0,
  } : {
    category: "N/A",
    amount: 0,
    percentage: 0,
  };

  return {
    totalIncome,
    totalExpenses,
    netSavings,
    savingsRate,
    monthlyChange,
    largestExpense,
  };
}

// Get income vs expense chart data (monthly)
export async function getIncomeExpenseChartData(dateRange?: DateRange): Promise<IncomeExpenseChartData[]> {
  const user = await getAuthenticatedUser();

  // Build date filter
  const dateFilter = dateRange?.from && dateRange?.to ? {
    date: {
      gte: dateRange.from,
      lte: dateRange.to,
    },
  } : {};

  // Get monthly data
  const monthlyData = await db.$queryRaw<IncomeExpenseChartData[]>`
    SELECT
      TO_CHAR(DATE_TRUNC('month', t.date), 'Mon YYYY') as month,
      COALESCE(SUM(CASE WHEN tp.type = 'INCOME' THEN tp.amount END), 0)::float as income,
      COALESCE(SUM(CASE WHEN tp.type = 'EXPENSE' THEN tp.amount END), 0)::float as expenses
    FROM transaction_participant tp
    JOIN transaction t ON tp.transaction_id = t.id
    WHERE tp.user_id = ${user.id}
      AND t.is_deleted = false
      ${dateFilter.date ? Prisma.sql`AND t.date >= ${dateFilter.date.gte}` : Prisma.empty}
      ${dateFilter.date ? Prisma.sql`AND t.date <= ${dateFilter.date.lte}` : Prisma.empty}
    GROUP BY DATE_TRUNC('month', t.date)
    ORDER BY DATE_TRUNC('month', t.date)
  `;

  return monthlyData;
}

// Get category breakdown data
export async function getCategoryBreakdownData(
  dateRange?: DateRange,
  selectedCategories?: string[]
): Promise<CategoryBreakdownData[]> {
  const user = await getAuthenticatedUser();

  // Build filters
  const dateFilter = dateRange?.from && dateRange?.to ? {
    date: {
      gte: dateRange.from,
      lte: dateRange.to,
    },
  } : {};

  const categoryFilter = selectedCategories && selectedCategories.length > 0 ? {
    categoryId: {
      in: selectedCategories,
    },
  } : {};

  // Get total expenses for percentage calculation
  const totalExpenses = await db.transactionParticipant.aggregate({
    where: {
      userId: user.id,
      type: "EXPENSE",
      transaction: {
        isDeleted: false,
        ...dateFilter,
      },
      ...categoryFilter,
    },
    _sum: {
      amount: true,
    },
  });

  const totalExpenseAmount = totalExpenses._sum.amount?.toNumber() || 0;

  // Get category breakdown
  const breakdownData = await db.transactionParticipant.findMany({
    where: {
      userId: user.id,
      type: "EXPENSE",
      transaction: {
        isDeleted: false,
        ...dateFilter,
      },
      ...categoryFilter,
    },
    include: {
      category: true,
    },
  });

  // Aggregate by category
  const categoryMap = new Map<string, { amount: number; category: typeof breakdownData[0]['category'] }>();

  breakdownData.forEach(item => {
    const categoryId = item.category.id;
    const amount = item.amount.toNumber();

    if (categoryMap.has(categoryId)) {
      categoryMap.get(categoryId)!.amount += amount;
    } else {
      categoryMap.set(categoryId, {
        amount,
        category: item.category,
      });
    }
  });

  // Convert to array and calculate percentages
  const result: CategoryBreakdownData[] = Array.from(categoryMap.entries()).map(([id, data], index) => ({
    id,
    name: data.category.name,
    value: data.amount,
    icon: data.category.icon,
    color: `hsl(${(index * 137.5) % 360}, 70%, 50%)`, // Generate distinct colors
    percentage: totalExpenseAmount > 0 ? (data.amount / totalExpenseAmount) * 100 : 0,
  }));

  return result.sort((a, b) => b.value - a.value); // Sort by amount descending
}

// Get monthly trend data by category
export async function getMonthlyTrendData(
  dateRange?: DateRange,
  selectedCategories?: string[]
): Promise<MonthlyTrendData[]> {
  const user = await getAuthenticatedUser();

  // Build filters
  const dateFilter = dateRange?.from && dateRange?.to ? {
    date: {
      gte: dateRange.from,
      lte: dateRange.to,
    },
  } : {};

  const categoryFilter = selectedCategories && selectedCategories.length > 0 ? {
    categoryId: {
      in: selectedCategories,
    },
  } : {};

  // Get monthly trend data with category breakdowns
  const trendData = await db.$queryRaw<any[]>`
    SELECT
      TO_CHAR(DATE_TRUNC('month', t.date), 'Mon YYYY') as month,
      c.name as category_name,
      LOWER(REPLACE(c.name, ' ', '')) as category_key,
      SUM(tp.amount)::float as amount
    FROM transaction_participant tp
    JOIN transaction t ON tp.transaction_id = t.id
    JOIN category c ON tp.category_id = c.id
    WHERE tp.user_id = ${user.id}
      AND tp.type = 'EXPENSE'
      AND t.is_deleted = false
      ${dateFilter.date ? Prisma.sql`AND t.date >= ${dateFilter.date.gte}` : Prisma.empty}
      ${dateFilter.date ? Prisma.sql`AND t.date <= ${dateFilter.date.lte}` : Prisma.empty}
      ${categoryFilter.categoryId ? Prisma.sql`AND tp.category_id IN (${categoryFilter.categoryId.in.map(id => Prisma.sql`${id}`).join(', ')})` : Prisma.empty}
    GROUP BY DATE_TRUNC('month', t.date), c.id, c.name
    ORDER BY DATE_TRUNC('month', t.date), c.name
  `;

  // Transform data into the expected format
  const monthlyMap = new Map<string, MonthlyTrendData>();

  trendData.forEach((row: any) => {
    const month = row.month;
    const categoryKey = row.category_key;
    const amount = row.amount;

    if (!monthlyMap.has(month)) {
      monthlyMap.set(month, { month, total: 0 } as MonthlyTrendData);
    }

    const monthData = monthlyMap.get(month)!;
    (monthData as any)[categoryKey] = amount;
    monthData.total += amount;
  });

  return Array.from(monthlyMap.values()).sort((a, b) => {
    // Sort by date (assuming format "Mon YYYY")
    const aDate = new Date(a.month + ' 1');
    const bDate = new Date(b.month + ' 1');
    return aDate.getTime() - bDate.getTime();
  });
}

// Get filtered transaction list
export async function getFilteredTransactions(
  dateRange?: DateRange,
  selectedCategories?: string[],
  searchTerm?: string,
  sortBy: string = "date-desc",
  limit: number = 50,
  offset: number = 0
): Promise<{ transactions: TransactionListItem[]; totalCount: number }> {
  const user = await getAuthenticatedUser();

  // Build filters
  const dateFilter = dateRange?.from && dateRange?.to ? {
    date: {
      gte: dateRange.from,
      lte: dateRange.to,
    },
  } : {};

  const categoryFilter = selectedCategories && selectedCategories.length > 0 ? {
    categoryId: {
      in: selectedCategories,
    },
  } : {};

  const searchFilter = searchTerm ? {
    transaction: {
      OR: [
        { description: { contains: searchTerm, mode: "insensitive" } },
        { notes: { contains: searchTerm, mode: "insensitive" } },
      ],
    },
  } : {};

  // Get total count for pagination
  const totalCount = await db.transactionParticipant.count({
    where: {
      userId: user.id,
      transaction: {
        isDeleted: false,
        ...dateFilter,
        ...searchFilter,
      },
      ...categoryFilter,
    },
  });

  // Build order by
  const orderBy: Prisma.TransactionParticipantOrderByWithRelationInput = {};
  switch (sortBy) {
    case "date-asc":
      orderBy.transaction = { date: "asc" };
      break;
    case "date-desc":
      orderBy.transaction = { date: "desc" };
      break;
    case "amount-asc":
      orderBy.amount = "asc";
      break;
    case "amount-desc":
      orderBy.amount = "desc";
      break;
    default:
      orderBy.transaction = { date: "desc" };
  }

  // Get transactions
  const transactionParticipants = await db.transactionParticipant.findMany({
    where: {
      userId: user.id,
      transaction: {
        isDeleted: false,
        ...dateFilter,
        ...searchFilter,
      },
      ...categoryFilter,
    },
    include: {
      transaction: true,
      category: true,
    },
    orderBy,
    take: limit,
    skip: offset,
  });

  // Transform to expected format
  const transactions: TransactionListItem[] = transactionParticipants.map(tp => ({
    id: tp.transaction.id,
    date: tp.transaction.date.toISOString().split("T")[0],
    description: tp.transaction.description,
    category: {
      id: tp.category.id,
      name: tp.category.name,
      icon: tp.category.icon,
    },
    amount: tp.type === "INCOME" ? tp.amount.toNumber() : -tp.amount.toNumber(),
    type: tp.type.toLowerCase() as "income" | "expense",
  }));

  return {
    transactions,
    totalCount,
  };
}

// Export data functions
export async function exportTransactionsCSV(
  dateRange?: DateRange,
  selectedCategories?: string[],
  searchTerm?: string,
  sortBy: string = "date-desc"
): Promise<string> {
  const { transactions } = await getFilteredTransactions(
    dateRange,
    selectedCategories,
    searchTerm,
    sortBy,
    10000 // Export up to 10k transactions
  );

  // Create CSV header
  const headers = ["Date", "Description", "Category", "Amount", "Type"];

  // Create CSV rows
  const rows = transactions.map(transaction => [
    transaction.date,
    `"${transaction.description.replace(/"/g, '""')}"`, // Escape quotes in CSV
    transaction.category.name,
    transaction.amount.toString(),
    transaction.type
  ]);

  // Combine headers and rows
  const csvContent = [headers, ...rows]
    .map(row => row.join(","))
    .join("\n");

  return csvContent;
}

export async function exportAnalyticsSummary(
  dateRange?: DateRange
): Promise<{
  summary: ExpenseSummaryData;
  csvContent: string;
}> {
  const summary = await getExpenseSummary(dateRange);

  // Create summary CSV
  const summaryData = [
    ["Metric", "Value"],
    ["Total Income", summary.totalIncome.toString()],
    ["Total Expenses", summary.totalExpenses.toString()],
    ["Net Savings", summary.netSavings.toString()],
    ["Savings Rate", `${summary.savingsRate.toFixed(2)}%`],
    ["Largest Expense Category", summary.largestExpense.category],
    ["Largest Expense Amount", summary.largestExpense.amount.toString()],
    ["Largest Expense Percentage", `${summary.largestExpense.percentage.toFixed(2)}%`]
  ];

  const csvContent = summaryData
    .map(row => row.map(cell => `"${cell}"`).join(","))
    .join("\n");

  return { summary, csvContent };
}