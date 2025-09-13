"use server";

import { auth } from "@/auth";
import { db } from "@/server/db";
import { revalidatePath } from "next/cache";

export async function getUserProfile() {
  const session = await auth();
  if (!session?.user?.email) {
    throw new Error("Not authenticated");
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
}

export async function updateUserProfile(data: { name?: string }) {
  const session = await auth();
  if (!session?.user?.email) {
    throw new Error("Not authenticated");
  }

  const updatedUser = await db.user.update({
    where: { email: session.user.email },
    data: {
      ...(data.name && { name: data.name }),
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
    },
  });

  revalidatePath("/settings");
  return updatedUser;
}