import { NextResponse } from "next/server";
import { generateUlid } from "@/app/lib/ulid";
import prisma from "@/app/lib/prisma";

/**
 * GET /api/payments/trigger
 * Simula una compra aleatoria disparando el flujo completo de creación de órdenes.
 * Reutiliza usuarios existentes de la base de datos para simular compras de usuarios reales.
 */
export async function GET() {
  try {
    let appUrl = process.env.APP_URL;
    if (!appUrl) {
      throw new Error("APP_URL no configurada en el entorno.");
    }
    
    // Normalizar APP_URL para garantizar que tenga http/https
    appUrl = appUrl.replace(/\/$/, "");
    if (!appUrl.startsWith("http://") && !appUrl.startsWith("https://")) {
      appUrl = appUrl.includes("localhost") ? `http://${appUrl}` : `https://${appUrl}`;
    }

    // 0. Obtener usuarios existentes para reutilizarlos
    let users = await prisma.usuario.findMany();
    
    if (users.length === 0) {
      // Si no hay usuarios, creamos un par de base para que el trigger funcione siempre
      const baseUsers = [];
      for (let i = 0; i < 2; i++) {
        const id = generateUlid("usr");
        const u = await prisma.usuario.create({
          data: {
            id,
            clerkUserId: `clerk_seed_${id.substring(0, 8)}`,
            email: `test_${i}@example.com`,
            fullName: i === 0 ? "Comprador de Prueba" : "Vendedor de Prueba",
          }
        });
        baseUsers.push(u);
      }
      users = baseUsers;
    }

    const getRandomUser = () => users[Math.floor(Math.random() * users.length)];

    // 1. Generar datos aleatorios de compra
    const buyer = getRandomUser();
    const buyerId = buyer.id;
    
    const numOrders = Math.floor(Math.random() * 3) + 1; // 1 a 3 órdenes
    const orders = [];

    for (let i = 0; i < numOrders; i++) {
      const quantity = Math.floor(Math.random() * 2) + 1; // 1 a 2 unidades
      const unitPrice = Math.floor(Math.random() * 200) + 50; // 50 a 250 ARS
      
      const productId = generateUlid("prod");
      const orderId = generateUlid("ord");
      const seller = getRandomUser();
      const sellerId = seller.id;
      
      const hasQuote = Math.random() > 0.5;

      // (Simulación de producto existente, la API mock ya no valida persistencia)

      let quoteData = undefined;
      if (hasQuote) {
        const quoteId = generateUlid("qte");
        // (Simulación de cotización, la API mock ya no valida persistencia)
        quoteData = {
          quote_id: quoteId,
          shipping_price: Math.floor(Math.random() * 100) + 20,
        };
      }

      orders.push({
        order_id: orderId,
        seller_id: sellerId,
        product_id: productId,
        quantity,
        unit_price: unitPrice,
        ...(quoteData ? { quote: quoteData } : {})
      });
    }

    const payload = {
      buyer_id: buyerId,
      orders,
      currency: "ARS",
      return_url: `${appUrl}/payments/history`
    };

    // 2. Realizar el POST a nuestro propio endpoint
    const response = await fetch(`${appUrl}/api/payments/ordenes-de-pago`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let errorData;
      const textResponse = await response.text();
      try {
        errorData = JSON.parse(textResponse);
      } catch {
        errorData = textResponse;
      }
      
      return NextResponse.json({
        message: "Error al disparar la orden de pago",
        payload,
        error: errorData
      }, { status: response.status });
    }

    const result = await response.json();

    return NextResponse.json({
      message: "Trigger ejecutado con éxito. Se reutilizaron usuarios existentes y se generaron items aleatorios.",
      simulated_payload: payload,
      api_response: result,
      checkout_url: result.checkout_url
    }, { status: 201 });

  } catch (error) {
    console.error("Error en Trigger:", error);
    return NextResponse.json({
      error: "Ocurrió un error en el trigger.",
      details: String(error)
    }, { status: 500 });
  }
}
