import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  type ConfirmationResult,
  type User,
  RecaptchaVerifier,
  onAuthStateChanged,
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
  sendPhoneCode: (phoneNumber: string, recaptchaContainerId: string) => Promise<ConfirmationResult>;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Remembers the last uid that passed checkAccess, so a returning user who
// opens the app offline (no way to re-run the Firestore blocked-list check)
// gets back into content they were already cleared for, instead of being
// bounced to the access-denied screen just because the check itself
// couldn't run. A brand-new sign-in still requires a real, online check.
const LAST_AUTHORIZED_UID_KEY = "engup-last-authorized-uid";

function rememberAuthorized(uid: string) {
  try {
    localStorage.setItem(LAST_AUTHORIZED_UID_KEY, uid);
  } catch {
    // ignore write errors (e.g. private browsing storage limits)
  }
}

function wasPreviouslyAuthorized(uid: string): boolean {
  try {
    return localStorage.getItem(LAST_AUTHORIZED_UID_KEY) === uid;
  } catch {
    return false;
  }
}

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
            rememberAuthorized(u.uid);
            await recordLogin(u).catch(() => {});
          }
          setIdentitySynced(true);
        })
        .catch(() => {
          // checkAccess couldn't run at all (most likely offline) — fall
          // back to whether this account was cleared last time it could.
          setAuthorized(admin || wasPreviouslyAuthorized(u.uid));
          setIdentitySynced(true);
        })
        .finally(() => setLoading(false));
    });
    return unsubscribe;
  }, []);

  async function signInWithGoogle() {
    await signInWithPopup(auth, googleProvider);
  }

  async function signInWithFacebook() {
    await signInWithPopup(auth, facebookProvider);
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
