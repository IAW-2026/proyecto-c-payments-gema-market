# 1.5 — Usuarios Compartidos

> **Tipo C — Marketplace**

El sistema utiliza **Clerk** como servicio centralizado de autenticación. Los usuarios se autentican a través de Clerk independientemente de qué app estén usando, y la identidad se propaga entre servicios mediante el token JWT emitido por Clerk.

Un único `clerk_user_id` (claim `sub`) representa al usuario en todas las apps del ecosistema. Esto garantiza que, por ejemplo, un `user_id` obtenido en la Buyer App sea válido para consultar el historial de pagos en la Payments App, porque ambas apps resuelven la identidad contra el mismo emisor (Clerk) y contra la misma clave pública (JWKS).

---

## ¿Qué apps comparten usuarios?

| Usuario | Apps donde puede autenticarse |
|---------|------------------------------|
| Comprador (`buyer`) | Buyer App, Payments App |
| Vendedor (`seller`) | Seller App, Payments App |
| Operador logístico (`logistics`) | Shipping App |
| Administrador (`admin`) | Control Plane, Buyer App, Seller App, Shipping App, Payments App (solo lectura y acciones administrativas) |

Un mismo usuario de Clerk **puede tener múltiples roles simultáneamente** (por ejemplo, `buyer` y `seller`): un estudiante suele comprar al llegar a Bahía Blanca y vender al egresar. Por eso el modelado usa una lista de roles, no un rol único.

---

## Claims del JWT relevantes por app

El JWT emitido por Clerk incluye los siguientes **Custom Claims** (configurados desde la JWT Template de Clerk leyendo `user.publicMetadata`):

| Claim | Tipo | Descripción |
|-------|------|-------------|
| `sub` | string | `clerk_user_id`. Identidad global |
| `email` | string | Email verificado |
| `roles` | string[] | Lista de roles asignados (`buyer`, `seller`, `logistics`, `admin`) |
| `permissions` | string[] | Permisos finos (ej: `orders:refund`, `products:deactivate`) para el Control Plane |
| `status` | string | `active` | `suspended` — permite bloqueo administrativo sin eliminar el usuario |

### Uso por app

| App | Claims consumidos | Validación |
|-----|------------------|------------|
| Buyer App | `sub`, `roles`, `status` | Requiere `"buyer" in roles` y `status == "active"` |
| Seller App | `sub`, `roles`, `status` | Requiere `"seller" in roles` |
| Shipping App | `sub`, `roles`, `org_id` | Requiere `"logistics" in roles` |
| Payments App | `sub`, `roles` | Acepta cualquiera con rol válido; verifica que `sub` sea el `buyer_id` o `seller_id` de la orden consultada |

Todas las apps validan el JWT contra el JWKS público de Clerk (`https://<clerk-frontend-api>/.well-known/jwks.json`) en cada request. Sin llamadas adicionales a Clerk en el hot path.

---

## Estrategia de roles

- Los roles se almacenan como `publicMetadata.roles: string[]` en Clerk (no como rol único). Esto soporta el caso comprador + vendedor en la misma identidad.
