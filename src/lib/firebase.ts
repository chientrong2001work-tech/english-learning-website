import { initializeApp, type FirebaseApp } from "firebase/app";
import { FacebookAuthProvider, GoogleAuthProvider, type Auth, getAuth } from "firebase/auth";

// These come from the Firebase project's Web App config (Project settings ->
// General -> Your apps). They are NOT secret — Firebase's security model
// relies on Auth + security rules, not on hiding this config — so it is safe
// for them to end up in the built client bundle. They are read from env vars
// (injected at build time, see .github/workflows/deploy.yml) so the project
// can be reconfigured without touching code.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const firebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

// initializeApp/getAuth throw synchronously when the config is missing/invalid,
// which would crash the whole app before React can even render the "not
// configured yet" message. Only initialize them once real config is present.
let app: FirebaseApp | null = null;
let authInstance: Auth | null = null;
if (firebaseConfigured) {
  app = initializeApp(firebaseConfig);
  authInstance = getAuth(app);
}

export { app };
export const auth = authInstance as Auth;
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();
