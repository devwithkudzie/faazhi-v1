import { createServer } from "node:http";

import { app } from "./app.js";
import { env } from "./config/env.js";

createServer(app).listen(env.port, () => {
  console.log(`Faazhi API listening on http://localhost:${env.port}`);
});
