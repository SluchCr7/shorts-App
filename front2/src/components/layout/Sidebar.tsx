"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import { useCheckAuthQuery, useLogoutMutation } from "../../redux/api/authApi";
import { 
  setFeedType, 
  openAuthModal, 
  openUploadModal, 
  openSidebar, 
  closeSidebar 
} from "../../redux/slices/uiSlice";
import ThemeToggle from "./ThemeToggle";
import VerifiedBadge from "../common/VerifiedBadge";
import { 
  FiCompass, FiUsers, FiHome, FiTrendingUp, FiBookmark, 
  FiPlus, FiSearch, FiLogOut, FiUser, FiPlay, FiLogIn,
  FiMenu, FiX
} from "react-icons/fi";

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { data: user } = useCheckAuthQuery();
  const [logout] = useLogoutMutation();
  const isAuthenticated = !!user;
  const { feedType, isSidebarOpen } = useAppSelector((state) => state.ui);

  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Auto-close mobile sidebar when navigating
  useEffect(() => {
    dispatch(closeSidebar());
  }, [pathname, dispatch]);

  // Close mobile sidebar on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isSidebarOpen) {
        dispatch(closeSidebar());
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSidebarOpen, dispatch]);

  const handleNavClick = () => {
    if (isSidebarOpen) {
      dispatch(closeSidebar());
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
      handleNavClick();
    }
  };

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      setDropdownOpen(false);
      handleNavClick();
      router.push("/");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

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

  const renderSidebarContent = (isMobile = false) => (
    <>
      <div className="space-y-6">
        
        {/* 1. Brand Logo & Mobile Close Button */}
        <div className="flex items-center justify-between px-2 pt-2">
          <Link href="/" onClick={handleNavClick} className="flex items-center gap-3 group">
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-[var(--accent-primary)] via-rose-500 to-[var(--accent-secondary)] flex items-center justify-center text-white shadow-lg shadow-[var(--accent-primary)]/25 transition-all duration-300 group-hover:scale-105">
              <FiPlay className="w-4 h-4 fill-current translate-x-0.5" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-lg tracking-tight text-[var(--text-primary)] leading-none">
                VIBE<span className="text-[var(--accent-primary)]">SHORTS</span>
              </span>
              <span className="text-[8px] font-bold uppercase tracking-widest text-[var(--text-muted)] leading-tight pt-0.5">
                Pro Stream
              </span>
            </div>
          </Link>

          {isMobile && (
            <button
              onClick={() => dispatch(closeSidebar())}
              className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer"
              aria-label="Close menu"
            >
              <FiX className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* 2. Quick Search Bar inside Sidebar */}
        <form onSubmit={handleSearchSubmit} className="relative px-1">
          <input
            type="text"
            placeholder="Search shorts, tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-8 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-primary)] transition-all"
          />
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)]" />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              ✕
            </button>
          )}
        </form>

        {/* 3. Main Navigation */}
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
                  handleNavClick();
                }}
                className={`relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                  isActive
                    ? "bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] shadow-xs"
                    : "text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-[var(--accent-primary)]" />
                )}
                <Icon className={`w-4 h-4 transition-transform ${isActive ? "text-[var(--accent-primary)] scale-110" : ""}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}

          {isAuthenticated && (
            <Link
              href={`/profile/${user?.username}`}
              onClick={handleNavClick}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] transition-all duration-200"
            >
              <FiBookmark className="w-4 h-4 text-amber-500" />
              <span>Saved Shorts</span>
            </Link>
          )}
        </nav>

        <hr className="border-[var(--border-color)] opacity-60" />

        {/* 4. Upload Button */}
        {isAuthenticated && (
          <button
            onClick={() => {
              dispatch(openUploadModal());
              handleNavClick();
            }}
            className="w-full h-10 px-4 rounded-xl bg-gradient-to-r from-[var(--accent-primary)] via-rose-500 to-[var(--accent-secondary)] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-[var(--accent-primary)]/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <FiPlus className="w-4 h-4 stroke-[3]" />
            <span>Upload Short</span>
          </button>
        )}

        {/* 5. Trending Hashtags */}
        <div>
          <h3 className="px-3 text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)] mb-2 flex items-center gap-1.5">
            <FiTrendingUp className="w-3 h-3 text-[var(--accent-primary)]" />
            Trending
          </h3>
          <div className="space-y-0.5">
            {trendingTags.map((tag) => (
              <Link
                key={tag.name}
                href={`/explore?tag=${tag.name}`}
                onClick={handleNavClick}
                className="group flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-all"
              >
                <span className="font-bold text-[var(--accent-secondary)] group-hover:text-[var(--accent-primary)]">
                  #{tag.name}
                </span>
                <span className="text-[9px] font-bold text-[var(--text-muted)]">
                  {tag.count}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* 6. Bottom Section: Theme Toggle & User Profile / Login */}
      <div className="pt-4 border-t border-[var(--border-color)] space-y-3">
        
        {/* Theme Toggle Bar */}
        <div className="flex items-center justify-between px-2">
          <span className="text-xs font-semibold text-[var(--text-secondary)]">Appearance</span>
          <ThemeToggle />
        </div>

        {/* User Account / Dropdown or Login */}
        {isAuthenticated ? (
          <div className="relative">
            {dropdownOpen && (
              <div className="absolute bottom-12 left-0 right-0 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-2xl p-2 z-50 backdrop-blur-xl animate-in fade-in">
                <div className="px-3 py-2 border-b border-[var(--border-color)] mb-1 bg-[var(--bg-elevated)]/40 rounded-xl">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <p className="font-extrabold text-xs text-[var(--text-primary)] truncate">{user?.fullName}</p>
                    {user?.isVerified && <VerifiedBadge size="xs" />}
                  </div>
                  <p className="text-[10px] font-medium text-[var(--text-secondary)] truncate">@{user?.username}</p>
                </div>
                <Link
                  href={`/profile/${user?.username}`}
                  onClick={() => {
                    setDropdownOpen(false);
                    handleNavClick();
                  }}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] rounded-xl"
                >
                  <FiUser className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                  My Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-500 hover:bg-rose-500/10 rounded-xl cursor-pointer mt-0.5"
                >
                  <FiLogOut className="w-3.5 h-3.5" />
                  Logout
                </button>
              </div>
            )}

            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-full flex items-center gap-3 p-2 rounded-xl bg-[var(--bg-elevated)]/50 hover:bg-[var(--bg-elevated)] border border-[var(--border-color)] transition-all cursor-pointer"
            >
              <img
                src={user?.avatar || "https://res.cloudinary.com/demo/image/upload/v1570972417/avatar-placeholder.png"}
                alt={user?.username || "Avatar"}
                className="w-8 h-8 rounded-full object-cover border border-[var(--accent-primary)]"
              />
              <div className="flex flex-col text-left min-w-0 flex-1">
                <span className="text-xs font-bold text-[var(--text-primary)] truncate">{user?.fullName}</span>
                <span className="text-[10px] text-[var(--text-muted)] truncate">@{user?.username}</span>
              </div>
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            onClick={handleNavClick}
            className="w-full h-9 rounded-xl bg-[var(--accent-primary)] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm hover:opacity-95 transition-all"
          >
            <FiLogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </Link>
        )}

      </div>
    </>
  );

  return (
    <>
      {/* Floating / Fixed Hamburger Menu Button on Mobile Screens */}
      <button
        onClick={() => dispatch(openSidebar())}
        className="md:hidden fixed top-3.5 left-3.5 z-40 p-2.5 rounded-full bg-[var(--bg-surface)]/90 backdrop-blur-md border border-[var(--border-color)] text-[var(--text-primary)] shadow-lg hover:bg-[var(--bg-elevated)] transition-all duration-200 cursor-pointer active:scale-95 flex items-center justify-center"
        aria-label="Open Navigation Menu"
      >
        <FiMenu className="w-5 h-5 text-[var(--accent-primary)]" />
      </button>

      {/* Backdrop Overlay for Mobile Drawer */}
      {isSidebarOpen && (
        <div
          onClick={() => dispatch(closeSidebar())}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 md:hidden animate-in fade-in duration-200"
        />
      )}

      {/* Mobile Slide-Over Drawer Sidebar */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-72 max-w-[85vw] h-full bg-[var(--bg-surface)] border-r border-[var(--border-color)] p-4 flex flex-col justify-between overflow-y-auto z-50 md:hidden transition-transform duration-300 ease-in-out shadow-2xl ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full pointer-events-none"
        }`}
      >
        {renderSidebarContent(true)}
      </aside>

      {/* Desktop Sticky Sidebar */}
      <aside className="w-64 h-screen sticky top-0 border-r border-[var(--border-color)] bg-[var(--bg-surface)]/95 backdrop-blur-md p-4 hidden md:flex flex-col justify-between overflow-y-auto transition-colors z-40">
        {renderSidebarContent(false)}
      </aside>
    </>
  );
}