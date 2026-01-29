
import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app';
import { getFirebaseConfig } from './config';

// This is a separate initialization for server-side actions.
// It ensures we don't conflict with client-side initialization.
export function initializeFirebaseApp(): FirebaseApp {
  const firebaseConfig = getFirebaseConfig();
  const appName = 'firebase-server-action-app';

  // Check if the app is already initialized
  const existingApp = getApps().find(app => app.name === appName);
  if (existingApp) {
    return existingApp;
  }
  
  // Initialize a new app if it doesn't exist
  return initializeApp(firebaseConfig, appName);
}

    