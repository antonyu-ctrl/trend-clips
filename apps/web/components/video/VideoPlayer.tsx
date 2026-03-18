"use client";

import type { Platform, VideoFormat } from "@/lib/types";
import { getEmbedUrl } from "@/lib/utils/embed";

interface VideoPlayerProps {
  platform: Platform;
  platformVideoId: string;
  format?: VideoFormat;
}

export function VideoPlayer({ platform, platformVideoId, format }: VideoPlayerProps) {
  const embedUrl = getEmbedUrl(platform, platformVideoId);
  const isVertical = format === "short";

  return (
    <div
      className={`overflow-hidden rounded-xl bg-black ${
        isVertical ? "mx-auto max-w-sm" : "w-full"
      }`}
    >
      <div
        className={`relative ${isVertical ? "aspect-[9/16]" : "aspect-video"}`}
      >
        <iframe
          src={embedUrl}
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      </div>
    </div>
  );
}
