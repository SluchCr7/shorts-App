"use client";

import Link from "next/link";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import { closeAuthModal } from "../../redux/slices/uiSlice";
import { FiX, FiLock, FiHeart, FiBookmark, FiUserPlus, FiUploadCloud, FiLogIn, FiUserCheck } from "react-icons/fi";

export default function AuthPromptModal() {
  const dispatch = useAppDispatch();
  const { isAuthModalOpen, authModalAction } = useAppSelector((state) => state.ui);

  if (!isAuthModalOpen) return null;

  const handleClose = () => {
    dispatch(closeAuthModal());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={handleClose}
        className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity duration-300 animate-in fade-in"
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-md bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-3xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-200">
        
        {/* Top Decorative Gradient Banner */}
        <div className="h-28 bg-gradient-to-r from-[var(--accent-primary)] via-rose-500 to-[var(--accent-secondary)] p-6 relative flex items-center justify-between">
          <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-xl">
            <FiLock className="w-7 h-7 drop-shadow-md animate-bounce" />
          </div>

          <button
            onClick={handleClose}
            className="w-9 h-9 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition-colors cursor-pointer border border-white/20"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 pt-5 space-y-5">
          {/* Header */}
          <div>
            <h2 className="text-xl font-black text-[var(--text-primary)] tracking-tight">
              Log in to {authModalAction}
            </h2>
            <p className="text-xs font-semibold text-[var(--text-secondary)] mt-1.5 leading-relaxed">
              Create an account or log in to unlock full interactions, follow your favorite creators, and customize your feed.
            </p>
          </div>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)]">
              <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
                <FiHeart className="w-4 h-4 fill-current" />
              </div>
              <span className="text-xs font-bold text-[var(--text-primary)]">Like shorts</span>
            </div>

            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)]">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                <FiBookmark className="w-4 h-4 fill-current" />
              </div>
              <span className="text-xs font-bold text-[var(--text-primary)]">Save favorites</span>
            </div>

            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)]">
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
                <FiUserPlus className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-[var(--text-primary)]">Follow creators</span>
            </div>

            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)]">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center shrink-0">
                <FiUploadCloud className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-[var(--text-primary)]">Post & Share</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-2">
            <Link
              href="/login"
              onClick={handleClose}
              className="w-full h-12 rounded-2xl bg-gradient-to-r from-[var(--accent-primary)] via-rose-500 to-[var(--accent-secondary)] text-white text-sm font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-[var(--accent-primary)]/25 hover:shadow-xl hover:shadow-[var(--accent-primary)]/40 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200"
            >
              <FiLogIn className="w-4 h-4 stroke-[3]" />
              <span>Log In</span>
            </Link>

            <Link
              href="/register"
              onClick={handleClose}
              className="w-full h-12 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-[var(--text-primary)] text-sm font-extrabold flex items-center justify-center gap-2 hover:bg-[var(--border-color)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-200"
            >
              <FiUserCheck className="w-4 h-4 text-[var(--accent-primary)]" />
              <span>Create Free Account</span>
            </Link>
          </div>

          {/* Footer cancel note */}
          <div className="text-center pt-1">
            <button
              onClick={handleClose}
              className="text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            >
              Continue watching as guest
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
