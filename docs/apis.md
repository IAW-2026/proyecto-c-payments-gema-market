# 1.3 — Diseño de APIs Inter-Servicios

> **Tipo C — Marketplace**

Documentar cada endpoint que una app expone para ser consumido por otra app del sistema. Este contrato debe estar acordado por todos los integrantes antes de comenzar la Etapa 2.

---

## Convenciones Generales

- **Formato de nombres**: todos los campos JSON en `snake_case` (ej: `user_id`, `product_id`, `order_id`, `payment_id`, `shipping_id`). Prohibido mezclar `camelCase`.
- **Identificador correlacional**: `order_id` se genera en la Buyer App al iniciar la compra y se propaga como referencia a Seller, Payments y Shipping.

---

## Buyer App — Endpoints expuestos

### `POST /api/buyer/pagos/:payment_id/confirmado`
- **Consumido por**: Payments App.
- **Descripción**: notifica al comprador que el pago fue aprobado para las órdenes incluidas.
- **Request body**:
```json
{
  "payment_id": "pay_01HXYZ...",
  "orders": [
    {
      "order_id": "ord_01HXYZ...",
      "mp_payment_id": "1234567890",
      "status": "approved",
      "amount": 15000.00,
      "currency": "ARS",
      "paid_at": "2026-04-17T14:32:00Z"
    }
  ]
}
```
- **Response 200**: `{ "ok": true }`

### `POST /api/buyer/pagos/:payment_id/rechazado`
- **Consumido por**: Payments App.
- **Descripción**: notifica rechazo / cancelación del pago para liberar las órdenes incluidas.
- **Request body**:
```json
{
  "payment_id": "pay_01HXYZ...",
  "orders": [
    {
      "order_id": "ord_01HXYZ...",
      "status": "rejected",
      "reason": "cc_rejected_insufficient_amount"
    }
  ]
}
```
- **Response 200**: `{ "ok": true }`

### `POST /api/buyer/ordenes/:order_id/estado-envio`
- **Consumido por**: Shipping App.
- **Descripción**: notifica cambios en el estado logístico del envío asociado a la orden.
- **Request body**:
```json
{
  "shipping_id": "shp_01HXYZ...",
  "status": "in_transit",
  "tracking_code": "BB-0001-2026",
  "updated_at": "2026-04-17T14:32:00Z"
}
```
- **Response 200**: `{ "ok": true }`

### `POST /api/buyer/ordenes/:order_id/disputa-resuelta`
- **Consumido por**: Payments App.
- **Descripción**: notifica al comprador la resolución definitiva de una disputa sobre su orden.
- **Request body**:
```json
{
  "dispute_id": "dsp_01HXYZ...",
  "resolution": "refunded",
  "resolved_at": "2026-04-17T14:32:00Z"
}
```
- **Response 200**: `{ "ok": true }`

---

## Seller App — Endpoints expuestos

### `GET /api/seller/productos`
- **Consumido por**: Buyer App, Control Plane, Analytics Dashboard.
- **Descripción**: lista los productos disponibles en el marketplace con soporte para filtros, paginación y ordenamiento.
- **Query params**:
  - `q` — búsqueda por texto en título/descripción.
  - `category_id` — filtrar por categoría.
  - `min_price`, `max_price` — rango de precio.
  - `seller_id` — filtrar por vendedor.
  - `status` — filtrar por estado del producto (`new`, `used`, `all`). Default: `All`.
  - `sort_by` — campo de ordenamiento. Valores permitidos: `price`, `created_at`, `title`. Default: `created_at`.
  - `order` — dirección de ordenamiento: `asc` | `desc`. Default: `desc`.
  - `page` — número de página (1-indexed). Default: `1`.
  - `page_size` — cantidad de resultados por página. Default: `20`. Máximo: `100`.
- **Response 200**:
```json
{
  "items": [
    {
      "product_id": "prd_01HXYZ...",
      "seller_id": "usr_01HXYZ...",
      "title": "Escritorio de madera",
      "price": 15000.00,
      "currency": "ARS",
      "category_id": "cat_muebles",
      "status": "all",
      "thumbnail_url": "https://...",
      "href": "https://.../api/seller/productos/prd_01HXYZ..."
    }
  ],
  "page": 1,
  "page_size": 20,
  "total": 134,
  "sort_by": "created_at",
  "order": "desc"
}
```

### `GET /api/seller/productos/:product_id`
- **Consumido por**: Buyer App, Control Plane.
- **Descripción**: obtiene el detalle público completo de un producto específico.
- **Response 200**:
```json
{
  "product_id": "prd_01HXYZ...",
  "seller_id": "usr_01HXYZ...",
  "title": "Escritorio de madera",
  "description": "Escritorio de madera maciza, ideal para estudiantes. Muy buen estado.",
  "weight": 15,
  "height": 75,
  "width": 120,
  "depth": 60,
  "price": 15000.00,
  "currency": "ARS",
  "category_id": "cat_muebles",
  "stock": 1,
  "status": "active",
  "images": [
    "https://..."
  ],
  "created_at": "2026-04-10T10:00:00Z"
}
```

### `GET /api/seller/productos/:product_id/direccion-origen`
- **Consumido por**: Shipping App.
- **Descripción**: devuelve la dirección del vendedor del producto, usada como origen en la cotización y creación del envío.
- **Response 200**:
```json
{
  "origin_address": {
    "street": "San Martín",
    "number": "123",
    "zip": "8000"
  }
}
```
- **Response 404**: `NOT FOUND` si el producto no existe.

### `GET /api/seller/categorias`
- **Consumido por**: Buyer App, Control Plane.
- **Descripción**: devuelve el listado jerárquico de las categorías de productos disponibles.
- **Response 200**:
```json
[
  {
    "category_id": "cat_muebles",
    "name": "Muebles"
  },
  {
    "category_id": "cat_electrodomesticos",
    "name": "Electrodomésticos"
  }
]
```

### `GET /api/seller/shops/:seller_id`
- **Consumido por**: Buyer App.
- **Descripción**: devuelve la información pública de la tienda de un vendedor, incluyendo datos generales, categorías en las que publica y el listado paginado de sus productos activos.
- **Query params**:
  - `page` — número de página (1-indexed). Default: `1`.
  - `page_size` — cantidad de productos por página. Default: `20`. Máximo: `100`.
- **Response 200**:
```json
{
  "seller_id": "usr_01HXYZ...",
  "store_name": "Muebles del Sur",
  "city": "Bahía Blanca",
  "total_products": 134,
  "categories": [
    {
      "category_id": "cat_muebles",
      "name": "Muebles"
    },
    {
      "category_id": "cat_electrodomesticos",
      "name": "Electrodomésticos"
    }
  ],
  "products": {
    "items": [
      {
        "product_id": "prd_01HXYZ...",
        "title": "Escritorio de madera",
        "price": 15000.00,
        "currency": "ARS",
        "category_id": "cat_muebles",
        "status": "active",
        "thumbnail_url": "https://...",
        "href": "https://.../api/seller/productos/prd_01HXYZ..."
      }
    ],
    "page": 1,
    "page_size": 20,
    "total": 134
  }
}
```
- **Response 404**: `NOT FOUND` si el vendedor no existe.

### `POST /api/seller/productos/:product_id/reservar`
- **Consumido por**: Payments App.
- **Descripción**: reserva el stock del producto para una orden en curso.
- **Request body**: `{ "order_id": "ord_01HXYZ...", "buyer_id": "usr_01HXYZ...", "product_id": "prd_01HXYZ...", "quantity": 3 }`
- **Response 200**: `{ "ok": true }`
- **Response 409**: `CONFLICT` si ya está reservado o vendido.

### `POST /api/seller/productos/:product_id/liberar-reserva`
- **Consumido por**: Payments App.
- **Descripción**: libera la reserva de stock de un producto, dejándolo disponible nuevamente.
- **Request body**: `{ "order_id": "ord_01HXYZ...", "product_id": "prd_01HXYZ...", "quantity": 3 }`
- **Response 200**: `{ "ok": true }`
- **Response 404**: `NOT FOUND` si no existe una reserva activa para la orden.

### `POST /api/seller/pagos/:payment_id/confirmado`
- **Consumido por**: Payments App.
- **Descripción**: notifica al vendedor que el pago de sus productos fue aprobado.
- **Request body**:
```json
{
  "payment_id": "pay_01HXYZ...",
  "orders": [
    {
      "order_id": "ord_01HXYZ...",
      "product_id": "prd_01HXYZ...",
      "quote_id": "qte_01HXYZ...",
      "amount": 15000.00,
      "fee": 150.00,
      "currency": "ARS",
      "paid_at": "2026-04-17T14:32:00Z"
    }
  ]
}
```
- **Response 200**: `{ "ok": true }`

### `POST /api/seller/ventas/:order_id/estado-envio`
- **Consumido por**: Shipping App.
- **Descripción**: notifica al vendedor las actualizaciones logísticas sobre el envío de su producto.
- **Request body**:
```json
{
  "order_id": "ord_01HXYZ...",
  "status": "in_transit",
  "tracking_code": "BB-0001-2026",
  "updated_at": "2026-04-17T14:32:00Z"
}
```
- **Response 200**: `{ "ok": true }`

### `POST /api/seller/ventas/:order_id/disputa-abierta`
- **Consumido por**: Payments App.
- **Descripción**: notifica al vendedor que el comprador inició un reclamo por un problema en la operación.
- **Request body**:
```json
{
  "dispute_id": "dsp_01HXYZ...",
  "reason": "product_not_as_described",
  "description": "El producto llegó dañado.",
}
```
- **Response 200**: `{ "ok": true }`

### `POST /api/seller/ventas/:order_id/disputa-resuelta`
- **Consumido por**: Payments App.
- **Descripción**: notifica al vendedor el resultado y resolución de una disputa abierta.
- **Request body**:
```json
{
  "dispute_id": "dsp_01HXYZ...",
  "resolution": "refunded",
  "resolved_at": "2026-04-17T14:32:00Z"
}
```
- **Response 200**: `{ "ok": true }`

---

## Shipping App — Endpoints expuestos

### `POST /api/shipping/cotizaciones`
- **Consumido por**: Buyer App.
- **Descripción**: calcula el costo y tiempo estimado de envío logístico entre dos domicilios.
- **Request body**:
```json
{
  "destination_address": { "street": "...", "number": "...", "zip": "8000" },
  "product_id": "prd_01HXYZ...",
  "weight_kg": 25,
  "height_m": 0.8,
  "width_m": 1,
  "depth_m": 0.5
}
```
- **Response 200**:
```json
{
  "quote_id": "qte_01HXYZ...",
  "price": 3500.00,
  "currency": "ARS",
  "estimated_days": 2,
  "valid_until": "2026-04-17T15:32:00Z"
}
```

### `POST /api/shipping/cotizaciones/reservar`
- **Consumido por**: Payments App.
- **Descripción**: reserva una cotización para una orden, evitando que sea utilizada por otra.
- **Request body**:
```json
{
  "quote_id": "qte_01HXYZ...",
  "order_id": "ord_01HXYZ..."
}
```
- **Response 200**: `{ "ok": true, "reserved_until": "2026-04-17T15:32:00Z" }`
- **Response 409**: `CONFLICT` si ya está reservada por otra orden.
- **Response 410**: `GONE` si la cotización ya ha vencido.

### `POST /api/shipping/cotizaciones/liberar-reserva`
- **Consumido por**: Payments App.
- **Descripción**: libera la reserva de una cotización, dejándola disponible nuevamente.
- **Request body**:
```json
{
  "quote_id": "qte_01HXYZ...",
  "order_id": "ord_01HXYZ..."
}
```
- **Response 200**: `{ "ok": true }`
- **Response 404**: `NOT FOUND` si no había reserva activa para esa orden.

### `POST /api/shipping/envios`
- **Consumido por**: Seller App (tras pago confirmado).
- **Descripción**: solicita la creación y gestión logística de un envío para una orden específica.
- **Request body**:
```json
{
  "order_id": "ord_01HXYZ...",
  "seller_id": "usr_01HXYZ...",
  "buyer_id": "usr_01HXYZ..."
}
```
- **Response 201**:
```json
{
  "shipping_id": "shp_01HXYZ...",
  "status": "pending_pickup",
  "tracking_code": "BB-0001-2026"
}
```

- **Response 400**: `Bad Request` si el quote_id u order_id no existe.

### `GET /api/shipping/envios/:order_id`
- **Consumido por**: Buyer App, Seller App, Control Plane.
- **Descripción**: permite consultar el estado actual y detalles de un envío asociado a una orden.
- **Response 200**:
```json
{
  "shipping_id": "shp_01HXYZ...",
  "order_id": "ord_01HXYZ...",
  "status": "in_transit",
  "tracking_code": "BB-0001-2026",
  "tracking_url": "https://shipping.unihousing.com/track/BB-0001-2026",
  "pickup_address": {
    "street": "San Martin",
    "number": "123",
    "zip": "8000"
  },
  "delivery_address": {
    "street": "Alsina",
    "number": "456",
    "floor": "7B",
    "zip": "8000"
  },
  "price": 3500.00,
  "picked_up_at": "2026-04-17T14:00:00Z",
  "delivered_at": null
}
```

---

## Payments App — Endpoints expuestos

### `POST /api/payments/ordenes-de-pago`
- **Consumido por**: Buyer App.
- **Descripción**: crea una intención de pago y retorna la preferencia de Mercado Pago Bricks para inicializar el checkout. Agrupa múltiples órdenes en una sola transacción.
- **Request body**:
```json
{
  "buyer_id": "usr_01HXYZ...",
  "orders": [
    {
      "order_id": "ord_01HXYZ...",
      "seller_id": "usr_01HXYZ...",
      "product_id": "prd_01HXYZ...",
      "quantity": 3,
      "unit_price": 15000.00,
      "quote": {
        "quote_id": "qte_01HXYZ...",
        "shipping_price": 3500.00
      }
    }
  ],
  "currency": "ARS",
  "return_url": "https://buyer.unihousing/checkout/callback"
}
```
- **Response 201**:
```json
{
  "payment_id": "pay_01HXYZ...",
  "checkout_url": "https://payments.unihousing.com/checkout/...",
  "status": "pending"
}
```

### `GET /api/payments/ordenes-de-pago/:payment_id`
- **Consumido por**: Buyer App, Seller App, Control Plane, Analytics Dashboard.
- **Descripción**: consulta el estado actual de una orden de pago.
- **Response 200**:
```json
{
  "payment_id": "pay_01HXYZ...",
  "buyer_id": "usr_01HXYZ...",
  "orders": [
    {
      "order_id": "ord_01HXYZ...",
      "seller_id": "usr_01HXYZ...",
      "product_id": "prd_01HXYZ...",
      "quote_id": "qte_01HXYZ...",
      "amount": 18500.00
    }
  ],
  "total_amount": 18500.00,
  "currency": "ARS",
  "status": "approved",
  "mp_payment_id": "1234567890",
  "mp_status_detail": "accredited",
  "created_at": "2026-04-17T14:30:00Z",
  "paid_at": "2026-04-17T14:32:00Z"
}
```

Estados soportados (mapeo Mercado Pago Sandbox): `pending`, `in_process`, `approved`, `rejected`, `cancelled`, `refunded`, `charged_back`, `in_mediation`.

### `POST /api/payments/webhooks/mercadopago`
- **Consumido por**: Mercado Pago (IPN/Webhook).
- **Descripción**: recibe notificaciones del estado del pago y actualiza el estado interno. Valida firma con `X-Signature` de MP.
- **Request body**:
```json
{
  "action": "payment.updated",
  "api_version": "v1",
  "data": {
    "id": "1234567890"
  },
  "date_created": "2026-04-17T14:32:00Z",
  "id": 11223344,
  "live_mode": false,
  "type": "payment"
}
```
- **Response 200**: `OK`


### `POST /api/payments/disputas`
- **Consumido por**: Buyer App.
- **Descripción**: permite a un usuario abrir un reclamo oficial por un problema durante la compra.
- **Request body**:
```json
{
  "order_id": "ord_01HXYZ...",
  "reason": "product_not_as_described",
  "description": "El producto llegó dañado."
}
```
- **Response 201**: `{ "dispute_id": "dsp_01HXYZ...", "status": "open" }`

### `POST /api/payments/disputas/:dispute_id/resolver`
- **Consumido por**: Control Plane.
- **Descripción**: permite a un administrador resolver una disputa a favor del comprador (reembolso) o del vendedor (rechazar reclamo).
- **Request body**:
```json
{
  "resolution": "refunded",
  "notes": "Se comprobó el daño en base a las fotos enviadas."
}
```
- **Response 200**: `{ "ok": true }`

---

## Endpoints Administrativos (Control Plane / Analytics)

> **Autenticación**: todos los endpoints de esta sección requieren un JWT de Clerk con `"admin" in roles`. Las apps deben validar este claim antes de procesar la solicitud. Los endpoints son consumidos exclusivamente por el Control Plane y el Analytics Dashboard (Etapa 3).

> **Contrato de respuesta paginada estándar**: todos los endpoints de listado siguen la misma estructura de respuesta con soporte para paginación, filtrado y ordenamiento.

### Seller App — Admin

#### `GET /api/seller/admin/productos`
- **Consumido por**: Control Plane, Analytics Dashboard.
- **Descripción**: listado paginado de **todos** los productos del marketplace (incluye estados no activos), con filtros extendidos.
- **Query params**: `q`, `category_id`, `seller_id`, `status` (sin default — muestra todos), `min_price`, `max_price`, `date_from`, `date_to`, `sort_by`, `order`, `page`, `page_size`.
- **Response 200**:
```json
{
  "items": [
    {
      "product_id": "prd_01HXYZ...",
      "seller_id": "usr_01HXYZ...",
      "title": "Escritorio de madera",
      "price": 15000.00,
      "currency": "ARS",
      "category_id": "cat_muebles",
      "status": "active",
      "stock": 1,
      "created_at": "2026-04-10T10:00:00Z"
    }
  ],
  "page": 1,
  "page_size": 20,
  "total": 312,
  "sort_by": "created_at",
  "order": "desc"
}
```

#### `GET /api/seller/admin/ventas`
- **Consumido por**: Control Plane, Analytics Dashboard.
- **Descripción**: listado paginado de todas las ventas registradas.
- **Query params**: `seller_id`, `status`, `date_from`, `date_to`, `sort_by`, `order`, `page`, `page_size`.
- **Response 200**:
```json
{
  "items": [
    {
      "venta_id": "vnt_01HXYZ...",
      "order_id": "ord_01HXYZ...",
      "product_id": "prd_01HXYZ...",
      "seller_id": "usr_01HXYZ...",
      "buyer_id": "usr_01HXYZ...",
      "amount": 15000.00,
      "status": "paid",
      "created_at": "2026-04-12T08:00:00Z"
    }
  ],
  "page": 1,
  "page_size": 20,
  "total": 87,
  "sort_by": "created_at",
  "order": "desc"
}
```

#### `GET /api/seller/admin/stats`
- **Consumido por**: Analytics Dashboard.
- **Descripción**: métricas agregadas de la Seller App.
- **Query params**: `date_from`, `date_to` (rango temporal del reporte).
- **Response 200**:
```json
{
  "total_products": 312,
  "products_by_status": { "active": 198, "paused": 45, "sold": 62, "blocked": 7 },
  "total_sales": 87,
  "total_revenue": 1245000.00,
  "currency": "ARS"
}
```

### Buyer App — Admin

#### `GET /api/buyer/admin/ordenes`
- **Consumido por**: Control Plane, Analytics Dashboard.
- **Descripción**: listado paginado de todas las órdenes del marketplace.
- **Query params**: `buyer_id`, `seller_id`, `status`, `date_from`, `date_to`, `sort_by`, `order`, `page`, `page_size`.
- **Response 200**:
```json
{
  "items": [
    {
      "order_id": "ord_01HXYZ...",
      "buyer_id": "usr_01HXYZ...",
      "seller_id": "usr_01HXYZ...",
      "product_id": "prd_01HXYZ...",
      "total_amount": 18500.00,
      "status": "paid",
      "created_at": "2026-04-12T08:00:00Z"
    }
  ],
  "page": 1,
  "page_size": 20,
  "total": 256,
  "sort_by": "created_at",
  "order": "desc"
}
```

#### `GET /api/buyer/admin/stats`
- **Consumido por**: Analytics Dashboard.
- **Descripción**: métricas agregadas de la Buyer App.
- **Query params**: `date_from`, `date_to`.
- **Response 200**:
```json
{
  "total_orders": 256,
  "orders_by_status": { "created": 12, "awaiting_payment": 5, "paid": 34, "shipping": 18, "delivered": 170, "cancelled": 10, "refunded": 4, "disputed": 3 },
  "average_ticket": 14250.50,
  "currency": "ARS"
}
```

### Shipping App — Admin

#### `GET /api/shipping/admin/envios`
- **Consumido por**: Control Plane, Analytics Dashboard.
- **Descripción**: listado paginado de todos los envíos.
- **Query params**: `logistics_id`, `status`, `date_from`, `date_to`, `sort_by`, `order`, `page`, `page_size`.
- **Response 200**:
```json
{
  "items": [
    {
      "shipping_id": "shp_01HXYZ...",
      "order_id": "ord_01HXYZ...",
      "status": "delivered",
      "tracking_code": "BB-0001-2026",
      "price": 3500.00,
      "picked_up_at": "2026-04-17T14:00:00Z",
      "delivered_at": "2026-04-17T16:30:00Z"
    }
  ],
  "page": 1,
  "page_size": 20,
  "total": 189,
  "sort_by": "created_at",
  "order": "desc"
}
```

#### `GET /api/shipping/admin/stats`
- **Consumido por**: Analytics Dashboard.
- **Descripción**: métricas agregadas de la Shipping App.
- **Query params**: `date_from`, `date_to`.
- **Response 200**:
```json
{
  "total_shipments": 189,
  "shipments_by_status": { "pending_pickup": 12, "in_transit": 8, "delivered": 155, "failed": 5, "cancelled": 9 },
  "average_delivery_hours": 4.2
}
```

### Payments App — Admin

#### `GET /api/payments/admin/ordenes-de-pago`
- **Consumido por**: Control Plane, Analytics Dashboard.
- **Descripción**: listado paginado de todas las órdenes de pago.
- **Query params**: `buyer_id`, `seller_id`, `status`, `date_from`, `date_to`, `sort_by`, `order`, `page`, `page_size`.
- **Response 200**:
```json
{
  "items": [
    {
      "payment_id": "pay_01HXYZ...",
      "buyer_id": "usr_01HXYZ...",
      "orders": [
        {
          "order_id": "ord_01HXYZ...",
          "seller_id": "usr_01HXYZ...",
          "product_id": "prd_01HXYZ...",
          "quote_id": "qte_01HXYZ...",
          "amount": 18500.00
        }
      ],
      "total_amount": 18500.00,
      "currency": "ARS",
      "status": "approved",
      "created_at": "2026-04-17T14:30:00Z",
      "paid_at": "2026-04-17T14:32:00Z"
    }
  ],
  "page": 1,
  "page_size": 20,
  "total": 203,
  "sort_by": "created_at",
  "order": "desc"
}
```

#### `GET /api/payments/admin/disputas`
- **Consumido por**: Control Plane, Analytics Dashboard.
- **Descripción**: listado paginado de todas las disputas.
- **Query params**: `status`, `date_from`, `date_to`, `sort_by`, `order`, `page`, `page_size`.
- **Response 200**:
```json
{
  "items": [
    {
      "dispute_id": "dsp_01HXYZ...",
      "order_id": "ord_01HXYZ...",
      "payment_id": "pay_01HXYZ...",
      "reason": "product_not_as_described",
      "status": "open",
      "resolved_at": null
    }
  ],
  "page": 1,
  "page_size": 20,
  "total": 15,
  "sort_by": "created_at",
  "order": "desc"
}
```

#### `GET /api/payments/admin/stats`
- **Consumido por**: Analytics Dashboard.
- **Descripción**: métricas agregadas de la Payments App.
- **Query params**: `date_from`, `date_to`.
- **Response 200**:
```json
{
  "total_payments": 203,
  "payments_by_status": { "pending": 8, "approved": 175, "rejected": 12, "refunded": 4, "cancelled": 3, "charged_back": 1 },
  "total_volume": 3756000.00,
  "currency": "ARS",
  "approval_rate": 0.862,
  "open_disputes": 3
}
```

---
