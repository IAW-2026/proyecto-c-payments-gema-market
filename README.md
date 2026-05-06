# Payments App — UniHousing

> Módulo de pagos de **UniHousing**, una aplicación web orientada a la compra y venta de muebles y artículos para el hogar entre estudiantes en **Bahía Blanca**.

---

## 📌 Descripción general

Proyecto desarrollado en **Next.js** para la materia **Ingeniería de Aplicaciones Web — UNS, 2026**.
Esta aplicación centraliza el flujo financiero del ecosistema:
- Creación y persistencia de órdenes de pago.
- Integración nativa con **Mercado Pago Bricks**.
- Procesamiento de Webhooks y sincronización de estados.
- Historial de transacciones para compradores.

---

## 🧱 Enfoque arquitectónico

El proyecto sigue una organización **MVC (Modelo-Vista-Controlador)** adaptada al **App Router de Next.js**:

- **Capa de Datos** (`app/(Datos)`): API Routes, Webhooks, estilos globales y assets.
- **Capa de Lógica** (`app/(Logica)`): Servicios de negocio, integraciones externas y contratos TypeScript.
- **Capa de Vistas** (`app/(Vistas)`): Páginas de checkout, historial y componentes UI.
- **Infraestructura** (`app/lib`): Clientes singleton (Prisma, Mercado Pago) y utilidades.

---

## 🗂️ Estructura del Proyecto

```text
├── app/
│   ├── (Datos)/         # APIs y configuración visual
│   │   ├── api/         # Endpoints (Pagos, Webhooks, Mocks)
│   │   └── fonts & css  # Estilos globales (Tailwind v4)
│   ├── (Logica)/        # Reglas de negocio
│   │   ├── services/    # Lógica de órdenes y Mercado Pago
│   │   ├── integrations/# Clientes para Buyer/Seller/Shipping
│   │   └── types/       # Definiciones TypeScript
│   ├── (Vistas)/        # Interfaz de Usuario
│   │   └── payments/    # Checkout, historial y componentes
│   └── lib/             # Infraestructura y utilidades (ULID, Prisma)
├── prisma/              # Esquema de base de datos (PostgreSQL)
└── docs/                # Documentación funcional y contratos
```

---

## 🔄 Flujo de Pago

1. **Creación**: `POST /api/payments/ordenes-de-pago` genera la orden local y la preferencia en Mercado Pago. Se reserva los productos y cotizaciones de envío.
2. **Checkout**: El usuario navega por `/checkout/[id]/methods` hasta el **Wallet Brick** en `/wallet`.
3. **Procesamiento**: Mercado Pago redirige al **Callback** (`/api/payments/callback/mercadopago`).
4. **Sincronización**: El **Webhook** actualiza el estado real en la base de datos de forma asincrónica. Se liberan o confirman los recursos externos según corresponda.
5. **Resultado**: El usuario visualiza la pantalla de `success` o `failed` según el resultado del polling.

---

## ⚙️ Configuración

### Variables de Entorno (.env)
- `DATABASE_URL` / `DIRECT_URL`: Conexión a PostgreSQL (Supabase).
- `MP_ACCESS_TOKEN` / `NEXT_PUBLIC_MP_PUBLIC_KEY`: Credenciales de Mercado Pago.
- `APP_URL`: URL base para retornos y webhooks.

### Scripts Útiles
```bash
pnpm dev              # Iniciar servidor de desarrollo
pnpm prisma:studio    # Explorar la base de datos
pnpm seed             # Poblar datos iniciales (vía /seed)
```

---


