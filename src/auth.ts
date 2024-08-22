import NextAuth from 'next-auth';
import { PrismaAdapter } from "@auth/prisma-adapter";
import { type Adapter } from "next-auth/adapters";

import { db } from "@/server/db";
import Google from "next-auth/providers/google";

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [Google],
    adapter: PrismaAdapter(db) as Adapter,
    session: { strategy: "jwt" },
});
