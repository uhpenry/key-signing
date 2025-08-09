import path from 'path';
import * as jose from 'jose';
import { promises as fs } from 'fs';

const ENV_FILE_PATH = path.join(process.cwd(), '.env');
const WELL_KNOWN_DIR = path.join(process.cwd(), './public/.well-known');

/**
 * Formats the current date as a string in YYYYMMDD format.
 *
 * @returns {string} Current date formatted as 'YYYYMMDD'.
 */
export const formatDate = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0'); // 0-indexed months, so +1
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
};

/**
 * Generates an Ed25519 key pair using the jose library.
 * The keys are created as extractable to allow export.
 *
 * @async
 * @function generateEd25519Key
 * @returns {Promise<{publicJwk: jose.JWK, privateJwk: jose.JWK}>}
 *   Resolves with the public and private keys exported as JWK objects.
 */
const generateEd25519Key = async (): Promise<{
  publicJwk: jose.JWK;
  privateJwk: jose.JWK;
}> => {
  // Generate EdDSA key pair with extractable keys
  const { publicKey, privateKey } = await jose.generateKeyPair('EdDSA', {
    extractable: true,
  });

  // Export keys to JWK (JSON Web Key) format
  const publicJwk = await jose.exportJWK(publicKey);
  const privateJwk = await jose.exportJWK(privateKey);

  // Optionally add algorithm and usage metadata for clarity
  publicJwk.alg = 'EdDSA';
  publicJwk.use = 'sig';
  privateJwk.alg = 'EdDSA';
  privateJwk.use = 'sig';

  return { publicJwk, privateJwk };
};

/**
 * Write or update .env file with given variables.
 * If .env exists, it updates variables; otherwise, creates new.
 */
export const updateEnvFile = async (vars: Record<string, string>) => {
  let envContent = '';
  try {
    envContent = await fs.readFile(ENV_FILE_PATH, 'utf8');
  } catch {
    // File does not exist, will create new
  }

  // Split lines and filter out old vars if present
  const lines = envContent.split('\n').filter((line) => {
    return !Object.keys(vars).some((key) => line.startsWith(key + '='));
  });

  // Add or replace vars
  for (const [key, val] of Object.entries(vars)) {
    lines.push(`${key}='${val}'`);
  }

  await fs.writeFile(ENV_FILE_PATH, lines.join('\n') + '\n', 'utf8');
  console.log(`✅ .env file updated at ${ENV_FILE_PATH}`);
};

/**
 * Generates an Ed25519 key pair, then saves the public key in the
 * `.well-known` directory under `./public/.well-known/{name}.public.json`,
 * and saves the private key to the project root as `{name}.private.json`.
 *
 * The public key file is safe to commit and share; the private key must be kept secret.
 *
 * @async
 * @function generateAndSaveKeys
 * @param {string} name - Base filename (without extension) for saving keys.
 * @returns {Promise<void>}
 */
export const generateAndSaveKeys = async (name: string): Promise<string> => {
  const { privateJwk, publicJwk } = await generateEd25519Key();

  // Prepare directory for public keys (create if not exists)
  await fs.mkdir(WELL_KNOWN_DIR, { recursive: true });

  // Write the public key file with "keys" array wrapper for JWKS standard
  const publicKeyPath = path.join(WELL_KNOWN_DIR, `${name}.public.json`);
  await fs.writeFile(
    publicKeyPath,
    JSON.stringify({ keys: [publicJwk] }, null, 2),
    'utf8'
  );
  console.log(`✅ Public key saved to ${publicKeyPath}`);

  // Write the private key file (do NOT commit this)
  const privateKeyPath = path.join(process.cwd(), `${name}.private.json`);
  await fs.writeFile(
    privateKeyPath,
    JSON.stringify(privateJwk, null, 2),
    'utf8'
  );
  console.log(`🔒 Private key saved to ${privateKeyPath} (keep this secret!)`);

  // Return minified private key JSON string for env
  return JSON.stringify(privateJwk);
};
