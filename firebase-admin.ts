import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
function getAdminApp() {
  if (getApps().length) return getApps()[0];
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON belum disetel');
  const serviceAccount = JSON.parse(raw);
  return initializeApp({ credential: cert(serviceAccount) });
}
export function adminAuth() { return getAuth(getAdminApp()); }
export function db() { return getFirestore(getAdminApp()); }
export async function requireUser(request: Request) {
  const header = request.headers.get('authorization') || '';
  if (!header.startsWith('Bearer ')) throw new Error('AUTH_REQUIRED');
  return adminAuth().verifyIdToken(header.slice(7));
}
export function isDeveloper(uid: string) {
  return (process.env.ADMIN_UIDS || '').split(',').map(x => x.trim()).filter(Boolean).includes(uid);
}
