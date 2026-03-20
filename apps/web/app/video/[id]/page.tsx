"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { VideoPlayer } from "@/components/video/VideoPlayer";
import { VideoGrid } from "@/components/video/VideoGrid";
import { getVideoById, getRelatedVideos } from "@/lib/firebase/firestore";
import { getWatchUrl, getPlatformLabel, getFormatLabel, formatViewCount } from "@/lib/utils/embed";
import { useAuth } from "@/lib/context/AuthContext";
import { toggleFavorite, isFavorited } from "@/lib/firebase/firestore";
import type { Video } from "@/lib/types";

export default function VideoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user } = useAuth();
  const [video, setVideo] = useState<Video | null>(null);
  const [related, setRelated] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorited, setFavorited] = useState(false);
  const [togglingFav, setTogglingFav] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const v = await getVideoById(id);
      setVideo(v);
      if (v) {
        const rel = await getRelatedVideos(v, 8);
        setRelated(rel);
      }
      setLoading(false);
    }
    load();
  }, [id]);

  useEffect(() => {
    if (user && video) {
      isFavorited(user.uid, video.id).then(setFavorited);
    }
  }, [user, video]);

  const handleToggleFavorite = async () => {
    if (!user || !video || togglingFav) return;
    setTogglingFav(true);
    const result = await toggleFavorite(user.uid, {
      id: video.id,
      title: video.title,
      thumbnailUrl: video.thumbnailUrl,
      embedUrl: video.embedUrl,
      platform: video.platform,
      platformVideoId: video.platformVideoId,
      format: video.format,
    });
    setFavorited(result);
    setTogglingFav(false);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="aspect-video animate-pulse rounded-xl bg-surface" />
        <div className="h-6 w-2/3 animate-pulse rounded bg-surface" />
        <div className="h-4 w-1/3 animate-pulse rounded bg-surface" />
      </div>
    );
  }

  if (!video) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h1 className="text-xl font-bold text-text-primary">Video not found</h1>
        <Link href="/" className="mt-2 text-sm text-accent hover:underline">
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      {/* Main content */}
      <div className="lg:col-span-2">
        <VideoPlayer
          platform={video.platform}
          platformVideoId={video.platformVideoId}
          format={video.format}
        />

        <div className="mt-4 space-y-3">
          <h1 className="text-xl font-bold text-text-primary">{video.title}</h1>

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-text-secondary">
              YouTube {getFormatLabel(video.format)}
            </span>
            <span className="text-sm text-text-muted">
              {formatViewCount(video.viewCount)} views
            </span>
            <a
              href={getWatchUrl(video.platform, video.platformVideoId, video.format)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-accent hover:underline"
            >
              Watch on YouTube
            </a>
          </div>

          <div className="flex items-center gap-3">
            {user && (
              <button
                onClick={handleToggleFavorite}
                disabled={togglingFav}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  favorited
                    ? "bg-accent/20 text-accent"
                    : "bg-surface text-text-secondary hover:bg-surface-hover"
                }`}
              >
                {favorited ? "Saved" : "Save"}
              </button>
            )}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/category/${video.category}`}
              className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent hover:bg-accent/20"
            >
              {video.category}
            </Link>
            {video.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-surface px-3 py-1 text-xs text-text-secondary"
              >
                {tag}
              </span>
            ))}
          </div>

          {video.description && (
            <p className="text-sm leading-relaxed text-text-secondary">
              {video.description}
            </p>
          )}
        </div>
      </div>

      {/* Sidebar: related videos */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-text-primary">
          Related Videos
        </h2>
        <div className="space-y-3">
          {related.map((v) => (
            <Link
              key={v.id}
              href={`/video/${v.id}`}
              className="group flex gap-3"
            >
              <div className="relative aspect-video w-40 shrink-0 overflow-hidden rounded-lg">
                <img
                  src={v.thumbnailUrl}
                  alt={v.title}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="line-clamp-2 text-sm font-medium text-text-primary group-hover:text-accent">
                  {v.title}
                </h3>
                <p className="mt-1 text-xs text-text-muted">
                  {formatViewCount(v.viewCount)} views
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
