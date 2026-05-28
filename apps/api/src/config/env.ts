import path from "node:path";

const root = process.cwd();

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 4000),
  dataDir: process.env.DATA_DIR ?? path.join(root, "data"),
  uploadDir: process.env.UPLOAD_DIR ?? path.join(root, "uploads"),
  publicBaseUrl: process.env.PUBLIC_BASE_URL ?? "http://localhost:4000",
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
};
