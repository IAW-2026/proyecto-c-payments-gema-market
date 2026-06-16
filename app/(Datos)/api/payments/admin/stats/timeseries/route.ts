import { NextRequest, NextResponse } from "next/server";
import { validateApiKey, apiKeyResponse } from "@/app/(Logica)/integrations/api-key";
import { getStatsTimeseries } from "@/app/(Logica)/services/admin-stats.service";
import type { TimeseriesGranularity, TimeseriesMetric, AdminTimeseriesResponse } from "@/app/(Logica)/types/payments.types";

function authCheck(request: NextRequest): NextResponse | null {
  if (!validateApiKey(request)) return apiKeyResponse();
  return null;
}

export async function GET(request: NextRequest) {
  const auth = authCheck(request);
  if (auth) return auth;

  try {
    const { searchParams } = new URL(request.url);

    const rawGranularity = searchParams.get("granularity") || "day";
    const validGranularities = ["day", "week", "month"];
    if (!validGranularities.includes(rawGranularity)) {
      return NextResponse.json(
        { error: "Parametro 'granularity' invalido. Use: day, week o month." },
        { status: 400 },
      );
    }
    const granularity = rawGranularity as TimeseriesGranularity;

    const rawMetric = searchParams.get("metric") || "count";
    const validMetrics = ["count", "total_volume"];
    if (!validMetrics.includes(rawMetric)) {
      return NextResponse.json(
        { error: "Parametro 'metric' invalido. Use: count o total_volume." },
        { status: 400 },
      );
    }
    const metric = rawMetric as TimeseriesMetric;

    const rawField = searchParams.get("field") || "created_at";
    if (rawField !== "created_at" && rawField !== "paid_at") {
      return NextResponse.json(
        { error: "Parametro 'field' invalido. Use: created_at o paid_at." },
        { status: 400 },
      );
    }
    const field = rawField as "created_at" | "paid_at";

    let dateFrom: Date | undefined;
    let dateTo: Date | undefined;

    const dateFromStr = searchParams.get("date_from");
    const dateToStr = searchParams.get("date_to");

    if (dateFromStr) {
      dateFrom = new Date(dateFromStr);
      if (isNaN(dateFrom.getTime())) {
        return NextResponse.json(
          { error: "Formato invalido para 'date_from'. Use ISO 8601." },
          { status: 400 },
        );
      }
    }

    if (dateToStr) {
      dateTo = new Date(dateToStr);
      if (isNaN(dateTo.getTime())) {
        return NextResponse.json(
          { error: "Formato invalido para 'date_to'. Use ISO 8601." },
          { status: 400 },
        );
      }
    }

    const result = await getStatsTimeseries(granularity, metric, dateFrom, dateTo, field);

    const response: AdminTimeseriesResponse = {
      granularity: result.granularity,
      metric: result.metric,
      series: result.series,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error al obtener timeseries:", error);
    return NextResponse.json(
      { error: "Error interno al obtener la serie temporal." },
      { status: 500 },
    );
  }
}
