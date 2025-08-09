# Uhpenry Key Security Practices

## Private Key Storage

- All private keys are stored in a secure vault (KMS/HSM).
- Never store private keys in git.
- `.gitignore` is configured to prevent accidental commits.

## Rotation

- Keys are rotated every 6 months.
- `kid` format: `uhp-license-YYYYMMDD`.
- Old public keys remain available after rotation.

## Verification

- Public keys are available at `https://uhpenry.com/.well-known/uhpenry-keys.json`.
- Anyone can verify a license offline using Ed25519 + the `kid` from the license.

## Compromise Procedure

1. Revoke compromised key in `.well-known` file (mark as `"revoked": true`).
2. Rotate immediately.
3. Notify partners & update docs.
