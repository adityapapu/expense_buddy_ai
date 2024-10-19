"use server";
import { getErrorMessage } from '@/utils/error';  // Make sure the path is correct
import { db } from "@/server/db";
import { getCurrentUser } from "@/server/services/userService";
import { type PaymentMethod } from '@prisma/client';
import { delay } from '@/lib/utils';

interface CreatePaymentMethodData {
  name: string;
  icon?: string;
}

type CreatePaymentMethodResult = {
  success: boolean;
  message: string;
  paymentMethod?: PaymentMethod; // Ideally, replace 'any' with the specific type you expect
};

interface CursorPaginationOptions {
  cursor?: string; // last payment method ID seen by the client
  pageSize: number;
}

type ListPaymentMethodsResult = {
  success: boolean;
  message: string;
  paymentMethods?: PaymentMethod[];
  nextCursor?: string | null;   // `null` indicates there are no more records
};
export const createPaymentMethod = async (data: CreatePaymentMethodData): Promise<CreatePaymentMethodResult> => {
  try {

    //fake wait of 3 sec
    // await delay(6);


    const user = await getCurrentUser();
    console.log(user);

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


export const listPaymentMethods= async (options: CursorPaginationOptions): Promise<ListPaymentMethodsResult & { totalCount?: number }> => {
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
      return {
          success: true,
          message: "Payment methods fetched successfully",
          paymentMethods: returnPaymentMethods,
          nextCursor: hasNextPage ? returnPaymentMethods[returnPaymentMethods.length - 1].id : null,
          totalCount: totalCount    // Including totalCount here
      };

  } catch (error) {
      console.error('Error listing payment methods:', getErrorMessage(error));
      return { 
          success: false, 
          message: getErrorMessage(error)
      };
  }
};