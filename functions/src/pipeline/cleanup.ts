import axios from "axios";
import { db } from "../utils/firestore";

/**
 * Check if YouTube videos still exist and mark unavailable ones.
 * For TikTok/Instagram, just mark very old unfetched videos as stale.
 */
export async function cleanupStaleVideos(): Promise<{
  checked: number;
  removed: number;
}> {
  let checked = 0;
  let removed = 0;

  // YouTube: verify via oEmbed (no quota cost)
  const ytSnap = await db
    .collection("videos")
    .where("platform", "==", "youtube")
    .where("status", "==", "active")
    .get();

  for (const doc of ytSnap.docs) {
    const data = doc.data();
    checked++;

    try {
      await axios.head(
        `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${data.platformVideoId}`,
        { timeout: 5000 }
      );
    } catch {
      // Video is unavailable
      await doc.ref.update({ status: "unavailable" });
      removed++;
    }

    // Rate limit ourselves: 1 check per 100ms
    await new Promise((r) => setTimeout(r, 100));
  }

  // Auto-expire: delete all videos older than 30 days (any platform)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const expiredSnap = await db
    .collection("videos")
    .where("createdAt", "<", thirtyDaysAgo)
    .get();

  for (const doc of expiredSnap.docs) {
    await doc.ref.delete();
    removed++;
  }
  checked += expiredSnap.size;

  if (expiredSnap.size > 0) {
    console.log(`Auto-expired ${expiredSnap.size} videos older than 30 days`);
  }

  return { checked, removed };
}
