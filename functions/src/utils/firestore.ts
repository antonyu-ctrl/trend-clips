import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const app = initializeApp();
export const db = getFirestore(app);

export interface VideoDoc {
  platform: "youtube" | "tiktok" | "instagram";
  platformVideoId: string;
  embedUrl: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  category: string;
  format: "clip" | "short";
  tags: string[];
  viewCount: number;
  upvotes: number;
  downvotes: number;
  score: number;
  status: "active" | "unavailable" | "removed";
  createdAt: FirebaseFirestore.FieldValue;
  fetchedAt: FirebaseFirestore.FieldValue;
}

export interface TopicDoc {
  name: string;
  searchQueries: string[];
  defaultCategory: string;
  isActive: boolean;
}

export async function getActiveTopics(): Promise<
  Array<TopicDoc & { id: string }>
> {
  const snap = await db
    .collection("topics")
    .where("isActive", "==", true)
    .get();
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as TopicDoc) }));
}

export async function upsertVideo(
  platform: string,
  platformVideoId: string,
  data: Omit<VideoDoc, "upvotes" | "downvotes" | "score" | "status" | "createdAt">
): Promise<void> {
  const docId = `${platform}_${platformVideoId}`;
  const ref = db.collection("videos").doc(docId);
  const existing = await ref.get();

  if (existing.exists) {
    // Update metrics only
    await ref.update({
      viewCount: data.viewCount,
      fetchedAt: data.fetchedAt,
    });
  } else {
    await ref.set({
      ...data,
      upvotes: 0,
      downvotes: 0,
      score: 0,
      status: "active",
      createdAt: data.fetchedAt,
    });
  }
}
