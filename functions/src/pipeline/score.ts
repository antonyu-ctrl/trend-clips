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
