import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { generateUlid } from "@/app/lib/ulid";

export async function GET() {
  try {
    // 1. Crear usuarios de prueba
    const user1Id = generateUlid("usr");
    const user2Id = generateUlid("usr");

    await prisma.usuario.createMany({
      data: [
        {
          id: user1Id,
          clerkUserId: "clerk_test_1",
          email: "buyer@example.com",
          fullName: "Comprador de Prueba",
          mpAccessToken: null,
          mpUserId: null,
        },
        {
          id: user2Id,
          clerkUserId: "clerk_test_2",
          email: "seller@example.com",
          fullName: "Vendedor de Prueba",
          mpAccessToken: null,
          mpUserId: null,
        },
      ],
      skipDuplicates: true,
    });

    // 2. Crear órdenes de pago de prueba
    const pay1Id = generateUlid("pay");
    const pay2Id = generateUlid("pay");
    const pay3Id = generateUlid("pay");

    await prisma.ordenDePago.createMany({
      data: [
        {
          id: pay1Id,
          buyerId: user1Id,
          orders: [
            { orderId: "ORD-001", sellerId: user2Id, productId: "PROD-01", amount: 500, quantity: 1 }
          ],
          totalAmount: 500,
          fee: 25,
          currency: "ARS",
          status: "pending",
          mpPreferenceId: "pref_test_1",
        },
        {
          id: pay2Id,
          buyerId: user1Id,
          orders: [
            { orderId: "ORD-002", sellerId: user2Id, productId: "PROD-02", amount: 1500, quantity: 2 }
          ],
          totalAmount: 1500,
          fee: 75,
          currency: "ARS",
          status: "approved",
          mpPaymentId: "123456789",
          paidAt: new Date(),
        },
        {
          id: pay3Id,
          buyerId: user1Id,
          orders: [
            { orderId: "ORD-003", sellerId: user2Id, productId: "PROD-03", amount: 800, quantity: 1 }
          ],
          totalAmount: 800,
          fee: 40,
          currency: "ARS",
          status: "rejected",
          mpPaymentId: "987654321",
          mpStatusDetail: "cc_rejected_bad_filled_date",
        },
      ],
      skipDuplicates: true,
    });

    // 3. Crear transacciones asociadas a los pagos
    await prisma.transaccion.createMany({
      data: [
        {
          id: generateUlid("txn"),
          paymentId: pay2Id,
          eventType: "payment.created",
          payloadJson: { action: "payment.created", data: { id: "123456789" } },
        },
        {
          id: generateUlid("txn"),
          paymentId: pay2Id,
          eventType: "payment.updated",
          payloadJson: { action: "payment.updated", data: { id: "123456789", status: "approved" } },
        },
        {
          id: generateUlid("txn"),
          paymentId: pay3Id,
          eventType: "payment.created",
          payloadJson: { action: "payment.created", data: { id: "987654321" } },
        },
        {
          id: generateUlid("txn"),
          paymentId: pay3Id,
          eventType: "payment.updated",
          payloadJson: { action: "payment.updated", data: { id: "987654321", status: "rejected" } },
        },
      ],
      skipDuplicates: true,
    });

    return NextResponse.json(
      { message: "Base de datos sembrada correctamente con valores de prueba." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al sembrar la BD:", error);
    return NextResponse.json(
      { error: "Ocurrió un error ejecutando el seed." },
      { status: 500 }
    );
  }
}