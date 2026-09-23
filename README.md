# Axis DIP / Underwriting POC

Basic TypeScript monorepo for the DIP and underwriting services.

## Prerequisites

- Node.js 20 or newer
- npm 10 or newer

## Setup

```sh
npm install
npm run typecheck
```

## Run a service

```sh
npm run dev:gateway
npm run dev:application
npm run dev:documents
npm run dev:orchestrator
```

Each service exposes `GET /health` on its default port:

| Service | Port |
| --- | ---: |
| API gateway | 3000 |
| Application service | 3001 |
| Document service | 3002 |
| Decision orchestrator | 3003 |






axis-dip-uw/
│
├── apps/
│   │
│   ├── api-gateway/
│   │   ├── src/
│   │   │   ├── routes/
│   │   │   ├── controllers/
│   │   │   ├── middleware/
│   │   │   ├── clients/
│   │   │   └── server.ts
│   │   │
│   │   ├── package.json
│   │   └── Dockerfile
│   │
│   ├── application-service/
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   ├── services/
│   │   │   ├── repositories/
│   │   │   ├── models/
│   │   │   ├── validators/
│   │   │   └── server.ts
│   │   │
│   │   ├── package.json
│   │   └── Dockerfile
│   │
│   ├── document-service/
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   ├── services/
│   │   │   ├── storage/
│   │   │   ├── processors/
│   │   │   └── server.ts
│   │   │
│   │   ├── package.json
│   │   └── Dockerfile
│   │
│   └── decision-orchestrator/
│       │
│       ├── src/
│       │   │
│       │   ├── agents/
│       │   │   │
│       │   │   ├── kyc-agent/
│       │   │   │   ├── kyc.agent.ts
│       │   │   │   ├── kyc.prompt.ts
│       │   │   │   ├── kyc.tools.ts
│       │   │   │   └── kyc.types.ts
│       │   │   │
│       │   │   ├── document-agent/
│       │   │   │   ├── document.agent.ts
│       │   │   │   ├── document.prompt.ts
│       │   │   │   ├── document.tools.ts
│       │   │   │   └── document.types.ts
│       │   │   │
│       │   │   ├── income-agent/
│       │   │   │   ├── income.agent.ts
│       │   │   │   ├── income.prompt.ts
│       │   │   │   ├── income.tools.ts
│       │   │   │   └── income.types.ts
│       │   │   │
│       │   │   ├── employment-agent/
│       │   │   │   ├── employment.agent.ts
│       │   │   │   ├── employment.prompt.ts
│       │   │   │   ├── employment.tools.ts
│       │   │   │   └── employment.types.ts
│       │   │   │
│       │   │   ├── eligibility-agent/
│       │   │   │   ├── eligibility.agent.ts
│       │   │   │   ├── eligibility.prompt.ts
│       │   │   │   ├── eligibility.tools.ts
│       │   │   │   └── eligibility.types.ts
│       │   │   │
│       │   │   ├── risk-agent/
│       │   │   │   ├── risk.agent.ts
│       │   │   │   ├── risk.prompt.ts
│       │   │   │   ├── risk.tools.ts
│       │   │   │   └── risk.types.ts
│       │   │   │
│       │   │   └── cam-agent/
│       │   │       ├── cam.agent.ts
│       │   │       ├── cam.prompt.ts
│       │   │       ├── cam.tools.ts
│       │   │       └── cam.types.ts
│       │   │
│       │   ├── orchestrator/
│       │   │   ├── dip.workflow.ts
│       │   │   ├── uw.workflow.ts
│       │   │   └── workflow.types.ts
│       │   │
│       │   ├── llm/
│       │   │   ├── llm.client.ts
│       │   │   ├── model.config.ts
│       │   │   └── structured-output.ts
│       │   │
│       │   ├── tools/
│       │   │   ├── pan-verification.tool.ts
│       │   │   ├── bank-account.tool.ts
│       │   │   ├── salary.tool.ts
│       │   │   └── application.tool.ts
│       │   │
│       │   ├── rules/
│       │   │   ├── kyc.rules.ts
│       │   │   ├── income.rules.ts
│       │   │   └── eligibility.rules.ts
│       │   │
│       │   ├── controllers/
│       │   │   └── workflow.controller.ts
│       │   │
│       │   └── server.ts
│       │
│       ├── package.json
│       └── Dockerfile
│
├── packages/
│   ├── shared-types/
│   ├── shared-errors/
│   ├── shared-logger/
│   └── shared-validation/
│
├── infrastructure/
│   ├── docker-compose.yml
│   └── kubernetes/
│
├── docs/
│   ├── architecture/
│   ├── agents/
│   └── api/
│
├── package.json
├── pnpm-workspace.yaml
└── README.md