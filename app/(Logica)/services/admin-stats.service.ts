import prisma from "@/app/lib/prisma";

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
