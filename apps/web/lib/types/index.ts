import type { Timestamp } from "firebase/firestore";

export type Platform = "youtube";

export type VideoFormat = "clip" | "short";

export type VideoStatus = "active" | "unavailable" | "removed";

export interface Video {
  id: string;
  platform: Platform;
  platformVideoId: string;
  embedUrl: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  category: string;
  format: VideoFormat;
  tags: string[];
  viewCount: number;
  upvotes: number;
  downvotes: number;
  score: number;
  status: VideoStatus;
  createdAt: Timestamp;
  fetchedAt: Timestamp;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  iconUrl?: string;
  order: number;
}

export interface Topic {
  id: string;
  name: string;
  searchQueries: string[];
  defaultCategory: string;
  isActive: boolean;
  languages?: string[];
}

export type UserTier = "free" | "invited" | "pro";

export interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  avatarUrl: string;
  createdAt: Timestamp;
  isAdmin?: boolean;
  tier: UserTier;
  maxCategories: number;
  maxTopics: number;
  inviteCode?: string;
}

export interface UserVideo {
  videoId: string;
  topicId: string;
  category: string;
  addedAt: Timestamp;
  score: number;
}

export interface InviteCode {
  id: string;
  createdBy: string;
  createdAt: Timestamp;
  usedBy?: string;
  usedAt?: Timestamp;
  isUsed: boolean;
}

export interface Favorite {
  userId: string;
  videoId: string;
  createdAt: Timestamp;
}

export type VoteType = "up" | "down";

export interface Vote {
  userId: string;
  videoId: string;
  voteType: VoteType;
}

export interface Comment {
  id: string;
  videoId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  createdAt: Timestamp;
}

export type SuggestionStatus = "pending" | "approved" | "rejected";

export interface Suggestion {
  id: string;
  userId: string;
  url: string;
  platform: Platform;
  status: SuggestionStatus;
  createdAt: Timestamp;
}

export interface FetchState {
  topicId: string;
  platform: Platform;
  lastFetchedAt: Timestamp;
  lastPageToken?: string;
  consecutiveFailures: number;
  isDisabled: boolean;
}

export interface RateLimit {
  apiName: string;
  requestCount: number;
  windowStart: Timestamp;
  monthlySpend: number;
  monthlyBudget: number;
}
