"use server";
import { auth } from "@/auth";
import { db } from "@/server/db";

export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.email) return null;

  const user = await db.user.findUnique({
    where: { email: session.user.email }
  });

  return user;
}
