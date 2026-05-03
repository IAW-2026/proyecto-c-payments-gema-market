import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { generateUlid } from "@/app/lib/ulid";
import { createPreference } from "@/app/(Logica)/services/mercadopago-preference.service";

export async function GET() {
  try {
    // ─── 1. Limpiar datos previos ────────────────────────────────────
    await prisma.transaccion.deleteMany();
    await prisma.ordenDePago.deleteMany();
    await prisma.usuario.deleteMany();

    // ─── 2. Crear usuarios de prueba ─────────────────────────────────
    const user1Id = generateUlid("usr");
    const user2Id = generateUlid("usr");
    const user3Id = generateUlid("usr");

    await prisma.usuario.createMany({
      data: [
        {
          id: user1Id,
          clerkUserId: "clerk_test_buyer",
          email: "buyer@unihousing.com",
          fullName: "Lucía Méndez",
        },
        {
          id: user2Id,
          clerkUserId: "clerk_test_seller",
          email: "seller@unihousing.com",
          fullName: "Martín López",
        },
        {
          id: user3Id,
          clerkUserId: "clerk_test_seller_mp",
          email: "seller.mp@unihousing.com",
          fullName: "Ana García",
        },
      ],
      skipDuplicates: true,
    });

    // ─── 3. Crear órdenes de pago de prueba ──────────────────────────

    // 3a. Orden APPROVED (ya pagada)
    const pay1Id = generateUlid("pay");
    await prisma.ordenDePago.create({
      data: {
        id: pay1Id,
        buyerId: user1Id,
        orders: [
          { orderId: "ORD-001", sellerId: user2Id, productId: "PROD-01", amount: 1500, quantity: 1 },
        ],
        totalAmount: 1500,
        fee: 75,
        currency: "ARS",
        status: "approved",
        mpPaymentId: "123456789",
        mpStatusDetail: "accredited",
        paidAt: new Date(),
      },
    });

    // 3b. Orden REJECTED
    const pay2Id = generateUlid("pay");
    await prisma.ordenDePago.create({
      data: {
        id: pay2Id,
        buyerId: user1Id,
        orders: [
          { orderId: "ORD-002", sellerId: user2Id, productId: "PROD-02", amount: 800, quantity: 1 },
        ],
        totalAmount: 800,
        fee: 40,
        currency: "ARS",
        status: "rejected",
        mpPaymentId: "987654321",
        mpStatusDetail: "cc_rejected_bad_filled_date",
      },
    });

    // 3c. Orden PENDING con preferencia real de MP (para testing del Wallet Brick)
    const pendingOrderItems = [
      { orderId: "ORD-003", sellerId: user3Id, productId: "PROD-03", amount: 2500, quantity: 1 },
      { orderId: "ORD-004", sellerId: user2Id, productId: "PROD-04", amount: 1200, quantity: 2 },
    ];
    const pendingTotal = pendingOrderItems.reduce((sum, o) => sum + o.amount, 0);

    // Crear preferencia real en MP
    let mpPreferenceId: string | null = null;
    try {
      const prefResult = await createPreference({
        paymentId: "seed-temp",
        items: pendingOrderItems,
        totalAmount: pendingTotal,
        currency: "ARS",
      });
      mpPreferenceId = prefResult.preferenceId;
    } catch (err) {
      console.warn("No se pudo crear preferencia MP en seed (probablemente credenciales de test):", err);
    }

    const pay3Id = generateUlid("pay");
    await prisma.ordenDePago.create({
      data: {
        id: pay3Id,
        buyerId: user1Id,
        orders: pendingOrderItems,
        totalAmount: pendingTotal,
        fee: Math.round(pendingTotal * 0.05 * 100) / 100,
        currency: "ARS",
        status: "pending",
        mpPreferenceId,
      },
    });

    // ─── 4. Crear transacciones de ejemplo ───────────────────────────
    await prisma.transaccion.createMany({
      data: [
        {
          id: generateUlid("txn"),
          paymentId: pay1Id,
          eventType: "payment.created",
          payloadJson: { action: "payment.created", data: { id: "123456789" } },
        },
        {
          id: generateUlid("txn"),
          paymentId: pay1Id,
          eventType: "payment.updated",
          payloadJson: { action: "payment.updated", data: { id: "123456789", status: "approved" } },
        },
        {
          id: generateUlid("txn"),
          paymentId: pay2Id,
          eventType: "payment.created",
          payloadJson: { action: "payment.created", data: { id: "987654321" } },
        },
        {
          id: generateUlid("txn"),
          paymentId: pay2Id,
          eventType: "payment.updated",
          payloadJson: { action: "payment.updated", data: { id: "987654321", status: "rejected" } },
        },
      ],
      skipDuplicates: true,
    });

    return NextResponse.json(
      {
        message: "Base de datos sembrada correctamente.",
        data: {
          usuarios: 3,
          ordenes: 3,
          transacciones: 4,
          pending_payment_id: pay3Id,
          checkout_url: `/payments/checkout/${pay3Id}/methods`,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al sembrar la BD:", error);
    return NextResponse.json(
      { error: "Ocurrió un error ejecutando el seed.", details: String(error) },
      { status: 500 }
    );
  }
}