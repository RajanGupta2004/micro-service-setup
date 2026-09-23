import { createServer } from "node:http";
import app from "./app";

const port = Number(process.env.PORT ?? 3000);

const server = createServer(app);

server.listen(port, () => {
  console.log(`api-gateway listening on http://localhost:${port}`);
});