import express from "express";
import { kycAgent } from "./agents/kyc-agent/kyc.agent";
import type { KycInput } from "./agents/kyc-agent/kyc.types";

const app = express();
app.use(express.json());

function isKycInput(value: unknown): value is KycInput {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const input = value as Record<string, unknown>;
  const photo = input.photo;
  return (
    typeof input.pan === "string" &&
    typeof input.panName === "string" &&
    typeof input.applicantName === "string" &&
    typeof input.panDateOfBirth === "string" &&
    typeof input.applicantDateOfBirth === "string" &&
    typeof photo === "object" &&
    photo !== null &&
    typeof (photo as Record<string, unknown>).present === "boolean" &&
    typeof (photo as Record<string, unknown>).eyesOpen === "boolean" &&
    ["CKYC", "OVD", "VKYC", "AADHAAR"].includes(String(input.authenticationType))
  );
}

app.get("/health", (req, res) => {
  res.status(200).json({ service: "decision-orchestrator", status: "ok" });
});

app.post("/kyc/evaluate", (req, res) => {
  if (!isKycInput(req.body)) {
    res.status(400).json({ error: "Invalid KYC input." });
    return;
  }

  res.status(200).json(kycAgent.evaluate(req.body));
});

export default app;