"use client";

import Image from "next/image";
import Link from "next/link";
import type { Video } from "@/lib/types";
import { useT } from "@/lib/i18n/I18nContext";
import {
  getFormatColor,
  getFormatLabel,
  formatViewCount,
} from "@/lib/utils/embed";

interface VideoCardProps {
  video: Video;
  compact?: boolean;
}

export function VideoCard({ video, compact }: VideoCardProps) {
  const { t } = useT();
  const formatColor = getFormatColor(video.format);
  const formatLabel = getFormatLabel(video.format);

  return (
    <Link href={`/video/${video.id}`} className="group block">
      <div className="overflow-hidden rounded-xl border border-border bg-surface transition-all duration-200 hover:border-accent/40 hover:shadow-lg hover:shadow-accent/5">
        {/* Thumbnail */}
        <div
          className={`relative overflow-hidden ${
            video.format === "short" ? "aspect-[9/16]" : "aspect-video"
          }`}
        >
          <Image
            src={video.thumbnailUrl}
            alt={video.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes={
              compact
                ? "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            }
          />
          {/* Format badge */}
          <span
            className={`absolute left-1.5 top-1.5 rounded-md px-1.5 py-0.5 text-[10px] font-semibold text-white ${formatColor} ${compact ? "sm:px-2 sm:text-xs" : "px-2 text-xs"}`}
          >
            {formatLabel}
          </span>
          {/* View count */}
          <span className={`absolute bottom-1.5 right-1.5 rounded-md bg-black/70 px-1.5 py-0.5 text-white ${compact ? "text-[10px] sm:text-xs" : "text-xs"}`}>
            {formatViewCount(video.viewCount)} {t("common.views")}
          </span>
        </div>

        {/* Info */}
        <div className={compact ? "p-2" : "p-3"}>
          <h3 className={`line-clamp-2 font-medium leading-snug text-text-primary ${compact ? "text-xs" : "text-sm"}`}>
            {video.title}
          </h3>
          {!compact && (
            <div className="mt-2 flex flex-wrap gap-1">
              {video.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-accent/10 px-2 py-0.5 text-xs text-accent"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
