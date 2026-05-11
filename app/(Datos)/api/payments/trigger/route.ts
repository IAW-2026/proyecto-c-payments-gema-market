import { NextRequest, NextResponse } from "next/server";
import { generateUlid } from "@/app/lib/ulid";
import prisma from "@/app/lib/prisma";
import { getApiKeyHash } from "@/app/(Logica)/integrations/api-key";
import { POST as createOrderHandler } from "../ordenes-de-pago/route";
/**
 * GET /api/payments/trigger
 * Simula una compra aleatoria disparando el flujo completo de creación de órdenes.
 * Reutiliza usuarios existentes de la base de datos para simular compras de usuarios reales.
 */
export async function GET(request: NextRequest) {
  try {
    const appUrl = request.nextUrl.origin;

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
      
      const quoteId = generateUlid("qte");
      const quoteData = {
        quote_id: quoteId,
        shipping_price: Math.floor(Math.random() * 150) + 30,
      };

      const productNames = ["Silla de madera", "Placard", "Mesa ratona", "Escritorio", "Estantería", "Lampara de pie", "Lampara de mesa", "Mesa de comedor", "Sillon esquinero"];
      const productName = productNames[i % productNames.length];

      orders.push({
        order_id: orderId,
        seller_id: sellerId,
        product_id: productId,
        product_name: productName,
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

    // 2. Realizar el POST llamando directamente al handler interno para evitar el bloqueo de Vercel Auth
    const apiKey = await getApiKeyHash();
    
    const mockRequest = new NextRequest(new URL(`${appUrl}/api/payments/ordenes-de-pago`), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key-hash": apiKey
      },
      body: JSON.stringify(payload),
    });

    // Llamada directa al handler interno
    const response = await createOrderHandler(mockRequest);

    if (!response || !response.ok) {
      let errorData;
      const textResponse = response ? await response.text() : "No response";
      try {
        errorData = JSON.parse(textResponse);
      } catch {
        errorData = textResponse;
      }
      
      return NextResponse.json({
        message: "Error al disparar la orden de pago",
        payload,
        error: errorData
      }, { status: response ? response.status : 500 });
    }

    const result = await response.json();

    return NextResponse.json({
      message: "Trigger ejecutado con éxito. Se reutilizaron usuarios existentes y se generaron items aleatorios.",
      buyer_name: buyer.fullName ?? buyer.email ?? buyer.clerkUserId,
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
