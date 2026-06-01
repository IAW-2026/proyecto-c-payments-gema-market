# Payments App — UniHousing

Módulo de pagos de **UniHousing**, una aplicación web orientada a la compra y venta de muebles y artículos para el hogar entre estudiantes en **Bahía Blanca**.
# Deploy
`https://payments-unihousing.vercel.app/`
---

## Descripción general

Proyecto desarrollado en **Next.js** para la materia **Ingeniería de Aplicaciones Web — UNS, 2026**.
Esta aplicación centraliza el flujo financiero del ecosistema:
- Creación y persistencia de órdenes de pago.
- Integración nativa con **Mercado Pago Bricks** (Wallet Brick).
- Procesamiento de Webhooks y sincronización de estados con Buyer/Seller/Shipping.
- Historial de transacciones para compradores y administración.
- Gestión de deudas con vendedores.
- Controles de acceso por usuario y validación de estado en el checkout.

---

## Enfoque arquitectónico

El proyecto sigue una organización **MVC (Modelo-Vista-Controlador)** adaptada al **App Router de Next.js**:

- **Capa de Datos** (`app/(Datos)`): API Routes, Webhooks, estilos globales y assets.
- **Capa de Lógica** (`app/(Logica)`): Servicios de negocio, integraciones externas y contratos TypeScript.
- **Capa de Vistas** (`app/(Vistas)`): Páginas de checkout, historial y componentes UI.
- **Infraestructura** (`app/lib`): Clientes singleton (Prisma, Mercado Pago) y utilidades.

---

## Estructura del Proyecto

```text
├── app/
│   ├── layout.tsx              # Root layout con ClerkProvider
│   ├── page.tsx                # Redirige a /payments/history
│   ├── not-found.tsx           # Página 404
│   ├── loading.tsx             # Skeleton global
│   ├── sync-user.tsx           # Sincroniza usuario Clerk con DB local
│   ├── proxy.ts                # Clerk middleware (protección de rutas)
│   │
│   ├── (Datos)/                # API y configuración visual
│   │   ├── globals.css         # Tailwind v4 + tema custom
│   │   ├── fonts.ts            # Fuentes Inter y JetBrains Mono
│   │   └── api/
│   │       ├── payments/       # Endpoints reales de pago
│   │       │   ├── ordenes-de-pago/
│   │       │   ├── ordenes-de-pago/[paymentId]/
│   │       │   ├── webhooks/mercadopago/
│   │       │   ├── callback/mercadopago/
│   │       │   ├── debts/[sellerId]/
│   │       │   └── trigger/
│   │       ├── seller/         # Mocks de Seller App
│   │       ├── buyer/          # Mocks de Buyer App
│   │       └── shipping/       # Mocks de Shipping App
│   │
│   ├── (Logica)/               # Reglas de negocio
│   │   ├── services/           # Órdenes, MP preference, transacciones, sync
│   │   ├── integrations/       # Clientes HTTP para Buyer/Seller/Shipping
│   │   └── types/              # Contratos TypeScript (API + externas)
│   │
│   ├── (Vistas)/               # Interfaz de Usuario
│   │   ├── sign-in/            # Página de login con Clerk
│   │   └── payments/
│   │       ├── page.tsx        # Redirige a /payments/history
│   │       ├── components/     # PayShell, MercadoPagoProvider
│   │       ├── shared/         # Sistema de diseño (Button, Card, Icon, etc.)
│   │       ├── history/        # Historial de pagos (server + client)
│   │       └── checkout/[paymentId]/
│   │           ├── layout.tsx  # Validación de ownership + MP Provider
│   │           ├── methods/    # Selección de método de pago
│   │           ├── wallet/     # Wallet Brick de Mercado Pago
│   │           ├── processing/ # Pantalla de espera con polling
│   │           ├── success/    # Pago aprobado
│   │           ├── failed/     # Pago rechazado
│   │           └── pending/    # Pago pendiente
│   │
│   └── lib/                    # Infraestructura
│       ├── prisma.ts           # Cliente Prisma singleton (adapter-pg)
│       ├── mercadopago.ts      # Config Mercado Pago SDK
│       ├── ulid.ts             # Generación de ULIDs
│       ├── util.ts             # formatDate, calculateFee, splitFee, round2
│       ├── auth-utils.ts       # isAdminPaymentsUser
│       ├── checkout-utils.ts   # ensurePaymentOwnership
│       ├── checkout-mapping.ts # mapCheckoutItems
│       └── payment-status.ts   # isFinalApproved, isFinalFailed, isPendingStatus
│
├── prisma/
│   └── schema.prisma           # Modelos: Usuario, OrdenDePago, Transaccion
│
├── docs/                       # Documentación funcional y contratos
│   ├── apis.md                 # Contratos inter-app
│   ├── modelo-de-datos.md      # Modelo de datos del ecosistema
│   ├── responsabilidades.md    # Asignación de apps por integrante
│   ├── usuarios.md             # Estrategia de auth con Clerk
│   ├── descripcion.md          # Descripción del sistema
│   └── proyecto.pdf            # Enunciado del proyecto
│
├── tests/                      # (pendiente)
├── proxy.ts                    # Clerk middleware (duplicado?)

# Archivos de configuración raíz
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── tsconfig.json
├── next.config.ts
├── next-env.d.ts
├── eslint.config.mjs
├── postcss.config.mjs
├── prisma.config.ts
├── .env.example
├── .gitignore
├── AGENTS.md                   # Guía para agentes de IA
└── TEST_MP_DATA.md             # Credenciales de prueba de Mercado Pago
```

---

## Flujo de Pago

1. **Creación**: `POST /api/payments/ordenes-de-pago` recibe los items, reserva recursos en Seller/Shipping, crea la orden local y la preferencia en Mercado Pago.
2. **Checkout**: El usuario navega por `/checkout/[id]/methods` → selecciona Mercado Pago → `/wallet` (Wallet Brick).
3. **Procesamiento**: MP redirige al **Callback** (`/api/payments/callback/mercadopago`) que envía al usuario a `/processing` con polling cada 5s.
4. **Sincronización**: El **Webhook** (`POST /api/payments/webhooks/mercadopago`) consulta la API de MP, actualiza la orden, registra la transacción y notifica a Buyer/Seller según el resultado.
5. **Resultado**: `success`, `failed` y `pending` validan el estado real contra la DB y redirigen si no coincide.

---

## Configuración

### Variables de Entorno (.env)

| Variable | Descripción |
|----------|-------------|
| `DATABASE_URL` / `DIRECT_URL` | Conexión a PostgreSQL (Supabase) |
| `MP_ACCESS_TOKEN` | Access Token de Mercado Pago (producción) |
| `NEXT_PUBLIC_MP_PUBLIC_KEY` | Public Key de Mercado Pago |
| `APP_URL` | URL base de esta app (para webhooks y callbacks) |
| `SELLER_APP_URL` | URL base de la Seller App |
| `BUYER_APP_URL` | URL base de la Buyer App |
| `SHIPPING_APP_URL` | URL base de la Shipping App |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Public Key de Clerk |
| `CLERK_SECRET_KEY` | Secret Key de Clerk |
| `PLATFORM_FEE_RATE` | Porcentaje de comisión (ej: 0.05 = 5%) |
| `INTERNAL_API_KEY` | Secret compartido entre apps (se envía hasheado) |

### Scripts Útiles

```bash
pnpm dev                # Iniciar servidor de desarrollo
pnpm build              # Compilar para producción
pnpm start              # Iniciar servidor de producción
pnpm lint               # Ejecutar ESLint
pnpm prisma:studio     # Explorar la base de datos
pnpm prisma:migrate    # Ejecutar migraciones
pnpm prisma:generate   # Regenerar cliente Prisma
pnpm prisma:push       # Sincronizar schema con DB
pnpm prisma:reset      # Resetear base de datos
```

### Rol de Administrador y Pruebas

El sistema soporta el rol **admin_payments**:
- El admin ve el botón **"Disparar trigger"** en la pantalla de Historial (`/payments/history`).
- También puede acceder a `GET /api/payments/trigger` para simular una compra completa.
- Estas herramientas generan usuarios, productos y órdenes aleatorias sin necesidad de cargar datos manualmente.

### Seguridad del Checkout

- `methods`, `wallet`, `processing`, `success`, `failed` y `pending` validan ownership por usuario (ID interno) y redirigen a `/payments/history` si no corresponde.
- `success`, `failed` y `pending` verifican el estado real del pago contra la DB antes de renderizar.

---

## Accesos de prueba

Las cuentas de prueba para Mercado Pago se encuentran en `TEST_MP_DATA.md`, incluyen credenciales de acceso, tarjetas de prueba y códigos para forzar resultados (APRO, OTHE, CONT, etc.).

Para acceder como usuario normal las credenciales son:
**Usuario**: `payments.user+clerk_test@unihousing.com`

**Contraseña** : `userUNS2026`
La clave de verificacion es `424242`
Para acceder como administrador las credenciales son:
(Acceder desde google con las mismas credenciales para evitar el codigo de verificacion)
**Usuario**: `payments.admin.unihousing@gmail.com`

**Contraseña**: `adminUNS2026`
