import axios from "axios";
import { FieldValue } from "firebase-admin/firestore";
import { db, upsertVideo, getActiveTopics } from "../utils/firestore";

const SCRAPECREATORS_BASE = "https://api.scrapecreators.com/v1/tiktok";

interface TikTokVideo {
  id: string;
  desc: string;
  stats: {
    playCount: number;
    diggCount: number;
    commentCount: number;
    shareCount: number;
  };
  video: {
    cover: string;
    dynamicCover?: string;
  };
  author?: {
    uniqueId: string;
  };
}

function getApiKey(): string {
  const key = process.env.SCRAPECREATORS_API_KEY;
  if (!key) throw new Error("SCRAPECREATORS_API_KEY not set");
  return key;
}

export async function fetchTikTokForAllTopics(): Promise<{
  fetched: number;
  errors: string[];
}> {
  const apiKey = getApiKey();
  const topics = await getActiveTopics();
  let totalFetched = 0;
  const errors: string[] = [];

  // Check monthly budget
  const limitsRef = db.collection("rateLimits").doc("scrapecreators");
  const limitsSnap = await limitsRef.get();
  if (limitsSnap.exists) {
    const data = limitsSnap.data();
    if (data && data.monthlySpend >= (data.monthlyBudget || 50)) {
      console.warn("Monthly ScrapeCreators budget exceeded, skipping TikTok fetch");
      return { fetched: 0, errors: ["Budget exceeded"] };
    }
  }

  for (const topic of topics) {
    for (const query of topic.searchQueries) {
      try {
        const { data } = await axios.get(`${SCRAPECREATORS_BASE}/search`, {
          params: {
            query,
            count: 20,
            sort_type: 0, // relevance
          },
          headers: {
            "x-api-key": apiKey,
          },
        });

        const videos: TikTokVideo[] = data.data?.videos || data.videos || [];

        for (const video of videos) {
          const tags = [
            topic.name.toLowerCase(),
            "tiktok",
          ];

          await upsertVideo("tiktok", video.id, {
            platform: "tiktok",
            platformVideoId: video.id,
            format: "short" as const,
            embedUrl: `https://www.tiktok.com/embed/v2/${video.id}`,
            title: video.desc.slice(0, 200) || `TikTok by ${video.author?.uniqueId || "unknown"}`,
            description: video.desc.slice(0, 500),
            thumbnailUrl: video.video.dynamicCover || video.video.cover,
            category: topic.defaultCategory,
            tags: [...new Set(tags)],
            viewCount: video.stats.playCount || 0,
            fetchedAt: FieldValue.serverTimestamp(),
          });
          totalFetched++;
        }

        // Track API usage
        await limitsRef.set(
          {
            apiName: "scrapecreators",
            requestCount: FieldValue.increment(1),
            monthlySpend: FieldValue.increment(0.01), // ~$0.01 per request
          },
          { merge: true }
        );

        // Update fetch state
        const stateDocId = `tiktok_${topic.id}_${query.replace(/\s+/g, "_")}`;
        await db
          .collection("fetchState")
          .doc(stateDocId)
          .set(
            {
              topicId: topic.id,
              platform: "tiktok",
              lastFetchedAt: FieldValue.serverTimestamp(),
              consecutiveFailures: 0,
              isDisabled: false,
            },
            { merge: true }
          );
      } catch (err) {
        const msg = `TikTok fetch error for topic "${topic.name}", query "${query}": ${err}`;
        errors.push(msg);
        console.error(msg);

        const stateDocId = `tiktok_${topic.id}_${query.replace(/\s+/g, "_")}`;
        await db
          .collection("fetchState")
          .doc(stateDocId)
          .set(
            { consecutiveFailures: FieldValue.increment(1) },
            { merge: true }
          );
      }
    }
  }

  return { fetched: totalFetched, errors };
}
