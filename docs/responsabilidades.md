# 1.2 — Asignación de Responsabilidades

> **Tipo C — Marketplace**

## Distribución de webapps

| App | Responsable | Repositorio |
|-----|-------------|-------------|
| Buyer App | Gonzalo Ferraro | `proyecto-c-buyer-[gonzalo]` |
| Seller App | Manuel Ducos | `proyecto-c-seller-[manuel]` |
| Shipping App | Emiliano Sensini | `proyecto-c-shipping-[emiliano]` |
| Payments App | Agustin Echavarria | `proyecto-c-payments-[agustin]` |
| Control Plane | Equipo completo | `proyecto-c-control-plane-unihousing` |
| Analytics Dashboard | Equipo completo | `proyecto-c-analytics-unihousing` |

---

## Datos propios de cada app

> **Regla de integración**: el `order_id` se genera en la **Buyer App** en el momento de iniciar la compra y es el identificador correlacional global del flujo. Todas las apps lo persisten como clave foránea lógica para trazabilidad inter-servicios.

### Buyer App
- `usuario` (cache de identidad — fuente de verdad: Clerk)
- `orden` (incluye `payment_id` FK-lógica → Payments, `shipping_id` FK-lógica → Shipping, `seller_id` y `product_id` FK-lógica → Seller)
- `carrito`
- `item_carrito`
- `favorito`
- `historial_compras` (vista agregada sobre `orden`)

### Seller App
- `usuario` (cache de identidad)
- `producto` (incluye `status`: `active` | `paused` | `blocked` | `sold`)
- `categoria`
- `venta` (incluye `order_id` FK-lógica → Buyer, `payment_id` FK-lógica → Payments, `shipping_id` FK-lógica → Shipping)
- `historial_ventas` (vista agregada sobre `venta`)

### Shipping App
- `usuario` (cache de identidad)
- `envio` (incluye `order_id` FK-lógica → Buyer, `seller_id`, `buyer_id`)
- `tarifa`
- `hoja_de_ruta`
- `historial_entregas` (vista agregada sobre `envio`)

### Payments App
- `usuario` (cache de identidad)
- `orden_de_pago` (incluye `order_id` FK-lógica → Buyer, `payment_id` propio, `mp_preference_id`, `mp_payment_id`)
- `transaccion` (eventos de Mercado Pago)
- `disputa` (incluye `order_id` y `payment_id`)

---

## Datos o acciones que requieren comunicación entre apps

> **Convención**: el parámetro de ruta unificado es `:order_id` (generado por Buyer App). Los nombres de campos en los JSON siguen `snake_case`.

| App origen | Acción / dato necesario | App destino | API involucrada |
|------------|--------------------------|-------------|-----------------|
| Buyer App | Obtener catálogo de productos con filtros | Seller App | `GET /api/seller/productos` |
| Buyer App | Obtener detalle de un producto | Seller App | `GET /api/seller/productos/:product_id` |
| Buyer App | Obtener listado de categorías | Seller App | `GET /api/seller/categorias` |
| Buyer App | Reservar stock del producto al iniciar checkout | Seller App | `POST /api/seller/productos/:product_id/reservar` |
| Buyer App | Consultar cotización de envío antes de pagar | Shipping App | `POST /api/shipping/cotizaciones` |
| Buyer App | Iniciar pago de una compra | Payments App | `POST /api/payments/ordenes-de-pago` |
| Buyer App | Abrir una disputa por problema en la compra | Payments App | `POST /api/payments/disputas` |
| Payments App | Notificar disputa abierta al vendedor | Seller App | `POST /api/seller/ventas/:order_id/disputa-abierta` |
| Payments App | Notificar resolución de disputa al comprador | Buyer App | `POST /api/buyer/ordenes/:order_id/disputa-resuelta` |
| Payments App | Notificar resolución de disputa al vendedor | Seller App | `POST /api/seller/ventas/:order_id/disputa-resuelta` |
| Payments App | Notificar pago aprobado al vendedor | Seller App | `POST /api/seller/ventas/:order_id/pago-confirmado` |
| Payments App | Notificar pago aprobado al comprador | Buyer App | `POST /api/buyer/ordenes/:order_id/pago-confirmado` |
| Payments App | Notificar pago rechazado / cancelado al comprador | Buyer App | `POST /api/buyer/ordenes/:order_id/pago-rechazado` |
| Seller App | Solicitar creación del envío | Shipping App | `POST /api/shipping/envios` |
| Shipping App | Notificar cambio de estado del envío al comprador | Buyer App | `POST /api/buyer/ordenes/:order_id/estado-envio` |
| Shipping App | Notificar cambio de estado del envío al vendedor | Seller App | `POST /api/seller/ventas/:order_id/estado-envio` |
| Control Plane | Resolver disputa abierta por un usuario | Payments App | `POST /api/payments/disputas/:dispute_id/resolver` |