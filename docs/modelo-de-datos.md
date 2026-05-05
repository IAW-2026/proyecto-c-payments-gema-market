# 1.4 — Modelo de Datos por Aplicación

> **Tipo C — Marketplace**

Para cada webapp, describir las entidades principales de su base de datos: tablas, campos relevantes y relaciones. No es necesario un DER formal, pero sí que quede claro qué persiste cada app.

También identificar posibles duplicados entre apps (ej: usuarios) y definir cómo se resuelven las inconsistencias.

> **Convenciones**:
> - Todas las PK internas se expresan como `id` (tipo ULID).
> - Los identificadores correlacionales inter-app (`order_id`, `payment_id`, `shipping_id`, `product_id`, `user_id`) son FK lógicas — cada app valida existencia vía API, no vía constraint de BD.
> - `clerk_user_id` es la identidad global; cada app mantiene un cache sincronizado vía webhook `user.created` / `user.updated` de Clerk.

---

## Buyer App

### Entidades principales

**`usuario`** (cache de Clerk)

| Campo | Tipo | Notas |
|-------|------|-------|
| id | ULID | PK |
| clerk_user_id | string | Único. Fuente de verdad |
| email | string | |
| full_name | string | |
| address | JSON | |
| role | enum | `buyer` (puede coexistir con `seller`) |
| created_at | timestamp | |

**`orden`** (entidad maestra del flujo)

| Campo | Tipo | Notas |
|-------|------|-------|
| id | ULID | PK. Se expone como `order_id` al resto del sistema |
| buyer_id | FK → usuario.id | |
| seller_id | FK lógica → Seller App (`user_id`) | |
| product_id | FK lógica → Seller App | |
| quantity | int | |
| unit_price | decimal | |
| quote_id | FK lógica → Shipping App | |
| shipping_price | int | |
| total_amount | decimal | |
| currency | string(3) | `ARS` |
| status | enum | `created`, `awaiting_payment`, `paid`, `shipping`, `delivered`, `shipping_failed`, `cancelled`, `refunded`, `disputed` |
| payment_id | string | FK lógica → Payments App. Permite trackear el pago |
| shipping_id | string | FK lógica → Shipping App |
| created_at | timestamp | |
| updated_at | timestamp | |

**`carrito`**

| Campo | Tipo | Notas |
|-------|------|-------|
| id | ULID | PK |
| buyer_id | FK → usuario.id | |
| created_at | timestamp | |

**`item_carrito`**

| Campo | Tipo | Notas |
|-------|------|-------|
| id | ULID | PK |
| carrito_id | FK → carrito.id | |
| product_id | string | FK lógica → Seller App |
| quantity | int | |
| added_at | timestamp | |

**`favorito`**

| Campo | Tipo | Notas |
|-------|------|-------|
| buyer_id | FK → usuario.id | PK compuesta |
| product_id | string | FK lógica → Seller App. PK compuesta |
| created_at | timestamp | |

---

## Seller App

### Entidades principales

**`usuario`** (cache de Clerk)

| Campo | Tipo | Notas |
|-------|------|-------|
| id | ULID | PK |
| clerk_user_id | string | Único. Fuente de verdad |
| email | string | |
| full_name | string | |
| shop_name | string | |
| phone_number | string | |
| bio | text | |
| role | enum | `seller` |
| address | JSON | |
| created_at | timestamp | |

**`producto`**

| Campo | Tipo | Notas |
|-------|------|-------|
| id | ULID | PK. Expuesto como `product_id` |
| seller_id | FK → usuario.id | |
| title | string | |
| description | text | |
| weight | int | |
| height | int | |
| width | int | |
| depth | int | |
| material | string | |
| color | string | |
| price | decimal | |
| currency | string(3) | |
| category_id | FK → categoria.id | |
| stock | int | |
| status | enum | `active`, `paused` |
| images | JSON | URLs |
| created_at | timestamp | |

**`categoria`**

| Campo | Tipo | Notas |
|-------|------|-------|
| id | ULID | PK |
| name | string | |

**`venta`**

| Campo | Tipo | Notas |
|-------|------|-------|
| id | ULID | PK |
| order_id | string | FK lógica → Buyer App |
| product_id | FK → producto.id | |
| seller_id | FK → usuario.id | |
| buyer_id | string | FK lógica → Buyer App |
| payment_id | string | FK lógica → Payments App |
| amount | decimal | |
| fee | decimal | |
| status | enum | `pending_payment`, `paid`, `shipping`, `delivered`, `shipping_failed`, `cancelled`, `disputed`, `refunded` |
| created_at | timestamp | |

**`reserva`**

| Campo | Tipo | Notas |
|-------|------|-------|
| id | ULID | PK |
| product_id | FK → producto.id | |
| order_id | string | FK lógica → Buyer App |
| buyer_id | string | FK lógica → Buyer App |
| quantity | int | Cantidad de unidades reservadas |
| expires_at | timestamp | Fecha de expiración de la reserva |
| created_at | timestamp | |

---

## Shipping App

### Entidades principales

**`usuario`** (cache de Clerk)

| Campo | Tipo | Notas |
|-------|------|-------|
| id | ULID | PK |
| clerk_user_id | string | Único. Fuente de verdad |
| email | string | |
| full_name | string | |
| role | enum | `logistics` |
| created_at | timestamp | |

**`cotizacion`**

| Campo | Tipo | Notas |
|-------|------|-------|
| id | ULID | PK. Expuesto como `quote_id` |
| product_id | string | FK lógica → Seller App |
| status | enum | available, reserved, confirmed |
| reserved_for_order_id | FK logica | |
| origin_address | JSON | |
| destination_address | JSON | |
| price | decimal | |
| currency | string(3) | |
| estimated_days | int | |
| valid_until | timestamp | Vencimiento de la cotización |
| created_at | timestamp | |

**`envio`**

| Campo | Tipo | Notas |
|-------|------|-------|
| id | ULID | PK. Expuesto como `shipping_id` |
| order_id | string | FK lógica → Buyer App |
| buyer_id | string | |
| seller_id | string | |
| logistics_id | FK → usuario.id (nullable) | |
| pickup_address | JSON | |
| delivery_address | JSON | |
| tracking_code | string | Único |
| status | enum | `pending_pickup`, `in_transit`, `delivered`, `failed`, `cancelled` |
| price | decimal | |
| picked_up_at | timestamp | nullable |
| delivered_at | timestamp | nullable |

**`tarifa`**

| Campo | Tipo |
|-------|------|
| id | ULID |
| weight_range | range |
| volume_range | range |
| price_per_km | decimal |

---

## Payments App

### Entidades principales

**`usuario`** (cache de Clerk)

**`orden_de_pago`**

| Campo | Tipo | Notas |
|-------|------|-------|
| id | ULID | PK. Expuesto como `payment_id` |
| buyer_id | string | FK lógica → Buyer App |
| orders | JSON | Array de órdenes: `[{order_id, seller_id, product_id, quote_id, amount, quantity}]` |
| total_amount | decimal | Suma de amounts de las órdenes |
| fee | decimal | |
| currency | string(3) | |
| status | enum | `pending`, `in_process`, `approved`, `rejected`, `cancelled`, `refunded`, `charged_back`, `in_mediation` |
| mp_preference_id | string | ID de preferencia en Mercado Pago |
| mp_payment_id | string | ID final del pago en MP (nullable hasta aprobación) |
| mp_status_detail | string | Detalle de MP (ej: `accredited`, `cc_rejected_...`) |
| created_at | timestamp | |
| paid_at | timestamp | nullable |

**`transaccion`**

| Campo | Tipo |
|-------|------|
| id | ULID |
| payment_id | FK → orden_de_pago.id |
| event_type | string |
| payload_json | JSON |
| received_at | timestamp |

**`disputa`**

| Campo | Tipo | Notas |
|-------|------|-------|
| id | ULID | |
| order_id | string | FK lógica → Buyer App |
| payment_id | FK → orden_de_pago.id | |
| opened_by | string | FK lógica → usuario |
| reason | string | |
| description | text | |
| notes | text | |
| status | enum | `open`, `resolved_refunded`, `resolved_rejected` |
| resolved_at | timestamp | nullable |

---

## Datos duplicados y estrategia de consistencia

| Dato duplicado | Apps que lo tienen | Fuente de verdad | Estrategia |
|----------------|--------------------|-----------------|------------|
| Usuario (`clerk_user_id`) | Todas | Clerk | Sincronización vía webhook `user.created`/`user.updated` o lazy load al primer login |
| `order_id` | Buyer, Seller, Payments, Shipping | Buyer App | Buyer genera y propaga en cada llamada. Resto almacena como FK lógica |
| `payment_id` | Payments (maestro), Buyer (`orden.payment_id`), Seller (`venta.payment_id`) | Payments App | Payments notifica al crear la orden de pago y cambios de estado |
| Estado de pago | Payments (maestro), Buyer, Seller | Payments App | Consulta autoritativa: `GET /api/payments/ordenes-de-pago/:payment_id` |
| Estado de envío | Shipping (maestro), Buyer, Seller | Shipping App | Webhooks de Shipping mantienen el estado local; ante duda se consulta `GET /api/shipping/envios/:order_id` |
