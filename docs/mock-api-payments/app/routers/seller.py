"""Endpoints mockeados de la Seller App que consume la Payments App."""
from __future__ import annotations

from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, HTTPException

from app import storage
from app.models import (
    DisputeOpenedSellerRequest,
    DisputeResolvedSellerRequest,
    PaymentConfirmedSellerRequest,
    ReleaseProductReservationRequest,
    ReserveProductRequest,
)

router = APIRouter(prefix="/api/seller", tags=["seller"])


@router.post("/pagos/{payment_id}/confirmado")
def payment_confirmed(payment_id: str, payload: PaymentConfirmedSellerRequest) -> dict:
    storage.append(
        "seller_notifications",
        {
            "payment_id": payment_id,
            "event": "pago-confirmado",
            "received_at": datetime.now(timezone.utc).isoformat(),
            **payload.model_dump(mode="json"),
        },
    )
    return {"ok": True}


@router.post("/ventas/{order_id}/disputa-abierta")
def dispute_opened(order_id: str, payload: DisputeOpenedSellerRequest) -> dict:
    storage.append(
        "seller_notifications",
        {
            "order_id": order_id,
            "event": "disputa-abierta",
            "received_at": datetime.now(timezone.utc).isoformat(),
            **payload.model_dump(mode="json"),
        },
    )
    return {"ok": True}


@router.post("/ventas/{order_id}/disputa-resuelta")
def dispute_resolved(order_id: str, payload: DisputeResolvedSellerRequest) -> dict:
    storage.append(
        "seller_notifications",
        {
            "order_id": order_id,
            "event": "disputa-resuelta",
            "received_at": datetime.now(timezone.utc).isoformat(),
            **payload.model_dump(mode="json"),
        },
    )
    return {"ok": True}


@router.post("/productos/{product_id}/reservar")
def reserve_product(product_id: str, payload: ReserveProductRequest) -> dict:
    product = storage.find_by_field("products", "product_id", product_id)
    if not product:
        raise HTTPException(
            status_code=404,
            detail=f"No se encontró el producto product_id={product_id}",
        )
    if product.get("status") != "active":
        raise HTTPException(
            status_code=409,
            detail=(
                f"El producto {product_id} no está disponible "
                f"(status={product.get('status')})"
            ),
        )

    existing = storage.find_by_field("product_reservations", "order_id", payload.order_id)
    if existing and existing.get("product_id") == product_id:
        raise HTTPException(
            status_code=409,
            detail=f"Ya existe una reserva activa para order_id={payload.order_id}",
        )
    other_reservation = storage.find_first_matching(
        "product_reservations",
        lambda r: r.get("product_id") == product_id and r.get("active", True),
    )
    if other_reservation:
        raise HTTPException(
            status_code=409,
            detail=f"El producto {product_id} ya está reservado",
        )

    storage.append(
        "product_reservations",
        {
            "order_id": payload.order_id,
            "buyer_id": payload.buyer_id,
            "product_id": product_id,
            "quantity": payload.quantity,
            "active": True,
            "reserved_at": datetime.now(timezone.utc).isoformat(),
        },
    )
    return {"ok": True}


@router.post("/productos/{product_id}/liberar-reserva")
def release_product_reservation(
    product_id: str, payload: ReleaseProductReservationRequest
) -> dict:
    updated = storage.update_first_matching(
        "product_reservations",
        lambda r: (
            r.get("order_id") == payload.order_id
            and r.get("product_id") == product_id
            and r.get("active", True)
        ),
        {
            "active": False,
            "released_at": datetime.now(timezone.utc).isoformat(),
        },
    )
    if not updated:
        raise HTTPException(
            status_code=404,
            detail=(
                f"No hay reserva activa para order_id={payload.order_id} "
                f"product_id={product_id}"
            ),
        )
    return {"ok": True}
