# SECURITY

This document describes the security model, recommended storage, rotation and incident response for the Uhpenry key & signing utilities.

> **Important:** This repository contains **no private keys**. Publishing code does not reduce safety if you follow the guidance below.

## Threat model (brief)

- **We protect integrity** of transaction objects and license certificates by signing them with a private key.
- **The private key is secret** — compromise of the private key allows forging licenses.
- Public disclosure of the key _generation code_ is acceptable; secrecy must be limited to private keys.

## Recommendations (must-haves)

1. **Never commit private keys.** Use `.gitignore` + CI checks to prevent accidental commits.
2. **Use a Key Management Service** (KMS/HSM) for production private keys (AWS KMS, GCP KMS, Azure Key Vault).
3. **Rotate keys every 6 months** (recommended). Keep older public keys in `.well-known` for verification of old signatures. Do not delete public keys needed to verify still-valid transactions.
4. **Retain public keys for at least 12 months** after rotation to allow verification of archived licenses.
5. **Audit all signing operations.** Log who/what/time/kid for each signing action (audit log).
6. **CI gate** pushes to the public repo and ensure no secrets are in repo history (use pre-commit and secret-scan).
7. **Revoke compromised keys:** publish a revocation flag in `.well-known` and notify affected parties.

## Secure storage guidance

- **Production:** Keep private keys in KMS and perform signing via KMS API (do not export raw key material). Store `kid` → KMS-reference mapping in an access-controlled store.
- **Development:** Use local files only on dev machines. Protect with file permissions (`600`) and ensure `keys/private/` is gitignored.
- **Backups:** If you must back up private keys, encrypt the backups and protect the encryption keys with KMS.

## When a key is compromised

1. Immediately mark key as revoked in `.well-known` and `current_kid` should reflect a safe key.
2. Rotate to a new key pair (generate new `kid`).
3. Re-issue any licenses that must be replaced.
4. Publish incident summary and mitigation steps for affected parties.

## Reporting vulnerabilities

If you find a security issue, please contact: `security@uhpenry.com` (or [link to contact]).
