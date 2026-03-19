"use client";

import { useState, useEffect } from "react";
import { VideoGrid } from "@/components/video/VideoGrid";
import { CategoryNav } from "@/components/category/CategoryNav";
import {
  getVideosByFormat,
  getVideosByCategoryAndFormat,
  getCategories,
} from "@/lib/firebase/firestore";
import type { Video, Category } from "@/lib/types";
import type { QueryDocumentSnapshot, DocumentData } from "firebase/firestore";

export default function ClipsPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [cursor, setCursor] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [result, cats] = await Promise.all([
        selectedCategory
          ? getVideosByCategoryAndFormat(selectedCategory, "clip", 20)
          : getVideosByFormat("clip", 20),
        getCategories(),
      ]);
      setVideos(result.videos);
      setCursor(result.lastDoc);
      setHasMore(result.videos.length === 20);
      setCategories(cats);
      setLoading(false);
    }
    load();
  }, [selectedCategory]);

  const loadMore = async () => {
    if (!cursor || loadingMore) return;
    setLoadingMore(true);
    const result = selectedCategory
      ? await getVideosByCategoryAndFormat(selectedCategory, "clip", 20, cursor)
      : await getVideosByFormat("clip", 20, cursor);
    setVideos((prev) => [...prev, ...result.videos]);
    setCursor(result.lastDoc);
    setHasMore(result.videos.length === 20);
    setLoadingMore(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2 text-3xl font-bold text-text-primary">🎬 YouTube Clips</h1>
        <p className="text-text-secondary">Top trending YouTube video clips by popularity</p>
      </div>

      <CategoryNav
        categories={categories}
        activeSlug={selectedCategory}
        onSelect={(slug) => setSelectedCategory(slug === selectedCategory ? null : slug)}
      />

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="space-y-3">
              <div className="aspect-video animate-pulse rounded-xl bg-surface" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-surface" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-surface" />
            </div>
          ))}
        </div>
      ) : (
        <>
          <VideoGrid videos={videos} format="clip" />
          {hasMore && (
            <div className="flex justify-center pt-4">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="rounded-lg bg-surface px-6 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary disabled:opacity-50"
              >
                {loadingMore ? "Loading..." : "Load more"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
