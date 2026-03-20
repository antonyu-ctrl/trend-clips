import { onSchedule } from "firebase-functions/v2/scheduler";
import { onDocumentWritten } from "firebase-functions/v2/firestore";
import { defineSecret } from "firebase-functions/params";
import { fetchYouTubeForAllTopics, fetchYouTubeForAllUsers } from "./fetchers/youtube";
import { rescoreAllVideos, syncUserVideoScores } from "./pipeline/score";
import { cleanupStaleVideos } from "./pipeline/cleanup";
import { computeScore } from "./pipeline/score";

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

// --- Firestore Triggers ---

// When a vote is written/updated/deleted, rescore the video
export const onVoteChange = onDocumentWritten(
  "votes/{voteId}",
  async (event) => {
    const data = event.data?.after?.data() || event.data?.before?.data();
    if (!data) return;

    const videoId = data.videoId;
    if (!videoId) return;

    const { getFirestore } = await import("firebase-admin/firestore");
    const db = getFirestore();
    const videoRef = db.collection("videos").doc(videoId);
    const videoSnap = await videoRef.get();

    if (!videoSnap.exists) return;

    const videoData = videoSnap.data()!;
    const nowSeconds = Date.now() / 1000;
    const fetchedAt = videoData.fetchedAt?.seconds || nowSeconds;
    const newScore = computeScore(
      videoData.upvotes || 0,
      videoData.downvotes || 0,
      videoData.viewCount || 0,
      fetchedAt,
      nowSeconds
    );

    await videoRef.update({ score: newScore });
  }
);
