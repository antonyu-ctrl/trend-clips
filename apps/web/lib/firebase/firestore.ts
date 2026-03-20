import {
  collection,
  doc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  updateDoc,
  increment,
  serverTimestamp,
  type QueryDocumentSnapshot,
  type DocumentData,
} from "firebase/firestore";
import { getClientDb } from "./client";
import type {
  Video,
  VideoFormat,
  Category,
  Comment,
  Vote,
  VoteType,
  Favorite,
  Suggestion,
  Platform,
  UserProfile,
  UserVideo,
  InviteCode,
  Topic,
} from "@/lib/types";

// --- Collection refs (lazy to avoid SSG initialization) ---
const videosRef = () => collection(getClientDb(), "videos");
const categoriesRef = () => collection(getClientDb(), "categories");
const commentsRef = () => collection(getClientDb(), "comments");
const votesRef = () => collection(getClientDb(), "votes");
const favoritesRef = () => collection(getClientDb(), "favorites");
const suggestionsRef = () => collection(getClientDb(), "suggestions");
const usersRef = () => collection(getClientDb(), "users");

// --- Helper: convert Firestore doc to typed object ---
function docToData<T>(snap: QueryDocumentSnapshot<DocumentData>): T {
  return { id: snap.id, ...snap.data() } as T;
}

// --- Videos ---
export async function getTopVideos(
  pageSize: number = 20,
  cursor?: QueryDocumentSnapshot
): Promise<{ videos: Video[]; lastDoc: QueryDocumentSnapshot | null }> {
  let q = query(videosRef(), where("status", "==", "active"), orderBy("score", "desc"), limit(pageSize));
  if (cursor) {
    q = query(videosRef(), where("status", "==", "active"), orderBy("score", "desc"), startAfter(cursor), limit(pageSize));
  }
  const snap = await getDocs(q);
  const videos = snap.docs.map((d) => docToData<Video>(d));
  const lastDoc = snap.docs[snap.docs.length - 1] ?? null;
  return { videos, lastDoc };
}

export async function getVideosByCategory(
  categorySlug: string,
  pageSize: number = 20,
  cursor?: QueryDocumentSnapshot
): Promise<{ videos: Video[]; lastDoc: QueryDocumentSnapshot | null }> {
  let q = query(
    videosRef(),
    where("category", "==", categorySlug),
    where("status", "==", "active"),
    orderBy("score", "desc"),
    limit(pageSize)
  );
  if (cursor) {
    q = query(
      videosRef(),
      where("category", "==", categorySlug),
      where("status", "==", "active"),
      orderBy("score", "desc"),
      startAfter(cursor),
      limit(pageSize)
    );
  }
  const snap = await getDocs(q);
  const videos = snap.docs.map((d) => docToData<Video>(d));
  const lastDoc = snap.docs[snap.docs.length - 1] ?? null;
  return { videos, lastDoc };
}

export async function getVideosByTag(
  tag: string,
  pageSize: number = 20
): Promise<Video[]> {
  const q = query(
    videosRef(),
    where("tags", "array-contains", tag),
    where("status", "==", "active"),
    orderBy("score", "desc"),
    limit(pageSize)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => docToData<Video>(d));
}

export async function getVideoById(id: string): Promise<Video | null> {
  const snap = await getDoc(doc(videosRef(), id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Video;
}

export async function getRelatedVideos(
  video: Video,
  count: number = 8
): Promise<Video[]> {
  const q = query(
    videosRef(),
    where("category", "==", video.category),
    where("status", "==", "active"),
    orderBy("score", "desc"),
    limit(count + 1)
  );
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => docToData<Video>(d))
    .filter((v) => v.id !== video.id)
    .slice(0, count);
}

// --- Videos by Format ---
export async function getVideosByFormat(
  format: VideoFormat,
  pageSize: number = 20,
  cursor?: QueryDocumentSnapshot
): Promise<{ videos: Video[]; lastDoc: QueryDocumentSnapshot | null }> {
  let q = query(
    videosRef(),
    where("format", "==", format),
    where("status", "==", "active"),
    orderBy("score", "desc"),
    limit(pageSize)
  );
  if (cursor) {
    q = query(
      videosRef(),
      where("format", "==", format),
      where("status", "==", "active"),
      orderBy("score", "desc"),
      startAfter(cursor),
      limit(pageSize)
    );
  }
  const snap = await getDocs(q);
  const videos = snap.docs.map((d) => docToData<Video>(d));
  const lastDoc = snap.docs[snap.docs.length - 1] ?? null;
  return { videos, lastDoc };
}

export async function getVideosByCategoryAndFormat(
  categorySlug: string,
  format: VideoFormat,
  pageSize: number = 20,
  cursor?: QueryDocumentSnapshot
): Promise<{ videos: Video[]; lastDoc: QueryDocumentSnapshot | null }> {
  let q = query(
    videosRef(),
    where("category", "==", categorySlug),
    where("format", "==", format),
    where("status", "==", "active"),
    orderBy("score", "desc"),
    limit(pageSize)
  );
  if (cursor) {
    q = query(
      videosRef(),
      where("category", "==", categorySlug),
      where("format", "==", format),
      where("status", "==", "active"),
      orderBy("score", "desc"),
      startAfter(cursor),
      limit(pageSize)
    );
  }
  const snap = await getDocs(q);
  const videos = snap.docs.map((d) => docToData<Video>(d));
  const lastDoc = snap.docs[snap.docs.length - 1] ?? null;
  return { videos, lastDoc };
}

// --- Categories ---
export async function getCategories(): Promise<Category[]> {
  const q = query(categoriesRef(), orderBy("order", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => docToData<Category>(d));
}

export async function getCategoryBySlug(
  slug: string
): Promise<Category | null> {
  const q = query(categoriesRef(), where("slug", "==", slug), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return docToData<Category>(snap.docs[0]);
}

// --- Votes ---
export function voteDocId(userId: string, videoId: string): string {
  return `${userId}_${videoId}`;
}

export async function getUserVote(
  userId: string,
  videoId: string
): Promise<Vote | null> {
  const id = voteDocId(userId, videoId);
  const snap = await getDoc(doc(votesRef(), id));
  if (!snap.exists()) return null;
  return snap.data() as Vote;
}

export async function castVote(
  userId: string,
  videoId: string,
  voteType: VoteType
): Promise<void> {
  const id = voteDocId(userId, videoId);
  const existing = await getUserVote(userId, videoId);
  const videoDoc = doc(videosRef(), videoId);

  if (existing) {
    if (existing.voteType === voteType) {
      // Remove vote
      await deleteDoc(doc(votesRef(), id));
      const field = voteType === "up" ? "upvotes" : "downvotes";
      await updateDoc(videoDoc, { [field]: increment(-1) });
    } else {
      // Switch vote
      await setDoc(doc(votesRef(), id), { userId, videoId, voteType });
      const incField = voteType === "up" ? "upvotes" : "downvotes";
      const decField = voteType === "up" ? "downvotes" : "upvotes";
      await updateDoc(videoDoc, {
        [incField]: increment(1),
        [decField]: increment(-1),
      });
    }
  } else {
    // New vote
    await setDoc(doc(votesRef(), id), { userId, videoId, voteType });
    const field = voteType === "up" ? "upvotes" : "downvotes";
    await updateDoc(videoDoc, { [field]: increment(1) });
  }
}

// --- Favorites ---
export function favoriteDocId(userId: string, videoId: string): string {
  return `${userId}_${videoId}`;
}

export async function isFavorited(
  userId: string,
  videoId: string
): Promise<boolean> {
  const snap = await getDoc(doc(favoritesRef(), favoriteDocId(userId, videoId)));
  return snap.exists();
}

export async function toggleFavorite(
  userId: string,
  videoId: string
): Promise<boolean> {
  const id = favoriteDocId(userId, videoId);
  const exists = await isFavorited(userId, videoId);
  if (exists) {
    await deleteDoc(doc(favoritesRef(), id));
    return false;
  } else {
    await setDoc(doc(favoritesRef(), id), {
      userId,
      videoId,
      createdAt: serverTimestamp(),
    });
    return true;
  }
}

export async function getUserFavorites(userId: string): Promise<Favorite[]> {
  const q = query(
    favoritesRef(),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as Favorite);
}

// --- Comments ---
export async function getComments(videoId: string): Promise<Comment[]> {
  const q = query(
    commentsRef(),
    where("videoId", "==", videoId),
    orderBy("createdAt", "desc"),
    limit(50)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => docToData<Comment>(d));
}

export async function addComment(
  videoId: string,
  userId: string,
  userName: string,
  userAvatar: string,
  text: string
): Promise<void> {
  const ref = doc(commentsRef());
  await setDoc(ref, {
    videoId,
    userId,
    userName,
    userAvatar,
    text,
    createdAt: serverTimestamp(),
  });
}

// --- Suggestions ---
export async function submitSuggestion(
  userId: string,
  url: string,
  platform: Platform
): Promise<void> {
  const ref = doc(suggestionsRef());
  await setDoc(ref, {
    userId,
    url,
    platform,
    status: "pending",
    createdAt: serverTimestamp(),
  });
}

// --- User Profile ---
export async function createOrUpdateUserProfile(
  userId: string,
  data: { displayName: string; email: string; avatarUrl: string }
): Promise<void> {
  const ref = doc(usersRef(), userId);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    await setDoc(ref, { ...data }, { merge: true });
  } else {
    await setDoc(ref, {
      ...data,
      createdAt: serverTimestamp(),
      tier: "free",
      maxCategories: 3,
      maxTopics: 5,
    });
  }
}

// --- Admin: Topics ---
const topicsRef = () => collection(getClientDb(), "topics");

export async function getTopics(): Promise<
  { id: string; name: string; searchQueries: string[]; defaultCategory: string; isActive: boolean }[]
> {
  const snap = await getDocs(topicsRef());
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as any));
}

export async function createTopic(data: {
  name: string;
  searchQueries: string[];
  defaultCategory: string;
  isActive: boolean;
  languages?: string[];
}): Promise<string> {
  const ref = doc(topicsRef());
  await setDoc(ref, data);
  return ref.id;
}

export async function updateTopic(
  topicId: string,
  data: Partial<{
    name: string;
    searchQueries: string[];
    defaultCategory: string;
    isActive: boolean;
    languages?: string[];
  }>
): Promise<void> {
  await updateDoc(doc(topicsRef(), topicId), data);
}

export async function deleteTopic(topicId: string): Promise<void> {
  await deleteDoc(doc(topicsRef(), topicId));
}

// --- Admin: Category CRUD ---
export async function createCategory(data: {
  name: string;
  slug: string;
  description: string;
  order: number;
}): Promise<string> {
  const ref = doc(categoriesRef());
  await setDoc(ref, data);
  return ref.id;
}

export async function updateCategory(
  catId: string,
  data: Partial<{ name: string; slug: string; description: string; order: number }>
): Promise<void> {
  await updateDoc(doc(categoriesRef(), catId), data);
}

export async function deleteCategory(catId: string): Promise<void> {
  await deleteDoc(doc(categoriesRef(), catId));
}

// --- Admin: Video moderation ---
export async function getAllVideos(
  pageSize: number = 50,
  cursor?: QueryDocumentSnapshot
): Promise<{ videos: Video[]; lastDoc: QueryDocumentSnapshot | null }> {
  let q = query(videosRef(), orderBy("fetchedAt", "desc"), limit(pageSize));
  if (cursor) {
    q = query(videosRef(), orderBy("fetchedAt", "desc"), startAfter(cursor), limit(pageSize));
  }
  const snap = await getDocs(q);
  const videos = snap.docs.map((d) => docToData<Video>(d));
  const lastDoc = snap.docs[snap.docs.length - 1] ?? null;
  return { videos, lastDoc };
}

export async function updateVideoStatus(
  videoId: string,
  status: "active" | "unavailable" | "removed"
): Promise<void> {
  await updateDoc(doc(videosRef(), videoId), { status });
}

// --- Admin: Suggestions ---
export async function getSuggestions(
  statusFilter?: "pending" | "approved" | "rejected"
): Promise<Suggestion[]> {
  let q;
  if (statusFilter) {
    q = query(suggestionsRef(), where("status", "==", statusFilter), orderBy("createdAt", "desc"), limit(100));
  } else {
    q = query(suggestionsRef(), orderBy("createdAt", "desc"), limit(100));
  }
  const snap = await getDocs(q);
  return snap.docs.map((d) => docToData<Suggestion>(d));
}

export async function updateSuggestionStatus(
  sugId: string,
  status: "approved" | "rejected"
): Promise<void> {
  await updateDoc(doc(suggestionsRef(), sugId), { status });
}

// --- User Profile with tier ---
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(usersRef(), userId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as UserProfile;
}

// --- User-scoped Categories ---
const userCategoriesRef = (userId: string) =>
  collection(getClientDb(), "users", userId, "categories");

export async function getUserCategories(userId: string): Promise<Category[]> {
  const q = query(userCategoriesRef(userId), orderBy("order", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => docToData<Category>(d));
}

export async function createUserCategory(
  userId: string,
  data: { name: string; slug: string; description: string; order: number }
): Promise<string> {
  const ref = doc(userCategoriesRef(userId));
  await setDoc(ref, data);
  return ref.id;
}

export async function updateUserCategory(
  userId: string,
  catId: string,
  data: Partial<{ name: string; slug: string; description: string; order: number }>
): Promise<void> {
  await updateDoc(doc(userCategoriesRef(userId), catId), data);
}

export async function deleteUserCategory(userId: string, catId: string): Promise<void> {
  await deleteDoc(doc(userCategoriesRef(userId), catId));
}

export async function getUserCategoryCount(userId: string): Promise<number> {
  const snap = await getDocs(userCategoriesRef(userId));
  return snap.size;
}

// --- User-scoped Topics ---
const userTopicsRef = (userId: string) =>
  collection(getClientDb(), "users", userId, "topics");

export async function getUserTopics(userId: string): Promise<Topic[]> {
  const snap = await getDocs(userTopicsRef(userId));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Topic));
}

export async function createUserTopic(
  userId: string,
  data: { name: string; searchQueries: string[]; defaultCategory: string; isActive: boolean; languages?: string[] }
): Promise<string> {
  const ref = doc(userTopicsRef(userId));
  await setDoc(ref, data);
  return ref.id;
}

export async function updateUserTopic(
  userId: string,
  topicId: string,
  data: Partial<{ name: string; searchQueries: string[]; defaultCategory: string; isActive: boolean; languages?: string[] }>
): Promise<void> {
  await updateDoc(doc(userTopicsRef(userId), topicId), data);
}

export async function deleteUserTopic(userId: string, topicId: string): Promise<void> {
  await deleteDoc(doc(userTopicsRef(userId), topicId));
}

export async function getUserTopicCount(userId: string): Promise<number> {
  const snap = await getDocs(userTopicsRef(userId));
  return snap.size;
}

// --- User Videos (personalized feed) ---
const userVideosRef = (userId: string) =>
  collection(getClientDb(), "users", userId, "userVideos");

export async function getUserVideos(
  userId: string,
  pageSize: number = 20,
  cursor?: QueryDocumentSnapshot
): Promise<{ videos: Video[]; lastDoc: QueryDocumentSnapshot | null }> {
  let q = query(userVideosRef(userId), orderBy("score", "desc"), limit(pageSize));
  if (cursor) {
    q = query(userVideosRef(userId), orderBy("score", "desc"), startAfter(cursor), limit(pageSize));
  }
  const snap = await getDocs(q);

  // Batch fetch global video docs
  const videos: Video[] = [];
  for (const d of snap.docs) {
    const uv = d.data() as UserVideo;
    const videoDoc = await getDoc(doc(videosRef(), uv.videoId));
    if (videoDoc.exists()) {
      videos.push({ id: videoDoc.id, ...videoDoc.data() } as Video);
    }
  }

  const lastDoc = snap.docs[snap.docs.length - 1] ?? null;
  return { videos, lastDoc };
}

export async function getUserVideosByCategory(
  userId: string,
  categorySlug: string,
  pageSize: number = 20,
  cursor?: QueryDocumentSnapshot
): Promise<{ videos: Video[]; lastDoc: QueryDocumentSnapshot | null }> {
  let q = query(
    userVideosRef(userId),
    where("category", "==", categorySlug),
    orderBy("score", "desc"),
    limit(pageSize)
  );
  if (cursor) {
    q = query(
      userVideosRef(userId),
      where("category", "==", categorySlug),
      orderBy("score", "desc"),
      startAfter(cursor),
      limit(pageSize)
    );
  }
  const snap = await getDocs(q);

  const videos: Video[] = [];
  for (const d of snap.docs) {
    const uv = d.data() as UserVideo;
    const videoDoc = await getDoc(doc(videosRef(), uv.videoId));
    if (videoDoc.exists()) {
      videos.push({ id: videoDoc.id, ...videoDoc.data() } as Video);
    }
  }

  const lastDoc = snap.docs[snap.docs.length - 1] ?? null;
  return { videos, lastDoc };
}

export async function getUserVideosByFormat(
  userId: string,
  format: VideoFormat,
  pageSize: number = 20,
  cursor?: QueryDocumentSnapshot
): Promise<{ videos: Video[]; lastDoc: QueryDocumentSnapshot | null }> {
  let q = query(
    userVideosRef(userId),
    where("format", "==", format),
    orderBy("score", "desc"),
    limit(pageSize)
  );
  if (cursor) {
    q = query(
      userVideosRef(userId),
      where("format", "==", format),
      orderBy("score", "desc"),
      startAfter(cursor),
      limit(pageSize)
    );
  }
  const snap = await getDocs(q);

  const videos: Video[] = [];
  for (const d of snap.docs) {
    const uv = d.data() as UserVideo;
    const videoDoc = await getDoc(doc(videosRef(), uv.videoId));
    if (videoDoc.exists()) {
      videos.push({ id: videoDoc.id, ...videoDoc.data() } as Video);
    }
  }

  const lastDoc = snap.docs[snap.docs.length - 1] ?? null;
  return { videos, lastDoc };
}

// --- Invite Codes ---
const inviteCodesRef = () => collection(getClientDb(), "inviteCodes");

export async function validateInviteCode(code: string): Promise<boolean> {
  const snap = await getDoc(doc(inviteCodesRef(), code));
  if (!snap.exists()) return false;
  const data = snap.data() as InviteCode;
  return !data.isUsed;
}

export async function redeemInviteCode(code: string, userId: string): Promise<boolean> {
  const ref = doc(inviteCodesRef(), code);
  const snap = await getDoc(ref);
  if (!snap.exists()) return false;
  const data = snap.data() as InviteCode;
  if (data.isUsed) return false;

  await updateDoc(ref, {
    isUsed: true,
    usedBy: userId,
    usedAt: serverTimestamp(),
  });

  // Upgrade user tier
  await updateDoc(doc(usersRef(), userId), {
    tier: "invited",
    maxCategories: 999,
    maxTopics: 999,
    inviteCode: code,
  });

  return true;
}

// --- Super Admin: Invite Code Management ---
export async function createInviteCode(adminUserId: string): Promise<string> {
  // Generate a random 8-char code
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }

  await setDoc(doc(inviteCodesRef(), code), {
    createdBy: adminUserId,
    createdAt: serverTimestamp(),
    isUsed: false,
  });

  return code;
}

export async function getInviteCodes(): Promise<InviteCode[]> {
  const snap = await getDocs(query(inviteCodesRef(), orderBy("createdAt", "desc")));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as InviteCode));
}

// --- Super Admin: User Management ---
export async function getAllUsers(): Promise<UserProfile[]> {
  const snap = await getDocs(query(usersRef(), orderBy("createdAt", "desc")));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as UserProfile));
}
