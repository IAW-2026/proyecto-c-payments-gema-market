import { NextResponse } from 'next/server';
import { Client } from 'pg';

export async function GET() {
  // Necesitamos la cadena de conexión directa a PostgreSQL (Transaction pooling o Session)
  const connectionString = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!connectionString) {
    return NextResponse.json(
      { error: "Falta la variable de entorno DATABASE_URL. Por favor, añádela en tu archivo .env (Settings > Database > Connection string en Supabase)." },
      { status: 500 }
    );
  }

  const client = new Client({ connectionString });

  try {
    await client.connect();

    // Iniciar transacción
    await client.query('BEGIN');

    // 1. Crear tabla `usuario` (Cache de Clerk)
    await client.query(`
      CREATE TABLE IF NOT EXISTS usuario (
        id VARCHAR(26) PRIMARY KEY, -- ULID
        clerk_user_id VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255),
        full_name VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Crear tabla `orden_de_pago`
    await client.query(`
      CREATE TABLE IF NOT EXISTS orden_de_pago (
        id VARCHAR(26) PRIMARY KEY, -- ULID, expuesto como payment_id
        buyer_id VARCHAR(26) NOT NULL, -- FK lógica -> Buyer App
        orders JSONB NOT NULL, -- Array de órdenes: [{order_id, seller_id, product_id, quote_id, amount, quantity}]
        total_amount DECIMAL(12, 2) NOT NULL,
        fee DECIMAL(12, 2) NOT NULL,
        currency VARCHAR(3) NOT NULL,
        status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'in_process', 'approved', 'rejected', 'cancelled', 'refunded', 'charged_back', 'in_mediation')),
        mp_preference_id VARCHAR(255),
        mp_payment_id VARCHAR(255),
        mp_status_detail VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        paid_at TIMESTAMP WITH TIME ZONE
      );
    `);

    // 3. Crear tabla `transaccion`
    await client.query(`
      CREATE TABLE IF NOT EXISTS transaccion (
        id VARCHAR(26) PRIMARY KEY, -- ULID
        payment_id VARCHAR(26) NOT NULL REFERENCES orden_de_pago(id) ON DELETE CASCADE,
        event_type VARCHAR(100) NOT NULL,
        payload_json JSONB NOT NULL,
        received_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 4. Crear tabla `disputa`
    await client.query(`
      CREATE TABLE IF NOT EXISTS disputa (
        id VARCHAR(26) PRIMARY KEY, -- ULID
        order_id VARCHAR(255) NOT NULL, -- FK lógica -> Buyer App
        payment_id VARCHAR(26) NOT NULL REFERENCES orden_de_pago(id) ON DELETE CASCADE,
        opened_by VARCHAR(26) NOT NULL, -- FK lógica -> usuario.id
        reason VARCHAR(255) NOT NULL,
        description TEXT,
        notes TEXT,
        status VARCHAR(50) NOT NULL CHECK (status IN ('open', 'resolved_refunded', 'resolved_rejected')),
        resolved_at TIMESTAMP WITH TIME ZONE
      );
    `);

    await client.query('COMMIT');
    await client.end();

    return NextResponse.json({
      message: "¡Tablas de la aplicación Payments creadas con éxito!",
      tables: ['usuario', 'orden_de_pago', 'transaccion', 'disputa']
    }, { status: 200 });

  } catch (error: any) {
    await client.query('ROLLBACK');
    await client.end();
    return NextResponse.json({ error: "Error creando las tablas", details: error.message }, { status: 500 });
  }
}
