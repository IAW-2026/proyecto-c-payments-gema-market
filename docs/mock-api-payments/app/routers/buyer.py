"""Endpoints mockeados de la Buyer App que consume la Payments App."""
from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter

from app import storage
from app.models import (
    DisputeResolvedBuyerRequest,
    PaymentConfirmedBuyerRequest,
    PaymentRejectedBuyerRequest,
)

router = APIRouter(prefix="/api/buyer", tags=["buyer"])


@router.post("/pagos/{payment_id}/confirmado")
def payment_confirmed(payment_id: str, payload: PaymentConfirmedBuyerRequest) -> dict:
    storage.append(
        "buyer_notifications",
        {
            "payment_id": payment_id,
            "event": "pago-confirmado",
            "received_at": datetime.now(timezone.utc).isoformat(),
            **payload.model_dump(mode="json"),
        },
    )
    return {"ok": True}


@router.post("/pagos/{payment_id}/rechazado")
def payment_rejected(payment_id: str, payload: PaymentRejectedBuyerRequest) -> dict:
    storage.append(
        "buyer_notifications",
        {
            "payment_id": payment_id,
            "event": "pago-rechazado",
            "received_at": datetime.now(timezone.utc).isoformat(),
            **payload.model_dump(mode="json"),
        },
    )
    return {"ok": True}


@router.post("/ordenes/{order_id}/disputa-resuelta")
def dispute_resolved(order_id: str, payload: DisputeResolvedBuyerRequest) -> dict:
    storage.append(
        "buyer_notifications",
        {
            "order_id": order_id,
            "event": "disputa-resuelta",
            "received_at": datetime.now(timezone.utc).isoformat(),
            **payload.model_dump(mode="json"),
        },
    )
    return {"ok": True}


@router.get("/pagos/{payment_id}/notificaciones")
def get_payment_notifications(payment_id: str) -> list:
    return storage.filter_by_field("buyer_notifications", "payment_id", payment_id)


@router.get("/ordenes/{order_id}/notificaciones")
def get_order_notifications(order_id: str) -> list:
    return storage.filter_by_field("buyer_notifications", "order_id", order_id)
