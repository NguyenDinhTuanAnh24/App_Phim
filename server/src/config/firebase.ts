import * as admin from 'firebase-admin';
import * as path from 'path';
import * as fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

let firebaseInitialized = false;

try {
  const envServiceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  const envServiceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  const fallbackPath = path.join(__dirname, '../../firebase-service-account.json');

  let serviceAccountRaw: any = null;

  if (envServiceAccountJson) {
    serviceAccountRaw = JSON.parse(envServiceAccountJson);
  } else {
    const resolvedPath = envServiceAccountPath
      ? path.isAbsolute(envServiceAccountPath)
        ? envServiceAccountPath
        : path.join(process.cwd(), envServiceAccountPath)
      : fallbackPath;

    if (fs.existsSync(resolvedPath)) {
      serviceAccountRaw = JSON.parse(fs.readFileSync(resolvedPath, 'utf-8'));
    }
  }

  const serviceAccount: admin.ServiceAccount | null = serviceAccountRaw
    ? {
        projectId: serviceAccountRaw.project_id || serviceAccountRaw.projectId,
        clientEmail: serviceAccountRaw.client_email || serviceAccountRaw.clientEmail,
        privateKey: (serviceAccountRaw.private_key || serviceAccountRaw.privateKey || '').replace(/\\n/g, '\n'),
      }
    : null;

  if (!serviceAccount) {
    console.warn('[FIREBASE] Service account not found. Firebase features will be disabled.');
  } else if (
    !serviceAccount.projectId ||
    serviceAccount.projectId === 'YOUR_PROJECT_ID' ||
    !serviceAccount.clientEmail ||
    !serviceAccount.privateKey ||
    serviceAccount.privateKey.includes('...')
  ) {
    console.warn('[FIREBASE] Service account contains placeholders. Firebase features disabled.');
  } else if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    firebaseInitialized = true;
    console.log('[FIREBASE] Successfully initialized Firebase Admin SDK');
  }
} catch (error) {
  console.error('[FIREBASE] Error initializing Firebase:', error instanceof Error ? error.message : error);
  console.warn('[FIREBASE] Firebase features will be disabled.');
}

export const firebaseAdmin = firebaseInitialized ? admin : null;
export const isFirebaseEnabled = firebaseInitialized;
