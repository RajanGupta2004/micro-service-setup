import type { KycInput, KycCheck } from "./kyc.types";

const PAN_PATTERN = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

const normalized = (value: string) => value.trim().replace(/\s+/g, " ").toUpperCase();

export function verifyPan(input: Pick<KycInput, "pan">): KycCheck {
  const pan = input.pan.trim().toUpperCase();
  return {
    name: "pan",
    passed: PAN_PATTERN.test(pan),
    reason: PAN_PATTERN.test(pan) ? "PAN format is valid." : "PAN must match the standard 10-character format.",
  };
}

export function verifyIdentity(input: Pick<KycInput, "panName" | "applicantName" | "panDateOfBirth" | "applicantDateOfBirth">): KycCheck[] {
  const nameMatches = normalized(input.panName) === normalized(input.applicantName);
  const dateOfBirthMatches = input.panDateOfBirth === input.applicantDateOfBirth;
  return [
    {
      name: "pan-name",
      passed: nameMatches,
      reason: nameMatches ? "PAN name matches the applicant name." : "PAN name does not match the applicant name.",
    },
    {
      name: "pan-date-of-birth",
      passed: dateOfBirthMatches,
      reason: dateOfBirthMatches ? "PAN date of birth matches the applicant date of birth." : "PAN date of birth does not match the applicant date of birth.",
    },
  ];
}

export function verifyPhoto(input: Pick<KycInput, "photo">): KycCheck[] {
  return [
    {
      name: "photo-present",
      passed: input.photo.present,
      reason: input.photo.present ? "Applicant photo is present." : "Applicant photo is missing.",
    },
    {
      name: "eyes-open",
      passed: input.photo.eyesOpen,
      reason: input.photo.eyesOpen ? "Applicant eyes-open rule passed." : "Applicant eyes-open rule failed.",
    },
  ];
}

export function verifyAuthentication(input: Pick<KycInput, "authenticationType" | "vkycCompleted" | "ovdNumber" | "aadhaarNumber">): KycCheck {
  if (input.authenticationType === "VKYC") {
    return {
      name: "authentication",
      passed: input.vkycCompleted === true,
      reason: input.vkycCompleted === true ? "VKYC is complete." : "VKYC must be completed.",
    };
  }

  if (input.authenticationType === "OVD") {
    const passed = Boolean(input.ovdNumber?.trim());
    return {
      name: "authentication",
      passed,
      reason: passed ? "OVD number is present." : "OVD number is required.",
    };
  }

  if (input.authenticationType === "AADHAAR") {
    const passed = /^\d{12}$/.test(input.aadhaarNumber ?? "");
    return {
      name: "authentication",
      passed,
      reason: passed ? "Aadhaar number is valid." : "Aadhaar number must contain 12 digits.",
    };
  }

  return {
    name: "authentication",
    passed: true,
    reason: "CKYC authentication selected.",
  };
}