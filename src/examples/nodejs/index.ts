import { JWK, jwtVerify } from 'jose';
import { hashDeterministicJson } from '../../lib/helpers';

// This is the transaction data you want to verify.
// You can get this JSON object from your snapshot page, e.g.:
// uhpenry.com/snapshot/{_id}
// Make sure this snapshot is public if you want others to verify it.
const data = {
  boothId: '...',
  userId: '...',
  amount: 5000,
  status: 'paid',
  // ... add all other relevant fields here
};

// Public keys associated with the tokens, identified by their 'kid'
// Make sure these keys are taken from Uhpenry .well-known directory
const integrityPublicKey = {
  keys: [
    {
      /**/
    },
  ],
} as JWK;

const signerPublicKey = {
  keys: [
    {
      /**/
    },
  ],
} as JWK;

// Compute a deterministic hash of the transaction data.
// This ensures the same data always produces the same hash.
const transactionHash = hashDeterministicJson(data);
console.log('Step 1: Deterministic hash of transaction data:', transactionHash);

const verifyTransactionFlow = async (
  integrityToken: string,
  signerToken: string
) => {
  console.log('Starting full transaction verification flow...');

  // Step 2: Verify the integrity token signature and get its payload
  const { payload: integrityPayload } = await jwtVerify(
    integrityToken,
    integrityPublicKey
  );
  console.log('Step 2: Integrity token payload:', integrityPayload);

  // Step 3: Verify the signer token signature and get its payload
  const { payload: signerPayload } = await jwtVerify(
    signerToken,
    signerPublicKey
  );
  console.log('Step 3: signer token payload:', signerPayload);

  // Step 4: Ensure the hashes inside both tokens match the recomputed transaction hash
  if (integrityPayload.hash !== transactionHash) {
    throw new Error(
      `Integrity token hash mismatch!\nToken hash: ${integrityPayload.hash}\nExpected hash: ${transactionHash}`
    );
  }
  console.log('Step 4: Integrity token hash matches computed hash.');

  if (signerPayload.hash !== transactionHash) {
    throw new Error(
      `signer token hash mismatch!\nToken hash: ${signerPayload.hash}\nExpected hash: ${transactionHash}`
    );
  }
  console.log('Step 4: signer token hash matches computed hash.');

  // Step 5: Confirm that both tokens carry the same hash value
  if (signerPayload.hash !== integrityPayload.hash) {
    throw new Error('Hash mismatch between signer and integrity tokens!');
  }
  console.log('Step 5: signer and Integrity tokens hashes match.');

  console.log(
    'Verification succeeded! Transaction is authentic and untampered.'
  );
  return {
    valid: true,
    hash: transactionHash,
    integrityPayload,
    signerPayload,
  };
};

// Example usage — replace example tokens below with real tokens you want to verify
(async () => {
  try {
    const exampleIntegrityToken = 'eyJ...'; // Replace with real integrity token JWT
    const exampleSignerToken = 'eyJ...'; // Replace with real signer token JWT

    const result = await verifyTransactionFlow(
      exampleIntegrityToken,
      exampleSignerToken
    );

    if (result.valid) {
      console.log('Full verification result:', result);
    }
  } catch (error) {
    console.error('Verification failed:', error);
  }
})();
