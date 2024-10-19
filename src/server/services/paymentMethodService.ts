"use server";
import { getErrorMessage } from '../../utils/error';
import { db } from "../db";
import { getCurrentUser } from "./userService";
import { type PaymentMethod } from '@prisma/client';
import { delay } from '../../lib/utils';

interface CreatePaymentMethodData {
  name: string;
  icon?: string;
}

interface UpdatePaymentMethodData {
  id: string;
  name: string;
  icon?: string;
}

type PaymentMethodResult = {
  success: boolean;
  message: string;
  paymentMethod?: PaymentMethod;
};

interface CursorPaginationOptions {
  cursor?: string;
  pageSize: number;
}

type ListPaymentMethodsResult = {
  success: boolean;
  message: string;
  paymentMethods?: PaymentMethod[];
  nextCursor?: string | null;
  totalCount?: number;
};

export const createPaymentMethod = async (data: CreatePaymentMethodData): Promise<PaymentMethodResult> => {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      throw new Error("User not authenticated");
    }

    const trimmedName = data.name.trim();
    if (!trimmedName) {
      throw new Error("Payment method name is required");
    }

    const existingPaymentMethod = await db.paymentMethod.findFirst({
      where: {
        userId: user.id,
        name: trimmedName
      }
    });

    if (existingPaymentMethod) {
      throw new Error("A payment method with this name already exists");
    }

    const newPaymentMethod = await db.paymentMethod.create({
      data: {
        ...data,
        name: trimmedName,
        userId: user.id
      }
    });

    return { 
      success: true, 
      message: "Payment method created successfully",
      paymentMethod: newPaymentMethod 
    };

  } catch (error) {
    console.error('Error creating payment method:', getErrorMessage(error));
    return { 
      success: false,
      message: getErrorMessage(error)
    };
  }
};

export const updatePaymentMethod = async (data: UpdatePaymentMethodData): Promise<PaymentMethodResult> => {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      throw new Error("User not authenticated");
    }

    const trimmedName = data.name.trim();
    if (!trimmedName) {
      throw new Error("Payment method name is required");
    }

    const existingPaymentMethod = await db.paymentMethod.findFirst({
      where: {
        id: data.id,
        userId: user.id
      }
    });

    if (!existingPaymentMethod) {
      throw new Error("Payment method not found");
    }

    const updatedPaymentMethod = await db.paymentMethod.update({
      where: { id: data.id },
      data: {
        name: trimmedName,
        icon: data.icon
      }
    });

    return { 
      success: true, 
      message: "Payment method updated successfully",
      paymentMethod: updatedPaymentMethod 
    };

  } catch (error) {
    console.error('Error updating payment method:', getErrorMessage(error));
    return { 
      success: false,
      message: getErrorMessage(error)
    };
  }
};

export const listPaymentMethods = async (options: CursorPaginationOptions): Promise<ListPaymentMethodsResult> => {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      throw new Error("User not authenticated");
    }

    const { cursor, pageSize } = options;
    const totalCount = await db.paymentMethod.count({
      where: { userId: user.id }
    });

    const paymentMethods = await db.paymentMethod.findMany({
      where: {
        id: cursor ? { gt: cursor } : undefined,
        userId: user.id
      },
      take: pageSize + 1,
      orderBy: { id: 'asc' } 
    });

    const hasNextPage = paymentMethods.length > pageSize;
    const returnPaymentMethods = hasNextPage ? paymentMethods.slice(0, -1) : paymentMethods;
    const lastPaymentMethod = returnPaymentMethods[returnPaymentMethods.length - 1];
    
    return {
      success: true,
      message: "Payment methods fetched successfully",
      paymentMethods: returnPaymentMethods,
      nextCursor: hasNextPage && lastPaymentMethod ? lastPaymentMethod.id : null,
      totalCount: totalCount
    };

  } catch (error) {
    console.error('Error listing payment methods:', getErrorMessage(error));
    return { 
      success: false, 
      message: getErrorMessage(error)
    };
  }
};

export const deletePaymentMethod = async (id: string): Promise<PaymentMethodResult> => {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      throw new Error("User not authenticated");
    }

    const existingPaymentMethod = await db.paymentMethod.findFirst({
      where: {
        id: id,
        userId: user.id
      }
    });

    if (!existingPaymentMethod) {
      throw new Error("Payment method not found");
    }

    await db.paymentMethod.delete({
      where: { id: id }
    });

    return { 
      success: true, 
      message: "Payment method deleted successfully"
    };

  } catch (error) {
    console.error('Error deleting payment method:', getErrorMessage(error));
    return { 
      success: false,
      message: getErrorMessage(error)
    };
  }
};
