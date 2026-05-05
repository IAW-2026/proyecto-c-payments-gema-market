# mock-api-payments

Servidor de prueba que simula los endpoints de la **Buyer App**, la **Seller App** y la **Shipping App** que la Payments App consume. Permite probar la Payments App de forma aislada, sin depender de las otras apps. Las notificaciones recibidas y los cambios de reservas se persisten en los archivos JSON de la carpeta `data/`.

## Endpoints

| Método | Path | Origen |
|--------|------|--------|
| `POST` | `/api/buyer/pagos/{payment_id}/confirmado` | Buyer App |
| `POST` | `/api/buyer/pagos/{payment_id}/rechazado` | Buyer App |
| `POST` | `/api/buyer/ordenes/{order_id}/disputa-resuelta` | Buyer App |
| `POST` | `/api/seller/pagos/{payment_id}/confirmado` | Seller App |
| `POST` | `/api/seller/ventas/{order_id}/disputa-abierta` | Seller App |
| `POST` | `/api/seller/ventas/{order_id}/disputa-resuelta` | Seller App |
| `POST` | `/api/seller/productos/{product_id}/reservar` | Seller App |
| `POST` | `/api/seller/productos/{product_id}/liberar-reserva` | Seller App |
| `POST` | `/api/shipping/cotizaciones/reservar` | Shipping App |
| `POST` | `/api/shipping/cotizaciones/liberar-reserva` | Shipping App |

Las notificaciones (`POST` que devuelven `{ "ok": true }`) se persisten para inspección:

| Método | Path |
|--------|------|
| `GET` | `/api/buyer/pagos/{payment_id}/notificaciones` |
| `GET` | `/api/buyer/ordenes/{order_id}/notificaciones` |

## Puesta en marcha (Windows)

### 1. Crear el entorno virtual

```bat
python -m venv .venv
```

### 2. Activar el entorno virtual

```bat
.venv\Scripts\activate
```

### 3. Instalar las dependencias

```bat
pip install -r requirements.txt
```

### 4. Correr el servidor

```bat
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

El servidor queda disponible en `http://localhost:8000`.  
La documentación interactiva (Swagger) está en `http://localhost:8000/docs`.

## Datos de prueba

Los archivos en `data/` se pueden editar libremente mientras el servidor no está corriendo:

| Archivo | Contenido |
|---------|-----------|
| `data/buyer_notifications.json` | Notificaciones enviadas a la Buyer App |
| `data/seller_notifications.json` | Notificaciones enviadas a la Seller App |
| `data/products.json` | Productos disponibles para `POST /productos/{id}/reservar` |
| `data/product_reservations.json` | Reservas activas/liberadas de productos |
| `data/quotes.json` | Cotizaciones disponibles para reservar/liberar |
