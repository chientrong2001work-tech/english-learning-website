import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  type Timestamp,
} from "firebase/firestore";
import type { User } from "firebase/auth";
import { ADMIN_EMAIL, db } from "./firebase";

export interface BlockedEntry {
  id: string;
  type: "email" | "phone";
  addedAt: Timestamp | null;
}

export interface ProgressSummary {
  knownCount: number;
  totalVocab: number;
  placementLevel: string | null;
  currentLevel: string | null;
  currentLevelKnown: number;
  currentLevelTarget: number;
  currentLevelPassed: boolean;
}

export interface LoginRecord {
  uid: string;
  email: string | null;
  phoneNumber: string | null;
  displayName: string | null;
  providers: string[];
  firstLoginAt: Timestamp | null;
  lastLoginAt: Timestamp | null;
  progress: ProgressSummary | null;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

// Firestore document IDs can't contain "/"; email/phone never do, so they're
// used directly as the blocked doc ID — this also lets a signed-in user look
// up (get) just their own entry without a broader list permission, to check
// whether they themselves are blocked.
async function isBlockedIdentifier(identifier: string): Promise<boolean> {
  const snap = await getDoc(doc(db, "blocked", identifier));
  return snap.exists();
}

// Access is open by default — anyone who signs in gets in — unless the admin
// has explicitly blocked their email or phone number.
export async function checkAccess(user: User): Promise<boolean> {
  if (user.email && (await isBlockedIdentifier(normalizeEmail(user.email)))) return false;
  if (user.phoneNumber && (await isBlockedIdentifier(user.phoneNumber))) return false;
  return true;
}

export async function recordLogin(user: User): Promise<void> {
  const ref = doc(db, "users", user.uid);
  const existing = await getDoc(ref);
  await setDoc(
    ref,
    {
      email: user.email ?? null,
      phoneNumber: user.phoneNumber ?? null,
      displayName: user.displayName ?? null,
      providers: user.providerData.map((p) => p.providerId),
      firstLoginAt: existing.exists() ? existing.data().firstLoginAt : serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function listLoginRecords(): Promise<LoginRecord[]> {
  const snap = await getDocs(collection(db, "users"));
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      uid: d.id,
      email: data.email ?? null,
      phoneNumber: data.phoneNumber ?? null,
      displayName: data.displayName ?? null,
      providers: data.providers ?? [],
      firstLoginAt: data.firstLoginAt ?? null,
      lastLoginAt: data.lastLoginAt ?? null,
      progress: data.progress ?? null,
    };
  });
}

// Called whenever a signed-in learner's local progress (known words, level
// scores) changes, so the admin panel can show where they've gotten to.
// Merges into the same per-uid doc as recordLogin — same self-write rule.
export async function syncProgress(uid: string, progress: ProgressSummary): Promise<void> {
  await setDoc(doc(db, "users", uid), { progress }, { merge: true });
}

export async function listBlocked(): Promise<BlockedEntry[]> {
  const snap = await getDocs(collection(db, "blocked"));
  return snap.docs.map((d) => ({ id: d.id, type: d.data().type, addedAt: d.data().addedAt ?? null }));
}

export async function blockIdentifier(rawIdentifier: string, type: "email" | "phone"): Promise<void> {
  const identifier = type === "email" ? normalizeEmail(rawIdentifier) : rawIdentifier.trim();
  await setDoc(doc(db, "blocked", identifier), { type, addedAt: serverTimestamp() });
}

export async function unblockIdentifier(identifier: string): Promise<void> {
  await deleteDoc(doc(db, "blocked", identifier));
}

export function isAdminEmail(email: string | null | undefined): boolean {
  return Boolean(email && normalizeEmail(email) === ADMIN_EMAIL);
}
