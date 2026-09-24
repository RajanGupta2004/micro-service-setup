export const KYC_AGENT_PROMPT = [
  "Evaluate KYC identity evidence only.",
  "Check PAN format, PAN name and date of birth matching, photo presence, eyes-open rule, and authentication evidence.",
  "Return PASS only when every KYC check passes; otherwise return FAIL with the failed checks.",
].join(" ");