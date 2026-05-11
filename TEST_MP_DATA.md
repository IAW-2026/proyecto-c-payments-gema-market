# 💳 Datos de Prueba Mercado Pago

Este documento contiene las credenciales de prueba para el entorno de Sandbox de Mercado Pago en **UniHousing**. Estos datos son ficticios y provistos por la plataforma para realizar integraciones.

---

## 👥 Cuentas de Prueba

### Compradores (Buyers)
| Actor | Usuario (Email/Username) | Contraseña | Código de Confirmación |
| :--- | :--- | :--- | :--- |
| **Comprador 1** | `TESTUSER4974901634230900058` | `GtSZUZor71` | `666567` |
| **Comprador 2** | `TESTUSER1240541601986241713` | `2zj9uNbwiD` | `900067` |

### Vendedores (Sellers)
| Actor | Usuario (Email/Username) | Contraseña | Código de Confirmación |
| :--- | :--- | :--- | :--- |
| **Vendedor 1** | `TESTUSER5880911622371665370` | `ZUgjL03yBg` | `666697` |
| **Vendedor 2** | `TESTUSER4921428870398034195` | `PqoAjB8hkA` | `900063` |

---

## 💳 Tarjetas de Prueba (Comprador 1)

| Marca | Tipo | Número de Tarjeta | CVV | Vencimiento |
| :--- | :--- | :--- | :--- | :--- |
| **Mastercard** | Crédito | `5031 7557 3453 0604` | `123` | `11/30` |
| **Visa** | Crédito | `4509 9535 6623 3704` | `123` | `11/30` |
| **Amex** | Crédito | `3711 803032 57522` | `1234` | `11/30` |
| **Mastercard** | Débito | `5287 3383 1025 3304` | `123` | `11/30` |
| **Visa** | Débito | `4002 7686 9439 5619` | `123` | `11/30` |

>
> **Datos comunes para todas las tarjetas:**
> - **DNI:** `12345678`
> - **Titular:** Ver sección de comportamientos abajo.

---

## 🎭 Comportamientos de Prueba (Magic Names)
Para simular distintos resultados de pago en el Checkout, ingresá los siguientes valores en el campo **Nombre del Titular**:

| Nombre | Resultado del Pago |
| :--- | :--- |
| `APRO` | ✅ **Aprobado** (Success) |
| `CONT` | ⏳ **Pendiente** (Pending/Processing) |
| `OTHE` | ❌ **Rechazado** (Error general) |
| `FUND` | ❌ **Rechazado** (Saldo insuficiente) |
| `SECU` | ❌ **Rechazado** (Código de seguridad inválido) |
| `EXPI` | ❌ **Rechazado** (Fecha de vencimiento inválida) |
| `FORM` | ❌ **Rechazado** (Error de formulario) |

---

> [!NOTE]
> Estos datos son para uso exclusivo en el ambiente de **Sandbox**. No intentes usarlos en producción.
