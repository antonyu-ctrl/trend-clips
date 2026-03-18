"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Category } from "@/lib/types";

interface CategoryNavProps {
  categories: Category[];
  /** When provided, use controlled mode with click handler instead of Link navigation */
  activeSlug?: string | null;
  onSelect?: (slug: string) => void;
}

export function CategoryNav({ categories, activeSlug, onSelect }: CategoryNavProps) {
  const pathname = usePathname();
  const isControlled = onSelect !== undefined;

  const pillClass = (active: boolean) =>
    `shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
      active
        ? "bg-accent text-white"
        : "bg-surface text-text-secondary hover:bg-surface-hover hover:text-text-primary"
    }`;

  if (isControlled) {
    return (
      <nav className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => onSelect("")}
          className={pillClass(activeSlug === null || activeSlug === "")}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.slug)}
            className={pillClass(activeSlug === cat.slug)}
          >
            {cat.name}
          </button>
        ))}
      </nav>
    );
  }

  return (
    <nav className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
      <Link
        href="/"
        className={pillClass(pathname === "/")}
      >
        All
      </Link>
      {categories.map((cat) => {
        const isActive = pathname === `/category/${cat.slug}`;
        return (
          <Link
            key={cat.id}
            href={`/category/${cat.slug}`}
            className={pillClass(isActive)}
          >
            {cat.name}
          </Link>
        );
      })}
    </nav>
  );
}
