"use server";
import { getErrorMessage } from '../../utils/error';
import { db } from "../db";
import { getCurrentUser } from "./userService";
import { type Category, type Prisma, TransactionType } from '@prisma/client';

interface CreateCategoryData {
  name: string;
  icon: string;
  type: TransactionType;
}

interface UpdateCategoryData {
  id: string;
  name: string;
  icon: string;
  type: TransactionType;
}

type CategoryResult = {
  success: boolean;
  message: string;
  category?: Category;
};

interface CursorPaginationOptions {
  cursor?: string;
  pageSize: number;
  filters?: {
    name?: string;
    type?: TransactionType;
  };
}

type ListCategoriesResult = {
  success: boolean;
  message: string;
  categories?: Category[];
  nextCursor?: string | null;
  totalCount?: number;
};

export const createCategory = async (data: CreateCategoryData): Promise<CategoryResult> => {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      throw new Error("User not authenticated");
    }

    const trimmedName = data.name.trim();
    if (!trimmedName) {
      throw new Error("Category name is required");
    }

    const existingCategory = await db.category.findFirst({
      where: {
        userId: user.id,
        name: trimmedName,
        type: data.type
      }
    });

    if (existingCategory) {
      throw new Error(`A category with this name already exists for the ${data.type.toLowerCase()} type`);
    }

    const newCategory = await db.category.create({
      data: {
        ...data,
        name: trimmedName,
        userId: user.id
      }
    });

    return { 
      success: true, 
      message: "Category created successfully",
      category: newCategory 
    };

  } catch (error) {
    console.error('Error creating category:', getErrorMessage(error));
    return { 
      success: false,
      message: getErrorMessage(error)
    };
  }
};

export const updateCategory = async (data: UpdateCategoryData): Promise<CategoryResult> => {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      throw new Error("User not authenticated");
    }

    const trimmedName = data.name.trim();
    if (!trimmedName) {
      throw new Error("Category name is required");
    }

    const existingCategory = await db.category.findFirst({
      where: {
        id: data.id,
        userId: user.id
      }
    });

    if (!existingCategory) {
      throw new Error("Category not found");
    }

    // Check for duplicate name within the same type
    const duplicateCategory = await db.category.findFirst({
      where: {
        userId: user.id,
        name: trimmedName,
        type: data.type,
        id: { not: data.id }
      }
    });

    if (duplicateCategory) {
      throw new Error(`A category with this name already exists for the ${data.type.toLowerCase()} type`);
    }

    const updatedCategory = await db.category.update({
      where: { id: data.id },
      data: {
        name: trimmedName,
        icon: data.icon,
        type: data.type
      }
    });

    return { 
      success: true, 
      message: "Category updated successfully",
      category: updatedCategory 
    };

  } catch (error) {
    console.error('Error updating category:', getErrorMessage(error));
    return { 
      success: false,
      message: getErrorMessage(error)
    };
  }
};

export const listCategories = async (options: CursorPaginationOptions): Promise<ListCategoriesResult> => {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      throw new Error("User not authenticated");
    }

    const { cursor, pageSize, filters = {} } = options;

    const whereClause: Prisma.CategoryWhereInput = {
      userId: user.id,
    };

    if (cursor) {
      whereClause.id = { gt: cursor };
    }

    if (filters.name) {
      whereClause.name = {
        contains: filters.name,
        mode: 'insensitive'
      };
    }

    if (filters.type) {
      whereClause.type = filters.type;
    }

    const totalCount = await db.category.count({
      where: whereClause
    });

    const categories = await db.category.findMany({
      where: whereClause,
      take: pageSize + 1,
      orderBy: { updatedAt: 'desc' } 
    });

    const hasNextPage = categories.length > pageSize;
    const returnCategories = hasNextPage ? categories.slice(0, -1) : categories;
    const lastCategory = returnCategories[returnCategories.length - 1];
    
    return {
      success: true,
      message: "Categories fetched successfully",
      categories: returnCategories,
      nextCursor: hasNextPage && lastCategory ? lastCategory.id : null,
      totalCount: totalCount
    };

  } catch (error) {
    console.error('Error listing categories:', getErrorMessage(error));
    return { 
      success: false, 
      message: getErrorMessage(error)
    };
  }
};

export const deleteCategory = async (id: string): Promise<CategoryResult> => {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      throw new Error("User not authenticated");
    }

    const existingCategory = await db.category.findFirst({
      where: {
        id: id,
        userId: user.id
      }
    });

    if (!existingCategory) {
      throw new Error("Category not found");
    }

    // Check if category is in use by any transaction
    const transactionCount = await db.transactionParticipant.count({
      where: {
        categoryId: id
      }
    });

    if (transactionCount > 0) {
      throw new Error("Cannot delete a category that is used in transactions. Try updating it instead.");
    }

    await db.category.delete({
      where: { id: id }
    });

    return { 
      success: true, 
      message: "Category deleted successfully"
    };

  } catch (error) {
    console.error('Error deleting category:', getErrorMessage(error));
    return { 
      success: false,
      message: getErrorMessage(error)
    };
  }
};