'use client';

import React, { useState, useEffect, createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFirebaseConfig } from '@/firebase/config';
import { Loader2 } from 'lucide-react';

/**
 * Defines the shape of the context that will be provided to the app.
 *
 * This interface includes the Firebase app instance, as well as the Firestore and
 * Auth service instances.
 */
interface FirebaseContextType {
  app: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null;
}

/**
 * The Firebase context object.
 *
 * This context will be used to provide the Firebase instances to the components.
 * It is initialized with a default value of `null` for all properties.
 */
const FirebaseContext = createContext<FirebaseContextType>({
  app: null,
  firestore: null,
  auth: null,
});

// Logic moved from index.ts to break circular dependency
function initializeFirebaseApp(): FirebaseApp {
  const firebaseConfig = getFirebaseConfig();
  if (getApps().length === 0) {
    return initializeApp(firebaseConfig);
  }
  return getApp();
}

function initializeFirebase(): {
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
} {
  const firebaseApp = initializeFirebaseApp();
  const firestore = getFirestore(firebaseApp);
  const auth = getAuth(firebaseApp);

  return { firebaseApp, firestore, auth };
}


/**
 * A provider component that makes Firebase services available to the component tree.
 *
 * This component initializes Firebase on the client side and provides the instances
 * to the rest of the application via the `FirebaseContext`.
 * It ensures children are only rendered after Firebase is initialized.
 *
 * @param {object} props - The properties for the component.
 * @param {ReactNode} props.children - The child components to render.
 * @returns A JSX element that provides the Firebase context to its children.
 */
export function FirebaseProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [services, setServices] = useState<FirebaseContextType>({
    app: null,
    firestore: null,
    auth: null,
  });

  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize Firebase on the client
    const { firebaseApp, firestore, auth } = initializeFirebase();
    setServices({ app: firebaseApp, firestore, auth });
    setIsInitialized(true);
  }, []);

  if (!isInitialized) {
      return (
          <div className="flex h-screen items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
      );
  }

  // Render children only after Firebase is initialized
  return (
    <FirebaseContext.Provider value={services}>
      {children}
    </FirebaseContext.Provider>
  );
}

/**
 * A hook that provides access to the Firebase context.
 *
 * This hook is a convenience wrapper around `useContext(FirebaseContext)`.
 * It ensures that the context is not null and provides type-safe access to the
 * Firebase instances.
 *
 * @returns The Firebase context, which includes the app, Firestore, and Auth instances.
 * @throws {Error} If the hook is used outside of a `FirebaseProvider`.
 */
export function useFirebase() {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
}

/**
 * A hook for accessing the Firebase App instance.
 *
 * This hook provides a convenient way to get the Firebase app instance from the context.
 *
 * @returns The Firebase app instance.
 */
export function useFirebaseApp() {
  return useFirebase().app;
}

/**
 * A hook for accessing the Firestore instance.
 *
 * This hook provides a convenient way to get the Firestore service instance from the context.
 *
 * @returns The Firestore instance, or null if not yet initialized.
 */
export function useFirestore() {
  return useFirebase().firestore;
}

/**
 * A hook for accessing the Firebase Auth instance.
 *
 * This hook provides a convenient way to get the Auth service instance from the context.
 *
 * @returns The Firebase Auth instance, or null if not yet initialized.
 */
export function useAuth() {
  return useFirebase().auth;
}
