"use client";

import { useState } from "react";
import Link from "next/link";
import { Short } from "../../types";
import { useShareShortMutation } from "../../redux/api/shortsApi";
import { useAppDispatch } from "../../redux/store";
import { openAuthModal } from "../../redux/slices/uiSlice";
import { useCheckAuthQuery } from "../../redux/api/authApi";
import VerifiedBadge from "../common/VerifiedBadge";
import { FiX, FiRepeat, FiCopy, FiCheck, FiShare2, FiTwitter } from "react-icons/fi";
import { FaWhatsapp, FaFacebookF } from "react-icons/fa";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  short: Short;
  feedType?: "for-you" | "following";
}

export default function ShareModal({ isOpen, onClose, short, feedType = "for-you" }: ShareModalProps) {
  const dispatch = useAppDispatch();
  const { data: user } = useCheckAuthQuery();
  const [shareShort, { isLoading: isSharing }] = useShareShortMutation();

  const [copied, setCopied] = useState(false);
  const [reposted, setReposted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (!isOpen) return null;

  const originalOwner = short.originalShort?.owner || short.owner;
  const shortUrl = typeof window !== "undefined" ? `${window.location.origin}/shorts/${short._id}` : "";

  const handleRepost = async () => {
    if (!user) {
      onClose();
      dispatch(openAuthModal("repost videos"));
      return;
    }

    try {
      setErrorMessage("");
      await shareShort({ shortId: short._id, feedType }).unwrap();
      setReposted(true);
      setTimeout(() => {
        setReposted(false);
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error("Failed to share short", err);
      setErrorMessage(err?.data?.message || "Failed to repost short. Please try again.");
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link", err);
    }
  };

  const handleSocialShare = (platform: "twitter" | "whatsapp" | "facebook") => {
    const text = encodeURIComponent(`Check out this Short by @${originalOwner?.username}!`);
    const url = encodeURIComponent(shortUrl);
    let shareUrl = "";

    if (platform === "twitter") {
      shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
    } else if (platform === "whatsapp") {
      shareUrl = `https://api.whatsapp.com/send?text=${text}%20${url}`;
    } else if (platform === "facebook") {
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank", "noopener,noreferrer");
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: short.title || "VibeShorts",
          text: `Check out this Short by @${originalOwner?.username}`,
          url: shortUrl,
        });
      } catch (err) {
        console.error("Native share cancelled or failed", err);
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-color)] bg-[var(--bg-surface)]">
          <div className="flex items-center gap-2">
            <FiShare2 className="w-5 h-5 text-[var(--accent-primary)]" />
            <h3 className="text-base font-extrabold text-[var(--text-primary)]">Share Short</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Short Preview Banner */}
        <div className="p-5 space-y-4">
          <div className="flex gap-3.5 p-3 rounded-2xl bg-[var(--bg-elevated)]/60 border border-[var(--border-color)]">
            <div className="w-16 h-20 rounded-xl overflow-hidden bg-black flex-shrink-0 relative shadow-inner">
              <img src={short.thumbnailUrl} alt={short.title} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <div className="flex items-center gap-1.5 flex-wrap mb-1">
                <span className="text-xs font-bold text-[var(--text-primary)]">@{originalOwner?.username}</span>
                {originalOwner?.isVerified && <VerifiedBadge size="xs" />}
              </div>
              <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                {short.title || "Untitled Short"}
              </p>
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-semibold text-center">
              {errorMessage}
            </div>
          )}

          {reposted && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs font-bold text-center flex items-center justify-center gap-2 animate-in fade-in">
              <FiCheck className="w-4 h-4 text-emerald-500" />
              <span>Reposted to your profile as @{user?.username} from @{originalOwner?.username}!</span>
            </div>
          )}

          {/* Action 1: Repost Button */}
          <button
            onClick={handleRepost}
            disabled={isSharing || reposted}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[var(--accent-primary)] via-rose-500 to-[var(--accent-secondary)] text-white font-extrabold text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-[var(--accent-primary)]/20 hover:opacity-95 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer disabled:opacity-60"
          >
            {isSharing ? (
              <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : reposted ? (
              <>
                <FiCheck className="w-5 h-5 stroke-[3]" />
                <span>Reposted Successfully</span>
              </>
            ) : (
              <>
                <FiRepeat className="w-5 h-5 stroke-[2.5]" />
                <span>Repost to My Profile</span>
              </>
            )}
          </button>

          {/* Action 2: Social Media Quick Buttons */}
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-2.5">
              Share to social
            </p>
            <div className="grid grid-cols-4 gap-2.5">
              <button
                onClick={() => handleSocialShare("twitter")}
                className="py-2.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/20 text-sky-500 flex flex-col items-center gap-1 transition-all cursor-pointer"
              >
                <FiTwitter className="w-5 h-5" />
                <span className="text-[10px] font-bold">X / Twitter</span>
              </button>

              <button
                onClick={() => handleSocialShare("whatsapp")}
                className="py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-500 flex flex-col items-center gap-1 transition-all cursor-pointer"
              >
                <FaWhatsapp className="w-5 h-5" />
                <span className="text-[10px] font-bold">WhatsApp</span>
              </button>

              <button
                onClick={() => handleSocialShare("facebook")}
                className="py-2.5 rounded-xl bg-blue-600/10 hover:bg-blue-600/20 border border-blue-600/20 text-blue-500 flex flex-col items-center gap-1 transition-all cursor-pointer"
              >
                <FaFacebookF className="w-5 h-5" />
                <span className="text-[10px] font-bold">Facebook</span>
              </button>

              <button
                onClick={handleNativeShare}
                className="py-2.5 rounded-xl bg-[var(--bg-elevated)] hover:bg-[var(--border-color)]/50 border border-[var(--border-color)] text-[var(--text-primary)] flex flex-col items-center gap-1 transition-all cursor-pointer"
              >
                <FiShare2 className="w-5 h-5 text-[var(--accent-cyan)]" />
                <span className="text-[10px] font-bold">More</span>
              </button>
            </div>
          </div>

          {/* Action 3: Copy Link */}
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-2">
              Short Link
            </p>
            <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)]">
              <input
                type="text"
                readOnly
                value={shortUrl}
                className="flex-1 bg-transparent px-3 text-xs text-[var(--text-secondary)] font-medium focus:outline-none truncate"
              />
              <button
                onClick={handleCopyLink}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  copied
                    ? "bg-emerald-500 text-white"
                    : "bg-[var(--accent-primary)] text-white hover:opacity-90"
                }`}
              >
                {copied ? (
                  <>
                    <FiCheck className="w-3.5 h-3.5" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <FiCopy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
