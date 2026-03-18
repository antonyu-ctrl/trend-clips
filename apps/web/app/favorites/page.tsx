"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { VideoGrid } from "@/components/video/VideoGrid";
import { useAuth } from "@/lib/context/AuthContext";
import { getUserFavorites, getVideoById } from "@/lib/firebase/firestore";
import type { Video } from "@/lib/types";

export default function FavoritesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/");
      return;
    }

    async function load() {
      const favs = await getUserFavorites(user!.uid);
      const vids = await Promise.all(
        favs.map((f) => getVideoById(f.videoId))
      );
      setVideos(vids.filter((v): v is Video => v !== null));
      setLoading(false);
    }
    load();
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="aspect-video animate-pulse rounded-xl bg-surface" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-text-primary">Your Favorites</h1>
      <VideoGrid videos={videos} />
    </div>
  );
}
