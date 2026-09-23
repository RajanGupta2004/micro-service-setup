import { createServer } from "node:http";
import app from "./app";

const port = Number(process.env.PORT ?? 3003);

const server = createServer(app);

server.listen(port, () => {
  console.log(`decision-orchestrator listening on http://localhost:${port}`);
});