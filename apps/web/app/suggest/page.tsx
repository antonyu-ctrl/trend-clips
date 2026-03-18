"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import { submitSuggestion } from "@/lib/firebase/firestore";

function isYouTubeUrl(url: string): boolean {
  return url.includes("youtube.com") || url.includes("youtu.be");
}

function detectFormat(url: string): "clip" | "short" {
  if (url.includes("youtube.com/shorts/")) return "short";
  return "clip";
}

export default function SuggestPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  if (authLoading) return null;
  if (!user) {
    router.push("/");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isYouTubeUrl(url)) {
      setError("Please enter a valid YouTube URL (clips or shorts).");
      return;
    }

    setSubmitting(true);
    try {
      await submitSuggestion(user.uid, url, "youtube");
      setSubmitted(true);
      setUrl("");
    } catch {
      setError("Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Submit a Video</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Found a great YouTube clip or Short? Share it with the community.
          Submissions are reviewed before publishing.
        </p>
      </div>

      {submitted ? (
        <div className="rounded-lg border border-upvote/30 bg-upvote/10 p-4 text-center">
          <p className="font-medium text-upvote">Thanks for your submission!</p>
          <p className="mt-1 text-sm text-text-secondary">
            We&apos;ll review it shortly.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="mt-3 text-sm text-accent hover:underline"
          >
            Submit another
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="url"
              className="mb-1 block text-sm font-medium text-text-primary"
            >
              YouTube URL
            </label>
            <input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=... or youtube.com/shorts/..."
              required
              className="w-full rounded-lg border border-border bg-surface px-4 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
            />
            {url && isYouTubeUrl(url) && (
              <p className="mt-1 text-xs text-accent">
                Detected: YouTube {detectFormat(url) === "short" ? "Short" : "Clip"}
              </p>
            )}
          </div>

          {error && (
            <p className="text-sm text-downvote">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting || !url}
            className="w-full rounded-lg bg-accent py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit for Review"}
          </button>
        </form>
      )}
    </div>
  );
}
