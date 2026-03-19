"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { VideoGrid } from "@/components/video/VideoGrid";
import { CategoryNav } from "@/components/category/CategoryNav";
import { getVideosByFormat, getCategories } from "@/lib/firebase/firestore";
import type { Video, Category } from "@/lib/types";

export default function HomePage() {
  const [clips, setClips] = useState<Video[]>([]);
  const [shorts, setShorts] = useState<Video[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [clipsResult, shortsResult, cats] = await Promise.all([
        getVideosByFormat("clip", 10),
        getVideosByFormat("short", 10),
        getCategories(),
      ]);
      setClips(clipsResult.videos);
      setShorts(shortsResult.videos);
      setCategories(cats);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-10">
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-8 w-20 animate-pulse rounded-full bg-surface"
            />
          ))}
        </div>
        {[1, 2].map((section) => (
          <div key={section} className="space-y-4">
            <div className="h-7 w-48 animate-pulse rounded bg-surface" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-3">
                  <div className="aspect-video animate-pulse rounded-xl bg-surface" />
                  <div className="h-4 w-3/4 animate-pulse rounded bg-surface" />
                  <div className="h-3 w-1/2 animate-pulse rounded bg-surface" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <CategoryNav categories={categories} />

      {/* Top YouTube Clips */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-text-primary">
            🎬 Top YouTube Clips
          </h2>
          <Link
            href="/clips"
            className="text-sm font-medium text-accent hover:text-accent/80 transition-colors"
          >
            View all →
          </Link>
        </div>
        {clips.length > 0 ? (
          <VideoGrid videos={clips} format="clip" />
        ) : (
          <p className="text-text-muted">No clips found yet.</p>
        )}
      </section>

      {/* Top YouTube Shorts */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-text-primary">
            ⚡ Top YouTube Shorts
          </h2>
          <Link
            href="/shorts"
            className="text-sm font-medium text-accent hover:text-accent/80 transition-colors"
          >
            View all →
          </Link>
        </div>
        {shorts.length > 0 ? (
          <VideoGrid videos={shorts} format="short" />
        ) : (
          <p className="text-text-muted">No shorts found yet.</p>
        )}
      </section>
    </div>
  );
}
