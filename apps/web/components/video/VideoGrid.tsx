import type { Video, VideoFormat } from "@/lib/types";
import { VideoCard } from "./VideoCard";

interface VideoGridProps {
  videos: Video[];
  format?: VideoFormat;
}

export function VideoGrid({ videos, format }: VideoGridProps) {
  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-lg text-text-secondary">No videos found</p>
        <p className="mt-1 text-sm text-text-muted">
          Check back later for new trending content.
        </p>
      </div>
    );
  }

  const isShorts = format === "short" || (!format && videos[0]?.format === "short");

  return (
    <div
      className={
        isShorts
          ? "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
          : "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      }
    >
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} compact={isShorts} />
      ))}
    </div>
  );
}
