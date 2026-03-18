/**
 * Seed script for local development.
 * Run with: npx ts-node scripts/seed.ts
 * Requires Firebase emulators running or a .env with project config.
 */

import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

// For emulator usage:
process.env.FIRESTORE_EMULATOR_HOST = "localhost:8080";

initializeApp({ projectId: "demo-trendclips" });
const db = getFirestore();

const categories = [
  { name: "AI & Tech", slug: "ai", description: "Artificial intelligence, machine learning, and tech trends", order: 1 },
  { name: "Travel", slug: "travel", description: "Travel destinations, tips, and adventures", order: 2 },
  { name: "Food", slug: "food", description: "Recipes, restaurants, and food culture", order: 3 },
  { name: "Gaming", slug: "gaming", description: "Video games, esports, and gaming culture", order: 4 },
  { name: "Music", slug: "music", description: "Music videos, covers, and performances", order: 5 },
  { name: "Fitness", slug: "fitness", description: "Workouts, health tips, and wellness", order: 6 },
];

const topics = [
  { name: "AI Tools", searchQueries: ["ai tools 2026", "chatgpt tutorial", "claude ai"], defaultCategory: "ai", isActive: true },
  { name: "Travel Vlog", searchQueries: ["travel vlog 2026", "best travel destinations"], defaultCategory: "travel", isActive: true },
  { name: "Easy Recipes", searchQueries: ["easy recipe viral", "5 minute meals"], defaultCategory: "food", isActive: true },
  { name: "Gaming Highlights", searchQueries: ["gaming highlights", "best gaming moments"], defaultCategory: "gaming", isActive: true },
];

const sampleVideos = [
  {
    id: "youtube_dQw4w9WgXcQ",
    platform: "youtube",
    platformVideoId: "dQw4w9WgXcQ",
    embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    title: "Amazing AI Demo - GPT in Action",
    description: "Watch this incredible AI demonstration",
    thumbnailUrl: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    category: "ai",
    format: "clip",
    tags: ["ai", "demo", "gpt"],
    viewCount: 1500000,
    upvotes: 42,
    downvotes: 3,
    score: 50,
    status: "active",
    createdAt: FieldValue.serverTimestamp(),
    fetchedAt: FieldValue.serverTimestamp(),
  },
  {
    id: "youtube_jNQXAC9IVRw",
    platform: "youtube",
    platformVideoId: "jNQXAC9IVRw",
    embedUrl: "https://www.youtube.com/embed/jNQXAC9IVRw",
    title: "Hidden Gems in Singapore - Travel Guide 2026",
    description: "Discover the best kept secrets of Singapore",
    thumbnailUrl: "https://i.ytimg.com/vi/jNQXAC9IVRw/hqdefault.jpg",
    category: "travel",
    format: "clip",
    tags: ["travel", "singapore", "guide"],
    viewCount: 850000,
    upvotes: 28,
    downvotes: 1,
    score: 45,
    status: "active",
    createdAt: FieldValue.serverTimestamp(),
    fetchedAt: FieldValue.serverTimestamp(),
  },
  {
    id: "youtube_short_abc123",
    platform: "youtube",
    platformVideoId: "abc123",
    embedUrl: "https://www.youtube.com/embed/abc123",
    title: "AI generates a full website in 30 seconds #shorts",
    description: "Incredible AI website builder demo",
    thumbnailUrl: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    category: "ai",
    format: "short",
    tags: ["ai", "shorts", "coding"],
    viewCount: 3200000,
    upvotes: 67,
    downvotes: 5,
    score: 60,
    status: "active",
    createdAt: FieldValue.serverTimestamp(),
    fetchedAt: FieldValue.serverTimestamp(),
  },
  {
    id: "youtube_short_def456",
    platform: "youtube",
    platformVideoId: "def456",
    embedUrl: "https://www.youtube.com/embed/def456",
    title: "This gaming clutch is INSANE #shorts",
    description: "Epic gaming moment caught on camera",
    thumbnailUrl: "https://i.ytimg.com/vi/jNQXAC9IVRw/hqdefault.jpg",
    category: "gaming",
    format: "short",
    tags: ["gaming", "clutch", "shorts"],
    viewCount: 780000,
    upvotes: 15,
    downvotes: 2,
    score: 30,
    status: "active",
    createdAt: FieldValue.serverTimestamp(),
    fetchedAt: FieldValue.serverTimestamp(),
  },
];

async function seed() {
  console.log("Seeding categories...");
  for (const cat of categories) {
    await db.collection("categories").doc(cat.slug).set(cat);
  }

  console.log("Seeding topics...");
  for (const topic of topics) {
    await db.collection("topics").add(topic);
  }

  console.log("Seeding sample videos...");
  for (const video of sampleVideos) {
    const { id, ...data } = video;
    await db.collection("videos").doc(id).set(data);
  }

  console.log("Done! Seeded:");
  console.log(`  ${categories.length} categories`);
  console.log(`  ${topics.length} topics`);
  console.log(`  ${sampleVideos.length} sample videos (2 clips + 2 shorts)`);
}

seed().catch(console.error);
