import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  type AuthCredential,
  type ConfirmationResult,
  type User,
  FacebookAuthProvider,
  GoogleAuthProvider,
  RecaptchaVerifier,
  createUserWithEmailAndPassword,
  linkWithCredential,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { auth, facebookProvider, firebaseConfigured, googleProvider } from "../lib/firebase";
import { checkAccess, isAdminEmail, recordLogin } from "../lib/members";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  configured: boolean;
  isAdmin: boolean;
  authorized: boolean | null;
  // True once the login-history write (email/phone/provider/lastLoginAt) for
  // the current sign-in has landed in Firestore. Other code that writes to
  // the same users/{uid} doc (e.g. progress sync) should wait for this, so
  // it never races ahead and leaves that doc missing its identity fields.
  identitySynced: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithFacebook: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  sendPhoneCode: (phoneNumber: string, recaptchaContainerId: string) => Promise<ConfirmationResult>;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [identitySynced, setIdentitySynced] = useState(false);

  useEffect(() => {
    if (!firebaseConfigured) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) {
        setIsAdmin(false);
        setAuthorized(null);
        setIdentitySynced(false);
        setLoading(false);
        return;
      }
      const admin = isAdminEmail(u.email);
      setIsAdmin(admin);
      setIdentitySynced(false);
      (admin ? Promise.resolve(true) : checkAccess(u))
        .then(async (ok) => {
          setAuthorized(ok);
          if (ok) {
            await recordLogin(u).catch(() => {});
          }
          setIdentitySynced(true);
        })
        .catch(() => {
          setAuthorized(false);
          setIdentitySynced(true);
        })
        .finally(() => setLoading(false));
    });
    return unsubscribe;
  }, []);

  // When someone signs in with a provider whose account email is already
  // linked to a different provider (e.g. they signed up with Google, then
  // later try Facebook using the same email), Firebase refuses the sign-in
  // rather than silently creating a second account for the same person.
  // fetchSignInMethodsForEmail can't tell us which provider that is —
  // Firebase's email-enumeration protection makes it always return an
  // empty list — so instead we just try the other social provider we
  // support (Google<->Facebook, the two this app offers) and link its
  // credential onto that account. If the email turns out to be registered
  // via email/password instead, that attempt fails the same way and the
  // error propagates as-is, telling the user to sign in with that instead.
  async function signInWithProvider(provider: GoogleAuthProvider | FacebookAuthProvider) {
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      const code = err instanceof Object && "code" in err ? String((err as { code: unknown }).code) : "";
      if (code !== "auth/account-exists-with-different-credential") throw err;

      const pendingCredential: AuthCredential | null =
        provider instanceof FacebookAuthProvider
          ? FacebookAuthProvider.credentialFromError(err as Parameters<typeof FacebookAuthProvider.credentialFromError>[0])
          : GoogleAuthProvider.credentialFromError(err as Parameters<typeof GoogleAuthProvider.credentialFromError>[0]);
      if (!pendingCredential) throw err;

      const otherProvider = provider instanceof FacebookAuthProvider ? googleProvider : facebookProvider;
      const result = await signInWithPopup(auth, otherProvider);
      await linkWithCredential(result.user, pendingCredential);
    }
  }

  async function signInWithGoogle() {
    await signInWithProvider(googleProvider);
  }

  async function signInWithFacebook() {
    await signInWithProvider(facebookProvider);
  }

  async function signInWithEmail(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password);
  }

  async function signUpWithEmail(email: string, password: string) {
    await createUserWithEmailAndPassword(auth, email, password);
  }

  async function sendPhoneCode(phoneNumber: string, recaptchaContainerId: string) {
    const verifier = new RecaptchaVerifier(auth, recaptchaContainerId, { size: "invisible" });
    return signInWithPhoneNumber(auth, phoneNumber, verifier);
  }

  async function logOut() {
    await signOut(auth);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        configured: firebaseConfigured,
        isAdmin,
        authorized,
        identitySynced,
        signInWithGoogle,
        signInWithFacebook,
        signInWithEmail,
        signUpWithEmail,
        sendPhoneCode,
        logOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
