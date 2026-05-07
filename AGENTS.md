# AGENTS.md — Guía para agentes de IA en `payments-app-unihousing`

Este documento existe para que cualquier agente de IA pueda comprender rápido el contexto funcional y técnico del proyecto, y trabajar sin romper arquitectura, contratos ni convenciones.

---

## 1. Qué es este proyecto

`payments-app-unihousing` es la **Payments App** del ecosistema **UniHousing**, un marketplace orientado a estudiantes que compran y venden muebles, artículos del hogar y productos similares.

### Objetivo funcional
Esta app se ocupa del flujo de pagos:
- crear órdenes de pago
- orquestar reservas y liberaciones de recursos en otras apps (Buyer, Seller, Shipping)
- integrar checkout con **Mercado Pago Bricks**
- persistir y consultar estados del pago
- recibir webhooks de Mercado Pago
- mostrar el flujo de checkout e historial de pagos
- gestionar deudas de vendedores (`debts`)

### Contexto de sistema mayor
Payments App es el nodo central del dinero en UniHousing. Se comunica activamente con:
- **Buyer App**: Notificaciones de pago.
- **Seller App**: Reservas de productos y confirmaciones.
- **Shipping App**: Reservas de cotizaciones (quotes).

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

---

## 3. Principios obligatorios para cualquier cambio

### 3.1 SOLID siempre
Todo cambio debe intentar respetar:
- **S**ingle Responsibility Principle
- **O**pen/Closed Principle
- **L**iskov Substitution Principle
- **I**nterface Segregation Principle
- **D**ependency Inversion Principle

### 3.2 MVC siempre (Arquitectura de Capas)
Aunque el proyecto usa App Router de Next.js, la organización conceptual se divide en:

- **Modelo / Datos** (`app/(Datos)` + `prisma`): Persistencia, API routes, seed y assets globales.
- **Control / Lógica** (`app/(Logica)`): Services, orquestación de side-effects, tipos de dominio e integraciones externas.
- **Vista** (`app/(Vistas)`): Páginas UI, componentes de checkout e historial.

### 3.3 TypeScript en todo lo posible
- Preferir `type` / `interface` explícitos.
- Evitar `any` salvo que sea realmente inevitable.
- Mantener `snake_case` para contratos JSON de API y `camelCase` para el dominio interno TS.

### 3.4 Estructura modular
- Reutilizar `services` y `integrations` antes de crear lógica duplicada.
- No meter consultas Prisma en componentes visuales cliente.
- No agregar lógica de negocio compleja dentro de componentes presentacionales.

---

## 4. Stack técnico actual

### Framework y runtime
- `Next.js 16.2.4`
- `React 19.2.5`
- `TypeScript` (strict mode)
- `App Router`

### Persistencia y Auth
- `Prisma 7.8.0` + `PostgreSQL (Supabase)`
- `@clerk/nextjs` (Integrado en el modelo de Usuario)

### Pagos e Integraciones
- `mercadopago` (SDK backend)
- `@mercadopago/sdk-react` (Bricks frontend)
- Clients HTTP custom para Buyer, Seller y Shipping.

### UI
- `Tailwind CSS v4`
- Fuentes: `Inter` y `JetBrains Mono`

---

## 5. Variables de entorno relevantes

- `DATABASE_URL` / `DIRECT_URL`
- `MP_ACCESS_TOKEN` / `NEXT_PUBLIC_MP_PUBLIC_KEY`
- `APP_URL` (Base URL de esta app)
- `BUYER_APP_URL`, `SELLER_APP_URL`, `SHIPPING_APP_URL` (Para integraciones externas)

*Regla: Las URLs deben incluir protocolo y no tener barra final.*

---

## 6. Organización interna de `app/`

### `app/(Datos)` (Route Group)
- `api/payments/`: Endpoints de órdenes, webhooks, callbacks y deudas.
- `seed/`: Scripts de inicialización de DB.
- `globals.css`: Estilos globales Tailwind v4.

### `app/(Logica)` (Route Group)
- `services/`: `ordenes-de-pago`, `mercadopago-preference`, `transacciones`, `external-sync` (Orquestador).
- `integrations/`: Clientes HTTP para comunicarse con otras aplicaciones.
- `types/`: Definiciones de dominio y contratos de API.

### `app/(Vistas)` (Route Group)
- `payments/checkout/[paymentId]/`: Flujo de pago (methods, wallet, processing, success, failed).
- `payments/history/`: Historial de pagos del usuario.

### `app/lib`
- Clientes singleton: `prisma.tsx`, `mercadopago.ts`.
- Utilidades: `ulid.ts`, `util.ts`.

---

## 7. Rutas reales (lo que existe hoy)

### 7.1 UI
- `/` (Home)
- `/payments/history`
- `/payments/checkout/[paymentId]/methods`
- `/payments/checkout/[paymentId]/wallet`
- `/payments/checkout/[paymentId]/processing`
- `/payments/checkout/[paymentId]/success`
- `/payments/checkout/[paymentId]/failed`

### 7.2 API
- `POST /api/payments/ordenes-de-pago` (Crea orden + Reservas externas)
- `GET /api/payments/ordenes-de-pago` (Listado global)
- `GET /api/payments/ordenes-de-pago/[paymentId]` (Detalle para polling)
- `GET /api/payments/debts/[sellerId]` (Deudas de un vendedor)
- `GET /api/payments/callback/mercadopago` (Navegación UI post-pago)
- `POST /api/payments/webhooks/mercadopago` (Fuente de verdad del estado)
- `GET /api/payments/trigger` (Simula flujo de compra aleatorio, no destructivo)

---

## 8. Flujo real de pago end-to-end

1.  **Creación**: `POST /api/payments/ordenes-de-pago` recibe los items.
2.  **Reservas**: Se llama a `reserveExternalResources` (Seller/Shipping). Si falla alguna, se libera lo reservado y se retorna error.
3.  **Persistencia**: Se crea `OrdenDePago` en estado `pending`.
4.  **Preferencia**: Se crea la preferencia en Mercado Pago vinculada al `paymentId`.
5.  **Checkout**: El usuario navega por `/methods` -> `/wallet` (Wallet Brick).
6.  **Callback**: MP redirige al callback interno, que solo decide a qué pantalla de UI enviar (`success`, `failed`, `processing`).
7.  **Webhook**: MP notifica el estado real. El webhook actualiza la `OrdenDePago`, registra la `Transaccion` y dispara `notifyApproved` o `notifyRejected` via `external-sync.service`.
8.  **Sincronización Final**:
    -   Si es `approved`: Notifica a Buyer y Seller.
    -   Si es `rejected/cancelled`: Notifica a Buyer y libera recursos en Seller/Shipping.

---

## 9. Dominio y Modelo de Datos

-   **`Usuario`**: ID propio + `clerkUserId`.
-   **`OrdenDePago`**: `orders` guardado como **JSONB**. Contiene `orderId`, `sellerId`, `productId`, `quoteId`, etc.
-   **`Transaccion`**: Historial de eventos recibidos de pasarelas.
-   **IDs**: Generados con ULID prefijado (`pay_`, `usr_`, `txn_`).

---

## 10. Riesgos e Inconsistencias Conocidas

-   **Auth**: Clerk está presente en el modelo pero la segmentación del historial por usuario autenticado es parcial.
-   **Webhook**: No implementa validación de firma (`X-Signature`) todavía.
-   **Mocks**: El proyecto ha migrado a integraciones reales; no usar mocks locales para nuevas funcionalidades.
-   **Callback vs Webhook**: Nunca confiar en el callback para actualizar el estado en la base de datos. Usar siempre el webhook.

---

## 11. Checklist mental para agentes

1.  ¿Estoy respetando la separación de capas (Datos/Logica/Vistas)?
2.  Si toco el estado de un pago, ¿estoy disparando los side-effects en `external-sync.service`?
3.  ¿Estoy usando `snake_case` para el JSON de la API y `camelCase` para TS?
4.  ¿Revisé si el cambio afecta contratos inter-app en `docs/apis.md`?
5.  Si hay ambigüedad estructural, ¿consultó al usuario?
