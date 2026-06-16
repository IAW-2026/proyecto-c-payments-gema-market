import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { validateApiKey, apiKeyResponse } from "@/app/(Logica)/integrations/api-key";
import { getAdminStats } from "@/app/(Logica)/services/admin-stats.service";
import type { AdminStatsResponse } from "@/app/(Logica)/types/payments.types";

function authCheck(request: NextRequest): NextResponse | null {
  if (!validateApiKey(request)) return apiKeyResponse();
  return null;
}

export async function GET(request: NextRequest) {
  const auth = authCheck(request);
  if (auth) return auth;

  try {
    const { searchParams } = new URL(request.url);
    const dateSchema = z.string().datetime();

    const dateFromStr = searchParams.get("date_from");
    const dateToStr = searchParams.get("date_to");

    let dateFrom: Date | undefined;
    let dateTo: Date | undefined;

    if (dateFromStr !== null) {
      const parsed = dateSchema.safeParse(dateFromStr);
      if (!parsed.success) {
        return NextResponse.json(
          { error: "Formato invalido para 'date_from'. Use ISO 8601." },
          { status: 400 },
        );
      }
      dateFrom = new Date(parsed.data);
    }

    if (dateToStr !== null) {
      const parsed = dateSchema.safeParse(dateToStr);
      if (!parsed.success) {
        return NextResponse.json(
          { error: "Formato invalido para 'date_to'. Use ISO 8601." },
          { status: 400 },
        );
      }
      dateTo = new Date(parsed.data);
    }

    const stats = await getAdminStats(dateFrom, dateTo);

    const response: AdminStatsResponse = {
      total_payments: stats.totalPayments,
      payments_by_status: stats.paymentsByStatus,
      total_volume: stats.totalVolume,
      currency: stats.currency,
      approval_rate: stats.approvalRate,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error al obtener estadisticas admin:", error);
    return NextResponse.json(
      { error: "Error interno al obtener estadisticas." },
      { status: 500 },
    );
  }
}
