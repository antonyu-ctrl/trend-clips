import type { Platform, VideoFormat } from "@/lib/types";

export function getEmbedUrl(platform: Platform, platformVideoId: string): string {
  return `https://www.youtube.com/embed/${platformVideoId}`;
}

export function getWatchUrl(platform: Platform, platformVideoId: string, format?: VideoFormat): string {
  if (format === "short") {
    return `https://www.youtube.com/shorts/${platformVideoId}`;
  }
  return `https://www.youtube.com/watch?v=${platformVideoId}`;
}

export function getPlatformColor(platform: Platform): string {
  return "bg-youtube";
}

export function getPlatformLabel(platform: Platform): string {
  return "YouTube";
}

export function getFormatColor(format: VideoFormat): string {
  return format === "clip" ? "bg-blue-600" : "bg-purple-600";
}

export function getFormatLabel(format: VideoFormat): string {
  return format === "clip" ? "Clip" : "Short";
}

export function formatViewCount(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return count.toString();
}
