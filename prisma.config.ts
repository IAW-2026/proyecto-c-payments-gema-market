import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  datasource: {
    // La CLI de Prisma usará la conexión directa para migraciones y push
    url: env("DIRECT_URL") || env("DATABASE_URL"),
  },
});

