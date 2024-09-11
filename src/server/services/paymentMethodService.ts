"use server"
import { db } from "@/server/db";
import { getCurrentUser } from "@/server/services/userService";

// Define TypeScript interfaces for the input data
interface CreatePaymentMethodData {
    name: string;
    icon?: string;
  }
  
  interface UpdatePaymentMethodData {
    name?: string;
    icon?: string;
  }

  // Create a new payment method
export const createPaymentMethod = async (data: CreatePaymentMethodData) => {

    const user = await getCurrentUser();
    if(!user){
        throw new Error("User not found");
    }
    try {
      return await db.paymentMethod.create({
        data,
      });
    } catch (error) {
      console.error('Error creating payment method:', error);
      throw new Error('Failed to create payment method');
    }
  };
  