# Payments App — UniHousing

> Módulo de pagos de **UniHousing**, una aplicación web orientada a la compra y venta de muebles y artículos para el hogar entre estudiantes en **Bahía Blanca**.

---

## 📌 Descripción general

Proyecto desarrollado en **Next.js** sobre el módulo de pagos de una aplicación web de venta de muebles para estudiantes en Bahía Blanca.

Fue desarrollado para la materia **Ingeniería de Aplicaciones Web — UNS, primer cuatrimestre 2026**.

El objetivo de este repositorio es centralizar el flujo de pagos de UniHousing:
- creación de órdenes de pago
- generación de preferencias de Mercado Pago
- render del checkout con **Mercado Pago Bricks**
- recepción de callbacks y webhooks
- consulta de estados del pago
- visualización del historial de pagos

---

## 🧱 Enfoque arquitectónico

El proyecto tiene una estructura de carpetas base siguiendo el modelo **Vista-Controlador (MVC)**.

Está conformado por una capa de:
- **Datos**
- **Lógica**
- **Vistas**

A esto se suman los archivos base en `/app` necesarios para el **App Router de Next.js**, además de la infraestructura compartida en `app/lib` y la persistencia definida en `prisma/`.

Se busca en todo momento:
- mantener una buena modularidad
- seguir el patrón de Next.js de llevar lo más posible al servidor
- adherirse en lo posible a los principios **SOLID**
- trabajar con **TypeScript** en la mayor parte del código

---

## 🗂️ Estructura general del proyecto

A continuación se describen módulo por módulo una breve explicación sobre sus responsabilidades y funcionalidades.

---

# CAPA DATOS

Se encarga de ofrecer APIs, el archivo base con las fuentes utilizadas en el layout raíz y las definiciones base de las clases CSS globales.

## `app/(Datos)/api`
Contiene las rutas HTTP del proyecto.

### `app/(Datos)/api/payments/ordenes-de-pago/route.ts`
Expone la API principal para disparar el flujo de pago en la app y listar las ordenes

#### `POST /api/payments/ordenes-de-pago`
Crea una nueva orden de pago local y luego genera una preferencia en Mercado Pago iniciando el flujo de pago.

Responsabilidades principales:
- validar el body entrante (`buyer_id`, `orders`, `currency`)
- transformar las órdenes externas al dominio interno (`OrderItem[]`)
- calcular el total y la fee de plataforma
- persistir la orden en base de datos
- crear la preferencia de Mercado Pago con el `payment_id` real
- devolver `payment_id`, `checkout_url` y `status`

#### `GET /api/payments/ordenes-de-pago`
Lista las órdenes de pago registradas en el sistema.

Responsabilidades principales:
- consultar todas las órdenes persistidas
- mapear la respuesta al contrato en `snake_case`
- devolver un listado resumido de pagos para uso interno / administrativo

---

### `app/(Datos)/api/payments/ordenes-de-pago/[paymentId]/route.ts`
Expone la consulta de una orden puntual.

#### `GET /api/payments/ordenes-de-pago/[paymentId]`
Devuelve el estado actual de una orden de pago específica.

Responsabilidades principales:
- resolver el `paymentId` desde la ruta
- consultar la orden en base de datos
- devolver el estado actual del pago

Esta ruta es usada especialmente por la pantalla de `processing`, que hace polling hasta detectar si el pago fue aprobado o rechazado.

---

### `app/(Datos)/api/payments/callback/mercadopago/route.ts`
Recibe el redirect de Mercado Pago una vez finalizado el checkout.

#### `GET /api/payments/callback/mercadopago`
Lee los parámetros de retorno que envía Mercado Pago y decide a qué pantalla de la app redirigir al usuario.

Responsabilidades principales:
- leer `external_reference`
- leer `collection_status` / `status`
- redirigir a:
  - `success`
  - `processing`
  - `failed`

Importante:
- este callback **no persiste estado en base de datos**
- la persistencia real del resultado del pago se hace en el webhook

---

### `app/(Datos)/api/payments/webhooks/mercadopago/route.ts`
Recibe eventos del backend de Mercado Pago.

#### `POST /api/payments/webhooks/mercadopago`
Es la fuente de actualización real del estado del pago dentro del sistema.

Responsabilidades principales:
- recibir notificaciones de Mercado Pago
- consultar el pago real en la API de MP usando `Payment.get`
- usar `external_reference` para identificar la orden local
- mapear el estado de MP al estado interno del dominio
- actualizar `OrdenDePago`
- registrar una `Transaccion` asociada al evento recibido

Este endpoint es clave porque sincroniza el estado persistido del pago.

---

## `app/(Datos)/fonts.ts`
Define las fuentes globales del proyecto usando `next/font`.

Actualmente registra:
- `Inter`
- `JetBrains Mono`

---

## `app/(Datos)/globals.css`
Define los estilos globales de la aplicación.

Responsabilidades principales:
- variables visuales del sistema
- colores, sombras, radios y tokens de diseño
- clases utilitarias compartidas
- base visual para toda la experiencia del checkout

---

# CAPA LÓGICA

Se encarga de centralizar la lógica de negocio, los tipos internos y el acceso a la persistencia a través de servicios.

## `app/(Logica)/types/payments.types.ts`
Archivo central de contratos internos y tipos compartidos.

Define:
- `PaymentStatus`
- `OrderItem`
- `OrdenDePagoDTO`
- `TransaccionDTO`
- `CreateOrdenDePagoRequest`
- responses de la API de pagos

También fija una convención importante del proyecto:
- **`snake_case` para APIs**
- **`camelCase` para TypeScript interno**

---

## `app/(Logica)/services/ordenes-de-pago.service.ts`
Servicio principal de acceso a datos para la entidad `OrdenDePago`.

Responsabilidades principales:
- crear órdenes de pago
- actualizar estado del pago
- actualizar `mpPreferenceId`
- obtener una orden por ID
- listar órdenes
- listar órdenes por comprador
- mapear filas de Prisma a DTOs del dominio

Es uno de los archivos más importantes del proyecto porque conecta la lógica de pagos con la base de datos.

---

## `app/(Logica)/services/mercadopago-preference.service.ts`
Encapsula la creación de preferencias en Mercado Pago.

Responsabilidades principales:
- transformar `OrderItem[]` a `items` válidos para MP
- generar la preferencia del Wallet Brick
- configurar `external_reference`
- configurar `back_urls` al callback del sistema
- devolver `preferenceId` e `initPoint`

Este servicio representa la integración backend con la API de preferencias de Mercado Pago.

---

## `app/(Logica)/services/transacciones.service.ts`
Servicio de consulta de eventos asociados a una orden.

Responsabilidades principales:
- obtener todas las transacciones ligadas a un `paymentId`
- mapear los eventos persistidos al DTO interno

---

# CAPA VISTAS

Se encarga de la experiencia de usuario del checkout y del historial de pagos.

## `app/(Vistas)/payments/checkout/[paymentId]`
Contiene el flujo completo de checkout para un pago puntual.

### `layout.tsx`
Envuelve todo el flujo con `MercadoPagoProvider`.

Su función principal es asegurar que el SDK de Mercado Pago esté inicializado en el cliente antes de renderizar vistas que usen Bricks.

---

## Flujo de checkout

### `methods/page.tsx`
Server Component que carga la orden desde el servidor y pasa los datos a `MethodsView`.

### `methods/MethodsView.tsx`
Client Component que renderiza la pantalla inicial del checkout local.

Responsabilidades principales:
- mostrar el resumen del pago
- mostrar la card “Total a pagar” con estilo destacado
- mostrar la opción disponible de pago con Mercado Pago
- llevar al usuario a `/wallet` para continuar con el brick

Actualmente el flujo visible ofrece **solo Mercado Pago** como método de pago.

---

### `wallet/page.tsx`
Server Component que obtiene la orden y el `mpPreferenceId` generado en backend.

### `wallet/WalletBrickView.tsx`
Client Component que renderiza el **Wallet Brick** de Mercado Pago.

Responsabilidades principales:
- mostrar un resumen visual del importe total
- renderizar el componente `<Wallet />` del SDK React de Mercado Pago
- pasar `initialization={{ preferenceId }}` al brick
- mostrar feedback visual si no existe una preferencia cargada

Es el componente más importante del lado cliente dentro del flujo de pago.

---

### `processing/page.tsx`
Client Component que representa el estado intermedio del pago.

Responsabilidades principales:
- mostrar una pantalla de espera
- hacer polling cada 3 segundos a `/api/payments/ordenes-de-pago/[paymentId]`
- redirigir automáticamente a `success` o `failed` según el estado
- aplicar un timeout de seguridad después de 60 segundos

---

### `success/page.tsx`
Server Component que carga la orden aprobada y prepara los datos para la vista final.

### `success/SuccessView.tsx`
Client Component que renderiza la pantalla de pago exitoso.

Responsabilidades principales:
- mostrar confirmación visual del pago
- mostrar el importe
- mostrar el primer `orderId` asociado
- mostrar la fecha de pago formateada
- mostrar el `mpPaymentId`
- ofrecer acceso al historial de pagos

---

### `failed/page.tsx`
Server Component que carga la orden rechazada y traduce `mpStatusDetail` a un motivo legible.

### `failed/FailedView.tsx`
Client Component que renderiza la pantalla de pago fallido.

Responsabilidades principales:
- mostrar la confirmación visual de rechazo
- mostrar el importe
- mostrar el primer `orderId`
- mostrar el motivo del rechazo
- mostrar el identificador del intento
- permitir reintentar el flujo yendo nuevamente a `wallet`

---

## `app/(Vistas)/payments/history`
Contiene la UI de historial de pagos.

### `history/page.tsx`
Server Component que consulta las órdenes de pago y las transforma a un formato visual para historial.

### `history/HistoryView.tsx`
Client Component que renderiza la lista de pagos.

Responsabilidades principales:
- mostrar transacciones del historial
- filtrar visualmente entre:
  - Todos
  - Compras
  - Fallidas
  - Pendientes
- mostrar importe, fecha, método y badge de estado

Actualmente el historial se arma a partir de órdenes persistidas localmente.

---

## `app/(Vistas)/payments/components`
Contiene componentes reutilizables específicos del módulo de pagos.

### `MercadoPagoProvider.tsx`
Inicializa el SDK cliente de Mercado Pago.

Responsabilidades principales:
- leer `NEXT_PUBLIC_MP_PUBLIC_KEY`
- llamar a `initMercadoPago(...)`
- exponer el árbol solo cuando el SDK está listo

---

### `PayShell.tsx`
Shell visual común para las pantallas del módulo de pagos.

Responsabilidades principales:
- renderizar una estructura visual consistente
- mostrar título de pantalla
- manejar botón de back cuando corresponde
- encapsular el layout visual de checkout e historial

---

## `app/(Vistas)/payments/shared/components.tsx`
Kit visual compartido del módulo.

Contiene componentes reutilizables como:
- `Icon`
- `Button`
- `Pill`
- `Field`
- `Input`
- `Card`
- `useToast`
- `Avatar`
- `EmptyState`
- `Skeleton`
- `Logo`
- utilidades visuales y de formato como `fmtARS`

Este archivo concentra la base de la UI reutilizable del dominio de pagos.

---

# INFRAESTRUCTURA

## `app/lib/mercadopago.ts`
Configura un cliente singleton del SDK backend de Mercado Pago.

Se utiliza desde los services del lado servidor para:
- crear preferencias
- consultar pagos reales desde MP

---

## `app/lib/prisma.tsx`
Configura un cliente singleton de Prisma usando `@prisma/adapter-pg`.

Responsabilidades principales:
- crear la conexión a PostgreSQL
- reutilizar la instancia en desarrollo para evitar múltiples conexiones

---

## `app/lib/ulid.ts`
Utility para generar IDs únicos con prefijos.

Ejemplos de uso en el proyecto:
- `usr_...`
- `pay_...`
- `txn_...`

---

# PERSISTENCIA

## `prisma/schema.prisma`
Define el modelo de datos principal del proyecto.

Entidades actuales:
- `Usuario`
- `OrdenDePago`
- `Transaccion`

### `Usuario`
Representa usuarios cacheados localmente.

### `OrdenDePago`
Entidad principal del dominio de pagos.

Guarda:
- comprador
- órdenes agrupadas en formato JSON
- total
- fee
- moneda
- estado
- ids de Mercado Pago
- timestamps relevantes

### `Transaccion`
Representa eventos recibidos y persistidos a partir de Mercado Pago.

---

# DOCUMENTACIÓN

## `docs/`
Carpeta con documentación funcional y contractual del ecosistema UniHousing.

Archivos principales:
- `descripcion.md` → explica el problema de negocio y el objetivo del sistema
- `apis.md` → define contratos inter-servicios y payloads esperados
- `modelo-de-datos.md` → describe el modelo de datos por aplicación
- `responsabilidades.md` → delimita qué hace cada app del ecosistema
- `usuarios.md` → describe el modelo de usuarios y el uso esperado de Clerk

> Importante: el código actual es la fuente de verdad del comportamiento real, mientras que `/docs` representa la intención general y los contratos esperados entre apps.

---

# FLUJO GENERAL DEL PROYECTO

A grandes rasgos, el flujo de pago actual funciona así:

1. Se crea una orden de pago con `POST /api/payments/ordenes-de-pago`
2. Se persiste una `OrdenDePago` local
3. Se crea una preferencia en Mercado Pago
4. El usuario entra al flujo `/payments/checkout/[paymentId]/methods`
5. Continúa a `/wallet`
6. Se renderiza el Wallet Brick con el `preferenceId`
7. Mercado Pago redirige al callback interno al terminar el checkout
8. El callback decide la pantalla final (`success`, `processing` o `failed`)
9. En paralelo, el webhook persiste el estado real del pago
10. El historial muestra el resumen de pagos registrados

---

# VARIABLES DE ENTORNO IMPORTANTES

Para levantar correctamente el proyecto, las variables más importantes hoy son:

- `DATABASE_URL`
- `DIRECT_URL`
- `MP_ACCESS_TOKEN`
- `NEXT_PUBLIC_MP_PUBLIC_KEY`
- `APP_URL`

---

# SCRIPTS ÚTILES

```bash
pnpm dev
pnpm build
pnpm start
pnpm lint
pnpm prisma:generate
pnpm prisma:push
pnpm prisma:migrate
pnpm prisma:studio
pnpm prisma:reset
```

---

# RESUMEN RÁPIDO

Si alguien entra por primera vez a este repo, lo importante para entenderlo rápido es esto:

- es la **Payments App** de UniHousing
- está construida con **Next.js App Router + Prisma + Mercado Pago Bricks**
- sigue una organización conceptual **MVC**
- el flujo principal es:
  - crear orden
  - crear preferencia
  - renderizar wallet
  - recibir callback
  - procesar webhook
  - mostrar resultado final
- la capa más sensible del sistema está entre:
  - `app/(Datos)/api/payments/...`
  - `app/(Logica)/services/...`
  - `app/(Vistas)/payments/checkout/[paymentId]/...`

---

# ESTADO ACTUAL

El proyecto ya cuenta con:
- flujo local de checkout
- integración con Mercado Pago Wallet Brick
- callback de retorno
- webhook de actualización de estado
- historial de pagos
- seed de desarrollo

Y está preparado para seguir creciendo con nuevas features del dominio de pagos a medida que avance el proyecto.
