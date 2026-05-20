import { buildApp } from "./app.js";
import { config } from "./config.js";
import { pool } from "./db/client.js";

const app = await buildApp();

const shutdown = async () => {
  await app.close();
  await pool.end();
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

await app.listen({
  host: "0.0.0.0",
  port: config.PORT,
});
