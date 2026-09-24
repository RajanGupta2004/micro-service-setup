# Decision orchestrator API

## Evaluate KYC

`POST /kyc/evaluate` evaluates the first KYC agent only. The request body must contain:

```json
{
  "pan": "ABCDE1234F",
  "panName": "Raj Gupta",
  "applicantName": "Raj Gupta",
  "panDateOfBirth": "1990-01-01",
  "applicantDateOfBirth": "1990-01-01",
  "photo": {
    "present": true,
    "eyesOpen": true
  },
  "authenticationType": "VKYC",
  "vkycCompleted": true
}
```

The response contains a `decision` (`PASS` or `FAIL`) and the result of each KYC check. Supported authentication types are `CKYC`, `OVD`, `VKYC`, and `AADHAAR`.