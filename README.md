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