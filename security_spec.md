# AuraAgent Security Specification (Phase 0 TDD)

## 1. Data Invariants
1. **Model Isolation**: Sub-resources (mediaVault, voiceVault, leads, chats) cannot exist or be modified without a valid parent `modelId` matching the path variable.
2. **Identity Integrity**: User records in `/users/{userId}` can only be read or written by the authenticated owner or admin.
3. **Data Boundary & Type Safety**:
   - Model profiles must have valid string `id`, `name`, and `handle`.
   - Media vault items must contain a valid `url` and `modelId`.
   - Voice clips must have `modelId` and `title`.
   - Lead memories must have valid `username`.
4. **Denial-of-Wallet Protections**: All string fields and array fields must be bounded in length and size (e.g. string size <= 500000 chars for base64 media, arrays <= 50 items).

## 2. The Dirty Dozen Payloads (Designed to Fail)
1. **Payload 1 (Orphaned Media)**: Write to `/models/{modelId}/mediaVault/{photoId}` with mismatching `modelId`.
2. **Payload 2 (Shadow Admin Escalation)**: Writing `role: 'admin'` to `/users/{userId}` by an unprivileged user.
3. **Payload 3 (Arbitrary Model ID Injection)**: Document ID containing non-alphanumeric or path traversal characters `../models/evil`.
4. **Payload 4 (Oversized Audio Attack)**: Writing audioBase64 string exceeding maximum allocation payload.
5. **Payload 5 (Unbounded KeyFacts Array)**: Injecting 50,000 items in `leadMemory.keyFacts` to trigger read quota exhaustion.
6. **Payload 6 (Corrupt Chat Sender)**: Writing a chat message with sender `"hacker_bot"` not conforming to `enum ['user', 'model', 'system']`.
7. **Payload 7 (Missing Required Fields)**: Writing a model profile without `name` or `handle`.
8. **Payload 8 (Cross-Model Leak)**: Model A attempting to overwrite Model B's voice vault items.
9. **Payload 9 (Lead Memory Theft)**: Unauthenticated client querying all lead CRM memories without constraint.
10. **Payload 10 (Negative Price Attack)**: Submitting media item with negative unlock price or malformed number.
11. **Payload 11 (Timestamp Poisoning)**: Sending malformed non-string timestamp to crash date ordering.
12. **Payload 12 (Direct PII Exfiltration)**: Reading private user email without appropriate authentication or ownership.
