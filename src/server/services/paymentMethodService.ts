"use server";
import { getErrorMessage } from '@/utils/error';  // Make sure the path is correct
import { db } from "@/server/db";
import { getCurrentUser } from "@/server/services/userService";
import { PaymentMethod } from '@prisma/client';
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
