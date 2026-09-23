import { createServer } from "node:http";

const port = Number(process.env.PORT ?? 3003);

const server = createServer((request, response) => {
  if (request.url === "/health" && request.method === "GET") {
    response.writeHead(200, { "content-type": "application/json" });
    response.end(JSON.stringify({ service: "decision-orchestrator", status: "ok" }));
    return;
  }

  response.writeHead(404, { "content-type": "application/json" });
  response.end(JSON.stringify({ error: "Not found" }));
});

server.listen(port, () => {
  console.log(`decision-orchestrator listening on http://localhost:${port}`);
});