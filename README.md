# Uhpenry Key Management (Transparency Release)

This repository contains Uhpenry's **exact key generation, rotation, and publication scripts**.

We open-source this for **trust and auditability**.  
No private keys are stored here — only the public parts and the code showing how we generate them.

## How it works

- **Key algorithm:** Ed25519 (modern, secure, and widely supported)
- **Key rotation:** Every 6 months, a new keypair is generated and a new public key is published.
- **Key ID format:** `uhp-license-YYYYMMDD`
- **Verification:** Anyone can verify a license offline using the published public key.
- **Rotation workflow:** Key rotations are done on the `rotate` branch and merged into `main` every 6 months to maintain clear history and operational safety.

## Keys and their purposes

Uhpenry uses two distinct Ed25519 key pairs, each serving a specific role in the platform’s security model:

1. **License Signer Key**

   - This key pair is used to cryptographically sign licenses issued on the platform.
   - The private key is held securely by Uhpenry and never exposed.
   - The corresponding public key is published so that anyone—developers, customers, or partners—can verify the authenticity and integrity of licenses offline without contacting Uhpenry servers.
   - This ensures trust in license validity and prevents unauthorized license creation or tampering.

2. **SnapCharge (Transaction Integrity) Key**
   - This separate key pair is dedicated to signing SnapCharge objects, which represent transactional snapshots including refund data, state, and other details.
   - By signing transactions independently from licensing keys, we create a clear cryptographic separation of concerns, improving security.
   - The SnapCharge public key is also published, enabling users or auditors to independently verify that transaction data has not been altered after signing.
   - This layered approach strengthens data integrity and user confidence while allowing flexibility to evolve transaction verification mechanisms (such as future blockchain integration).

## Why open-source?

Transparency builds trust. By publishing the exact code and public keys, anyone can audit how Uhpenry generates and rotates keys.  
This removes any hidden “black box” concerns and ensures users and partners have confidence in our system’s integrity.

## Security model

- Security depends **only** on private key secrecy, not on algorithm secrecy.
- Private keys are stored in a secure vault (never in git).

## Folders

- `lib/` – Core logic
- `scripts/` – CLI scripts we run internally
- `public/.well-known/uhp-{signer/integrity}-*.public.json` – The published public key list
- `examples/` – Show how verification works in Node, Python, Go
- `docs/` – Security notes

## Important

This code is for transparency. It is **not a public API** and is not supported for production use outside Uhpenry.
