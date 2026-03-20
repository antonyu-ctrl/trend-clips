"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/context/AuthContext";
import { useT } from "@/lib/i18n/I18nContext";
import { getUserFavorites } from "@/lib/firebase/firestore";
import type { Favorite } from "@/lib/types";

export default function FavoritesPage() {
  const { t } = useT();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/");
      return;
    }

    async function load() {
      const favs = await getUserFavorites(user!.uid);
      setFavorites(favs);
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
      <h1 className="text-2xl font-bold text-text-primary">{t("favorites.title")}</h1>
      {favorites.length === 0 ? (
        <p className="text-text-muted">{t("favorites.empty")}</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {favorites.map((fav) => (
            <Link
              key={fav.videoId}
              href={`/video/${fav.videoId}`}
              className="group block"
            >
              <div className="overflow-hidden rounded-xl border border-border bg-surface transition-all duration-200 hover:border-accent/40 hover:shadow-lg hover:shadow-accent/5">
                <div
                  className={`relative overflow-hidden ${
                    fav.format === "short" ? "aspect-[9/16]" : "aspect-video"
                  }`}
                >
                  {fav.thumbnailUrl ? (
                    <Image
                      src={fav.thumbnailUrl}
                      alt={fav.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-surface-hover">
                      <span className="text-text-muted">No thumbnail</span>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="line-clamp-2 text-sm font-medium leading-snug text-text-primary">
                    {fav.title}
                  </h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
