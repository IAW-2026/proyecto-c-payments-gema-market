# 1.1 — Descripción del Sistema

> **Tipo C — Marketplace**

## ¿Qué problema resuelve?

**UniHousing** es un marketplace enfocado en estudiantes que se mudan a Bahía Blanca y necesitan equipar sus departamentos de forma rápida, económica y práctica.

El problema principal es que:

- Los estudiantes nuevos no tienen mobiliario ni artículos básicos.
- Comprar todo nuevo es caro y poco eficiente.
- Conseguir cosas usadas confiables requiere tiempo (grupos de Facebook, contactos, etc.).
- Los estudiantes que se van de la ciudad necesitan vender rápido sus pertenencias.

UniHousing conecta oferta y demanda en un entorno específico (estudiantes), simplificando la compra y venta de artículos para el hogar.

En particular, resuelve:

- **La fragmentación del mercado**: centraliza la oferta de muebles y artículos usados y nuevos para el hogar en un entorno seguro y validado.
- **La barrera logística**: integra un sistema de envíos especializado en bultos grandes (fletes locales), eliminando la necesidad de que el estudiante coordine el transporte por fuera del sistema.
- **La desconfianza en transacciones**: asegura que el pago se procese de forma segura y directa mediante la pasarela oficial (Mercado Pago), depositando el dinero directamente en la cuenta del vendedor.

## Actores del sistema

| Actor | Descripción | Apps donde interactúa |
|-------|-------------|----------------------|
| Comprador | Estudiante que busca equipar su vivienda en la ciudad. | Buyer App, Payments App |
| Vendedor | Estudiante que egresa o usuario que ofrece mobiliario y artículos para el hogar. | Seller App, Payments App |
| Operador Logístico | Fletero encargado del traslado de bultos pesados dentro de Bahía Blanca. | Shipping App |
| Administrador | Superadministrador encargado de la moderación y gestión global del ecosistema. | Control Plane, Seller App, Buyer App |

## Flujo principal de uso

1. Un vendedor publica un producto desde la **Seller App**:
	sube fotos, descripción, precio y categoría.
2. Un comprador navega el marketplace desde la **Buyer App**:
	busca productos por filtros o categorías.
3. El comprador selecciona un producto:
	visualiza detalles y decide avanzar.
4. El comprador inicia la compra:
	confirma la compra directa.
5. El vendedor confirma la venta:
	 y se gestiona la entrega con el comprador.
6. Se realiza el pago en la **Payments App**:
	el procesamiento se efectúa directamente en nuestra aplicación mediante Mercado Pago Bricks, y los fondos se depositan en la cuenta de Mercado Pago del vendedor.
7. El operador logístico gestiona el traslado desde la **Shipping App**:
	se concreta la entrega del producto.


## Flujos alternativos

- Registro e inicio de sesión de usuarios. `(Comun a todas las App)`
- Edición o eliminación de publicaciones. `(Seller app)`
- Sistema de favoritos. `(Buyer App)`
- Reporte de publicaciones o usuarios. `(Admin)`
- Historial de compras. `(Buyer App)`
- Historial de ventas.  `(Seller app)`
