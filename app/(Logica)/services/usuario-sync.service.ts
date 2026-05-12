import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/app/lib/prisma";
import { generateUlid } from "@/app/lib/ulid";

/**
 * Sincroniza el usuario autenticado de Clerk con la base local.
 */
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

/**
 * Obtiene el usuario local a partir del ID de Clerk.
 */
export async function getUsuarioByClerkUserId(clerkUserId: string) {
  if (!clerkUserId) return null;
  return prisma.usuario.findUnique({
    where: { clerkUserId },
  });
}

/**
 * Obtiene usuarios locales por una lista de IDs.
 */
export async function getUsuariosByIds(ids: string[]) {
  if (!ids.length) return [];
  return prisma.usuario.findMany({
    where: { id: { in: ids } },
  });
}
