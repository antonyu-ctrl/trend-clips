import axios from "axios";
import { FieldValue } from "firebase-admin/firestore";
import { db, upsertVideo, getActiveTopics } from "../utils/firestore";

const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";

interface YouTubeSearchItem {
  id: { videoId: string };
}

interface YouTubeVideoItem {
  id: string;
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      high?: { url: string };
      medium?: { url: string };
      default?: { url: string };
    };
    tags?: string[];
    publishedAt: string;
  };
  statistics: {
    viewCount?: string;
    likeCount?: string;
  };
  contentDetails: {
    duration: string;
  };
}

function getApiKey(): string {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) throw new Error("YOUTUBE_API_KEY not set");
  return key;
}

function isShort(duration: string): boolean {
  // ISO 8601 duration: PT1M30S, PT45S, etc.
  const match = duration.match(/PT(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return false;
  const minutes = parseInt(match[1] || "0");
  const seconds = parseInt(match[2] || "0");
  return minutes * 60 + seconds <= 60;
}

async function searchVideos(
  query: string,
  apiKey: string,
  publishedAfter?: string,
  maxResults: number = 25
): Promise<string[]> {
  const params: Record<string, string> = {
    part: "id",
    q: query,
    type: "video",
    order: "viewCount",
    maxResults: maxResults.toString(),
    key: apiKey,
  };
  if (publishedAfter) params.publishedAfter = publishedAfter;

  const { data } = await axios.get(`${YOUTUBE_API_BASE}/search`, { params });
  return (data.items as YouTubeSearchItem[]).map((item) => item.id.videoId);
}

async function getVideoDetails(
  videoIds: string[],
  apiKey: string
): Promise<YouTubeVideoItem[]> {
  if (videoIds.length === 0) return [];
  const { data } = await axios.get(`${YOUTUBE_API_BASE}/videos`, {
    params: {
      part: "snippet,statistics,contentDetails",
      id: videoIds.join(","),
      key: apiKey,
    },
  });
  return data.items as YouTubeVideoItem[];
}

export async function fetchYouTubeForAllTopics(): Promise<{
  fetched: number;
  errors: string[];
}> {
  const apiKey = getApiKey();
  const topics = await getActiveTopics();
  let totalFetched = 0;
  const errors: string[] = [];

  for (const topic of topics) {
    for (const query of topic.searchQueries) {
      try {
        // Get last fetch timestamp for this topic+query
        const stateDocId = `youtube_${topic.id}_${query.replace(/\s+/g, "_")}`;
        const stateRef = db.collection("fetchState").doc(stateDocId);
        const stateSnap = await stateRef.get();
        const lastFetched = stateSnap.exists
          ? stateSnap.data()?.lastFetchedAt?.toDate()?.toISOString()
          : undefined;

        const videoIds = await searchVideos(query, apiKey, lastFetched);
        const videos = await getVideoDetails(videoIds, apiKey);

        for (const video of videos) {
          const thumbnail =
            video.snippet.thumbnails.high?.url ||
            video.snippet.thumbnails.medium?.url ||
            video.snippet.thumbnails.default?.url ||
            "";

          const videoIsShort = isShort(video.contentDetails.duration);
          const tags = [
            topic.name.toLowerCase(),
            ...(video.snippet.tags || []).slice(0, 5).map((t) => t.toLowerCase()),
          ];

          await upsertVideo("youtube", video.id, {
            platform: "youtube",
            platformVideoId: video.id,
            embedUrl: `https://www.youtube.com/embed/${video.id}`,
            title: video.snippet.title,
            description: video.snippet.description.slice(0, 500),
            thumbnailUrl: thumbnail,
            category: topic.defaultCategory,
            format: videoIsShort ? "short" : "clip",
            tags: [...new Set(tags)],
            viewCount: parseInt(video.statistics.viewCount || "0"),
            fetchedAt: FieldValue.serverTimestamp(),
          });
          totalFetched++;
        }

        // Update fetch state
        await stateRef.set(
          {
            topicId: topic.id,
            platform: "youtube",
            lastFetchedAt: FieldValue.serverTimestamp(),
            consecutiveFailures: 0,
            isDisabled: false,
          },
          { merge: true }
        );
      } catch (err) {
        const msg = `YouTube fetch error for topic "${topic.name}", query "${query}": ${err}`;
        errors.push(msg);
        console.error(msg);

        // Track failures
        const stateDocId = `youtube_${topic.id}_${query.replace(/\s+/g, "_")}`;
        const stateRef = db.collection("fetchState").doc(stateDocId);
        await stateRef.set(
          {
            consecutiveFailures: FieldValue.increment(1),
          },
          { merge: true }
        );
      }
    }
  }

  return { fetched: totalFetched, errors };
}
