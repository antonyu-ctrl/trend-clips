"use client";

import { useState, useEffect } from "react";
import {
  getTopics,
  getCategories,
  createTopic,
  updateTopic,
  deleteTopic,
} from "@/lib/firebase/firestore";
import type { Category } from "@/lib/types";

interface Topic {
  id: string;
  name: string;
  searchQueries: string[];
  defaultCategory: string;
  isActive: boolean;
}

export default function AdminTopicsPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [formName, setFormName] = useState("");
  const [formQueries, setFormQueries] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formActive, setFormActive] = useState(true);
  const [saving, setSaving] = useState(false);

  async function loadData() {
    const [t, c] = await Promise.all([getTopics(), getCategories()]);
    setTopics(t);
    setCategories(c);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  function resetForm() {
    setFormName("");
    setFormQueries("");
    setFormCategory(categories[0]?.slug || "");
    setFormActive(true);
    setEditing(null);
    setShowForm(false);
  }

  function startEdit(topic: Topic) {
    setFormName(topic.name);
    setFormQueries(topic.searchQueries.join("\n"));
    setFormCategory(topic.defaultCategory);
    setFormActive(topic.isActive);
    setEditing(topic.id);
    setShowForm(true);
  }

  async function handleSave() {
    if (!formName || !formQueries) return;
    setSaving(true);
    const queries = formQueries.split("\n").map((q) => q.trim()).filter(Boolean);
    try {
      if (editing) {
        await updateTopic(editing, {
          name: formName,
          searchQueries: queries,
          defaultCategory: formCategory,
          isActive: formActive,
        });
      } else {
        await createTopic({
          name: formName,
          searchQueries: queries,
          defaultCategory: formCategory,
          isActive: formActive,
        });
      }
      await loadData();
      resetForm();
    } catch (err) {
      console.error("Failed to save topic:", err);
    }
    setSaving(false);
  }

  async function handleDelete(topicId: string) {
    if (!confirm("Delete this topic? Existing fetched videos will remain.")) return;
    await deleteTopic(topicId);
    await loadData();
  }

  async function handleToggleActive(topic: Topic) {
    await updateTopic(topic.id, { isActive: !topic.isActive });
    await loadData();
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-text-primary">Topics</h1>
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 animate-pulse rounded-lg bg-surface" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Topics</h1>
          <p className="text-sm text-text-secondary">
            Topics define what search queries are used to fetch YouTube videos.
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="w-full rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/90 transition-colors sm:w-auto"
        >
          + Add Topic
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="rounded-xl border border-border bg-surface p-5 space-y-4">
          <h3 className="font-semibold text-text-primary">
            {editing ? "Edit Topic" : "New Topic"}
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-text-secondary">Topic Name</label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none"
                placeholder="e.g. AI Tools 2026"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-text-secondary">Default Category</label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.slug}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm text-text-secondary">
                Search Queries (one per line)
              </label>
              <textarea
                value={formQueries}
                onChange={(e) => setFormQueries(e.target.value)}
                rows={4}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none"
                placeholder={"ai tools 2026\nchatgpt tutorial\nbest ai apps"}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="active"
                checked={formActive}
                onChange={(e) => setFormActive(e.target.checked)}
                className="rounded border-border"
              />
              <label htmlFor="active" className="text-sm text-text-secondary">
                Active (fetcher will use this topic)
              </label>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving || !formName || !formQueries}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/90 disabled:opacity-50 transition-colors"
            >
              {saving ? "Saving..." : editing ? "Update" : "Create"}
            </button>
            <button
              onClick={resetForm}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Topic list */}
      <div className="space-y-2">
        {topics.map((topic) => (
          <div
            key={topic.id}
            className="rounded-lg border border-border bg-surface p-4"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-text-primary">{topic.name}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    topic.isActive
                      ? "bg-green-500/10 text-green-400"
                      : "bg-red-500/10 text-red-400"
                  }`}
                >
                  {topic.isActive ? "Active" : "Paused"}
                </span>
              </div>
              <div className="mt-1 text-sm text-text-muted">
                Category: {topic.defaultCategory} · {topic.searchQueries.length} queries
              </div>
              <div className="mt-1 flex flex-wrap gap-1">
                {topic.searchQueries.map((q) => (
                  <span
                    key={q}
                    className="rounded bg-background px-2 py-0.5 text-xs text-text-secondary"
                  >
                    {q}
                  </span>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={() => handleToggleActive(topic)}
                  className="rounded-md px-3 py-1 text-sm text-text-secondary hover:bg-surface-hover transition-colors"
                >
                  {topic.isActive ? "Pause" : "Activate"}
                </button>
                <button
                  onClick={() => startEdit(topic)}
                  className="rounded-md px-3 py-1 text-sm text-accent hover:bg-accent/10 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(topic.id)}
                  className="rounded-md px-3 py-1 text-sm text-red-400 hover:bg-red-400/10 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
        {topics.length === 0 && (
          <p className="text-text-muted">No topics yet. Create one to start fetching videos.</p>
        )}
      </div>
    </div>
  );
}
