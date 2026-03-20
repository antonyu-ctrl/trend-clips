"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { VideoGrid } from "@/components/video/VideoGrid";
import {
  getTopVideos,
  getVideosByTag,
  getUserCategories,
  getUserVideos,
} from "@/lib/firebase/firestore";
import { useAuth } from "@/lib/context/AuthContext";
import { useT } from "@/lib/i18n/I18nContext";
import type { Video } from "@/lib/types";

function EmptyState() {
  const { t } = useT();
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-4 text-5xl">🔍</div>
      <h2 className="mb-2 text-xl font-semibold text-text-primary">{t("explore.nothingYet")}</h2>
      <p className="mb-6 max-w-md text-text-secondary">
        {t("explore.addDesc")}
      </p>
      <Link
        href="/dashboard/categories"
        className="rounded-lg bg-accent px-6 py-2.5 text-sm font-medium text-white hover:bg-accent/90"
      >
        {t("home.addCategories")}
      </Link>
    </div>
  );
}

export default function ExplorePage() {
  const { t } = useT();
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [hasCategories, setHasCategories] = useState<boolean | null>(null);

  useEffect(() => {
    async function load() {
      if (user) {
        const userCats = await getUserCategories(user.uid);
        setHasCategories(userCats.length > 0);

        if (userCats.length === 0) {
          setVideos([]);
          setLoading(false);
          return;
        }

        const result = await getUserVideos(user.uid, 24);
        setVideos(result.videos);
      } else {
        const { videos } = await getTopVideos(24);
        setVideos(videos);
        setHasCategories(null);
      }
      setLoading(false);
    }
    load();
  }, [user]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setSearching(true);
    const results = await getVideosByTag(query.trim().toLowerCase(), 24);
    setVideos(results);
    setSearching(false);
  };

  const handleClear = async () => {
    setQuery("");
    setSearching(true);
    if (user) {
      const result = await getUserVideos(user.uid, 24);
      setVideos(result.videos);
    } else {
      const { videos } = await getTopVideos(24);
      setVideos(videos);
    }
    setSearching(false);
  };

  if (!loading && user && hasCategories === false) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Explore</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Search videos by tags or browse trending content.
          </p>
        </div>
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">{t("explore.title")}</h1>
        <p className="mt-1 text-sm text-text-secondary">
          {t("explore.description")}
        </p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("explore.searchPlaceholder")}
          className="flex-1 rounded-lg border border-border bg-surface px-4 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
        />
        <button
          type="submit"
          disabled={searching}
          className="rounded-lg bg-accent px-5 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50"
        >
          {t("explore.search")}
        </button>
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="rounded-lg bg-surface px-4 py-2 text-sm text-text-secondary hover:bg-surface-hover"
          >
            {t("explore.clear")}
          </button>
        )}
      </form>

      {loading || searching ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="space-y-3">
              <div className="aspect-video animate-pulse rounded-xl bg-surface" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-surface" />
            </div>
          ))}
        </div>
      ) : (
        <VideoGrid videos={videos} />
      )}
    </div>
  );
}
