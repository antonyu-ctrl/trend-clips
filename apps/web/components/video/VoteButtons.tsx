"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import { castVote, getUserVote } from "@/lib/firebase/firestore";
import type { VoteType } from "@/lib/types";

interface VoteButtonsProps {
  videoId: string;
  initialUpvotes: number;
  initialDownvotes: number;
}

export function VoteButtons({
  videoId,
  initialUpvotes,
  initialDownvotes,
}: VoteButtonsProps) {
  const { user } = useAuth();
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [downvotes, setDownvotes] = useState(initialDownvotes);
  const [currentVote, setCurrentVote] = useState<VoteType | null>(null);
  const [voting, setVoting] = useState(false);

  useEffect(() => {
    if (!user) return;
    getUserVote(user.uid, videoId).then((vote) => {
      if (vote) setCurrentVote(vote.voteType);
    });
  }, [user, videoId]);

  const handleVote = async (type: VoteType) => {
    if (!user || voting) return;
    setVoting(true);

    try {
      // Optimistic update
      if (currentVote === type) {
        // Removing vote
        if (type === "up") setUpvotes((v) => v - 1);
        else setDownvotes((v) => v - 1);
        setCurrentVote(null);
      } else if (currentVote) {
        // Switching vote
        if (type === "up") {
          setUpvotes((v) => v + 1);
          setDownvotes((v) => v - 1);
        } else {
          setDownvotes((v) => v + 1);
          setUpvotes((v) => v - 1);
        }
        setCurrentVote(type);
      } else {
        // New vote
        if (type === "up") setUpvotes((v) => v + 1);
        else setDownvotes((v) => v + 1);
        setCurrentVote(type);
      }

      await castVote(user.uid, videoId, type);
    } catch {
      // Revert on error
      setUpvotes(initialUpvotes);
      setDownvotes(initialDownvotes);
      const vote = await getUserVote(user.uid, videoId);
      setCurrentVote(vote?.voteType ?? null);
    } finally {
      setVoting(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handleVote("up")}
        disabled={!user || voting}
        className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
          currentVote === "up"
            ? "bg-upvote/20 text-upvote"
            : "bg-surface text-text-secondary hover:bg-surface-hover hover:text-upvote"
        } disabled:cursor-not-allowed disabled:opacity-50`}
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
        </svg>
        {upvotes}
      </button>
      <button
        onClick={() => handleVote("down")}
        disabled={!user || voting}
        className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
          currentVote === "down"
            ? "bg-downvote/20 text-downvote"
            : "bg-surface text-text-secondary hover:bg-surface-hover hover:text-downvote"
        } disabled:cursor-not-allowed disabled:opacity-50`}
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
        {downvotes}
      </button>
    </div>
  );
}
