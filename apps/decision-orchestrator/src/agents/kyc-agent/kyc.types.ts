export type KycDecision = "PASS" | "REVIEW" | "FAIL";

export type AuthenticationType = "CKYC" | "OVD" | "VKYC" | "AADHAAR";

export interface KycPhoto {
  present: boolean;
  eyesOpen: boolean;
}

export interface KycInput {
  pan: string;
  panName: string;
  applicantName: string;
  panDateOfBirth: string;
  applicantDateOfBirth: string;
  photo: KycPhoto;
  authenticationType: AuthenticationType;
  vkycCompleted?: boolean;
  ovdNumber?: string;
  aadhaarNumber?: string;
}

export interface KycCheck {
  name: string;
  passed: boolean;
  reason: string;
}

export interface KycResult {
  decision: KycDecision;
  checks: KycCheck[];
}