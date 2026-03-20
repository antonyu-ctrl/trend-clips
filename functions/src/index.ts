import { onSchedule } from "firebase-functions/v2/scheduler";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import { fetchYouTubeForAllTopics, fetchYouTubeForAllUsers, fetchYouTubeForSingleUser } from "./fetchers/youtube";
import { rescoreAllVideos, syncUserVideoScores } from "./pipeline/score";
import { cleanupStaleVideos } from "./pipeline/cleanup";

const youtubeApiKey = defineSecret("YOUTUBE_API_KEY");

// --- Scheduled Fetchers ---

export const fetchYouTube = onSchedule(
  {
    schedule: "0 */6 * * *", // Every 6 hours
    timeZone: "UTC",
    memory: "512MiB",
    timeoutSeconds: 300,
    secrets: [youtubeApiKey],
  },
  async () => {
    // 1. Fetch for global/public homepage (super admin topics)
    const globalResult = await fetchYouTubeForAllTopics();
    console.log(`Global fetch: ${globalResult.fetched} videos, ${globalResult.errors.length} errors`);

    // 2. Fetch for all users' personalized feeds (dedup + fan-out)
    const userResult = await fetchYouTubeForAllUsers();
    console.log(`User fetch: ${userResult.fetched} videos, ${userResult.fanOuts} fan-outs, ${userResult.errors.length} errors`);
  }
);

// TikTok and Instagram fetchers are disabled for now.
// The fetcher files are kept in src/fetchers/ for future use.

export const rescoreVideos = onSchedule(
  {
    schedule: "0 * * * *", // Every hour
    timeZone: "UTC",
    memory: "512MiB",
    timeoutSeconds: 120,
  },
  async () => {
    const updated = await rescoreAllVideos();
    console.log(`Rescored ${updated} global videos`);

    const synced = await syncUserVideoScores();
    console.log(`Synced ${synced} user video scores`);
  }
);

export const cleanupVideos = onSchedule(
  {
    schedule: "0 4 * * *", // Daily at 4am UTC
    timeZone: "UTC",
    memory: "512MiB",
    timeoutSeconds: 540,
  },
  async () => {
    const result = await cleanupStaleVideos();
    console.log(`Cleanup: checked ${result.checked}, removed ${result.removed}`);
  }
);

// --- On-demand fetch for a single user (callable) ---

export const fetchTopicsForUser = onCall(
  {
    memory: "512MiB",
    timeoutSeconds: 120,
    secrets: [youtubeApiKey],
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Must be signed in");
    }

    const userId = request.auth.uid;
    const result = await fetchYouTubeForSingleUser(userId);
    console.log(`On-demand fetch for ${userId}: ${result.videosAdded} videos, ${result.errors.length} errors`);

    return { videosAdded: result.videosAdded };
  }
);
