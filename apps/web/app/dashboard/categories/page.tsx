"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import {
  getUserCategories,
  createUserCategory,
  updateUserCategory,
  deleteUserCategory,
  getUserCategoryCount,
} from "@/lib/firebase/firestore";
import type { Category } from "@/lib/types";

export default function DashboardCategoriesPage() {
  const { user, userProfile } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formOrder, setFormOrder] = useState(0);
  const [saving, setSaving] = useState(false);
  const [limitMessage, setLimitMessage] = useState("");

  async function loadCategories() {
    if (!user) return;
    const cats = await getUserCategories(user.uid);
    setCategories(cats);
    setLoading(false);
  }

  useEffect(() => {
    loadCategories();
  }, [user]);

  function resetForm() {
    setFormName("");
    setFormSlug("");
    setFormDescription("");
    setFormOrder(categories.length);
    setEditing(null);
    setShowForm(false);
    setLimitMessage("");
  }

  function startEdit(cat: Category) {
    setFormName(cat.name);
    setFormSlug(cat.slug);
    setFormDescription(cat.description);
    setFormOrder(cat.order);
    setEditing(cat.id);
    setShowForm(true);
    setLimitMessage("");
  }

  async function startNew() {
    if (!user || !userProfile) return;
    const count = await getUserCategoryCount(user.uid);
    if (count >= (userProfile.maxCategories || 3)) {
      setLimitMessage(
        `You've reached the maximum of ${(userProfile.maxCategories || 3)} categories for your ${userProfile.tier} tier. Enter an invite code in Settings to unlock more.`
      );
      return;
    }
    resetForm();
    setFormOrder(categories.length);
    setShowForm(true);
  }

  async function handleSave() {
    if (!formName || !formSlug || !user) return;
    setSaving(true);
    try {
      if (editing) {
        await updateUserCategory(user.uid, editing, {
          name: formName,
          slug: formSlug,
          description: formDescription,
          order: formOrder,
        });
      } else {
        await createUserCategory(user.uid, {
          name: formName,
          slug: formSlug,
          description: formDescription,
          order: formOrder,
        });
      }
      await loadCategories();
      resetForm();
    } catch (err) {
      console.error("Failed to save category:", err);
    }
    setSaving(false);
  }

  async function handleDelete(catId: string) {
    if (!user) return;
    if (!confirm("Delete this category? Videos in this category won't be removed.")) return;
    await deleteUserCategory(user.uid, catId);
    await loadCategories();
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 animate-pulse rounded-lg bg-surface" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">My Categories</h2>
          {userProfile?.tier === "free" && (
            <p className="text-sm text-text-secondary">
              {categories.length}/{(userProfile.maxCategories || 3)} categories used
            </p>
          )}
        </div>
        <button
          onClick={startNew}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/90 transition-colors"
        >
          + Add Category
        </button>
      </div>

      {limitMessage && (
        <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm text-yellow-400">
          {limitMessage}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="rounded-xl border border-border bg-surface p-5 space-y-4">
          <h3 className="font-semibold text-text-primary">
            {editing ? "Edit Category" : "New Category"}
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-text-secondary">Name</label>
              <input
                type="text"
                value={formName}
                onChange={(e) => {
                  setFormName(e.target.value);
                  if (!editing) setFormSlug(e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
                }}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none"
                placeholder="e.g. AI & Tech"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-text-secondary">Slug</label>
              <input
                type="text"
                value={formSlug}
                onChange={(e) => setFormSlug(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none"
                placeholder="e.g. ai-tech"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm text-text-secondary">Description</label>
              <input
                type="text"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none"
                placeholder="Short description of this category"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-text-secondary">Order</label>
              <input
                type="number"
                value={formOrder}
                onChange={(e) => setFormOrder(parseInt(e.target.value) || 0)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving || !formName || !formSlug}
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

      {/* Category list */}
      <div className="space-y-2">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="flex items-center justify-between rounded-lg border border-border bg-surface p-4"
          >
            <div>
              <div className="font-medium text-text-primary">{cat.name}</div>
              <div className="text-sm text-text-muted">
                /{cat.slug} · Order: {cat.order}
                {cat.description && ` · ${cat.description}`}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => startEdit(cat)}
                className="rounded-md px-3 py-1 text-sm text-accent hover:bg-accent/10 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(cat.id)}
                className="rounded-md px-3 py-1 text-sm text-red-400 hover:bg-red-400/10 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {categories.length === 0 && (
          <p className="text-text-muted">No categories yet. Create one above.</p>
        )}
      </div>
    </div>
  );
}
