/**
 * Servicio de Usuarios para administración.
 * Encapsula las consultas Prisma para la entidad Usuario en contexto admin.
 */

import prisma from "@/app/lib/prisma";
import type { Prisma } from "@prisma/client";

export interface GetUsuariosAdminParams {
  q?: string;
  page: number;
  pageSize: number;
  sortBy: string;
  order: "asc" | "desc";
}

export interface UsuarioAdminRow {
  id: string;
  clerkUserId: string;
  email: string | null;
  fullName: string | null;
  createdAt: Date;
}

const SORT_MAP: Record<string, string> = {
  created_at: "createdAt",
  email: "email",
  full_name: "fullName",
};

/**
 * Busca usuarios con paginación para el panel de administración.
 * Soporta búsqueda por email o fullName (case-insensitive).
 */
export async function getUsuariosAdmin(
  opts: GetUsuariosAdminParams,
): Promise<{ rows: UsuarioAdminRow[]; total: number }> {
  const { q, page, pageSize, sortBy, order } = opts;

  const where: Prisma.UsuarioWhereInput = {};

  if (q?.trim()) {
    const term = q.trim();
    where.OR = [
      { email: { contains: term, mode: "insensitive" } },
      { fullName: { contains: term, mode: "insensitive" } },
    ];
  }

  const mappedSort = SORT_MAP[sortBy] ?? "createdAt";
  const skip = (page - 1) * pageSize;

  const [rows, total] = await Promise.all([
    prisma.usuario.findMany({
      where,
      orderBy: { [mappedSort]: order },
      skip,
      take: pageSize,
    }),
    prisma.usuario.count({ where }),
  ]);

  return {
    rows: rows.map((r) => ({
      id: r.id,
      clerkUserId: r.clerkUserId,
      email: r.email,
      fullName: r.fullName,
      createdAt: r.createdAt,
    })),
    total,
  };
}
