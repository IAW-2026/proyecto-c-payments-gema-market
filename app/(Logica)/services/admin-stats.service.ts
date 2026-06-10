import prisma from "@/app/lib/prisma";
import type { TimeseriesGranularity, TimeseriesMetric, TimeseriesBucket } from "@/app/(Logica)/types/payments.types";

export interface AdminStatsResult {
  totalPayments: number;
  paymentsByStatus: Record<string, number>;
  totalVolume: number;
  currency: string;
  approvalRate: number;
}

export async function getAdminStats(
  dateFrom?: Date,
  dateTo?: Date,
): Promise<AdminStatsResult> {
  const dateFilter =
    dateFrom || dateTo
      ? {
          ...(dateFrom ? { gte: dateFrom } : {}),
          ...(dateTo ? { lte: dateTo } : {}),
        }
      : undefined;

  const where = dateFilter ? { createdAt: dateFilter } : {};

  const totalPayments = await prisma.ordenDePago.count({ where });

  const statusGroups = await prisma.ordenDePago.groupBy({
    by: ["status"],
    where,
    _count: { id: true },
  });

  const paymentsByStatus: Record<string, number> = {};
  let approvedCount = 0;

  for (const group of statusGroups) {
    const count = group._count.id;
    paymentsByStatus[group.status] = count;
    if (group.status === "approved") approvedCount = count;
  }

  const aggregation = await prisma.ordenDePago.aggregate({
    where: { ...where, status: "approved" },
    _sum: { totalAmount: true },
  });

  const totalVolume = Number(aggregation._sum.totalAmount ?? 0);

  const approvalRate =
    totalPayments > 0
      ? Math.round((approvedCount / totalPayments) * 1000) / 1000
      : 0;

  return {
    totalPayments,
    paymentsByStatus,
    totalVolume,
    currency: "ARS",
    approvalRate,
  };
}

/* ------------------------------------------------------------------ */
/*  Timeseries: aggregated counts/volume over time                    */
/* ------------------------------------------------------------------ */

const GRANULARITY_MAP: Record<string, string> = {
  day: "day",
  week: "week",
  month: "month",
};

/**
 * Obtiene series temporales de payments, agrupadas por intervalo.
 * @param granularity  "day" | "week" | "month"
 * @param metric       "count" | "total_volume"
 * @param dateFrom     Fecha de inicio (opcional)
 * @param dateTo       Fecha de fin (opcional)
 * @param field        Campo de fecha: "created_at" | "paid_at" (default: "created_at")
 */
export async function getStatsTimeseries(
  granularity: TimeseriesGranularity,
  metric: TimeseriesMetric,
  dateFrom?: Date,
  dateTo?: Date,
  field: "created_at" | "paid_at" = "created_at",
): Promise<{ granularity: string; metric: string; series: TimeseriesBucket[] }> {
  const trunc = GRANULARITY_MAP[granularity] ?? "day";
  const dateColumn = field === "paid_at" ? '"paid_at"' : '"created_at"';
  const conditions: string[] = [`${dateColumn} IS NOT NULL`];
  const queryParams: unknown[] = [];
  let paramIndex = 1;

  function addCondition(sql: string, ...vals: unknown[]) {
    conditions.push(sql);
    for (const v of vals) {
      queryParams.push(v);
      paramIndex++;
    }
  }

  if (dateFrom) {
    addCondition(`${dateColumn} >= $${paramIndex}`, dateFrom);
  }
  if (dateTo) {
    addCondition(`${dateColumn} <= $${paramIndex}`, dateTo);
  }

  const whereClause = `WHERE ${conditions.join(" AND ")}`;

  const valueExpr =
    metric === "total_volume"
      ? `SUM("total_amount")::float`
      : `COUNT(*)::int`;

  const sql = `SELECT DATE_TRUNC('${trunc}', ${dateColumn}) AS bucket, ${valueExpr} AS value FROM "orden_de_pago" ${whereClause} GROUP BY bucket ORDER BY bucket`;

  const rows: Array<{ bucket: Date; value: number }> =
    await prisma.$queryRawUnsafe(sql, ...queryParams);

  return {
    granularity: trunc,
    metric,
    series: rows.map((r) => ({
      bucket: r.bucket.toISOString(),
      value: Number(r.value),
    })),
  };
}
