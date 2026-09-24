import { verifyAuthentication, verifyIdentity, verifyPan, verifyPhoto } from "./kyc.tools";
import type { KycInput, KycResult } from "./kyc.types";

export class KycAgent {
  evaluate(input: KycInput): KycResult {
    const checks = [
      verifyPan(input),
      ...verifyIdentity(input),
      ...verifyPhoto(input),
      verifyAuthentication(input),
    ];
    const failedChecks = checks.filter((check) => !check.passed);

    return {
      decision: failedChecks.length === 0 ? "PASS" : "FAIL",
      checks,
    };
  }
}

export const kycAgent = new KycAgent();