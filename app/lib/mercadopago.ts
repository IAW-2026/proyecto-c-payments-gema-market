/**
 * MercadoPago SDK — Configuración singleton (Backend).
 *
 * Inicializa un único `MercadoPagoConfig` con el access token
 * de la plataforma, para uso en los services del lado servidor.
 * 
 * Principio: DRY — se importa un solo cliente en todos los services.
 */

import { MercadoPagoConfig } from "mercadopago";

const mercadoPagoClient = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!, options: {timeout :5000}
});

export default mercadoPagoClient;
