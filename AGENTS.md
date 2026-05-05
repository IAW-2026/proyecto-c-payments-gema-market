<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This project uses `Next.js 16` with the App Router. APIs, conventions, routing behavior and file structure may differ from older Next.js versions. Before making framework-level changes, read the relevant guide in `node_modules/next/dist/docs/` and heed deprecations.
<!-- END:nextjs-agent-rules -->

# AGENTS.md — Guía para agentes de IA en `payments-app-unihousing`

Este documento existe para que cualquier agente de IA pueda comprender rápido el contexto funcional y técnico del proyecto, y trabajar sin romper arquitectura, contratos ni convenciones.

---

## 1. Qué es este proyecto

`payments-app-unihousing` es la **Payments App** del ecosistema **UniHousing**, un marketplace orientado a estudiantes que compran y venden muebles, artículos del hogar y productos similares.

### Objetivo funcional
Esta app se ocupa del flujo de pagos:
- crear órdenes de pago
- integrar checkout con **Mercado Pago Bricks**
- persistir y consultar estados del pago
- recibir webhooks de Mercado Pago
- mostrar el flujo de checkout e historial de pagos

### Contexto de sistema mayor
Según `/docs`, UniHousing está compuesto por varias apps:
- **Buyer App**
- **Seller App**
- **Shipping App**
- **Payments App** ← este repo
- **Control Plane**
- **Analytics Dashboard**

### Actores principales
- **Comprador**
- **Vendedor**
- **Operador logístico**
- **Administrador**

---

## 2. Regla fundamental: prioridad entre código y documentación

Cuando haya tensiones entre lo documentado y lo implementado, seguí esta regla:

1. **El código actual manda para entender el comportamiento real.**
2. **`/docs` manda para entender el contrato esperado y la intención de diseño.**
3. Si un cambio afecta contratos entre apps, estados de dominio, URLs de retorno o persistencia, **consultá al usuario antes de redefinir comportamiento**.

En este repo, algunos docs describen funcionalidades futuras o más amplias que todavía no están implementadas completamente.

---

## 3. Principios obligatorios para cualquier cambio

## 3.1 SOLID siempre
Todo cambio debe intentar respetar:
- **S**ingle Responsibility Principle
- **O**pen/Closed Principle
- **L**iskov Substitution Principle
- **I**nterface Segregation Principle
- **D**ependency Inversion Principle

### Traducción práctica en este repo
- No mezclar UI, acceso a datos y lógica de negocio en un mismo archivo si se puede evitar.
- No meter consultas Prisma en componentes visuales cliente.
- No duplicar mapeos de estados o contratos en varios lugares si se pueden centralizar.
- No agregar lógica de negocio dentro de componentes presentacionales si corresponde a un service.

## 3.2 MVC siempre
Aunque el proyecto usa App Router de Next.js, la organización conceptual buscada es **MVC**:

- **Modelo / Datos** → `app/(Datos)` + `prisma`
- **Control / Lógica** → `app/(Logica)`
- **Vista** → `app/(Vistas)`

### Regla operativa
Si agregás una feature nueva:
- persistencia o endpoints → `app/(Datos)`
- servicios, mapeos, lógica de negocio, contratos internos → `app/(Logica)`
- páginas, componentes y UX → `app/(Vistas)`

## 3.3 TypeScript en todo lo posible
- Preferir `type` / `interface` explícitos.
- Evitar `any` salvo que sea realmente inevitable.
- Si aparece una nueva forma de dato externa, tiparla.
- Mantener `snake_case` para contratos JSON de API y `camelCase` para el dominio interno TS.

## 3.4 Estructura modular
- Reutilizar `services` y `types` antes de crear lógica duplicada.
- Mantener componentes compartidos en `shared` o `components` cuando tenga sentido.
- No “parchar” una vista con lógica que debería vivir en un service.

## 3.5 Consultar al usuario cuando el cambio sea ambiguo o estructural
No hace falta preguntar por todo.

Sí conviene consultar cuando:
- el cambio altera contratos entre apps
- hay varias interpretaciones válidas del comportamiento esperado
- el cambio toca persistencia, estados o rutas de negocio sensibles
- la documentación y el código se contradicen de forma relevante
- el cambio implica borrar funcionalidad o reformular arquitectura

No hace falta consultar cuando:
- es un fix claro y localizado
- el usuario ya definió el comportamiento esperado
- es una corrección evidente de estilo, tipado o wiring

---

## 4. Stack técnico actual

### Framework y runtime
- `Next.js 16.2.4`
- `React 19`
- `TypeScript`
- `App Router`

### Persistencia
- `Prisma`
- `PostgreSQL (Supabase)`
- `@prisma/adapter-pg`
- `pg`

### Pagos
- `mercadopago` (SDK backend)
- `@mercadopago/sdk-react` (Bricks frontend)

### UI
- `Tailwind CSS v4`
- fuente `Inter`
- fuente `JetBrains Mono`

### Configuración relevante
- `tsconfig.json` tiene `strict: true`
- `next.config.ts` usa `serverExternalPackages` para Prisma/pg
- `prisma.config.ts` usa `DIRECT_URL || DATABASE_URL`

---

## 5. Variables de entorno relevantes

Estas variables son importantes en el estado actual del código:

- `DATABASE_URL`
- `DIRECT_URL`
- `MP_ACCESS_TOKEN`
- `NEXT_PUBLIC_MP_PUBLIC_KEY`
- `APP_URL`

### Reglas prácticas
- `APP_URL` debería incluir protocolo (`http://` o `https://`)
- idealmente sin barra final
- `MP_ACCESS_TOKEN` se usa en el backend
- `NEXT_PUBLIC_MP_PUBLIC_KEY` se usa en el provider de Mercado Pago del frontend

---

## 6. Estructura real del proyecto

## 6.1 Carpetas raíz importantes
- `app/`
- `docs/`
- `prisma/`
- `public/`

## 6.2 Organización interna de `app/`

### `app/(Datos)`
Responsabilidad principal:
- API routes
- seed de desarrollo
- assets de configuración visual global (`globals.css`, `fonts.ts`)

Subárbol importante:
- `app/(Datos)/api/payments/...`
- `app/(Datos)/seed/route.ts`

### `app/(Logica)`
Responsabilidad principal:
- lógica de negocio
- tipos internos y contratos TS
- mapeo entre persistencia, dominio y API

Subárbol importante:
- `services/mercadopago-preference.service.ts`
- `services/ordenes-de-pago.service.ts`
- `services/transacciones.service.ts`
- `types/payments.types.ts`

### `app/(Vistas)`
Responsabilidad principal:
- páginas UI del checkout e historial
- componentes visuales de pagos
- componentes cliente para interacción

Subárbol importante:
- `payments/checkout/[paymentId]/...`
- `payments/history/...`
- `payments/components/...`
- `payments/shared/components.tsx`

### `app/lib`
Infraestructura reusable:
- cliente singleton de Mercado Pago
- cliente singleton de Prisma
- generador ULID

### `prisma/`
- `schema.prisma`

---

## 7. Importante sobre rutas de Next.js en este repo

Las carpetas con paréntesis como `(Datos)`, `(Logica)` y `(Vistas)` son **route groups / agrupación interna** y **no forman parte de la URL pública**.

### Ejemplo
`app/(Vistas)/payments/history/page.tsx` expone:
- `/payments/history`

No expone:
- `/(Vistas)/payments/history`

---

## 8. Rutas reales actuales

## 8.1 UI
- `/`
- `/payments/history`
- `/payments/checkout/[paymentId]/methods`
- `/payments/checkout/[paymentId]/wallet`
- `/payments/checkout/[paymentId]/processing`
- `/payments/checkout/[paymentId]/success`
- `/payments/checkout/[paymentId]/failed`

## 8.2 API
- `POST /api/payments/ordenes-de-pago`
- `GET /api/payments/ordenes-de-pago`
- `GET /api/payments/ordenes-de-pago/[paymentId]`
- `GET /api/payments/callback/mercadopago`
- `POST /api/payments/webhooks/mercadopago`
- `GET /seed`

## 8.3 Rutas documentadas pero no implementadas hoy
Según `/docs`, existen conceptos/endpoints no presentes aún en el código actual de este repo, por ejemplo:
- disputas
- endpoints admin de payments
- integración de auth con Clerk
- notificaciones inter-app completas

No asumir que están implementados solo porque figuran en `/docs`.

---

## 9. Arquitectura funcional actual

Este proyecto es un **monolito Next.js** con capas lógicas separadas.

### Patrón actual de trabajo
- las `page.tsx` suelen ser **Server Components**
- esas páginas consultan datos vía `services`
- los componentes interactivos (`MethodsView`, `WalletBrickView`, etc.) suelen ser **Client Components**
- Prisma y Mercado Pago backend viven del lado servidor

### Flujo típico
1. una API route recibe request
2. llama a uno o más services en `app/(Logica)`
3. los services usan `app/lib/*` o Prisma
4. las vistas server cargan datos y los pasan a componentes cliente

---

## 10. Dominio actual de Payments App

## 10.1 Entidades reales implementadas en Prisma

### `Usuario`
Campos reales:
- `id`
- `clerkUserId`
- `email`
- `fullName`
- `createdAt`

### `OrdenDePago`
Campos reales:
- `id`
- `buyerId`
- `orders` (JSON)
- `totalAmount`
- `fee`
- `currency`
- `status`
- `mpPreferenceId`
- `mpPaymentId`
- `mpStatusDetail`
- `createdAt`
- `paidAt`

### `Transaccion`
Campos reales:
- `id`
- `paymentId`
- `eventType`
- `payloadJson`
- `receivedAt`

## 10.2 Particularidades del modelo actual
- `orders` se guarda como **JSONB**, no como tabla relacional separada.
- `buyerId` no tiene FK Prisma hacia `Usuario`.
- `sellerId`, `productId`, `quoteId` viven dentro del JSON de `orders`.
- La única relación fuerte modelada es `Transaccion -> OrdenDePago`.

---

## 11. Tipos y contratos internos importantes

Archivo clave:
- `app/(Logica)/types/payments.types.ts`

### Estado de pago interno
`PaymentStatus` soporta:
- `pending`
- `in_process`
- `approved`
- `rejected`
- `cancelled`
- `refunded`
- `charged_back`
- `in_mediation`

### Convención de naming
- JSON/API externa: `snake_case`
- código TS interno: `camelCase`

### IDs
Se generan con ULID prefijado usando `generateUlid(prefix)`.

Prefijos presentes hoy:
- `usr_`
- `pay_`
- `txn_`

---

## 12. Flujo real de pago end-to-end hoy

## 12.1 Creación de orden de pago
Endpoint:
- `POST /api/payments/ordenes-de-pago`

Qué hace hoy:
1. valida `buyer_id`, `orders`, `currency`
2. transforma el request externo a `OrderItem[]`
3. calcula `totalAmount`
4. calcula `fee`
5. crea una `OrdenDePago` local con estado `pending`
6. crea preferencia en Mercado Pago con el `paymentId` real como `external_reference`
7. actualiza `mpPreferenceId` en la orden
8. responde `payment_id`, `checkout_url`, `status`

## 12.2 Checkout local
El checkout comienza en:
- `/payments/checkout/[paymentId]/methods`

Luego sigue a:
- `/payments/checkout/[paymentId]/wallet`

Hoy, tras los cambios recientes, la UI ofrece **solo Mercado Pago** como método visible.

## 12.3 Mercado Pago Provider
`checkout/[paymentId]/layout.tsx` envuelve todo el flujo con `MercadoPagoProvider`.

Ese provider:
- lee `NEXT_PUBLIC_MP_PUBLIC_KEY`
- inicializa `initMercadoPago(...)`
- si no está listo, devuelve `null`

## 12.4 Wallet Brick
En la vista wallet se renderiza:
- `<Wallet initialization={{ preferenceId }} />`

La preferencia se crea en backend con:
- `purpose: "wallet_purchase"`
- `external_reference = paymentId`
- `back_urls` apuntando al callback interno

## 12.5 Callback
Mercado Pago vuelve a:
- `GET /api/payments/callback/mercadopago`

Ese callback:
- lee `external_reference`
- lee `collection_status` / `status`
- redirige a:
  - `success`
  - `processing`
  - `failed`

### Regla importante
**Hoy el callback solo decide UI.**
La fuente de verdad del estado persistido sigue siendo el webhook.

## 12.6 Webhook
Mercado Pago notifica a:
- `POST /api/payments/webhooks/mercadopago`

Ese webhook:
- consulta el pago real en MP con `Payment.get`
- usa `external_reference` para identificar la orden local
- mapea `status` de MP a `PaymentStatus`
- actualiza `OrdenDePago`
- registra una `Transaccion`

## 12.7 Processing
La pantalla `processing` hace polling a:
- `GET /api/payments/ordenes-de-pago/[paymentId]`

y redirige según el estado detectado.

## 12.8 Pantallas finales
### `success`
Muestra:
- monto
- primer `orderId`
- fecha pagada
- `mpPaymentId`

### `failed`
Muestra:
- monto
- primer `orderId`
- motivo
- `mpPaymentId`

### Nota
Aunque una orden puede agrupar varias órdenes internas, varias vistas resumen solo la primera (`orders[0]`).

---

## 13. Contratos esperados según `/docs`

Los docs modelan esta app como la fuente de verdad de:
- creación de órdenes de pago
- estado de pago
- integración con Mercado Pago
- disputas
- notificaciones a Buyer/Seller
- endpoints admin para Control Plane / Analytics

### Endpoints de Payments documentados en `/docs/apis.md`
- `POST /api/payments/ordenes-de-pago`
- `GET /api/payments/ordenes-de-pago/:payment_id`
- `POST /api/payments/webhooks/mercadopago`
- `POST /api/payments/disputas`
- `POST /api/payments/disputas/:dispute_id/resolver`
- endpoints admin bajo `/api/payments/admin/...`

### Advertencia importante
No todos esos endpoints existen hoy en el código.
Si un cambio depende de disputas, auth, permisos admin o callbacks inter-app, revisá primero la implementación real.

---

## 14. Qué partes del repo son críticas

Si vas a tocar checkout, revisá siempre en conjunto:
- `app/(Datos)/api/payments/ordenes-de-pago/route.ts`
- `app/(Logica)/services/mercadopago-preference.service.ts`
- `app/(Datos)/api/payments/callback/mercadopago/route.ts`
- `app/(Datos)/api/payments/webhooks/mercadopago/route.ts`
- `app/(Vistas)/payments/checkout/[paymentId]/*`
- `app/(Logica)/services/ordenes-de-pago.service.ts`
- `app/(Logica)/types/payments.types.ts`

Si vas a tocar historial:
- `app/(Vistas)/payments/history/page.tsx`
- `app/(Vistas)/payments/history/HistoryView.tsx`
- `app/(Logica)/services/ordenes-de-pago.service.ts`

Si vas a tocar persistencia:
- `prisma/schema.prisma`
- `app/lib/prisma.tsx`
- `prisma.config.ts`

---

## 15. Convenciones de desarrollo para agentes

## 15.1 Mantener separación de capas
### Sí
- Route handlers del lado API en `(Datos)`
- lógica de negocio en `(Logica)`
- vistas y UX en `(Vistas)`

### No
- consultas Prisma dentro de componentes cliente
- lógica de negocio compleja embebida en JSX
- formateos/mapeos duplicados entre páginas y services

## 15.2 Preferir cambios pequeños y trazables
- primero entender el flujo completo afectado
- luego cambiar lo mínimo necesario
- si una modificación impacta varias capas, mantener consistencia en todas

## 15.3 No romper contratos sin confirmación
En este repo hay contratos inter-app descritos en `/docs/apis.md`. Si tocás:
- nombres de campos
- estados de pago
- estructura de response
- URLs públicas de callback/webhook
- IDs compartidos (`payment_id`, `order_id`, etc.)

consultá al usuario antes si el cambio no es un fix inequívoco.

## 15.4 Mantener `snake_case` en APIs y `camelCase` en TS interno
Esto ya está establecido y no debe mezclarse.

## 15.5 Reutilizar services existentes
Antes de crear un archivo nuevo, revisar si la responsabilidad ya existe en:
- `ordenes-de-pago.service.ts`
- `mercadopago-preference.service.ts`
- `transacciones.service.ts`

---

## 16. Riesgos / inconsistencias conocidas del estado actual

Estas observaciones son importantes para no asumir de más.

### 16.1 Auth y autorización no están integradas completamente
Aunque `/docs` describe Clerk y claims JWT, el código actual no implementa ese flujo real todavía.

### 16.2 `/seed` es destructivo
`GET /seed` borra y vuelve a sembrar datos.
Usarlo solo con intención clara.

### 16.3 Webhook sin validación de firma
Los docs dicen que debería validarse `X-Signature`, pero hoy no está implementado.

### 16.4 Callback y webhook cumplen funciones diferentes
- callback → navegación UI
- webhook → persistencia del estado

No mezclar esos roles sin motivo fuerte.

### 16.5 Hay desalineaciones menores entre docs y código
Ejemplos:
- `return_url` existe en el tipo de request pero hoy no se usa realmente
- docs describen disputas/admin, pero no están implementados aquí todavía
- algunas rutas fallback del frontend no están totalmente alineadas con la app actual

### 16.6 El historial hoy no está segmentado por buyer autenticado
Se listan órdenes de pago globales desde el service actual.

## 16.7 Existe un mock server con las apis consumidas por la app
  Siempre que se necesite consumir alguna api, se usara X_APP_URL mas la estructura de la api, la documentacion que va a devolver esta hardcodeada a modo de mock en /docs/mock-api-payments/data.
---

## 17. Cómo trabajar con `/docs`

Archivos más relevantes:
- `docs/descripcion.md`
- `docs/apis.md`
- `docs/modelo-de-datos.md`
- `docs/responsabilidades.md`
- `docs/usuarios.md`

### Cuándo leer cada uno
- **`descripcion.md`** → para entender el problema de negocio y el flujo macro
- **`apis.md`** → para contratos entre apps y payloads esperados
- **`modelo-de-datos.md`** → para intención del modelo por aplicación
- **`responsabilidades.md`** → para límites entre apps
- **`usuarios.md`** → para identidad, roles y auth esperada

### Regla operativa
Si vas a tocar un contrato entre apps, leé `docs/apis.md` antes de editar.

---

## 18. Checklist mental antes de cambiar algo importante

Preguntas que un agente debería responderse:

1. ¿Estoy tocando solo UI o también lógica/persistencia?
2. ¿Esto afecta el flujo completo del checkout?
3. ¿Estoy manteniendo MVC o estoy mezclando capas?
4. ¿Estoy respetando SOLID o estoy agregando una responsabilidad indebida a un archivo?
5. ¿Estoy manteniendo TypeScript fuerte o agregando `any` innecesario?
6. ¿El cambio afecta contratos con otras apps descritos en `/docs`?
7. Si hay ambigüedad, ¿conviene consultar al usuario antes de continuar?

---

## 19. Qué validar manualmente si tocás pagos

Si no hay tests automáticos que cubran el cambio, validar manualmente al menos:
- creación de orden de pago
- navegación a `methods`
- navegación a `wallet`
- render del Wallet Brick
- redirect/callback de Mercado Pago
- recepción de webhook
- transición de `processing` → `success` o `failed`
- visualización de historial

Si tocaste persistencia o contratos:
- validar forma JSON de responses
- validar `snake_case`
- validar mapeo de estados

---

## 20. Resumen ejecutivo para agentes

Si tenés que entender este repo muy rápido, retené esto:

- es la **Payments App** de UniHousing
- usa **Next.js App Router + Prisma + Mercado Pago Bricks**
- la arquitectura buscada es **MVC** con separación en `(Datos)`, `(Logica)` y `(Vistas)`
- hay que respetar **SOLID**, **TypeScript fuerte**, y **modularidad**
- el flujo más sensible es: **crear orden → crear preferencia → wallet → callback → webhook → vistas finales**
- `/docs` describe contratos e intención, pero el código actual es la fuente de verdad del comportamiento real
- si el cambio es ambiguo, estructural o contractual, **consultá al usuario**
