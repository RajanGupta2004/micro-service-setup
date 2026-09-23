

# 1. What this project does

This is an **Axis Bank Credit Card Decision-In-Principle and Underwriting platform**.

It takes a credit-card application, reads the applicant’s information and documents, runs multiple verification checks, and produces a recommendation such as:

- `ACCEPT`
- `REWORK`
- `SDR` — Sales Decline Recommendation
- `CDR` — Credit Decline Recommendation
- `REVIEW` — manual review required

Important: the system does **not make the final human decision**. It recommends a result, and a bank operator or underwriter performs the final HITL — Human-in-the-Loop — decision.

The main documentation is available in `README.md`, `docker-compose.yml`, and `EKS/README.md`.

---

# 2. How many microservices are there?

## Current v2 architecture: 5 running containers/workloads

| # | Service | Port | Purpose |
|---|---|---:|---|
| 1 | `main-ms` | `8090` | Main entry point and case management |
| 2 | `dip-orchestrator` | `8200` | Runs the complete DIP verification pipeline |
| 3 | `uw-orch` | `8300` | Underwriting pipeline; currently scaffold/Phase 2 |
| 4 | `mock` / `integration-mock` | `4000` | Local dummy bank APIs for development and testing |
| 5 | `dip-ui` | `3000` locally / `8081` internally | React web application for bank users |

However, the mock service is for local/UAT testing and is marked to be **removed at production go-live**. Therefore:

- **Local deployment:** 5 workloads
- **Production target:** normally 4 actual workloads, excluding the mock

The Kubernetes deployment table is documented in `EKS/README.md`.

---

# 3. Role of each microservice

## 3.1 `main-ms` — Main entry point

Source code: `apps/main-ms/src/server.ts`

This is the **front door of the backend**.

It performs the following work:

### Receives cases

Cases can arrive through:

- IBPS/NewGen polling
- The user interface
- Test upload APIs
- Direct intake API

Important APIs include:

```text
POST /api/v1/cases/intake
GET  /api/v1/pending-cases
POST /api/v1/cases/:caseId/proceed
GET  /api/v1/cases
GET  /api/v1/cases/:caseId
GET  /api/v1/cases/:caseId/results
POST /api/v1/cases/:caseId/rerun
```

### Reads and validates IBPS data

It reads the case from the bank’s IBPS/NewGen source and checks:

- Case ID
- Customer type/segment
- Current workstep
- Available documents
- Routing information

The customer segment can be:

- `ETB` — Existing-to-Bank customer
- `NTB` — New-to-Bank customer
- `LEAD`

The segment is important because it decides which evidence source and rules are used.

### Acquires documents

Documents are collected from the bank’s document table, called DOCTABLE, and placed in GCS.

The flow is approximately:

```text
IBPS case
   ↓
DOCTABLE documents
   ↓
GCS document storage
   ↓
Document classification
   ↓
DIP/UW processing
```

### Classifies documents

The system verifies whether a document is really what it claims to be.

For example:

- A file marked as a PAN document may actually be a salary slip.
- A document may be unreadable.
- A document may not belong to the current customer.

Invalid or mismatched documents are excluded from agent processing.

### Routes the case

`main-ms` decides whether the case goes to:

- `dip-orchestrator`
- `uw-orch`

The routing is based on the configured IBPS workstep.

### Stores case state and results

It stores:

- Case status
- Document mapping
- Agent results
- Recommendation
- Error information
- Run history

The frontend reads the case information from `main-ms`.

---

## 3.2 `dip-orchestrator` — DIP processing service

Source code:

- `apps/dip-orchestrator/src/index.ts`
- `apps/dip-orchestrator/src/orchestrator.ts`

Port:

```text
8200
```

This is the most important business-processing service for the current project.

It exposes:

```text
POST /run
```

Unlike the old architecture, the individual agents do **not** communicate with each other through separate HTTP services. They run as in-process modules inside the DIP orchestrator.

### DIP pipeline steps

The orchestrator runs these steps:

```text
1. Gather evidence
2. Prepare datasets
3. Run applicable check agents in parallel
4. Run audit checks
5. Assemble final recommendation
6. Return all detailed results
```

### Step 1: Gather evidence

The orchestrator fetches additional information based on the segment.

For `ETB` and `LEAD`, it generally uses:

- FESA/Finacle demographics
- FESA statements
- Balance/AQB/TRV data

For `NTB`, it generally uses:

- CKYC profile
- Applicant documents
- IBPS data

This logic is implemented in `apps/dip-orchestrator/src/evidence/gather.ts`.

### Step 2: Prepare datasets

The full case information is split into smaller datasets for the relevant agents.

For example:

- KYC data goes to the KYC agent
- Employment documents go to the employment agent
- Address information goes to the address agent
- Card information goes to the card agent

This prevents every agent from processing unrelated information.

### Step 3: Run check agents in parallel

The applicable agents are executed concurrently using `Promise.all`.

This reduces the total processing time.

### Step 4: Run the audit agent

The audit agent runs after the normal checks because it needs to see the earlier verdicts.

It checks cross-cutting rules such as:

- Aadhaar masking
- Add-on rules
- TVR checks
- Income/document audit
- Overall data integrity

### Step 5: Assemble the recommendation

The decision logic combines all agent results.

The recommendation is deterministic and follows configured precedence. A serious result such as CDR takes priority over less severe results.

If required policy configuration is missing, the system defaults to `REVIEW` rather than guessing.

---

## 3.3 `uw-orch` — Underwriting service

Source code: `apps/uw-orchestrator/src/index.ts`

Port:

```text
8300
```

This service is the planned **Underwriting-stage orchestrator**.

Currently, it is a scaffold and is not fully implemented.

The planned responsibilities are:

1. Receive DIP results
2. Gather additional underwriting evidence
3. Run UW-specific checks
4. Validate income and risk
5. Run surrogate-related checks
6. Prepare CAM/risk information
7. Assemble an underwriting recommendation
8. Send the case to a human underwriting checkpoint

The current source contains a placeholder response indicating that the Phase 2 implementation is pending.

---

## 3.4 `integration-mock` — Local bank-system simulator

Source code: `apps/integration-mock/src/server.ts`

Port:

```text
4000
```

This service simulates external Axis Bank systems during local development and testing.

It provides dummy versions of:

- IBPS pending-case queue
- IBPS case data
- FESA/Finacle customer profile
- FESA statements
- CKYC profiles
- Balance summaries
- Encrypted Finacle-style requests and responses

For example, in local development:

```text
main-ms
   ↓
integration-mock
   ├── dummy IBPS
   ├── dummy FESA
   └── dummy CKYC
```

This allows developers to test the complete application without connecting to real bank systems.

The mock is not intended for production. The production system should use real bank integration services through the approved ESB/proxy path.

---

## 3.5 `dip-ui` — React user interface

Source code: `apps/dip-ui/src/App.tsx`

Local URL:

```text
http://localhost:3000
```

Internal container port:

```text
8081
```

This is the web application used by bank operators.

The UI currently provides screens for:

- Login
- Pending IBPS cases
- Submit Case
- Case list
- Case details
- Document classification
- Agent verdicts
- Decision recommendation
- Sign out

The UI does not directly call individual agents. It communicates with `main-ms`, which is the backend entry point.

The basic UI flow is:

```text
User opens UI
   ↓
User views pending IBPS cases
   ↓
User selects/proceeds with a case
   ↓
UI calls main-ms
   ↓
main-ms calls the correct orchestrator
   ↓
Results are displayed in the UI
```

---

# 4. What are the agents?

The repository contains many folders under `agents/`, but these should not be confused with microservices.

## Important distinction

### Old architecture

Previously, each agent could be run as a separate service:

```text
salary-slip-agent → port 8101
employee-agent    → port 8102
demographic-agent → port 8103
...
```

### Current v2 architecture

The agents are now loaded inside `dip-orchestrator`:

```text
dip-orchestrator
   ├── demographic-agent
   ├── digital-consent-agent
   ├── employment-agent
   ├── kyc-agent
   ├── address-agent
   ├── card-agent
   ├── office-use-agent
   ├── audit-agent
   └── decision-agent
```

They are in-process modules and do not create separate running containers in the current v2 deployment.

The registry is defined in `apps/dip-orchestrator/src/agents/registry.ts`.

---

# 5. Current logical agent roles

The current orchestrator groups checks into larger agents.

## `demographic-agent`

Checks customer demographic information, including:

- Name
- Desired name on card
- Age
- Mother’s maiden name
- Nationality
- Country risk
- Constitution
- Occupation alignment
- FATCA declaration
- Nominee details
- Source of funds
- Re-KYC-related checks

## `digital-consent-agent`

Checks:

- MID document
- Applicant identity
- Applicant signature
- Bank copy
- Signature date
- Barcode
- Applicant type
- Digital consent requirements

## `employment-agent`

Checks employment and income-related information, including:

- Salary slips
- Employment details
- Employer information
- Income calculations
- Self-employed information
- ITR-related documents
- Document-to-claim consistency

## `kyc-agent`

Checks KYC and identity information, including:

- PAN
- PAN name and date of birth
- Photo
- Eyes-open/photo rules
- Authentication type
- VKYC
- OVD number matching
- Aadhaar-related identity data

## `address-agent`

Checks:

- Residence address
- Permanent address
- Office address
- Address document matching
- Pincode
- Office distance
- Work-from-home-related rules
- Deviation evidence

## `card-agent`

Checks card-related information, including:

- Card type
- MID
- Product eligibility
- Income eligibility for the selected card
- Auto-debit
- Card variant-related rules

## `office-use-agent`

Checks office-entered information such as:

- Sales remarks
- Channel code
- Source/promo codes
- Vernacular documents
- Blaze output
- Other office-use fields

## `audit-agent`

Runs cross-checks after the other agents finish.

It is used for broader audit and consistency checks.

## `decision-agent`

This is the final aggregator.

It:

- Reads all agent verdicts
- Applies configured decision precedence
- Detects conflicting evidence
- Produces the overall DIP recommendation
- Produces credit remarks

It does not make a final bank decision. It only recommends a result for human review.

---

# 6. Complete case flow

A normal case moves through the system like this:

```text
1. New case enters IBPS/NewGen
              ↓
2. main-ms polls or receives the case
              ↓
3. main-ms identifies:
       - customer segment
       - current workstep
       - DIP or UW route
              ↓
4. Documents are acquired from DOCTABLE
              ↓
5. Documents are uploaded/stored in GCS
              ↓
6. Documents are classified and verified
              ↓
7. main-ms calls one orchestrator endpoint
              ↓
8. DIP orchestrator gathers evidence:
       - FESA for ETB/LEAD
       - CKYC for NTB
              ↓
9. Relevant check agents run in parallel
              ↓
10. Audit agent checks the combined result
              ↓
11. Decision agent assembles recommendation
              ↓
12. main-ms stores the results
              ↓
13. UI displays verdicts and recommendation
              ↓
14. Human operator confirms or overrides the recommendation
```

The main pipeline implementation is in `apps/main-ms/src/pipeline.ts`.

---

# 7. Important shared packages

These are not microservices, but they are important parts of the codebase.

## `packages/contracts`

Location: `packages/contracts/`

Contains shared types and validation schemas, such as:

- Case state
- Agent request
- Agent response
- Verdicts
- Decisions
- Document references

This is the common contract used between services.

## `packages/agent-kit`

Location: `packages/agent-kit/`

Provides common agent functionality:

- Agent HTTP server
- Gemini/Vertex AI runner
- Prompt loading
- Document loading
- Logging
- Validation
- Shared agent skills

## `packages/shared`

Location: `packages/shared/`

Contains common infrastructure code:

- Environment configuration
- IBPS data source
- FESA/ESB clients
- Database helpers
- Routing helpers
- Common utilities

## `prompts`

Location: `prompts/`

Contains the prompts used by AI-enabled agents.

There is:

```text
prompts/_master.md
prompts/<agent-name>.md
```

The master prompt contains shared rules. Each agent has its own prompt file.

---

# 8. Technologies used

The project uses:

- Node.js
- TypeScript
- Express
- React
- Google ADK
- Gemini on Vertex AI
- PostgreSQL
- Google Cloud Storage
- GKE
- Docker
- Kubernetes
- Google Secret Manager
- IBPS/NewGen integration
- FESA/Finacle integration
- CKYC integration

The root package configuration is in `package.json`.

---

# 9. Where you should start as a new developer

I recommend learning the project in this order:

1. Read `README.md`
2. Understand `apps/main-ms/src/server.ts`
3. Follow `apps/main-ms/src/pipeline.ts`
4. Read `apps/dip-orchestrator/src/orchestrator.ts`
5. Read `apps/dip-orchestrator/src/evidence/gather.ts`
6. Read `apps/dip-orchestrator/src/agents/registry.ts`
7. Read `agents/AGENT_PATTERN.md`
8. Review one complete agent, for example `agents/demographic-agent/`
9. Read the related tests under each agent’s `test/` directory
10. Run the project tests:

```bash
npm install
npm test
npm run typecheck
```

## Short summary

The easiest way to remember the architecture is:

```text
dip-ui
   ↓
main-ms
   ↓
DIP orchestrator or UW orchestrator
   ↓
internal verification agents
   ↓
audit + decision aggregation
   ↓
case result shown to human operator
```

The most important point is that **the system currently has 5 deployed containers locally, but the many verification agents run inside the DIP orchestrator and are not separate microservices in the current v2 architecture**.