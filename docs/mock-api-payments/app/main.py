"""Mock API para testing de la Payments App.

Expone los endpoints de la Buyer App, la Seller App y la Shipping App que la
Payments App consume, con datos de prueba persistidos en archivos JSON bajo `data/`.
"""
from __future__ import annotations

from fastapi import FastAPI

from app.routers import buyer, seller, shipping

app = FastAPI(
    title="Mock API – Payments App dependencies",
    description=(
        "Servidor de prueba que simula los endpoints de la Buyer App, la "
        "Seller App y la Shipping App que la Payments App consume. Las "
        "notificaciones recibidas se persisten en archivos JSON bajo `data/`."
    ),
    version="0.2.0",
)

app.include_router(buyer.router)
app.include_router(seller.router)
app.include_router(shipping.router)


@app.get("/", tags=["meta"])
def root() -> dict:
    return {
        "service": "mock-api-payments",
        "docs": "/docs",
        "endpoints": [
            "POST /api/buyer/pagos/{payment_id}/confirmado",
            "POST /api/buyer/pagos/{payment_id}/rechazado",
            "POST /api/buyer/ordenes/{order_id}/disputa-resuelta",
            "POST /api/seller/pagos/{payment_id}/confirmado",
            "POST /api/seller/ventas/{order_id}/disputa-abierta",
            "POST /api/seller/ventas/{order_id}/disputa-resuelta",
            "POST /api/seller/productos/{product_id}/reservar",
            "POST /api/seller/productos/{product_id}/liberar-reserva",
            "POST /api/shipping/cotizaciones/reservar",
            "POST /api/shipping/cotizaciones/liberar-reserva",
        ],
    }


@app.get("/health", tags=["meta"])
def health() -> dict:
    return {"status": "ok"}
