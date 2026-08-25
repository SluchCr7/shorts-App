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
import { FiVolume2, FiVolumeX, FiPlay, FiMusic, FiHeart, FiFastForward } from "react-icons/fi";

interface ShortCardProps {
  short: Short;
  isActive: boolean;
  shouldRenderVideo?: boolean;
}

export default function ShortCard({ short, isActive, shouldRenderVideo = true }: ShortCardProps) {
  const dispatch = useAppDispatch();
  const { feedType } = useAppSelector((state) => state.ui);
  const { data: user } = useCheckAuthQuery();
  const isAuthenticated = !!user;

  const [toggleLikeShort] = useToggleLikeShortMutation();
  const [incrementViews] = useIncrementViewsMutation();

  const videoRef = useRef<HTMLVideoElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [progress, setProgress] = useState(0);
  const [showHeartAnim, setShowHeartAnim] = useState(false);

  // Auto-play / pause when active in viewport
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !shouldRenderVideo) return;

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
  }, [isActive, shouldRenderVideo, short._id, feedType, incrementViews]);

  // Apply playback speed
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  // Track progress
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration || 1;
      setProgress((current / total) * 100);
    }
  };

  // Click timeline to seek video
  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!videoRef.current || !timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    videoRef.current.currentTime = percentage * (videoRef.current.duration || 0);
    setProgress(percentage * 100);
  };

  // Toggle play / pause
  const handleVideoClick = () => {
    if (!videoRef.current || !shouldRenderVideo) return;
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
    setTimeout(() => setShowHeartAnim(false), 900);
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

  const cyclePlaybackRate = (e: React.MouseEvent) => {
    e.stopPropagation();
    const speeds = [1, 1.25, 1.5, 2];
    const nextIndex = (speeds.indexOf(playbackRate) + 1) % speeds.length;
    setPlaybackRate(speeds[nextIndex]);
  };

  return (
    <div className="relative w-full h-full max-w-[460px] mx-auto flex items-center justify-center bg-slate-950 overflow-hidden rounded-none sm:rounded-3xl shadow-2xl border-x sm:border border-white/10 group transition-all duration-300">
      
      {/* Video Element OR High-Perf Poster Placeholder */}
      {shouldRenderVideo ? (
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
      ) : (
        <div className="relative w-full h-full bg-slate-900 flex items-center justify-center">
          {short.thumbnailUrl ? (
            <img src={short.thumbnailUrl} alt={short.title} className="w-full h-full object-cover opacity-60" />
          ) : (
            <div className="w-12 h-12 rounded-full border-2 border-[var(--accent-primary)] border-t-transparent animate-spin" />
          )}
        </div>
      )}

      {/* Top & Bottom Ambient Shadow Gradients */}
      <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-black/70 via-black/30 to-transparent pointer-events-none z-10" />
      <div className="absolute bottom-0 inset-x-0 h-60 bg-gradient-to-t from-black/95 via-black/50 to-transparent pointer-events-none z-10" />

      {/* Play / Pause Overlay Icon when paused */}
      {shouldRenderVideo && !isPlaying && (
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
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-40">
          <FiHeart className="w-24 h-24 text-[var(--accent-primary)] fill-[var(--accent-primary)] drop-shadow-2xl animate-heart-pop" />
        </div>
      )}

      {/* Top Right Floating Controls: Mute & Playback Speed */}
      <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
        {/* Speed button */}
        {playbackRate !== 1 && (
          <span className="text-[10px] font-extrabold px-2 py-1 rounded-full bg-[var(--accent-primary)] text-white shadow-md animate-pulse">
            {playbackRate}x
          </span>
        )}
        <button
          onClick={cyclePlaybackRate}
          className="w-9 h-9 rounded-full glass-pill text-white/90 flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg cursor-pointer"
          title="Playback speed"
        >
          <FiFastForward className="w-4 h-4 text-white" />
        </button>

        {/* Mute button */}
        <button
          onClick={toggleMute}
          className="w-9 h-9 rounded-full glass-pill text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg cursor-pointer"
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <FiVolumeX className="w-4 h-4 text-white/80" /> : <FiVolume2 className="w-4 h-4 text-[var(--accent-primary)]" />}
        </button>
      </div>

      {/* Video Information Overlay (Bottom Left) */}
      <div className="absolute left-4 bottom-5 right-20 z-30 text-white pointer-events-auto space-y-2">
        {short.originalShort && short.originalShort.owner ? (
          <div className="flex items-center gap-1.5 flex-wrap text-sm text-slate-100 drop-shadow-md">
            <Link href={`/profile/${short.owner?.username}`} className="inline-flex items-center gap-1 group/author font-extrabold text-white hover:underline">
              <span>@{short.owner?.username}</span>
              {short.owner?.isVerified && <VerifiedBadge size="sm" className="drop-shadow-md" />}
            </Link>
            <span className="text-[10px] font-bold text-slate-300 px-1.5 py-0.5 rounded-md bg-black/40 backdrop-blur-xs border border-white/10">reposted from</span>
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
                  className="px-2 py-0.5 rounded-md bg-white/10 hover:bg-[var(--accent-primary)] text-[11px] font-extrabold text-[var(--accent-cyan)] hover:text-white border border-white/15 transition-all shadow-xs"
                >
                  #{cleanTag}
                </Link>
              );
            })}
          </div>
        )}

        {/* Audio Track Ticker */}
        <div className="flex items-center gap-2 text-xs text-slate-200 pt-1 overflow-hidden max-w-[220px]">
          <div className="w-5 h-5 rounded-full bg-white/15 flex items-center justify-center shrink-0">
            <FiMusic className="w-3 h-3 animate-pulse text-[var(--accent-secondary)]" />
          </div>
          <div className="overflow-hidden whitespace-nowrap">
            <span className="font-medium text-slate-200 drop-shadow-sm text-xs">
              {short.sound ? short.sound.title : `Original Audio - ${short.owner?.username}`}
            </span>
          </div>
        </div>
      </div>

      {/* Right Action Sidebar */}
      <ShortSidebar short={short} isPlaying={isPlaying} />

      {/* Bottom Timeline Progress Bar with Click Seek */}
      <div
        ref={timelineRef}
        onClick={handleTimelineClick}
        className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/20 z-30 cursor-pointer group/timeline hover:h-2.5 transition-all"
        title="Click to seek"
      >
        <div
          className="h-full bg-gradient-to-r from-[var(--accent-primary)] via-rose-400 to-[var(--accent-secondary)] transition-all duration-100 ease-linear shadow-xs relative"
          style={{ width: `${progress}%` }}
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-md opacity-0 group-hover/timeline:opacity-100 transition-opacity" />
        </div>
      </div>
    </div>
  );
}
