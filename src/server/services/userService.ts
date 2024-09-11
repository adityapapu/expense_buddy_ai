import { auth } from "@/auth";

export async function getCurrentUser() {
    const session = await auth();
    if(!session?.user?.email) return null;
    return session.user;
}

