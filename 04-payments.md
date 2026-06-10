# Plan de ejecución — Etapa 3 · Payments App (`proyecto-c-payments-gema-market`)

> **Orden de ejecución:** 4 de 6 (antes de Control Plane 05 y Analytics 06).
> **Disputas: fuera de alcance** (no se modela `disputa`; el estado `in_mediation` queda sin lógica).
> **Marca:** UniHousing. **Auth de integración:** API-key (`x-api-key-hash`).

## Objetivo

Payments es el app con la **API admin más completa**: ya expone `GET /api/payments/admin/ordenes-de-pago`,
`GET /api/payments/admin/stats` y `GET /api/payments/ordenes-de-pago/:payment_id`, **todos con auth por
API-key**. Los cambios son mínimos:
1. Agregar `GET /api/payments/admin/usuarios` (vista consolidada de usuarios del Control Plane).
2. (Opcional / stretch) `POST /api/payments/admin/ordenes-de-pago/:payment_id/refund`.
3. (Opcional) `GET /api/payments/admin/stats/timeseries` para Analytics.

## Contexto del código (lo que ya existe y se reutiliza)

- **API-key:** `app/(Logica)/integrations/api-key.ts → validateApiKey(request)` +
  `apiKeyResponse()` (401). SHA-256 hex mayúsculas de `INTERNAL_API_KEY`. Patrón de gate:
  ```ts
  const auth = authCheck(request); if (auth) return auth;   // ver app/(Datos)/api/payments/admin/stats/route.ts
  ```
- **Services:** `app/(Logica)/services/` → `getAdminOrdenesPaged`, `getAdminStats`,
  `ordenes-de-pago.service`, `mercadopago-preference.service`. Tipos en `app/(Logica)/types/payments.types.ts`.
- **MercadoPago:** SDK `mercadopago` v2 + `@mercadopago/sdk-react`. Webhook en
  `app/(Datos)/api/payments/webhooks/mercadopago/route.ts`, callback en `.../callback/mercadopago`.
- **Modelos** (`prisma/schema.prisma`):
  - `Usuario`: `id (usr_)`, `clerkUserId`, `email?`, `fullName?`, `createdAt`.
  - `OrdenDePago`: `id (pay_)`, `buyerId`, `orders Json` (`[{order_id, seller_id, product_id, quote_id,
    amount, quantity}]`), `totalAmount`, `fee`, `currency`, **`status String`**
    (`pending|in_process|approved|rejected|cancelled|refunded|charged_back|in_mediation`),
    `mpPreferenceId?`, `mpPaymentId?`, `mpStatusDetail?`, `createdAt`, `paidAt?`, `returnUrl?`.
  - `Transaccion`: log de webhooks MP (`paymentId`, `eventType`, `payloadJson`, `receivedAt`).

> **Validación:** Payments usa **chequeos manuales** (no Zod). Mantener ese estilo para consistencia con el
> repo (o introducir Zod solo en los handlers nuevos, opcional). Convención de carpetas: `(Datos)` rutas,
> `(Logica)` servicios/tipos/integraciones, `(Vistas)` UI.

## Convenciones (rutas nuevas)

1. `const auth = authCheck(request); if (auth) return auth;` al inicio.
2. Listados → `{ items, page, page_size, total, sort_by, order }` (mismo estilo que ordenes-de-pago admin).
3. snake_case · `Decimal → Number` · fechas ISO. Validar `date_from`/`date_to` con `isNaN(getTime())` → 400.

---

## Endpoints

### 1) `GET /api/payments/admin/usuarios` (NUEVO)

**Archivo:** `app/(Datos)/api/payments/admin/usuarios/route.ts` · **Consumido por:** Control Plane.
Crear `getUsuariosAdmin(opts)` en `app/(Logica)/services/usuarios.service.ts` (paginar `Usuario`).
Query: `q` (email/fullName), `page`, `page_size`, `sort_by (created_at)`, `order`.
```json
{ "items": [{ "user_id": "usr_…", "clerk_user_id": "user_…", "email": "c@p.com",
  "full_name": "Carlos Pérez", "created_at": "…" }], "page": 1, "page_size": 20, "total": 300 }
```

### 2) `GET /api/payments/admin/ordenes-de-pago` (EXISTE) — sin cambios

Ya cumple: paginación + filtros (`buyer_id`, `seller_id`, `status`, `date_from/to`, `sort_by`, `order`) +
API-key. **Verificar** que `orders` se devuelve como array con `{order_id, seller_id, product_id, quote_id,
amount}` (lo consume el Control Plane para correlacionar por `order_id`).

### 3) `GET /api/payments/admin/stats` (EXISTE) — sin cambios

Ya devuelve `{ total_payments, payments_by_status, total_volume, currency, approval_rate }`.
**Verificar** que `payments_by_status` incluye todos los estados presentes en el seed (incl. `refunded`,
`charged_back`). `approval_rate` = `approved / total` (definir denominador en `docs/apis.md`).

### 4) (OPCIONAL / stretch) `POST /api/payments/admin/ordenes-de-pago/:payment_id/refund`

**Solo si hay tiempo.** Hoy **no existe lógica de refund** (el estado `refunded` existe pero no la acción).
**Archivo:** `app/(Datos)/api/payments/admin/ordenes-de-pago/[paymentId]/refund/route.ts`.
- Gate API-key. Body `{ "reason": string }`.
- Llamar al **refund de MercadoPago sandbox** (`payment.refund` con `mpPaymentId`), registrar `Transaccion`
  (`event_type: "admin.refund"`), pasar `OrdenDePago.status → "refunded"`.
- **200:** `{ "payment_id": "pay_…", "status": "refunded" }` · 404 · 409 si no está `approved` ·
  502 si MP falla.
> **Decisión:** dado que disputas están fuera de alcance y el refund agrega complejidad real (MP sandbox +
> reversa en Buyer/Seller/Shipping), **marcarlo como opcional**. El Control Plane puede mostrar el botón
> deshabilitado con tooltip "no implementado" si no se hace.

### 5) (OPCIONAL) `GET /api/payments/admin/stats/timeseries`

`{ granularity, series:[{bucket,value}] }` por `created_at`/`paidAt` (count o `totalAmount`/`total_volume`),
con `date_trunc`. Habilita la curva de volumen en Analytics.

---

## Cambios fuera de los endpoints

- **`docs/apis.md` (repo Payments):** agregar `admin/usuarios` (y refund/timeseries si se hacen). La nota de
  auth ya es correcta (API-key).
- **`.env.example`:** `INTERNAL_API_KEY` ya está. El refund opcional requiere las credenciales MP ya
  presentes (`MP_ACCESS_TOKEN` sandbox).
- **Deuda técnica menor (no bloqueante):** la inconsistencia de marca (UI dice "UniHousing" pero el repo es
  `…-gema-market`) y la ausencia de logo se documentan; no son parte de este plan funcional.

## Tests

No hay suite automatizada. Documentar `curl` para `admin/usuarios` (401 sin key, 200 con paginación). Si se
hace refund, probar el flujo en MP sandbox con los datos de `TEST_MP_DATA.md`.

## Checklist de ejecución

- [ ] `app/(Logica)/services/usuarios.service.ts` (`getUsuariosAdmin`).
- [ ] `app/(Datos)/api/payments/admin/usuarios/route.ts`.
- [ ] Verificar shapes de `admin/ordenes-de-pago` y `admin/stats` contra los contratos.
- [ ] (Opcional) refund + (opcional) timeseries.
- [ ] `docs/apis.md` + repo de docs (branch + PR + merge).
- [ ] Deploy Vercel con `INTERNAL_API_KEY` (+ MP sandbox si refund).
