"use client";

import Link from "next/link";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import { useCheckAuthQuery } from "../../redux/api/authApi";
import { useToggleLikeShortMutation, useToggleSaveShortMutation } from "../../redux/api/shortsApi";
import { useToggleFollowUserMutation } from "../../redux/api/usersApi";
import { openCommentsDrawer, openAuthModal } from "../../redux/slices/uiSlice";
import { Short } from "../../types";
import SoundDisc from "./SoundDisc";
import ShareModal from "./ShareModal";
import { FiHeart, FiMessageSquare, FiBookmark, FiShare2, FiPlus, FiCheck } from "react-icons/fi";

interface ShortSidebarProps {
  short: Short;
  isPlaying: boolean;
}

export default function ShortSidebar({ short, isPlaying }: ShortSidebarProps) {
  const dispatch = useAppDispatch();
  const { feedType } = useAppSelector((state) => state.ui);
  const { data: user } = useCheckAuthQuery();
  const isAuthenticated = !!user;

  const [toggleLikeShort] = useToggleLikeShortMutation();
  const [toggleSaveShort] = useToggleSaveShortMutation();
  const [toggleFollowUser] = useToggleFollowUserMutation();

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      dispatch(openAuthModal("like videos"));
      return;
    }
    toggleLikeShort({ short, feedType });
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      dispatch(openAuthModal("save videos to your favorites"));
      return;
    }
    toggleSaveShort({ short, feedType });
  };

  const handleFollow = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      dispatch(openAuthModal("follow creators"));
      return;
    }
    if (!short.owner?._id) return;
    toggleFollowUser({
      userId: short.owner._id,
      username: short.owner.username,
      isFollowing: short.isFollowingOwner,
    });
  };

  const handleOpenComments = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(openCommentsDrawer(short._id));
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsShareModalOpen(true);
  };

  return (
    <>
      <div className="absolute right-3.5 bottom-12 z-30 flex flex-col items-center gap-5 text-white drop-shadow-lg">
        {/* Creator Avatar & Follow button */}
        <div className="relative">
          <Link href={`/profile/${short.owner?.username}`}>
            <div className="w-12 h-12 rounded-full border-2 border-white/90 overflow-hidden shadow-xl transform transition-transform duration-200 hover:scale-105 ring-2 ring-[var(--accent-primary)]/40">
              <img
                src={short.owner?.avatar || "https://res.cloudinary.com/demo/image/upload/v1570972417/avatar-placeholder.png"}
                alt={short.owner?.username}
                className="w-full h-full object-cover"
              />
            </div>
          </Link>
          {user?._id !== short.owner?._id && !short.isFollowingOwner && (
            <button
              onClick={handleFollow}
              className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-[var(--accent-primary)] text-white flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-transform cursor-pointer border border-white"
            >
              <FiPlus className="w-3.5 h-3.5 stroke-[3]" />
            </button>
          )}
        </div>

        {/* Like Button */}
        <button
          onClick={handleLike}
          className="group flex flex-col items-center gap-1 cursor-pointer focus:outline-none"
        >
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center glass-panel transition-all duration-200 group-hover:scale-110 active:scale-90 border border-white/15 ${
              short.isLiked ? "bg-rose-500/25 text-rose-400 border-rose-500/50 shadow-lg shadow-rose-500/20" : "text-white hover:bg-white/15"
            }`}
          >
            <FiHeart
              className={`w-6 h-6 transition-all duration-200 active:scale-125 ${
                short.isLiked ? "fill-rose-500 text-rose-500 drop-shadow-md" : ""
              }`}
            />
          </div>
          <span className="text-[11px] font-extrabold tracking-tight drop-shadow-md">{short.likesCount || 0}</span>
        </button>

        {/* Comment Button */}
        <button
          onClick={handleOpenComments}
          className="group flex flex-col items-center gap-1 cursor-pointer focus:outline-none"
        >
          <div className="w-12 h-12 rounded-full flex items-center justify-center glass-panel text-white transition-all duration-200 group-hover:scale-110 active:scale-90 border border-white/15 hover:bg-white/15">
            <FiMessageSquare className="w-6 h-6 drop-shadow-sm" />
          </div>
          <span className="text-[11px] font-extrabold tracking-tight drop-shadow-md">{short.commentsCount || 0}</span>
        </button>

        {/* Save / Bookmark Button */}
        <button
          onClick={handleSave}
          className="group flex flex-col items-center gap-1 cursor-pointer focus:outline-none"
        >
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center glass-panel transition-all duration-200 group-hover:scale-110 active:scale-90 border border-white/15 ${
              short.isSaved ? "bg-amber-500/25 text-amber-400 border-amber-500/50 shadow-lg shadow-amber-500/20" : "text-white hover:bg-white/15"
            }`}
          >
            <FiBookmark
              className={`w-6 h-6 transition-all duration-200 active:scale-125 ${
                short.isSaved ? "fill-amber-400 text-amber-400 drop-shadow-md" : ""
              }`}
            />
          </div>
          <span className="text-[11px] font-extrabold tracking-tight drop-shadow-md">{short.savesCount || 0}</span>
        </button>

        {/* Share / Repost Button */}
        <button
          onClick={handleShare}
          className="group flex flex-col items-center gap-1 cursor-pointer focus:outline-none"
          title="Share or Repost Short"
        >
          <div className="w-12 h-12 rounded-full flex items-center justify-center glass-panel text-white transition-all duration-200 group-hover:scale-110 active:scale-90 border border-white/15 hover:bg-white/15 hover:text-[var(--accent-cyan)]">
            <FiShare2 className="w-6 h-6 drop-shadow-sm" />
          </div>
          <span className="text-[11px] font-extrabold tracking-tight drop-shadow-md">{short.sharesCount || 0}</span>
        </button>

        {/* Audio Spinning Disc */}
        {(() => {
          const soundObj = typeof short.audioId === "object" && short.audioId ? short.audioId : short.sound;
          const soundId = soundObj?._id || (typeof short.audioId === "string" ? short.audioId : null);
          const targetHref = soundId ? `/audio/${soundId}` : `/profile/${short.owner?.username}`;

          return (
            <Link href={targetHref} className="mt-1 cursor-pointer block hover:scale-105 transition-transform" title="View sound details">
              <SoundDisc sound={soundObj || short.sound} isPlaying={isPlaying} />
            </Link>
          );
        })()}
      </div>

      {/* Professional Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        short={short}
        feedType={feedType}
      />
    </>
  );
}
