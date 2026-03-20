"use client";

import { useAuth } from "@/lib/context/AuthContext";

export default function DashboardVideosPage() {
  const { userProfile } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-text-primary">My Videos</h2>
        <p className="text-sm text-text-secondary">
          Your personalized video feed based on your topics and categories.
        </p>
      </div>

      <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-border bg-surface p-12 text-center">
        <div className="text-4xl">📺</div>
        <h3 className="text-lg font-semibold text-text-primary">Coming Soon</h3>
        <p className="max-w-md text-sm text-text-secondary">
          Your personalized video feed will appear here once the fetcher runs for your topics.
          Videos will be automatically curated based on your categories and search queries.
        </p>
      </div>
    </div>
  );
}
