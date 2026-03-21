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
  signInWithRedirect,
  getRedirectResult,
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

  // Handle redirect result on page load (for in-app browsers that don't support popups)
  useEffect(() => {
    getRedirectResult(getClientAuth()).catch((err) => {
      console.error("Redirect sign-in error:", err);
    });
  }, []);

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
    const auth = getClientAuth();

    // Detect in-app browsers (LINE, Instagram, Facebook, etc.) that don't support popups
    const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
    const isInAppBrowser = /Line|LIFF|Instagram|FBAN|FBAV|Twitter|MicroMessenger/i.test(ua);

    if (isInAppBrowser) {
      // Use redirect for in-app browsers where popups are blocked
      await signInWithRedirect(auth, provider);
      return;
    }

    try {
      await signInWithPopup(auth, provider);
    } catch (err: unknown) {
      const error = err as { code?: string };
      if (error.code === "auth/popup-blocked" || error.code === "auth/cancelled-popup-request") {
        // Popup was blocked — fall back to redirect
        await signInWithRedirect(auth, provider);
      } else if (error.code !== "auth/popup-closed-by-user") {
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
