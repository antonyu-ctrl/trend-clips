"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import { useT } from "@/lib/i18n/I18nContext";
import {
  getUserVideos,
  getUserVideosByCategory,
  getUserVideosByFormat,
  getUserVideosByCategoryAndFormat,
  getUserCategories,
} from "@/lib/firebase/firestore";
import { VideoGrid } from "@/components/video/VideoGrid";
import type { Video, VideoFormat, Category } from "@/lib/types";
import type { QueryDocumentSnapshot } from "firebase/firestore";
import Link from "next/link";

type FormatFilter = "all" | "clip" | "short";

export default function DashboardVideosPage() {
  const { user } = useAuth();
  const { t } = useT();
  const [videos, setVideos] = useState<Video[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedFormat, setSelectedFormat] = useState<FormatFilter>("all");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [cursor, setCursor] = useState<QueryDocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const PAGE_SIZE = 20;

  const fetchVideos = useCallback(
    async (reset = false) => {
      if (!user) return;
      const currentCursor = reset ? undefined : cursor ?? undefined;

      let result: { videos: Video[]; lastDoc: QueryDocumentSnapshot | null };

      if (selectedCategory === "all" && selectedFormat === "all") {
        result = await getUserVideos(user.uid, PAGE_SIZE, currentCursor);
      } else if (selectedCategory === "all") {
        result = await getUserVideosByFormat(user.uid, selectedFormat as VideoFormat, PAGE_SIZE, currentCursor);
      } else if (selectedFormat === "all") {
        result = await getUserVideosByCategory(user.uid, selectedCategory, PAGE_SIZE, currentCursor);
      } else {
        result = await getUserVideosByCategoryAndFormat(user.uid, selectedCategory, selectedFormat as VideoFormat, PAGE_SIZE, currentCursor);
      }

      setVideos(reset ? result.videos : [...videos, ...result.videos]);
      setCursor(result.lastDoc);
      setHasMore(result.videos.length === PAGE_SIZE);
    },
    [user, selectedCategory, selectedFormat, cursor, videos]
  );

  // Load categories
  useEffect(() => {
    if (!user) return;
    getUserCategories(user.uid).then(setCategories);
  }, [user]);

  // Load videos on filter change
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    setCursor(null);
    setHasMore(true);

    const load = async () => {
      let result: { videos: Video[]; lastDoc: QueryDocumentSnapshot | null };

      if (selectedCategory === "all" && selectedFormat === "all") {
        result = await getUserVideos(user.uid, PAGE_SIZE);
      } else if (selectedCategory === "all") {
        result = await getUserVideosByFormat(user.uid, selectedFormat as VideoFormat, PAGE_SIZE);
      } else if (selectedFormat === "all") {
        result = await getUserVideosByCategory(user.uid, selectedCategory, PAGE_SIZE);
      } else {
        result = await getUserVideosByCategoryAndFormat(user.uid, selectedCategory, selectedFormat as VideoFormat, PAGE_SIZE);
      }

      setVideos(result.videos);
      setCursor(result.lastDoc);
      setHasMore(result.videos.length === PAGE_SIZE);
      setLoading(false);
    };

    load();
  }, [user, selectedCategory, selectedFormat]);

  const loadMore = async () => {
    setLoadingMore(true);
    await fetchVideos(false);
    setLoadingMore(false);
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-text-primary">{t("videos.title")}</h2>
        <p className="text-sm text-text-secondary">
          {t("videos.description")}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Category filter */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              selectedCategory === "all"
                ? "bg-accent text-white"
                : "bg-surface text-text-secondary hover:bg-surface-hover"
            }`}
          >
            {t("common.all")}
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                selectedCategory === cat.slug
                  ? "bg-accent text-white"
                  : "bg-surface text-text-secondary hover:bg-surface-hover"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="hidden h-6 w-px bg-border sm:block" />

        {/* Format filter */}
        <div className="flex gap-2">
          {(["all", "clip", "short"] as FormatFilter[]).map((fmt) => (
            <button
              key={fmt}
              onClick={() => setSelectedFormat(fmt)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                selectedFormat === fmt
                  ? "bg-accent text-white"
                  : "bg-surface text-text-secondary hover:bg-surface-hover"
              }`}
            >
              {fmt === "all" ? t("videos.allFormats") : fmt === "clip" ? t("videos.clips") : t("videos.shorts")}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        </div>
      ) : videos.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border p-12 text-center">
          <div className="text-4xl">📺</div>
          <h3 className="text-lg font-semibold text-text-primary">{t("videos.noVideosYet")}</h3>
          <p className="max-w-md text-sm text-text-secondary">
            {t("videos.noVideosDesc")}
          </p>
          <Link
            href="/dashboard/topics"
            className="rounded-lg bg-accent px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-accent/90"
          >
            {t("videos.manageTopics")}
          </Link>
        </div>
      ) : (
        <>
          <VideoGrid
            videos={videos}
            format={selectedFormat === "all" ? undefined : (selectedFormat as VideoFormat)}
          />
          {hasMore && (
            <div className="flex justify-center pt-4">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="rounded-lg bg-surface px-8 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-hover disabled:opacity-50"
              >
                {loadingMore ? t("common.loading") : t("common.loadMore")}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
