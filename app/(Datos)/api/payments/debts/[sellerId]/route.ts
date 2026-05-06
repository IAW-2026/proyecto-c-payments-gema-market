import { NextRequest, NextResponse } from "next/server";
import { getDebtsBySeller } from "@/app/(Logica)/services/ordenes-de-pago.service";
import type { SellerDebtsResponse } from "@/app/(Logica)/types/payments.types";

/**
 * GET /api/payments/debts/[sellerId]?start_date=YYYY-MM-DD
 *
 * Retorna la lista de deudas (órdenes pagadas) que la plataforma tiene con un vendedor.
 * Permite filtrar por una fecha de inicio.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sellerId: string }> },
) {
  const { sellerId } = await params;
  
  // Obtener fecha de inicio desde los query params
  const { searchParams } = new URL(request.url);
  const startDateStr = searchParams.get("start_date");
  
  let startDate: Date | undefined;
  if (startDateStr) {
    startDate = new Date(startDateStr);
    if (isNaN(startDate.getTime())) {
      return NextResponse.json(
        { error: "Formato de fecha inválido para 'start_date'. Use formato ISO 8601." },
        { status: 400 },
      );
    }
  }

  try {
    const result = await getDebtsBySeller(sellerId, startDate);

    // Mapear resultado al contrato de API (snake_case)
    const response: SellerDebtsResponse = {
      seller_id: result.sellerId,
      total_debt: result.totalDebt,
      items: result.items.map((item) => ({
        payment_id: item.paymentId,
        order_id: item.orderId,
        product_id: item.productId,
        amount: item.amount,
        fee: item.fee,
        net_amount: item.netAmount,
        currency: item.currency,
        date: item.date.toISOString(),
      })),
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error(`Error al obtener deudas para el vendedor ${sellerId}:`, error);
    return NextResponse.json(
      { error: "Error interno al procesar la consulta de deudas." },
      { status: 500 },
    );
  }
}
