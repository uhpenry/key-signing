# Uhpenry Key Management (Transparency Release)

This repository contains Uhpenry's **exact key generation, rotation, and publication scripts**.

We open-source this for **trust and auditability**.  
No private keys are stored here — only the public parts and the code showing how we generate them.

## How it works

- **Key algorithm:** Ed25519 (modern, secure, and widely supported)
- **Key rotation:** Every 6 months, a new keypair is generated and a new public key is published.
- **Key ID format:** `uhp-license-YYYYMMDD`
- **Verification:** Anyone can verify a license offline using the published public key.

## Security model

- Security depends **only** on private key secrecy, not on algorithm secrecy.
- Private keys are stored in a secure vault (never in git).

## Folders

- `lib/` – Core logic
- `scripts/` – CLI scripts we run internally
- `public/.well-known/uhpenry-keys.json` – The published public key list
- `examples/` – Show how verification works in Node, Python, Go
- `docs/` – Security notes

## Important

This code is for transparency. It is **not a public API** and is not supported for production use outside Uhpenry.
