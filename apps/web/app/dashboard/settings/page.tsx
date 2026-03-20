"use client";

import { useState } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import { redeemInviteCode } from "@/lib/firebase/firestore";

export default function SettingsPage() {
  const { user, userProfile } = useAuth();
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [redeeming, setRedeeming] = useState(false);

  const handleRedeem = async () => {
    if (!user || !code.trim()) return;
    setRedeeming(true);
    setMessage("");
    const success = await redeemInviteCode(code.trim().toUpperCase(), user.uid);
    if (success) {
      setMessage("Invite code redeemed! Your account has been upgraded. Please refresh the page.");
      setCode("");
    } else {
      setMessage("Invalid or already used invite code.");
    }
    setRedeeming(false);
  };

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-border bg-surface p-6">
        <h2 className="mb-4 text-lg font-semibold text-text-primary">Account</h2>
        <div className="space-y-2 text-sm text-text-secondary">
          <p><span className="font-medium text-text-primary">Name:</span> {userProfile?.displayName}</p>
          <p><span className="font-medium text-text-primary">Email:</span> {userProfile?.email}</p>
          <p><span className="font-medium text-text-primary">Tier:</span> <span className="capitalize">{userProfile?.tier || "free"}</span></p>
        </div>
      </div>

      {userProfile?.tier === "free" && (
        <div className="rounded-xl border border-border bg-surface p-6">
          <h2 className="mb-4 text-lg font-semibold text-text-primary">Redeem Invite Code</h2>
          <p className="mb-4 text-sm text-text-secondary">
            Enter an invite code to unlock unlimited categories and topics.
          </p>
          <div className="flex gap-3">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Enter code (e.g., ABCD1234)"
              className="flex-1 rounded-lg border border-border bg-background px-4 py-2 text-sm text-text-primary placeholder:text-text-secondary focus:border-accent focus:outline-none"
              maxLength={8}
            />
            <button
              onClick={handleRedeem}
              disabled={redeeming || !code.trim()}
              className="rounded-lg bg-accent px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-accent/90 disabled:opacity-50"
            >
              {redeeming ? "Redeeming..." : "Redeem"}
            </button>
          </div>
          {message && <p className="mt-3 text-sm">{message}</p>}
        </div>
      )}
    </div>
  );
}
