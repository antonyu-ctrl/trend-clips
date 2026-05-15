"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import { useT } from "@/lib/i18n/I18nContext";
import {
  getUserTopics,
  getUserCategories,
  createUserTopic,
  updateUserTopic,
  deleteUserTopic,
  getUserTopicCount,
  triggerUserFetch,
} from "@/lib/firebase/firestore";
import type { Category, Topic } from "@/lib/types";

function getLanguageOptions(t: (key: string) => string) {
  return [
    { code: "en", label: t("lang.en") },
    { code: "ko", label: t("lang.ko") },
    { code: "ja", label: t("lang.ja") },
    { code: "es", label: t("lang.es") },
    { code: "fr", label: t("lang.fr") },
    { code: "de", label: t("lang.de") },
    { code: "pt", label: t("lang.pt") },
    { code: "zh", label: t("lang.zh") },
  ];
}

export default function DashboardTopicsPage() {
  const { user, userProfile } = useAuth();
  const { t } = useT();
  const LANGUAGE_OPTIONS = getLanguageOptions(t);
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
  const [formLanguages, setFormLanguages] = useState<string[]>(["en"]);
  const [saving, setSaving] = useState(false);
  const [limitMessage, setLimitMessage] = useState("");
  const [fetchStatus, setFetchStatus] = useState<string | null>(null);

  async function loadData() {
    if (!user) return;
    const [t, c] = await Promise.all([getUserTopics(user.uid), getUserCategories(user.uid)]);
    setTopics(t);
    setCategories(c);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, [user]);

  function resetForm() {
    setFormName("");
    setFormQueries("");
    setFormCategory(categories[0]?.slug || "");
    setFormActive(true);
    setFormLanguages(["en"]);
    setEditing(null);
    setShowForm(false);
    setLimitMessage("");
  }

  function startEdit(topic: Topic) {
    setFormName(topic.name);
    setFormQueries(topic.searchQueries.join("\n"));
    setFormCategory(topic.defaultCategory);
    setFormActive(topic.isActive);
    setFormLanguages(topic.languages || ["en"]);
    setEditing(topic.id);
    setShowForm(true);
    setLimitMessage("");
  }

  function toggleLanguage(code: string) {
    setFormLanguages((prev) =>
      prev.includes(code) ? prev.filter((l) => l !== code) : [...prev, code]
    );
  }

  async function startNew() {
    if (!user || !userProfile) return;
    const count = await getUserTopicCount(user.uid);
    const maxTopics = userProfile.maxTopics || 5;
    if (count >= maxTopics) {
      setLimitMessage(
        t("topics.reachedMax", { max: userProfile.maxTopics, tier: userProfile.tier })
      );
      return;
    }
    if (categories.length === 0) {
      setLimitMessage(t("topics.needCategory"));
      return;
    }
    resetForm();
    setFormCategory(categories[0]?.slug || "");
    setShowForm(true);
  }

  async function handleSave() {
    if (!formName || !formQueries || !user) return;
    setSaving(true);
    const queries = formQueries.split("\n").map((q) => q.trim()).filter(Boolean);
    try {
      if (editing) {
        await updateUserTopic(user.uid, editing, {
          name: formName,
          searchQueries: queries,
          defaultCategory: formCategory,
          isActive: formActive,
          languages: formLanguages,
        });
      } else {
        await createUserTopic(user.uid, {
          name: formName,
          searchQueries: queries,
          defaultCategory: formCategory,
          isActive: formActive,
          languages: formLanguages,
        });
      }
      await loadData();
      resetForm();

      // Trigger on-demand fetch for this user's topics
      setFetchStatus(t("topics.fetchingVideos"));
      try {
        const result = await triggerUserFetch();
        setFetchStatus(
          result.videosAdded > 0
            ? t("topics.videosFound", { count: result.videosAdded })
            : t("topics.noNewVideos")
        );
        setTimeout(() => setFetchStatus(null), 5000);
      } catch (fetchErr) {
        console.error("Fetch failed:", fetchErr);
        setFetchStatus(t("topics.fetchFailed"));
        setTimeout(() => setFetchStatus(null), 5000);
      }
    } catch (err) {
      console.error("Failed to save topic:", err);
    }
    setSaving(false);
  }

  async function handleDelete(topicId: string) {
    if (!user) return;
    if (!confirm(t("topics.confirmDelete"))) return;
    await deleteUserTopic(user.uid, topicId);
    await loadData();
  }

  async function handleToggleActive(topic: Topic) {
    if (!user) return;
    await updateUserTopic(user.uid, topic.id, { isActive: !topic.isActive });
    await loadData();
  }

  if (loading) {
    return (
      <div className="space-y-4">
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
          <h2 className="text-lg font-semibold text-text-primary">{t("topics.title")}</h2>
          <p className="text-sm text-text-secondary">
            {t("topics.description")}
            {userProfile?.tier === "free" && (
              <> {t("topics.used", { count: topics.length, max: userProfile.maxTopics })}</>
            )}
          </p>
        </div>
        <button
          onClick={startNew}
          className="w-full rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/90 transition-colors sm:w-auto"
        >
          {t("topics.addTopic")}
        </button>
      </div>

      {limitMessage && (
        <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm text-yellow-400">
          {limitMessage}
        </div>
      )}

      {fetchStatus && (
        <div className="flex items-center gap-2 rounded-lg border border-accent/30 bg-accent/10 p-4 text-sm text-accent">
          {fetchStatus === t("topics.fetchingVideos") && (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          )}
          {fetchStatus}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="rounded-xl border border-border bg-surface p-5 space-y-4">
          <h3 className="font-semibold text-text-primary">
            {editing ? t("topics.editTopic") : t("topics.newTopic")}
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-text-secondary">{t("topics.topicName")}</label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none"
                placeholder="e.g. AI Tools 2026"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-text-secondary">{t("topics.defaultCategory")}</label>
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
                {t("topics.searchQueries")}
              </label>
              <textarea
                value={formQueries}
                onChange={(e) => setFormQueries(e.target.value)}
                rows={4}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none"
                placeholder={"ai tools 2026\nchatgpt tutorial\nbest ai apps"}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm text-text-secondary">
                {t("topics.languages")}
              </label>
              <div className="flex flex-wrap gap-2">
                {LANGUAGE_OPTIONS.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => toggleLanguage(lang.code)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                      formLanguages.includes(lang.code)
                        ? "bg-accent text-white"
                        : "bg-background text-text-secondary hover:bg-surface-hover"
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
              {formLanguages.length === 0 && (
                <p className="mt-1 text-xs text-red-400">{t("topics.selectLanguage")}</p>
              )}
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
                {t("topics.active")}
              </label>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving || !formName || !formQueries}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/90 disabled:opacity-50 transition-colors"
            >
              {saving ? t("topics.saving") : editing ? t("topics.update") : t("topics.create")}
            </button>
            <button
              onClick={resetForm}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
            >
              {t("topics.cancel")}
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
                  {topic.isActive ? t("topics.activeStatus") : t("topics.pausedStatus")}
                </span>
              </div>
              <div className="mt-1 text-sm text-text-muted">
                Category: {topic.defaultCategory} · {topic.searchQueries.length} queries · Lang: {(topic.languages || ["en"]).join(", ")}
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
                  {topic.isActive ? t("topics.pause") : t("topics.activate")}
                </button>
                <button
                  onClick={() => startEdit(topic)}
                  className="rounded-md px-3 py-1 text-sm text-accent hover:bg-accent/10 transition-colors"
                >
                  {t("topics.edit")}
                </button>
                <button
                  onClick={() => handleDelete(topic.id)}
                  className="rounded-md px-3 py-1 text-sm text-red-400 hover:bg-red-400/10 transition-colors"
                >
                  {t("topics.delete")}
                </button>
              </div>
            </div>
          </div>
        ))}
        {topics.length === 0 && (
          <p className="text-text-muted">{t("topics.empty")}</p>
        )}
      </div>
    </div>
  );
}
