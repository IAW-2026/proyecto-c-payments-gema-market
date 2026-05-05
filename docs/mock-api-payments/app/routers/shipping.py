"""Endpoints mockeados de la Shipping App que consume la Payments App."""
from __future__ import annotations

from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, HTTPException

from app import storage
from app.models import (
    ReleaseQuoteRequest,
    ReserveQuoteRequest,
    ReserveQuoteResponse,
)

router = APIRouter(prefix="/api/shipping", tags=["shipping"])


def _parse_iso(value: str | None) -> datetime | None:
    if not value:
        return None
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


@router.post("/cotizaciones/reservar", response_model=ReserveQuoteResponse)
def reserve_quote(payload: ReserveQuoteRequest) -> ReserveQuoteResponse:
    quote = storage.find_by_field("quotes", "quote_id", payload.quote_id)
    if not quote:
        raise HTTPException(
            status_code=404,
            detail=f"No se encontró la cotización quote_id={payload.quote_id}",
        )

    valid_until = _parse_iso(quote.get("valid_until"))
    if valid_until and valid_until < datetime.now(timezone.utc):
        raise HTTPException(
            status_code=410,
            detail=f"La cotización quote_id={payload.quote_id} ya venció",
        )

    if quote.get("status") == "reserved" and quote.get("reserved_for_order_id") != payload.order_id:
        raise HTTPException(
            status_code=409,
            detail=(
                f"La cotización quote_id={payload.quote_id} ya está reservada "
                f"por otra orden"
            ),
        )

    reserved_until = datetime.now(timezone.utc) + timedelta(minutes=30)
    storage.update_first_matching(
        "quotes",
        lambda q: q.get("quote_id") == payload.quote_id,
        {
            "status": "reserved",
            "reserved_for_order_id": payload.order_id,
            "reserved_until": reserved_until.isoformat(),
        },
    )

    return ReserveQuoteResponse(ok=True, reserved_until=reserved_until)


@router.post("/cotizaciones/liberar-reserva")
def release_quote(payload: ReleaseQuoteRequest) -> dict:
    quote = storage.find_by_field("quotes", "quote_id", payload.quote_id)
    if not quote or quote.get("reserved_for_order_id") != payload.order_id:
        raise HTTPException(
            status_code=404,
            detail=(
                f"No hay reserva activa para quote_id={payload.quote_id} "
                f"order_id={payload.order_id}"
            ),
        )

    storage.update_first_matching(
        "quotes",
        lambda q: q.get("quote_id") == payload.quote_id,
        {
            "status": "available",
            "reserved_for_order_id": None,
            "reserved_until": None,
        },
    )
    return {"ok": True}
