"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useSearchShortsQuery } from "../../src/redux/api/shortsApi";
import VideoGrid from "../../src/components/profile/VideoGrid";
import { FiSearch, FiTrendingUp } from "react-icons/fi";

function ExploreContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const initialTag = searchParams.get("tag") || "";

  const [query, setQuery] = useState(initialQuery);
  const [activeTag, setActiveTag] = useState(initialTag);

  const tags = ["dance", "funny", "music", "viral", "tech", "sports", "gaming"];

  const { data: shorts = [], isLoading } = useSearchShortsQuery(
    { query, tag: activeTag },
    { skip: !query && !activeTag }
  );

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] p-4 sm:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="max-w-4xl space-y-5">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[var(--accent-primary)]/15 text-[var(--accent-primary)] flex items-center justify-center font-bold text-xl shadow-inner border border-[var(--accent-primary)]/20">
            <FiTrendingUp className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">Explore & Discover</h1>
            <p className="text-xs sm:text-sm font-semibold text-[var(--text-secondary)]">Discover trending short videos, hashtags, and viral creators</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search shorts by title, creator, or keyword..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveTag("");
            }}
            className="w-full h-12 pl-12 pr-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] text-sm font-medium text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] focus:ring-2 focus:ring-[var(--accent-primary)]/20 shadow-sm transition-all"
          />
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
        </div>

        {/* Hashtag Filters */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => {
              setActiveTag("");
              setQuery("");
            }}
            className={`px-4.5 h-9 rounded-full text-xs font-bold transition-all cursor-pointer ${
              !activeTag && !query
                ? "bg-[var(--accent-primary)] text-white shadow-md shadow-[var(--accent-primary)]/25"
                : "bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-color)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
            }`}
          >
            All Trending
          </button>
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => {
                setActiveTag(tag);
                setQuery("");
              }}
              className={`px-4.5 h-9 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTag === tag
                  ? "bg-[var(--accent-primary)] text-white shadow-md shadow-[var(--accent-primary)]/25"
                  : "bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-color)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-[var(--accent-primary)] border-t-transparent animate-spin" />
          <p className="text-xs font-semibold text-[var(--text-muted)]">Searching shorts...</p>
        </div>
      ) : (
        <VideoGrid shorts={shorts} emptyMessage="No shorts found for your search" />
      )}
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-[calc(100vh-4rem)] flex items-center justify-center">
          <div className="w-10 h-10 rounded-full border-4 border-[var(--accent-primary)] border-t-transparent animate-spin" />
        </div>
      }
    >
      <ExploreContent />
    </Suspense>
  );
}
