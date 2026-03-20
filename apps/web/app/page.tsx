"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { VideoGrid } from "@/components/video/VideoGrid";
import { CategoryNav } from "@/components/category/CategoryNav";
import {
  getVideosByFormat,
  getCategories,
  getUserCategories,
  getUserVideosByFormat,
  getUserVideosByCategoryAndFormat,
} from "@/lib/firebase/firestore";
import { useAuth } from "@/lib/context/AuthContext";
import { useT } from "@/lib/i18n/I18nContext";
import type { Video, Category } from "@/lib/types";

function PersonalizedFeed({ userId }: { userId: string }) {
  const { t } = useT();
  const [clips, setClips] = useState<Video[]>([]);
  const [shorts, setShorts] = useState<Video[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserCategories(userId).then((cats) => {
      setCategories(cats);
    });
  }, [userId]);

  useEffect(() => {
    setLoading(true);
    const fetchClips = activeCategory
      ? getUserVideosByCategoryAndFormat(userId, activeCategory, "clip", 10)
      : getUserVideosByFormat(userId, "clip", 10);
    const fetchShorts = activeCategory
      ? getUserVideosByCategoryAndFormat(userId, activeCategory, "short", 10)
      : getUserVideosByFormat(userId, "short", 10);

    Promise.all([fetchClips, fetchShorts]).then(([clipsResult, shortsResult]) => {
      setClips(clipsResult.videos);
      setShorts(shortsResult.videos);
      setLoading(false);
    });
  }, [userId, activeCategory]);

  if (loading && categories.length === 0) {
    return <LoadingSkeleton />;
  }

  const hasNoVideos = clips.length === 0 && shorts.length === 0;

  return (
    <div className="space-y-10">
      {/* User's category nav */}
      {categories.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveCategory(null)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              activeCategory === null
                ? "bg-accent text-white"
                : "bg-surface text-text-secondary hover:bg-surface-hover hover:text-text-primary"
            }`}
          >
            {t("common.all")}
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.slug)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                activeCategory === cat.slug
                  ? "bg-accent text-white"
                  : "bg-surface text-text-secondary hover:bg-surface-hover hover:text-text-primary"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <LoadingSkeleton />
      ) : hasNoVideos ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-border bg-surface p-12 text-center">
          <div className="text-4xl">📭</div>
          <h2 className="text-lg font-semibold text-text-primary">
            {t("home.noVideosYet")}
          </h2>
          <p className="max-w-md text-sm text-text-secondary">
            {t("home.noVideosDesc")}
          </p>
          <Link
            href="/dashboard/topics"
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/90"
          >
            {t("home.manageTopics")}
          </Link>
        </div>
      ) : (
        <>
          {clips.length > 0 && (
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-text-primary">
                  {"🎬 " + t("home.yourClips")}
                </h2>
                <Link
                  href="/clips"
                  className="text-sm font-medium text-accent hover:text-accent/80 transition-colors"
                >
                  {t("common.viewAll")}
                </Link>
              </div>
              <VideoGrid videos={clips} format="clip" />
            </section>
          )}

          {shorts.length > 0 && (
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-text-primary">
                  {"⚡ " + t("home.yourShorts")}
                </h2>
                <Link
                  href="/shorts"
                  className="text-sm font-medium text-accent hover:text-accent/80 transition-colors"
                >
                  {t("common.viewAll")}
                </Link>
              </div>
              <VideoGrid videos={shorts} format="short" />
            </section>
          )}
        </>
      )}
    </div>
  );
}

function NoCategoriesBanner() {
  const { t } = useT();
  return (
    <div className="mb-8 flex items-center justify-between rounded-xl border border-accent/20 bg-accent/5 px-6 py-4">
      <div>
        <h3 className="font-semibold text-text-primary">
          {t("home.customizeFeed")}
        </h3>
        <p className="text-sm text-text-secondary">
          {t("home.customizeDesc")}
        </p>
      </div>
      <Link
        href="/dashboard/categories"
        className="whitespace-nowrap rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/90"
      >
        {t("home.getStarted")}
      </Link>
    </div>
  );
}

function EmptyFeedState() {
  const { t } = useT();
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-4 text-5xl">📂</div>
      <h2 className="mb-2 text-xl font-semibold text-text-primary">
        {t("home.noCategoriesYet")}
      </h2>
      <p className="mb-6 max-w-md text-text-secondary">
        {t("home.addCategoriesDesc")}
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

function GlobalFeed() {
  const { t } = useT();
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

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="space-y-10">
      <CategoryNav categories={categories} />

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-text-primary">
            {"🎬 " + t("home.topClips")}
          </h2>
          <Link
            href="/clips"
            className="text-sm font-medium text-accent hover:text-accent/80 transition-colors"
          >
            {t("common.viewAll")}
          </Link>
        </div>
        {clips.length > 0 ? (
          <VideoGrid videos={clips} format="clip" />
        ) : (
          <p className="text-text-muted">{t("home.noClips")}</p>
        )}
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-text-primary">
            {"⚡ " + t("home.topShorts")}
          </h2>
          <Link
            href="/shorts"
            className="text-sm font-medium text-accent hover:text-accent/80 transition-colors"
          >
            {t("common.viewAll")}
          </Link>
        </div>
        {shorts.length > 0 ? (
          <VideoGrid videos={shorts} format="short" />
        ) : (
          <p className="text-text-muted">{t("home.noShorts")}</p>
        )}
      </section>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-10">
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-8 w-20 animate-pulse rounded-full bg-surface" />
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

export default function HomePage() {
  const { user, userProfile, loading: authLoading } = useAuth();
  const [userHasCategories, setUserHasCategories] = useState<boolean | null>(null);

  useEffect(() => {
    if (!user) {
      setUserHasCategories(null);
      return;
    }
    getUserCategories(user.uid).then((cats) => {
      setUserHasCategories(cats.length > 0);
    });
  }, [user]);

  if (authLoading) return <LoadingSkeleton />;

  // Not signed in → global feed
  if (!user) return <GlobalFeed />;

  // Signed in, checking categories...
  if (userHasCategories === null) return <LoadingSkeleton />;

  // Signed in, has categories → personalized feed
  if (userHasCategories) return <PersonalizedFeed userId={user.uid} />;

  // Signed in, no categories → empty state (user starts fresh)
  return <EmptyFeedState />;
}
