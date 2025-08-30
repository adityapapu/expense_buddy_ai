
"use server"

import { db } from "@/server/db"

export async function getCategories() {
  return await db.category.findMany({
    select: {
      id: true,
      name: true,
    },
  })
}

export async function getPaymentMethods() {
  return await db.paymentMethod.findMany({
    select: {
      id: true,
      name: true,
    },
  })
}
