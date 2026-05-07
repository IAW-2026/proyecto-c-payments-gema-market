import { NextResponse } from "next/server";
import { generateUlid } from "@/app/lib/ulid";
import prisma from "@/app/lib/prisma";
import { append } from "@/app/(Datos)/mock/storage";

/**
 * GET /api/payments/trigger
 * Simula una compra aleatoria disparando el flujo completo de creación de órdenes.
 * Antes de disparar, crea los registros necesarios en la BD y en el storage del mock
 * para que las validaciones de reserva no fallen.
 */
export async function GET() {
  try {
    const appUrl = process.env.APP_URL;
    if (!appUrl) {
      throw new Error("APP_URL no configurada en el entorno.");
    }

    // 1. Generar datos aleatorios
    const buyerId = generateUlid("usr");
    
    // Crear comprador en la BD para que exista en el sistema
    await prisma.usuario.create({
      data: {
        id: buyerId,
        clerkUserId: `clerk_${buyerId}`,
        email: `${buyerId}@example.com`,
        fullName: `Comprador Simulado ${buyerId.substring(0, 5)}`,
      }
    });

    const numOrders = Math.floor(Math.random() * 3) + 1; // 1 a 3 órdenes
    const orders = [];

    for (let i = 0; i < numOrders; i++) {
      const quantity = Math.floor(Math.random() * 2) + 1; // 1 a 2 unidades
      const unitPrice = Math.floor(Math.random() * 200) + 50; // 50 a 250 ARS
      const productId = generateUlid("prod");
      const sellerId = generateUlid("usr");
      const orderId = generateUlid("ord");
      const hasQuote = Math.random();

      // Crear vendedor en la BD
      await prisma.usuario.create({
        data: {
          id: sellerId,
          clerkUserId: `clerk_${sellerId}`,
          email: `${sellerId}@example.com`,
          fullName: `Vendedor Simulado ${sellerId.substring(0, 5)}`,
        }
      });

      // Crear producto en el storage del mock de Seller App
      await append("products", {
        product_id: productId,
        seller_id: sellerId,
        status: "active",
        stock: 99
      });

      let quoteData = undefined;
      if (hasQuote) {
        const quoteId = generateUlid("qte");
        // Crear cotización en el storage del mock de Shipping App
        await append("quotes", {
          quote_id: quoteId,
          status: "available",
          valid_until: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24h
        });
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
      // Intentar obtener el JSON de error, si falla obtener texto
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = await response.text();
      }
      
      return NextResponse.json({
        message: "Error al disparar la orden de pago",
        payload,
        error: errorData
      }, { status: response.status });
    }

    const result = await response.json();

    return NextResponse.json({
      message: "Trigger ejecutado con éxito. Se crearon usuarios y productos aleatorios antes del flujo.",
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
