"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import { useCheckAuthQuery } from "../../redux/api/authApi";
import { openUploadModal, openAuthModal, setFeedType } from "../../redux/slices/uiSlice";
import ThemeToggle from "./ThemeToggle";
import { FiHome, FiCompass, FiPlus, FiUsers, FiUser, FiPlay } from "react-icons/fi";

export default function MobileNav() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { data: user } = useCheckAuthQuery();
  const isAuthenticated = !!user;
  const { feedType } = useAppSelector((state) => state.ui);

  const handleUploadClick = () => {
    if (!isAuthenticated) {
      dispatch(openAuthModal("upload short videos"));
      return;
    }
    dispatch(openUploadModal());
  };

  return (
    <>
      {/* Mobile Top App Bar (Sleek Glass Bar) */}
      <header className="md:hidden sticky top-0 z-40 w-full h-14 bg-[var(--bg-surface)]/85 backdrop-blur-xl border-b border-[var(--border-color)] px-4 flex items-center justify-between transition-colors">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[var(--accent-primary)] via-rose-500 to-[var(--accent-secondary)] flex items-center justify-center text-white shadow-md shadow-[var(--accent-primary)]/30">
            <FiPlay className="w-4 h-4 fill-current translate-x-0.5" />
          </div>
          <span className="font-black text-base tracking-tight text-[var(--text-primary)]">
            VIBE<span className="text-[var(--accent-primary)]">SHORTS</span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </header>

      {/* Mobile Bottom Navigation Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-16 bg-[var(--bg-surface)]/90 backdrop-blur-xl border-t border-[var(--border-color)] px-2 flex items-center justify-around shadow-2xl transition-colors">
        {/* 1. Home / For You */}
        <Link
          href="/"
          onClick={() => dispatch(setFeedType("for-you"))}
          className={`flex flex-col items-center justify-center gap-1 w-14 py-1 rounded-xl transition-all ${
            pathname === "/" && feedType === "for-you"
              ? "text-[var(--accent-primary)] font-bold scale-105"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium"
          }`}
        >
          <FiHome className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Home</span>
        </Link>

        {/* 2. Explore */}
        <Link
          href="/explore"
          className={`flex flex-col items-center justify-center gap-1 w-14 py-1 rounded-xl transition-all ${
            pathname.startsWith("/explore")
              ? "text-[var(--accent-primary)] font-bold scale-105"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium"
          }`}
        >
          <FiCompass className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Explore</span>
        </Link>

        {/* 3. Upload Plus Button */}
        <button
          onClick={handleUploadClick}
          aria-label="Upload short video"
          className="relative -top-2 w-12 h-12 rounded-full bg-gradient-to-tr from-[var(--accent-primary)] via-rose-500 to-[var(--accent-secondary)] text-white flex items-center justify-center shadow-lg shadow-[var(--accent-primary)]/40 hover:scale-110 active:scale-95 transition-all cursor-pointer border-2 border-[var(--bg-surface)]"
        >
          <FiPlus className="w-6 h-6 stroke-[3]" />
        </button>

        {/* 4. Following */}
        <Link
          href={isAuthenticated ? "/following" : "#"}
          onClick={(e) => {
            if (!isAuthenticated) {
              e.preventDefault();
              dispatch(openAuthModal("view your following feed"));
              return;
            }
            dispatch(setFeedType("following"));
          }}
          className={`flex flex-col items-center justify-center gap-1 w-14 py-1 rounded-xl transition-all ${
            pathname === "/following" || (pathname === "/" && feedType === "following")
              ? "text-[var(--accent-primary)] font-bold scale-105"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium"
          }`}
        >
          <FiUsers className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Following</span>
        </Link>

        {/* 5. Profile */}
        <Link
          href={isAuthenticated ? `/profile/${user?.username}` : "/login"}
          className={`flex flex-col items-center justify-center gap-1 w-14 py-1 rounded-xl transition-all ${
            pathname.startsWith("/profile") || pathname === "/login"
              ? "text-[var(--accent-primary)] font-bold scale-105"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium"
          }`}
        >
          {isAuthenticated && user?.avatar ? (
            <div className="w-6 h-6 rounded-full overflow-hidden border border-[var(--accent-primary)]">
              <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
            </div>
          ) : (
            <FiUser className="w-5 h-5" />
          )}
          <span className="text-[10px] tracking-tight">{isAuthenticated ? "Profile" : "Sign In"}</span>
        </Link>
      </nav>
    </>
  );
}
