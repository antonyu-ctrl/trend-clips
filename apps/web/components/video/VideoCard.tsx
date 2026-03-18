"use client";

import Image from "next/image";
import Link from "next/link";
import type { Video } from "@/lib/types";
import {
  getFormatColor,
  getFormatLabel,
  formatViewCount,
} from "@/lib/utils/embed";

interface VideoCardProps {
  video: Video;
}

export function VideoCard({ video }: VideoCardProps) {
  const formatColor = getFormatColor(video.format);
  const formatLabel = getFormatLabel(video.format);
  const netVotes = video.upvotes - video.downvotes;

  return (
    <Link href={`/video/${video.id}`} className="group block">
      <div className="overflow-hidden rounded-xl border border-border bg-surface transition-all duration-200 hover:border-accent/40 hover:shadow-lg hover:shadow-accent/5">
        {/* Thumbnail */}
        <div
          className={`relative overflow-hidden ${
            video.format === "short" ? "aspect-[9/16] max-h-72" : "aspect-video"
          }`}
        >
          <Image
            src={video.thumbnailUrl}
            alt={video.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          {/* Format badge */}
          <span
            className={`absolute left-2 top-2 rounded-md px-2 py-0.5 text-xs font-semibold text-white ${formatColor}`}
          >
            {formatLabel}
          </span>
          {/* View count */}
          <span className="absolute bottom-2 right-2 rounded-md bg-black/70 px-2 py-0.5 text-xs text-white">
            {formatViewCount(video.viewCount)} views
          </span>
        </div>

        {/* Info */}
        <div className="p-3">
          <h3 className="line-clamp-2 text-sm font-medium leading-snug text-text-primary">
            {video.title}
          </h3>
          <div className="mt-2 flex items-center justify-between">
            {/* Tags */}
            <div className="flex flex-wrap gap-1">
              {video.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-accent/10 px-2 py-0.5 text-xs text-accent"
                >
                  {tag}
                </span>
              ))}
            </div>
            {/* Votes */}
            <span
              className={`text-xs font-medium ${
                netVotes > 0
                  ? "text-upvote"
                  : netVotes < 0
                    ? "text-downvote"
                    : "text-text-muted"
              }`}
            >
              {netVotes > 0 ? "+" : ""}
              {netVotes}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
