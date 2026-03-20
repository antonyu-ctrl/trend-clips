import { db } from "../utils/firestore";

export function computeScore(
  upvotes: number,
  downvotes: number,
  viewCount: number,
  createdAtSeconds: number,
  nowSeconds: number
): number {
  const voteScore = (upvotes - downvotes) * 2;

  // Recency is the primary factor (0-100 points, decays over 30 days)
  const daysSinceCreated = (nowSeconds - createdAtSeconds) / 86400;
  const recencyScore = Math.max(0, 100 - (daysSinceCreated * 100) / 30);

  // View count is secondary (0-20 points, log scale)
  const viewScore = Math.min(20, Math.log10(viewCount + 1) * 2.5);

  return recencyScore + viewScore + voteScore;
}

export async function rescoreAllVideos(): Promise<number> {
  const nowSeconds = Date.now() / 1000;
  const snap = await db
    .collection("videos")
    .where("status", "==", "active")
    .get();

  const batch = db.batch();
  let count = 0;

  for (const doc of snap.docs) {
    const data = doc.data();
    const fetchedAt = data.createdAt?.seconds || data.fetchedAt?.seconds || nowSeconds;
    const newScore = computeScore(
      data.upvotes || 0,
      data.downvotes || 0,
      data.viewCount || 0,
      fetchedAt,
      nowSeconds
    );

    if (Math.abs(newScore - (data.score || 0)) > 0.01) {
      batch.update(doc.ref, { score: newScore });
      count++;
    }

    // Firestore batch limit is 500
    if (count > 0 && count % 490 === 0) {
      await batch.commit();
    }
  }

  if (count % 490 !== 0) {
    await batch.commit();
  }

  return count;
}

// Sync scores from global videos to user's userVideos subcollections
export async function syncUserVideoScores(): Promise<number> {
  // Use collectionGroup to get all userVideos across all users
  const snap = await db.collectionGroup("userVideos").get();

  let count = 0;
  let batch = db.batch();
  let batchCount = 0;

  for (const userVideoDoc of snap.docs) {
    const data = userVideoDoc.data();
    const globalVideoId = data.videoId;

    // Look up global video's score
    const globalDoc = await db.collection("videos").doc(globalVideoId).get();
    if (!globalDoc.exists) continue;

    const globalScore = globalDoc.data()?.score || 0;

    if (Math.abs(globalScore - (data.score || 0)) > 0.01) {
      batch.update(userVideoDoc.ref, { score: globalScore });
      count++;
      batchCount++;
    }

    if (batchCount >= 490) {
      await batch.commit();
      batch = db.batch();
      batchCount = 0;
    }
  }

  if (batchCount > 0) {
    await batch.commit();
  }

  return count;
}
