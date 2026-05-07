import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/app/lib/prisma";
import { generateUlid } from "@/app/lib/ulid";

export async function syncCurrentUser() {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) return null;

    const email = clerkUser.emailAddresses[0]?.emailAddress ?? null;
    const fullName = [clerkUser.firstName, clerkUser.lastName]
      .filter(Boolean)
      .join(" ") || null;

    const existing = await prisma.usuario.findUnique({
      where: { clerkUserId: clerkUser.id },
    });

    if (existing) return existing;

    return prisma.usuario.create({
      data: {
        id: generateUlid("usr_"),
        clerkUserId: clerkUser.id,
        email,
        fullName,
      },
    });
  } catch {
    return null;
  }
}
