"""Modelos Pydantic para request/response de los endpoints mockeados."""
from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel


# ---------- Buyer App ----------

class PaymentConfirmedBuyerOrderItem(BaseModel):
    order_id: str
    mp_payment_id: str
    status: str
    amount: float
    currency: str
    paid_at: datetime


class PaymentConfirmedBuyerRequest(BaseModel):
    payment_id: str
    orders: list[PaymentConfirmedBuyerOrderItem]


class PaymentRejectedBuyerOrderItem(BaseModel):
    order_id: str
    status: str
    reason: str | None = None


class PaymentRejectedBuyerRequest(BaseModel):
    payment_id: str
    orders: list[PaymentRejectedBuyerOrderItem]


class DisputeResolvedBuyerRequest(BaseModel):
    dispute_id: str
    resolution: str
    resolved_at: datetime


# ---------- Seller App ----------

class PaymentConfirmedSellerOrderItem(BaseModel):
    order_id: str
    product_id: str
    quote_id: str
    amount: float
    fee: float
    currency: str
    paid_at: datetime


class PaymentConfirmedSellerRequest(BaseModel):
    payment_id: str
    orders: list[PaymentConfirmedSellerOrderItem]


class DisputeOpenedSellerRequest(BaseModel):
    dispute_id: str
    reason: str
    description: str | None = None


class DisputeResolvedSellerRequest(BaseModel):
    dispute_id: str
    resolution: str
    resolved_at: datetime


class ReserveProductRequest(BaseModel):
    order_id: str
    buyer_id: str
    product_id: str
    quantity: int


class ReleaseProductReservationRequest(BaseModel):
    order_id: str
    product_id: str
    quantity: int


# ---------- Shipping App ----------

class ReserveQuoteRequest(BaseModel):
    quote_id: str
    order_id: str


class ReserveQuoteResponse(BaseModel):
    ok: bool = True
    reserved_until: datetime


class ReleaseQuoteRequest(BaseModel):
    quote_id: str
    order_id: str
