"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useSearchShortsQuery } from "../../src/redux/api/shortsApi";
import VideoGrid from "../../src/components/profile/VideoGrid";
import { MAIN_STATIC_HASHTAGS } from "../../src/constants/hashtags";
import { FiSearch, FiTrendingUp, FiHash, FiStar } from "react-icons/fi";

function ExploreContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const initialTag = searchParams.get("tag") || "";

  const [query, setQuery] = useState(initialQuery);
  const [activeTag, setActiveTag] = useState(initialTag);

  // Fetch search results or all public shorts by default when query and tag are empty
  const { data: shorts = [], isLoading } = useSearchShortsQuery({
    query,
    tag: activeTag,
  });

  // Extract real dynamic hashtags from published shorts in real-time
  const realHashtags = useMemo(() => {
    const counts: Record<string, number> = {};
    shorts.forEach((short) => {
      if (Array.isArray(short.hashtags)) {
        short.hashtags.forEach((tag) => {
          const cleaned = tag.toLowerCase().replace(/^#/, "").trim();
          if (cleaned) {
            counts[cleaned] = (counts[cleaned] || 0) + 1;
          }
        });
      }
    });

    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [shorts]);

  // Combined list of tags: Static main hashtags + any real dynamic hashtags from DB
  const allTagItems = useMemo(() => {
    const staticMap = new Map(MAIN_STATIC_HASHTAGS.map((item) => [item.name.toLowerCase(), item]));
    const list = [...MAIN_STATIC_HASHTAGS];

    realHashtags.forEach(({ name }) => {
      if (!staticMap.has(name.toLowerCase())) {
        list.push({
          name: name,
          label: `#${name}`,
          icon: "🏷️",
          category: "creative",
        });
      }
    });

    return list;
  }, [realHashtags]);

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] p-4 sm:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="max-w-5xl space-y-6">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-[var(--accent-primary)]/20">
            <FiTrendingUp className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">Explore & Discover</h1>
            <p className="text-xs sm:text-sm font-semibold text-[var(--text-secondary)]">Discover trending short videos, main topics & real hashtags</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search shorts by title, description, or #hashtag..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveTag("");
            }}
            className="w-full h-12 pl-12 pr-10 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] text-sm font-medium text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] focus:ring-2 focus:ring-[var(--accent-primary)]/20 shadow-sm transition-all"
          />
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
          {(query || activeTag) && (
            <button
              onClick={() => {
                setQuery("");
                setActiveTag("");
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[var(--accent-primary)] hover:underline cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* Main Static & Real Hashtag Pills */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[var(--text-secondary)]">
            <FiStar className="w-4 h-4 text-[var(--accent-primary)]" />
            <span>Main Topics & Hashtags</span>
          </div>

          <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1">
            <button
              onClick={() => {
                setActiveTag("");
                setQuery("");
              }}
              className={`px-4.5 h-10 rounded-2xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap border ${
                !activeTag && !query
                  ? "bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white border-transparent shadow-lg shadow-[var(--accent-primary)]/25"
                  : "bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-color)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
              }`}
            >
              <span>🔥</span>
              <span>All Shorts</span>
            </button>

            {allTagItems.map((item) => {
              const isActive = activeTag.toLowerCase() === item.name.toLowerCase();
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    setActiveTag(item.name);
                    setQuery("");
                  }}
                  className={`px-4 h-10 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 border ${
                    isActive
                      ? "bg-[var(--accent-primary)] text-white border-[var(--accent-primary)] shadow-md shadow-[var(--accent-primary)]/25 scale-[1.02]"
                      : "bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-color)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Real Hashtags Badge Section (if available) */}
        {realHashtags.length > 0 && (
          <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-extrabold text-[var(--text-primary)]">
              <FiHash className="w-4 h-4 text-[var(--accent-cyan)]" />
              <span>Real Trending Hashtags on Platform</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {realHashtags.slice(0, 12).map(({ name, count }) => (
                <button
                  key={name}
                  onClick={() => {
                    setActiveTag(name);
                    setQuery("");
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                    activeTag.toLowerCase() === name.toLowerCase()
                      ? "bg-[var(--accent-cyan)] text-slate-950 border-[var(--accent-cyan)] shadow-sm"
                      : "bg-[var(--bg-elevated)] text-[var(--accent-cyan)] border-[var(--border-color)] hover:border-[var(--accent-cyan)]/40 hover:bg-slate-900"
                  }`}
                >
                  <span>#{name}</span>
                  <span className="px-1.5 py-0.5 rounded-md bg-black/30 text-[10px] text-slate-200">
                    {count} {count === 1 ? "video" : "videos"}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Results Grid */}
      {isLoading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-[var(--accent-primary)] border-t-transparent animate-spin" />
          <p className="text-xs font-semibold text-[var(--text-muted)]">Loading shorts...</p>
        </div>
      ) : (
        <VideoGrid
          shorts={shorts}
          emptyMessage={
            activeTag
              ? `No shorts found under #${activeTag}`
              : query
              ? `No shorts found matching "${query}"`
              : "No shorts uploaded yet"
          }
        />
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
