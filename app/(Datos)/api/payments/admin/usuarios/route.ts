import { NextRequest, NextResponse } from "next/server";
import { validateApiKey, apiKeyResponse } from "@/app/(Logica)/integrations/api-key";
import { getUsuariosAdmin } from "@/app/(Logica)/services/usuarios.service";
import type { AdminUsuariosResponse } from "@/app/(Logica)/types/payments.types";

function authCheck(request: NextRequest): NextResponse | null {
  if (!validateApiKey(request)) return apiKeyResponse();
  return null;
}

export async function GET(request: NextRequest) {
  const auth = authCheck(request);
  if (auth) return auth;

  try {
    const { searchParams } = new URL(request.url);

    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const pageSizeRaw = parseInt(searchParams.get("page_size") ?? "20", 10);
    const pageSize = Math.min(Math.max(1, pageSizeRaw), 100);
    const q = searchParams.get("q") || undefined;
    const rawOrder = searchParams.get("order") || "desc";
    const order = rawOrder === "asc" ? "asc" as const : "desc" as const;
    const sortBy = searchParams.get("sort_by") || "created_at";

    const result = await getUsuariosAdmin({ q, page, pageSize, sortBy, order });

    const response: AdminUsuariosResponse = {
      items: result.rows.map((r) => ({
        user_id: r.id,
        clerk_user_id: r.clerkUserId,
        email: r.email,
        full_name: r.fullName,
        created_at: r.createdAt.toISOString(),
      })),
      page,
      page_size: pageSize,
      total: result.total,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error al obtener usuarios admin:", error);
    return NextResponse.json(
      { error: "Error interno al obtener usuarios." },
      { status: 500 },
    );
  }
}
