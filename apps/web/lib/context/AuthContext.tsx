"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  type User,
} from "firebase/auth";
import { getClientAuth } from "@/lib/firebase/client";
import { createOrUpdateUserProfile, getUserProfile, promoteToAdmin } from "@/lib/firebase/firestore";
import type { UserProfile } from "@/lib/types";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  userProfile: UserProfile | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  isAdmin: false,
  userProfile: null,
  signInWithGoogle: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getClientAuth(), async (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);

      if (firebaseUser) {
        const tokenResult = await firebaseUser.getIdTokenResult();
        const adminClaim = tokenResult.claims.admin === true;
        setIsAdmin(adminClaim);

        await createOrUpdateUserProfile(firebaseUser.uid, {
          displayName: firebaseUser.displayName || "Anonymous",
          email: firebaseUser.email || "",
          avatarUrl: firebaseUser.photoURL || "",
        });

        // Auto-promote admin users to "admin" tier with unlimited access
        if (adminClaim) {
          await promoteToAdmin(firebaseUser.uid);
        }

        const profile = await getUserProfile(firebaseUser.uid);
        setUserProfile(profile);
      } else {
        setIsAdmin(false);
        setUserProfile(null);
      }
    });
    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(getClientAuth(), provider);
    } catch (err: unknown) {
      // If popup is blocked or closed, log but don't crash
      const error = err as { code?: string };
      if (error.code !== "auth/popup-closed-by-user") {
        console.error("Sign-in error:", err);
      }
    }
  };

  const signOut = async () => {
    await firebaseSignOut(getClientAuth());
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, userProfile, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
