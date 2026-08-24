"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "../../redux/store";
import { useCheckAuthQuery, useLogoutMutation } from "../../redux/api/authApi";
import { openUploadModal } from "../../redux/slices/uiSlice";
import ThemeToggle from "./ThemeToggle";
import { FiPlus, FiSearch, FiLogOut, FiUser, FiPlay, FiLogIn } from "react-icons/fi";

export default function Navbar() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { data: user } = useCheckAuthQuery();
  const [logout] = useLogoutMutation();
  const isAuthenticated = !!user;

  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      setDropdownOpen(false);
      router.push("/");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full h-16 border-b border-[var(--border-color)] bg-[var(--bg-surface)]/90 backdrop-blur-xl px-4 lg:px-8 flex items-center justify-between transition-colors shadow-xs">
      
      {/* Brand Logo */}
      <Link href="/" className="flex items-center gap-3 group">
        <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-[var(--accent-primary)] via-rose-500 to-[var(--accent-secondary)] flex items-center justify-center text-white shadow-lg shadow-[var(--accent-primary)]/25 transition-all duration-300 group-hover:scale-105 group-hover:shadow-[var(--accent-primary)]/40">
          <FiPlay className="w-5 h-5 fill-current translate-x-0.5" />
          <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <div className="hidden sm:flex flex-col">
          <span className="font-black text-xl tracking-tight text-[var(--text-primary)] leading-none">
            VIBE<span className="text-[var(--accent-primary)]">SHORTS</span>
          </span>
          <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-muted)] leading-tight pt-0.5">
            Pro Stream Experience
          </span>
        </div>
      </Link>

      {/* Advanced Search Bar */}
      <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-lg mx-4">
        <input
          type="text"
          placeholder="Search professional shorts, creators, tags..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-10 pl-11 pr-10 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-primary)] focus:ring-2 focus:ring-[var(--accent-primary)]/20 transition-all duration-200"
        />
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-1"
          >
            ✕
          </button>
        )}
      </form>

      {/* Action Controls & Authentication */}
      <div className="flex items-center gap-3">
        <ThemeToggle />

        {isAuthenticated ? (
          <>
            <button
              onClick={() => dispatch(openUploadModal())}
              className="h-10 px-4 rounded-full bg-gradient-to-r from-[var(--accent-primary)] via-rose-500 to-[var(--accent-secondary)] text-white text-sm font-bold flex items-center gap-2 shadow-md shadow-[var(--accent-primary)]/20 hover:shadow-lg hover:shadow-[var(--accent-primary)]/35 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer"
            >
              <FiPlus className="w-4 h-4 stroke-[3]" />
              <span className="hidden sm:inline">Upload</span>
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-10 h-10 rounded-full overflow-hidden border-2 border-[var(--accent-primary)]/70 hover:border-[var(--accent-primary)] transition-all duration-200 shadow-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/40"
              >
                <img
                  src={user?.avatar || "https://res.cloudinary.com/demo/image/upload/v1570972417/avatar-placeholder.png"}
                  alt={user?.username || "Avatar"}
                  className="w-full h-full object-cover"
                />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2.5 w-60 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200 backdrop-blur-xl">
                  <div className="px-3.5 py-3 border-b border-[var(--border-color)] mb-1 bg-[var(--bg-elevated)]/40 rounded-xl">
                    <p className="font-extrabold text-sm text-[var(--text-primary)] truncate">{user?.fullName}</p>
                    <p className="text-xs font-medium text-[var(--text-secondary)] truncate">@{user?.username}</p>
                  </div>
                  <Link
                    href={`/profile/${user?.username}`}
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-3.5 py-2.5 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] rounded-xl transition-all duration-150"
                  >
                    <FiUser className="w-4 h-4 text-[var(--accent-primary)]" />
                    My Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3.5 py-2.5 text-sm font-semibold text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all duration-150 cursor-pointer mt-1"
                  >
                    <FiLogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2.5">
            {/* Minimal Icon Login Button */}
            <Link
              href="/login"
              title="Log in"
              className="w-10 h-10 rounded-full border border-[var(--border-color)] bg-[var(--bg-elevated)]/50 text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] hover:border-[var(--accent-primary)]/50 flex items-center justify-center transition-all duration-200 shadow-xs group"
            >
              <FiLogIn className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-[var(--accent-primary)] transition-colors" />
            </Link>
            
            {/* Sign Up Button */}
            <Link
              href="/register"
              className="h-10 px-5 rounded-full bg-[var(--accent-primary)] text-white text-sm font-bold hover:opacity-95 shadow-md shadow-[var(--accent-primary)]/20 hover:scale-[1.02] flex items-center justify-center transition-all duration-200"
            >
              Sign up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}