import axios from "axios";
import { FieldValue } from "firebase-admin/firestore";
import { db, upsertVideo, getActiveTopics } from "../utils/firestore";

const SCRAPECREATORS_BASE = "https://api.scrapecreators.com/v1/instagram";

interface InstagramReel {
  id: string;
  shortcode: string;
  caption?: string;
  thumbnail_url: string;
  video_view_count?: number;
  like_count?: number;
  owner?: {
    username: string;
  };
}

function getApiKey(): string {
  const key = process.env.SCRAPECREATORS_API_KEY;
  if (!key) throw new Error("SCRAPECREATORS_API_KEY not set");
  return key;
}

export async function fetchInstagramForAllTopics(): Promise<{
  fetched: number;
  errors: string[];
}> {
  const apiKey = getApiKey();
  const topics = await getActiveTopics();
  let totalFetched = 0;
  const errors: string[] = [];

  // Check monthly budget (shared with TikTok)
  const limitsRef = db.collection("rateLimits").doc("scrapecreators");
  const limitsSnap = await limitsRef.get();
  if (limitsSnap.exists) {
    const data = limitsSnap.data();
    if (data && data.monthlySpend >= (data.monthlyBudget || 50)) {
      console.warn("Monthly ScrapeCreators budget exceeded, skipping Instagram fetch");
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
          },
          headers: {
            "x-api-key": apiKey,
          },
        });

        const reels: InstagramReel[] = data.data?.reels || data.reels || [];

        for (const reel of reels) {
          const shortcode = reel.shortcode || reel.id;
          const tags = [topic.name.toLowerCase(), "reels"];

          await upsertVideo("instagram", shortcode, {
            platform: "instagram",
            platformVideoId: shortcode,
            format: "short" as const,
            embedUrl: `https://www.instagram.com/reel/${shortcode}/embed`,
            title:
              reel.caption?.slice(0, 200) ||
              `Reel by ${reel.owner?.username || "unknown"}`,
            description: reel.caption?.slice(0, 500) || "",
            thumbnailUrl: reel.thumbnail_url,
            category: topic.defaultCategory,
            tags: [...new Set(tags)],
            viewCount: reel.video_view_count || reel.like_count || 0,
            fetchedAt: FieldValue.serverTimestamp(),
          });
          totalFetched++;
        }

        // Track API usage
        await limitsRef.set(
          {
            apiName: "scrapecreators",
            requestCount: FieldValue.increment(1),
            monthlySpend: FieldValue.increment(0.01),
          },
          { merge: true }
        );

        // Update fetch state
        const stateDocId = `instagram_${topic.id}_${query.replace(/\s+/g, "_")}`;
        await db
          .collection("fetchState")
          .doc(stateDocId)
          .set(
            {
              topicId: topic.id,
              platform: "instagram",
              lastFetchedAt: FieldValue.serverTimestamp(),
              consecutiveFailures: 0,
              isDisabled: false,
            },
            { merge: true }
          );
      } catch (err) {
        const msg = `Instagram fetch error for topic "${topic.name}", query "${query}": ${err}`;
        errors.push(msg);
        console.error(msg);

        const stateDocId = `instagram_${topic.id}_${query.replace(/\s+/g, "_")}`;
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
