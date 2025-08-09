import * as jose from 'jose';
import { JsonValue } from '../types';
import { describe, test } from 'vitest';
import { hashDeterministicJson } from '../helpers';

type KeyPair = {
  privateKey: CryptoKey;
  publicKey: CryptoKey;
};

const transaction = {
  acceptsRefunds: 'yes',
  amount: 5000,
  applicationFee: 30000,
  applicationPercentage: 6,
  boothId: 'sd7dtxz1k9e0cg6nyhwc8tkynx7mdev7',
  checkoutId: 'r1791eyef1sr34ehtj0ywe7jm17n99ay',
  code: 'UHP-WMrV-808t',
  commit: {
    commitAt: '2025-07 -19T23:13:14Z',
    committer: 'Rocky Essel',
    isVerified: true,
    message: 'Initial commit',
    name: 'main',
    parentSha: '',
    sha: '316cb9f3aa11997fb53ecac0addb654a441f259d',
    verificationReason: 'valid',
    verifiedAt: '2025-07-19T23:13:14Z',
  },
  completedAt: 1754652555920,
  couponCode: '',
  disputePeriod: 7,
  folderStructure:
    '[{"name":".gitignore","size":2152},{"name":"LICENSE","size":16726},{"name":"README.md","size":9}]',
  hasAnyRefunds: false,
  initializeAt: 1754652548809,
  isCompleted: true,
  isLocked: true,
  isMain: true,
  isReported: false,
  isSuccess: true,
  metadata: { accessMethod: 'download' },
  netAmount: 453721,
  originalAmount: 5000,
  paymentIntentId: 'pi_3RtoTLFqw8igH6h40CiF9TRZ',
  paymentType: 'one-time',
  publicId: 'CgNWItHeOBsBQvV-iODaJ',
  refundConditions: [
    'You report a critical issue or defect that prevents the product from working as described, and we’re unable to resolve it.',
    'You accidentally purchased the wrong product and have not accessed or unlocked the repository.',
    'You reach out within 7 days of purchase with a valid reason.',
  ],
  refundPolicy: `We aim to provide high-quality, gated-source software for developers who want production-ready tools. Howev....`,
  schedule: { isActive: false, isDone: true },
  sig: 'bf2679db0d45e625a44d58dbfd07fa8450e16594e824dbc4b772cd1a6a2e0d7c',
  snapshot:
    '{"_creationTime":1754379881844.76,"_id":"k171n27h1hqgcn1fy1944x9yw57n2de2"}',
  snapshotCompletedAt: 1754652555920,
  snapshotCreatedAt: 1754652512222,
  snapshotExpireAt: 1754656112222,
  snapshotStartAt: 1754652512222,
  status: 'paid',
  stripeFee: 16279,
  termsAndConditions: 'V2VsY29tZSwgYW5kIHRo...UK',
  type: 'projects',
  userId: 'kh718fgdsd9tzajreeb5ey876s7kxez5',
};

const signFullFlow = async (
  transaction: JsonValue,
  integrityKeys: KeyPair,
  licenseKeys: KeyPair
) => {
  // Step 1: Hash the transaction deterministically
  const transactionHash = hashDeterministicJson(transaction);
  console.log('Transaction hash:', transactionHash);

  // Step 2: Sign the hash with Integrity Private Key -> integrity token
  const integrityToken = await new jose.SignJWT({ hash: transactionHash })
    .setProtectedHeader({ alg: 'EdDSA', kid: 'integrity-key' })
    .setIssuedAt()
    .setIssuer('uhpenry.com')
    .setSubject('transaction-integrity')
    .sign(integrityKeys.privateKey);
  console.log('Integrity Token:', integrityToken);

  // Step 3: Sign the same hash with License Private Key -> license token
  // (The license token payload contains the same hash for verification)
  const licenseToken = await new jose.SignJWT({ hash: transactionHash })
    .setProtectedHeader({ alg: 'EdDSA', kid: 'license-key' })
    .setIssuedAt()
    .setIssuer('uhpenry.com')
    .setSubject('transaction-license')
    .sign(licenseKeys.privateKey);
  console.log('License Token:', licenseToken);

  // === Verification Section ===

  // Verify License Token
  const { payload: verifiedLicensePayload } = await jose.jwtVerify(
    licenseToken,
    licenseKeys.publicKey
  );
  console.log('Verified License Token Payload:', verifiedLicensePayload);

  // Verify Integrity Token
  const { payload: verifiedIntegrityPayload } = await jose.jwtVerify(
    integrityToken,
    integrityKeys.publicKey
  );
  console.log('Verified Integrity Token Payload:', verifiedIntegrityPayload);

  // Validate that both tokens contain the same hash
  if (verifiedLicensePayload.hash !== verifiedIntegrityPayload.hash) {
    throw new Error('Hash mismatch between license and integrity tokens!');
  }

  return {
    transactionHash,
    integrityToken,
    licenseToken,
  };
};

const verifyFullFlow = async (
  transaction: JsonValue,
  integrityToken: string,
  licenseToken: string,
  integrityPublicKey: CryptoKey,
  licensePublicKey: CryptoKey
) => {
  // Step 1: Hash the transaction deterministically
  const transactionHash = hashDeterministicJson(transaction);

  // Step 2: Verify integrity token signature & payload
  const { payload: integrityPayload } = await jose.jwtVerify(
    integrityToken,
    integrityPublicKey
  );

  // Step 3: Verify license token signature & payload
  const { payload: licensePayload } = await jose.jwtVerify(
    licenseToken,
    licensePublicKey
  );

  // Step 4: Check that hashes in tokens match recomputed hash
  if (integrityPayload.hash !== transactionHash) {
    throw new Error('Integrity token hash does not match transaction hash!');
  }
  if (licensePayload.hash !== transactionHash) {
    throw new Error('License token hash does not match transaction hash!');
  }

  // Step 5: Check that both tokens contain the same hash
  if (licensePayload.hash !== integrityPayload.hash) {
    throw new Error('Hash mismatch between license and integrity tokens!');
  }

  return {
    valid: true,
    transactionHash,
    integrityPayload,
    licensePayload,
  };
};

describe('Uhpenry Key Management Tests', () => {
  // Test signing a license payload and verifying it
  test('Full Life-Cycle', async () => {
    // Generate Ed25519 keys for integrity and license
    const integrityKeys = await jose.generateKeyPair('EdDSA', {
      extractable: true,
    });
    const licenseKeys = await jose.generateKeyPair('EdDSA', {
      extractable: true,
    });
    const result = await signFullFlow(transaction, integrityKeys, licenseKeys);

    console.log('Hash:', result.transactionHash);
    console.log('Integrity Token:', result.integrityToken);
    console.log('License Token:', result.licenseToken);

    const result_ = await verifyFullFlow(
      transaction,
      result.integrityToken,
      result.licenseToken,
      integrityKeys.publicKey,
      licenseKeys.publicKey
    );

    console.log('Verification Result:', result_);
  });
});
