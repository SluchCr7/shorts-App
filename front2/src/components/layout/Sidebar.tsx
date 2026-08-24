"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import { useCheckAuthQuery } from "../../redux/api/authApi";
import { setFeedType, openAuthModal } from "../../redux/slices/uiSlice";
import { FiCompass, FiUsers, FiHome, FiTrendingUp, FiBookmark } from "react-icons/fi";

export default function Sidebar() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { data: user } = useCheckAuthQuery();
  const isAuthenticated = !!user;
  const { feedType } = useAppSelector((state) => state.ui);

  const mainNav = [
    {
      name: "For You",
      icon: FiHome,
      path: "/",
      type: "for-you" as const,
      requiresAuth: false,
    },
    {
      name: "Following",
      icon: FiUsers,
      path: "/following",
      type: "following" as const,
      requiresAuth: true,
    },
    {
      name: "Explore",
      icon: FiCompass,
      path: "/explore",
      type: null,
      requiresAuth: false,
    },
  ];

  const trendingTags = [
    { name: "dance", count: "14.2M" },
    { name: "funny", count: "9.8M" },
    { name: "music", count: "22.5M" },
    { name: "viral", count: "45.1M" },
    { name: "tech", count: "5.4M" },
  ];

  return (
    <aside className="w-64 h-[calc(100vh-4rem)] sticky top-16 border-r border-[var(--border-color)] bg-[var(--bg-surface)]/95 backdrop-blur-md p-4 hidden md:flex flex-col justify-between overflow-y-auto transition-colors">
      <div className="space-y-6">
        {/* Main Navigation */}
        <nav className="space-y-1.5">
          {mainNav.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.path === "/"
                ? pathname === "/" && feedType === "for-you"
                : item.path === "/following"
                ? pathname === "/following" || feedType === "following"
                : pathname.startsWith(item.path);

            return (
              <Link
                key={item.name}
                href={item.requiresAuth && !isAuthenticated ? "#" : item.path}
                onClick={(e) => {
                  if (item.requiresAuth && !isAuthenticated) {
                    e.preventDefault();
                    dispatch(openAuthModal("view your following feed"));
                    return;
                  }
                  if (item.type) {
                    dispatch(setFeedType(item.type));
                  }
                }}
                className={`relative flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200 ${
                  isActive
                    ? "bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] shadow-xs"
                    : "text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-[var(--accent-primary)]" />
                )}
                <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? "text-[var(--accent-primary)] scale-110" : ""}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}

          {isAuthenticated && (
            <Link
              href={`/profile/${user?.username}`}
              className="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] transition-all duration-200"
            >
              <FiBookmark className="w-5 h-5 text-amber-500" />
              <span>Saved Shorts</span>
            </Link>
          )}
        </nav>

        <hr className="border-[var(--border-color)] opacity-60" />

        {/* Trending Hashtags */}
        <div>
          <h3 className="px-4 text-[11px] font-black uppercase tracking-wider text-[var(--text-muted)] mb-3 flex items-center gap-1.5">
            <FiTrendingUp className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
            Trending Topics
          </h3>
          <div className="space-y-1">
            {trendingTags.map((tag) => (
              <Link
                key={tag.name}
                href={`/explore?tag=${tag.name}`}
                className="group flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-all duration-200"
              >
                <span className="font-bold text-[var(--accent-secondary)] group-hover:text-[var(--accent-primary)] transition-colors">
                  #{tag.name}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[var(--bg-elevated)] group-hover:bg-[var(--border-color)] text-[10px] font-bold text-[var(--text-muted)] transition-colors">
                  {tag.count}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="px-4 text-[11px] text-[var(--text-muted)] space-y-1.5 pt-4 border-t border-[var(--border-color)]">
        <p className="font-bold text-[var(--text-secondary)]">VIBE<span className="text-[var(--accent-primary)]">SHORTS</span> Platform</p>
        <p className="text-[10px] text-[var(--text-muted)]">© 2026 High-speed Video Stream</p>
      </div>
    </aside>
  );
}
