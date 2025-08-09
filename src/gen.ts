import { formatDate, generateAndSaveKeys, updateEnvFile } from './lib/keygen';

const main = async (): Promise<void> => {
    const dateString = formatDate();
    
    
  const signerBaseName = `uhp-signer-${dateString}`;
  const integrityBaseName = `uhp-integrity-${dateString}`;

  // Generate signer keys & save files
  const signerPrivateKey = await generateAndSaveKeys(signerBaseName);

  // Generate integrity keys & save files
  const integrityPrivateKey = await generateAndSaveKeys(integrityBaseName);

  // Write both private keys to .env as minified strings
  await updateEnvFile({ UHPENRY_SIGNER_KEY: signerPrivateKey, UHPENRY_INTEGRITY_KEY: integrityPrivateKey });
};

main().catch((err) => {
  console.error('❌ Error generating keys:', err);
  process.exit(1);
});
