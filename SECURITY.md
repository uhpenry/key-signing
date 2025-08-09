# Uhpenry Key Security Practices

## Private Key Storage

- All private keys are stored securely.
- Never store private keys in git or any public repository.
- `.gitignore` is configured to prevent accidental commits of sensitive files.
- Access to private keys is restricted to minimal necessary services and personnel.

## Key Generation and Algorithm

- Keys use Ed25519 curve for EdDSA signatures, chosen for its security, efficiency, and broad library support.
- Keys are generated with the `extractable: true` flag only for controlled export during rotation or backup.
- Key IDs (`kid`) include timestamps (format: `uhp-license-YYYYMMDD`) for traceability.

## Rotation

- Keys are rotated on a strict 6-month schedule to limit exposure in case of compromise.
- Old public keys remain accessible in `.well-known` for signature verification of previously issued licenses.
- Rotation process is performed on a dedicated `rotate` branch to maintain clean audit trails.
- After rotation, immediate deployment and publishing of new public keys occur to avoid service disruption.

## Verification

- Public keys are hosted under `https://uhpenry.com/.well-known/uhp-{signer/integrity}-*.public.json` following JWKS standards.
- License verification is fully offline-capable using the Ed25519 algorithm and the corresponding `kid`.
- Clients should always use the `kid` in the license payload to select the correct key for verification.
- Verification libraries in major languages (Node.js, Python, Go) are maintained and documented for interoperability.

## Compromise Procedure

1. Mark the compromised key as `"revoked": true` in the `.well-known` JWKS file immediately.
2. Issue an emergency key rotation with a new key pair.
3. Notify all partners and affected users with clear guidance.
4. Revoke any licenses signed by the compromised key if feasible.
5. Conduct a root cause analysis and review security policies.

## Additional Security Recommendations

- Use HTTPS strictly for all key and license distribution endpoints.
- Implement rate limiting and monitoring on key rotation APIs and endpoints.
- Log all key generation and rotation activities with immutable audit trails.
- Encourage clients to cache public keys securely and periodically refresh from `.well-known`.
- Educate developers and partners about the importance of key security and proper verification procedures.

## Disclaimer

While this system is designed with strong security principles, no system can guarantee absolute security. Regular security reviews and improvements are part of our ongoing commitment.

---
