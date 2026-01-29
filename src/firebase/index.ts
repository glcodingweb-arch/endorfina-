import { getFirebaseConfig } from './config';
import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

/**
 * Initializes and returns a Firebase app instance.
 *
 * This function handles the initialization of the Firebase app, ensuring that it is
 * only initialized once (singleton pattern). This is crucial for performance and to
gid
 * avoid re-initialization errors.
 *
 * @returns The initialized Firebase app instance.
 */
function initializeFirebaseApp(): FirebaseApp {
  const firebaseConfig = getFirebaseConfig();
  if (getApps().length === 0) {
    return initializeApp(firebaseConfig);
  }
  return getApp();
}

/**
 * Initializes Firebase services and returns instances for the app, Firestore, and Auth.
 *
 * This function serves as a centralized point for accessing Firebase services.
 * It ensures that the Firebase app is initialized before attempting to get the
 * service instances.
 *
 * @returns An object containing the Firebase app, Firestore, and Auth instances.
 */
export function initializeFirebase(): {
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
} {
  const firebaseApp = initializeFirebaseApp();
  const firestore = getFirestore(firebaseApp);
  const auth = getAuth(firebaseApp);

  return { firebaseApp, firestore, auth };
}

export * from './provider';
export { useCollection } from './firestore/use-collection';
export { useDoc } from './firestore/use-doc';
export { useUser } from './auth/use-user';
