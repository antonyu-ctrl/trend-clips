import { initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

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
  languages?: string[];
}

// Get global topics (for public homepage, managed by super admin)
export async function getActiveTopics(): Promise<
  Array<TopicDoc & { id: string }>
> {
  const snap = await db
    .collection("topics")
    .where("isActive", "==", true)
    .get();
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as TopicDoc) }));
}

// Get all user topics across all users (collectionGroup query)
export interface UserTopicDoc extends TopicDoc {
  id: string;
  userId: string;
}

export async function getAllUserTopics(): Promise<UserTopicDoc[]> {
  const snap = await db
    .collectionGroup("topics")
    .where("isActive", "==", true)
    .get();

  return snap.docs
    .filter((d) => {
      // Only include user subcollection topics (path: users/{uid}/topics/{topicId})
      const pathParts = d.ref.path.split("/");
      return pathParts.length === 4 && pathParts[0] === "users";
    })
    .map((d) => {
      const pathParts = d.ref.path.split("/");
      return {
        id: d.id,
        userId: pathParts[1],
        ...(d.data() as TopicDoc),
      };
    });
}

// Create a userVideo reference (fan-out from global video to user's feed)
export async function createUserVideoRef(
  userId: string,
  globalVideoId: string,
  topicId: string,
  category: string,
  format: string,
  score: number
): Promise<void> {
  const ref = db.doc(`users/${userId}/userVideos/${globalVideoId}`);
  await ref.set(
    {
      videoId: globalVideoId,
      topicId,
      category,
      format,
      addedAt: FieldValue.serverTimestamp(),
      score,
    },
    { merge: true }
  );
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
