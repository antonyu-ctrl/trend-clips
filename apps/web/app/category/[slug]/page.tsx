"use client";

import { useState, useEffect, use } from "react";
import { VideoGrid } from "@/components/video/VideoGrid";
import { CategoryNav } from "@/components/category/CategoryNav";
import {
  getVideosByCategory,
  getVideosByCategoryAndFormat,
  getCategories,
  getCategoryBySlug,
} from "@/lib/firebase/firestore";
import type { Video, Category, VideoFormat } from "@/lib/types";
import type { QueryDocumentSnapshot, DocumentData } from "firebase/firestore";

type FormatFilter = "all" | VideoFormat;

export default function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [videos, setVideos] = useState<Video[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [cursor, setCursor] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [formatFilter, setFormatFilter] = useState<FormatFilter>("all");

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [result, cats, cat] = await Promise.all([
        formatFilter === "all"
          ? getVideosByCategory(slug, 20)
          : getVideosByCategoryAndFormat(slug, formatFilter, 20),
        getCategories(),
        getCategoryBySlug(slug),
      ]);
      setVideos(result.videos);
      setCursor(result.lastDoc);
      setHasMore(result.videos.length === 20);
      setCategories(cats);
      setCategory(cat);
      setLoading(false);
    }
    load();
  }, [slug, formatFilter]);

  const loadMore = async () => {
    if (!cursor) return;
    const result =
      formatFilter === "all"
        ? await getVideosByCategory(slug, 20, cursor)
        : await getVideosByCategoryAndFormat(slug, formatFilter, 20, cursor);
    setVideos((prev) => [...prev, ...result.videos]);
    setCursor(result.lastDoc);
    setHasMore(result.videos.length === 20);
  };

  const formatTabs: { label: string; value: FormatFilter }[] = [
    { label: "All", value: "all" },
    { label: "🎬 Clips", value: "clip" },
    { label: "⚡ Shorts", value: "short" },
  ];

  if (loading && !category) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-40 animate-pulse rounded bg-surface" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="aspect-video animate-pulse rounded-xl bg-surface" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CategoryNav categories={categories} />

      <div>
        <h1 className="mb-1 text-2xl font-bold text-text-primary">
          {category?.name || slug}
        </h1>
        {category?.description && (
          <p className="mb-4 text-sm text-text-secondary">
            {category.description}
          </p>
        )}

        {/* Format sub-filter tabs */}
        <div className="mb-4 flex gap-1 rounded-lg bg-surface p-1">
          {formatTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFormatFilter(tab.value)}
              className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                formatFilter === tab.value
                  ? "bg-accent text-white"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-video animate-pulse rounded-xl bg-surface" />
            ))}
          </div>
        ) : (
          <VideoGrid videos={videos} />
        )}
      </div>

      {hasMore && !loading && (
        <div className="flex justify-center pt-4">
          <button
            onClick={loadMore}
            className="rounded-lg bg-surface px-6 py-2 text-sm font-medium text-text-secondary hover:bg-surface-hover hover:text-text-primary"
          >
            Load more
          </button>
        </div>
      )}
    </div>
  );
}
