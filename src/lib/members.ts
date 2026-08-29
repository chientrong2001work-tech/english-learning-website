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

export interface MemberEntry {
  id: string;
  type: "email" | "phone";
  addedAt: Timestamp | null;
}

export interface LoginRecord {
  uid: string;
  email: string | null;
  phoneNumber: string | null;
  displayName: string | null;
  providers: string[];
  firstLoginAt: Timestamp | null;
  lastLoginAt: Timestamp | null;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

// Firestore document IDs can't contain "/"; email/phone never do, so they're
// used directly as the member doc ID — this also lets a signed-in user look
// up (get) just their own entry without a broader list permission.
export async function isMember(identifier: string): Promise<boolean> {
  const snap = await getDoc(doc(db, "members", identifier));
  return snap.exists();
}

export async function checkAccess(user: User): Promise<boolean> {
  if (user.email && (await isMember(normalizeEmail(user.email)))) return true;
  if (user.phoneNumber && (await isMember(user.phoneNumber))) return true;
  return false;
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

export async function listMembers(): Promise<MemberEntry[]> {
  const snap = await getDocs(collection(db, "members"));
  return snap.docs.map((d) => ({ id: d.id, type: d.data().type, addedAt: d.data().addedAt ?? null }));
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
    };
  });
}

export async function addMember(rawIdentifier: string, type: "email" | "phone"): Promise<void> {
  const identifier = type === "email" ? normalizeEmail(rawIdentifier) : rawIdentifier.trim();
  await setDoc(doc(db, "members", identifier), { type, addedAt: serverTimestamp() });
}

export async function removeMember(identifier: string): Promise<void> {
  await deleteDoc(doc(db, "members", identifier));
}

export function isAdminEmail(email: string | null | undefined): boolean {
  return Boolean(email && normalizeEmail(email) === ADMIN_EMAIL);
}
