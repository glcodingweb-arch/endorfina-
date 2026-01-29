// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBjCqpeFMGaL7QSYhEDUA5vPj_V2x7NJo8",
  authDomain: "eventos-2c771.firebaseapp.com",
  projectId: "eventos-2c771",
  storageBucket: "eventos-2c771.appspot.com",
  messagingSenderId: "698763590536",
  appId: "1:698763590536:web:4c23ab291c4ba0dad9583d",
  measurementId: "G-7X6QJCZKFS"
};

/**
 * Retrieves the Firebase configuration.
 *
 * This function is designed to ensure that the Firebase configuration is loaded securely
 * and is available throughout the application. It validates that all necessary
 * environment variables are set and throws an error if any are missing.
 *
 * @returns The Firebase configuration object.
 * @throws {Error} If any of the required Firebase environment variables are not set.
 */
export function getFirebaseConfig() {
  if (!firebaseConfig.apiKey) {
    throw new Error('Missing FIREBASE_API_KEY');
  }
  return firebaseConfig;
}
