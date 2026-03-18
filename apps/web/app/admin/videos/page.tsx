"use client";

import { useState, useEffect } from "react";
import { getAllVideos, updateVideoStatus } from "@/lib/firebase/firestore";
import { formatViewCount } from "@/lib/utils/embed";
import type { Video, VideoStatus } from "@/lib/types";
import type { QueryDocumentSnapshot, DocumentData } from "firebase/firestore";

export default function AdminVideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [cursor, setCursor] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);

  async function loadVideos() {
    const result = await getAllVideos(50);
    setVideos(result.videos);
    setCursor(result.lastDoc);
    setHasMore(result.videos.length === 50);
    setLoading(false);
  }

  useEffect(() => {
    loadVideos();
  }, []);

  const loadMore = async () => {
    if (!cursor) return;
    const result = await getAllVideos(50, cursor);
    setVideos((prev) => [...prev, ...result.videos]);
    setCursor(result.lastDoc);
    setHasMore(result.videos.length === 50);
  };

  async function handleStatusChange(videoId: string, newStatus: VideoStatus) {
    await updateVideoStatus(videoId, newStatus);
    setVideos((prev) =>
      prev.map((v) => (v.id === videoId ? { ...v, status: newStatus } : v))
    );
  }

  const statusColor = (status: VideoStatus) => {
    switch (status) {
      case "active":
        return "bg-green-500/10 text-green-400";
      case "unavailable":
        return "bg-yellow-500/10 text-yellow-400";
      case "removed":
        return "bg-red-500/10 text-red-400";
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-text-primary">Videos</h1>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 animate-pulse rounded-lg bg-surface" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Videos</h1>
        <p className="text-sm text-text-secondary">
          {videos.length} videos loaded · Manage video visibility
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-text-secondary">
              <th className="pb-2 pr-4 font-medium">Title</th>
              <th className="pb-2 pr-4 font-medium">Format</th>
              <th className="pb-2 pr-4 font-medium">Category</th>
              <th className="pb-2 pr-4 font-medium">Views</th>
              <th className="pb-2 pr-4 font-medium">Score</th>
              <th className="pb-2 pr-4 font-medium">Status</th>
              <th className="pb-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {videos.map((video) => (
              <tr key={video.id} className="border-b border-border/50">
                <td className="py-3 pr-4">
                  <div className="max-w-xs truncate font-medium text-text-primary">
                    {video.title}
                  </div>
                </td>
                <td className="py-3 pr-4">
                  <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${
                    video.format === "clip" ? "bg-blue-500/10 text-blue-400" : "bg-purple-500/10 text-purple-400"
                  }`}>
                    {video.format === "clip" ? "Clip" : "Short"}
                  </span>
                </td>
                <td className="py-3 pr-4 text-text-secondary">{video.category}</td>
                <td className="py-3 pr-4 text-text-secondary">
                  {formatViewCount(video.viewCount)}
                </td>
                <td className="py-3 pr-4 text-text-secondary">
                  {video.score?.toFixed(1) ?? "—"}
                </td>
                <td className="py-3 pr-4">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor(video.status)}`}>
                    {video.status}
                  </span>
                </td>
                <td className="py-3">
                  <select
                    value={video.status}
                    onChange={(e) => handleStatusChange(video.id, e.target.value as VideoStatus)}
                    className="rounded border border-border bg-background px-2 py-1 text-xs text-text-primary focus:border-accent focus:outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="unavailable">Unavailable</option>
                    <option value="removed">Removed</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {hasMore && (
        <div className="flex justify-center">
          <button
            onClick={loadMore}
            className="rounded-lg bg-surface px-6 py-2 text-sm font-medium text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-colors"
          >
            Load more
          </button>
        </div>
      )}
    </div>
  );
}
