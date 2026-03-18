"use client";

import { useState, useEffect } from "react";
import { VideoGrid } from "@/components/video/VideoGrid";
import { getTopVideos, getVideosByTag } from "@/lib/firebase/firestore";
import type { Video } from "@/lib/types";

export default function ExplorePage() {
  const [query, setQuery] = useState("");
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  // Load initial trending on mount
  useEffect(() => {
    getTopVideos(24).then(({ videos }) => {
      setVideos(videos);
      setLoading(false);
    });
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setSearching(true);
    // Search by tag (Firestore array-contains)
    const results = await getVideosByTag(query.trim().toLowerCase(), 24);
    setVideos(results);
    setSearching(false);
  };

  const handleClear = async () => {
    setQuery("");
    setSearching(true);
    const { videos } = await getTopVideos(24);
    setVideos(videos);
    setSearching(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Explore</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Search videos by tags or browse trending content.
        </p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by tag (e.g. ai, travel, food)..."
          className="flex-1 rounded-lg border border-border bg-surface px-4 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
        />
        <button
          type="submit"
          disabled={searching}
          className="rounded-lg bg-accent px-5 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50"
        >
          Search
        </button>
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="rounded-lg bg-surface px-4 py-2 text-sm text-text-secondary hover:bg-surface-hover"
          >
            Clear
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
