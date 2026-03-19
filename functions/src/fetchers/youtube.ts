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
    defaultAudioLanguage?: string;
    defaultLanguage?: string;
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
  maxResults: number = 10,
  relevanceLanguage?: string
): Promise<string[]> {
  // Default to 7 days ago if no publishedAfter — ensures we get recent content
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const params: Record<string, string> = {
    part: "id",
    q: query,
    type: "video",
    order: "relevance",
    maxResults: maxResults.toString(),
    publishedAfter: publishedAfter || sevenDaysAgo,
    key: apiKey,
  };

  if (relevanceLanguage) {
    params.relevanceLanguage = relevanceLanguage;
  }

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
    // Languages to filter by — default to English if not set
    const languages: string[] = topic.languages && topic.languages.length > 0
      ? topic.languages
      : ["en"];

    for (const query of topic.searchQueries) {
      try {
        // Get last fetch timestamp for this topic+query
        const stateDocId = `youtube_${topic.id}_${query.replace(/\s+/g, "_")}`;
        const stateRef = db.collection("fetchState").doc(stateDocId);
        const stateSnap = await stateRef.get();
        const lastFetched = stateSnap.exists
          ? stateSnap.data()?.lastFetchedAt?.toDate()?.toISOString()
          : undefined;

        // Search once per language, deduplicate results
        const allVideoIds = new Set<string>();
        for (const lang of languages) {
          const ids = await searchVideos(query, apiKey, lastFetched, 10, lang);
          ids.forEach((id) => allVideoIds.add(id));
        }

        const videoIds = Array.from(allVideoIds);
        const videos = await getVideoDetails(videoIds, apiKey);

        for (const video of videos) {
          // Skip videos with fewer than 10K views
          const viewCount = parseInt(video.statistics.viewCount || "0");
          if (viewCount < 10000) continue;

          // Language filter: skip if audio language is set and not in allowed list
          const audioLang = video.snippet.defaultAudioLanguage?.toLowerCase();
          if (audioLang && !languages.some((lang) => audioLang.startsWith(lang))) {
            continue;
          }

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
            viewCount,
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
