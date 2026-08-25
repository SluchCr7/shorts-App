"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import { useCheckAuthQuery } from "../../redux/api/authApi";
import { useToggleLikeShortMutation, useIncrementViewsMutation } from "../../redux/api/shortsApi";
import { openAuthModal } from "../../redux/slices/uiSlice";
import { Short } from "../../types";
import ShortSidebar from "./ShortSidebar";
import VerifiedBadge from "../common/VerifiedBadge";
import { FiVolume2, FiVolumeX, FiPlay, FiMusic, FiHeart } from "react-icons/fi";

interface ShortCardProps {
  short: Short;
  isActive: boolean;
}

export default function ShortCard({ short, isActive }: ShortCardProps) {
  const dispatch = useAppDispatch();
  const { feedType } = useAppSelector((state) => state.ui);
  const { data: user } = useCheckAuthQuery();
  const isAuthenticated = !!user;

  const [toggleLikeShort] = useToggleLikeShortMutation();
  const [incrementViews] = useIncrementViewsMutation();

  const videoRef = useRef<HTMLVideoElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [showHeartAnim, setShowHeartAnim] = useState(false);

  // Auto-play / pause when active in viewport
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            incrementViews({ shortId: short._id, feedType });
          })
          .catch(() => {
            setIsPlaying(false);
          });
      }
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, [isActive, short._id, feedType, incrementViews]);

  // Track progress
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration || 1;
      setProgress((current / total) * 100);
    }
  };

  // Click video to toggle play/pause
  const handleVideoClick = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  // Double click video to like
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      dispatch(openAuthModal("like videos"));
      return;
    }
    setShowHeartAnim(true);
    setTimeout(() => setShowHeartAnim(false), 800);
    if (!short.isLiked) {
      toggleLikeShort({ short, feedType });
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] max-w-[420px] mx-auto snap-start flex items-center justify-center bg-slate-950 overflow-hidden rounded-none sm:rounded-3xl shadow-2xl border border-white/10 group transition-transform duration-300">
      {/* Video Element */}
      <video
        ref={videoRef}
        src={short.videoUrl}
        poster={short.thumbnailUrl}
        loop
        playsInline
        muted={isMuted}
        onTimeUpdate={handleTimeUpdate}
        onClick={handleVideoClick}
        onDoubleClick={handleDoubleClick}
        className="w-full h-full object-cover cursor-pointer select-none"
      />

      {/* Top & Bottom Ambient Shadow Gradients */}
      <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-black/60 to-transparent pointer-events-none z-10" />
      <div className="absolute bottom-0 inset-x-0 h-56 bg-gradient-to-t from-black/95 via-black/40 to-transparent pointer-events-none z-10" />

      {/* Play / Pause Overlay Icon when paused */}
      {!isPlaying && (
        <div
          onClick={handleVideoClick}
          className="absolute inset-0 flex items-center justify-center bg-black/25 pointer-events-auto cursor-pointer z-20"
        >
          <div className="w-16 h-16 rounded-full glass-panel flex items-center justify-center text-white shadow-2xl animate-pulse backdrop-blur-md border border-white/20">
            <FiPlay className="w-8 h-8 fill-current translate-x-0.5 text-white" />
          </div>
        </div>
      )}

      {/* Double Tap Heart Animation Overlay */}
      {showHeartAnim && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-40 animate-ping">
          <FiHeart className="w-24 h-24 text-[var(--accent-primary)] fill-[var(--accent-primary)] drop-shadow-2xl" />
        </div>
      )}

      {/* Mute / Unmute Floating Control */}
      <button
        onClick={toggleMute}
        className="absolute top-4 right-4 z-30 w-10 h-10 rounded-full glass-panel text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg cursor-pointer"
      >
        {isMuted ? <FiVolumeX className="w-5 h-5 text-white/80" /> : <FiVolume2 className="w-5 h-5 text-[var(--accent-primary)]" />}
      </button>

      {/* Video Information Overlay (Bottom Left) */}
      <div className="absolute left-4 bottom-5 right-20 z-30 text-white pointer-events-auto space-y-2">
        {short.originalShort && short.originalShort.owner ? (
          <div className="flex items-center gap-1.5 flex-wrap text-sm text-slate-100 drop-shadow-md">
            <Link href={`/profile/${short.owner?.username}`} className="inline-flex items-center gap-1 group/author font-extrabold text-white hover:underline">
              <span>@{short.owner?.username}</span>
              {short.owner?.isVerified && <VerifiedBadge size="sm" className="drop-shadow-md" />}
            </Link>
            <span className="text-[11px] font-bold text-slate-300 px-1.5 py-0.5 rounded-md bg-black/40 backdrop-blur-xs border border-white/10">from</span>
            <Link href={`/profile/${short.originalShort.owner?.username}`} className="inline-flex items-center gap-1 group/original font-extrabold text-[var(--accent-cyan)] hover:underline">
              <span>@{short.originalShort.owner?.username}</span>
              {short.originalShort.owner?.isVerified && <VerifiedBadge size="sm" className="drop-shadow-md" />}
            </Link>
          </div>
        ) : (
          <Link href={`/profile/${short.owner?.username}`} className="inline-flex items-center gap-1.5 group/author">
            <span className="font-bold text-base tracking-tight hover:underline text-white drop-shadow-md">
              @{short.owner?.username}
            </span>
            {short.owner?.isVerified && (
              <VerifiedBadge size="sm" className="drop-shadow-md" />
            )}
          </Link>
        )}

        {/* Title & Description */}
        <p className="text-sm font-medium line-clamp-2 leading-relaxed drop-shadow-md text-slate-100">
          {short.title}
        </p>

        {/* Hashtags */}
        {short.hashtags && short.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {short.hashtags.map((tag) => {
              const cleanTag = tag.replace(/^#/, "");
              return (
                <Link
                  key={cleanTag}
                  href={`/explore?tag=${encodeURIComponent(cleanTag)}`}
                  className="px-2 py-0.5 rounded-md bg-white/10 hover:bg-[var(--accent-primary)]/80 text-[11px] font-extrabold text-[var(--accent-cyan)] hover:text-white border border-white/15 transition-all shadow-xs"
                >
                  #{cleanTag}
                </Link>
              );
            })}
          </div>
        )}

        {/* Audio Track Info */}
        <div className="flex items-center gap-2 text-xs text-slate-300 pt-1">
          <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center">
            <FiMusic className="w-3 h-3 animate-pulse text-[var(--accent-secondary)]" />
          </div>
          <span className="truncate max-w-[200px] font-medium text-slate-200 drop-shadow-sm">
            {short.sound ? short.sound.title : `Original Audio - ${short.owner?.username}`}
          </span>
        </div>
      </div>

      {/* Right Action Sidebar */}
      <ShortSidebar short={short} isPlaying={isPlaying} />

      {/* Bottom Timeline Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-30">
        <div
          className="h-full bg-gradient-to-r from-[var(--accent-primary)] via-rose-400 to-[var(--accent-secondary)] transition-all duration-100 ease-linear shadow-xs"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
