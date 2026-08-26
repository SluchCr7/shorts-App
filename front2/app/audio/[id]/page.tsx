"use client";

import { use, useState, useRef, useEffect } from "react";
import { useGetSoundByIdQuery, useGetSoundShortsQuery } from "../../../src/redux/api/soundsApi";
import { useAppDispatch } from "../../../src/redux/store";
import { openUploadModalWithSound } from "../../../src/redux/slices/uiSlice";
import VideoGrid from "../../../src/components/profile/VideoGrid";
import { FiMusic, FiPlay, FiPause, FiPlus, FiDisc, FiUser } from "react-icons/fi";

export default function AudioDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const audioId = resolvedParams.id;
  const dispatch = useAppDispatch();

  const { data: sound, isLoading: isSoundLoading } = useGetSoundByIdQuery(audioId);
  const { data: shorts = [], isLoading: isShortsLoading } = useGetSoundShortsQuery(audioId);

  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const loading = isSoundLoading || isShortsLoading;

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handleTogglePlay = () => {
    if (!sound?.audioUrl) return;

    if (isPlayingPreview) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlayingPreview(false);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(sound.audioUrl);
      audioRef.current = audio;
      audio.play().catch(() => {});
      audio.onended = () => setIsPlayingPreview(false);
      setIsPlayingPreview(true);
    }
  };

  const handleUseSound = () => {
    if (sound) {
      dispatch(openUploadModalWithSound(sound));
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-[var(--accent-primary)] border-t-transparent animate-spin" />
      </div>
    );
  }

  const usesCount = sound?.usesCount || sound?.shortsCount || shorts.length;

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] p-4 sm:p-8 space-y-8 max-w-6xl mx-auto">
      {sound && (
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 backdrop-blur-xl">
          {/* Left: Cover Image & Title / Info */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left min-w-0 flex-1">
            <div className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-2xl bg-slate-900 border-4 border-[var(--border-color)] overflow-hidden shadow-2xl flex-shrink-0 group">
              {sound.coverImage ? (
                <img src={sound.coverImage} alt={sound.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[var(--accent-primary)] bg-gradient-to-tr from-slate-950 via-slate-900 to-slate-800">
                  <FiMusic className="w-14 h-14" />
                </div>
              )}

              {/* Overlay Play Button */}
              <button
                onClick={handleTogglePlay}
                className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center text-white opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                title={isPlayingPreview ? "Pause Audio Preview" : "Play Audio Preview"}
              >
                <div className="w-14 h-14 rounded-full bg-[var(--accent-primary)] flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                  {isPlayingPreview ? (
                    <FiPause className="w-6 h-6 text-white" />
                  ) : (
                    <FiPlay className="w-6 h-6 fill-current text-white translate-x-0.5" />
                  )}
                </div>
              </button>
            </div>

            <div className="space-y-3 min-w-0 flex-1">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[var(--accent-primary)] px-2.5 py-1 rounded-full bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20 inline-block mb-1.5">
                  Audio Track
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight leading-tight truncate">
                  {sound.title}
                </h1>
              </div>

              <div className="flex items-center justify-center sm:justify-start gap-2 text-sm font-bold text-[var(--text-secondary)]">
                <FiUser className="w-4 h-4 text-[var(--accent-secondary)] shrink-0" />
                <span className="truncate">{sound.artist || "Original Sound"}</span>
              </div>

              <div className="flex items-center justify-center sm:justify-start gap-4 text-xs font-semibold text-[var(--text-muted)] pt-1">
                <span className="flex items-center gap-1.5 text-[var(--accent-primary)] font-bold">
                  <FiDisc className={`w-4 h-4 ${isPlayingPreview ? "animate-spin-slow" : ""}`} />
                  {usesCount} {usesCount === 1 ? "video" : "videos"} using this sound
                </span>
                {sound.duration > 0 && <span>• {sound.duration}s duration</span>}
              </div>
            </div>
          </div>

          {/* Right: Action Buttons */}
          <div className="flex flex-col sm:flex-col gap-3 shrink-0 w-full sm:w-auto">
            <button
              onClick={handleUseSound}
              className="w-full sm:w-auto h-12 px-6 rounded-2xl bg-gradient-to-r from-[var(--accent-primary)] via-rose-500 to-[var(--accent-secondary)] text-white text-sm font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-[var(--accent-primary)]/25 hover:shadow-xl hover:shadow-[var(--accent-primary)]/40 hover:scale-[1.03] active:scale-[0.98] transition-all cursor-pointer"
            >
              <FiPlus className="w-4 h-4 stroke-[3]" />
              <span>Use This Sound</span>
            </button>

            <button
              onClick={handleTogglePlay}
              className="w-full sm:w-auto h-11 px-5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-[var(--text-primary)] hover:border-[var(--accent-primary)] text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {isPlayingPreview ? (
                <>
                  <FiPause className="w-4 h-4 text-rose-500" />
                  <span>Pause Preview</span>
                </>
              ) : (
                <>
                  <FiPlay className="w-4 h-4 text-[var(--accent-primary)] fill-current" />
                  <span>Listen Preview</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Videos Section Header */}
      <div className="space-y-4">
        <h2 className="text-xl font-extrabold text-[var(--text-primary)] flex items-center gap-2">
          <span>Short Videos</span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-[var(--bg-elevated)] text-[var(--text-secondary)] font-bold border border-[var(--border-color)]">
            {shorts.length}
          </span>
        </h2>

        <VideoGrid shorts={shorts} emptyMessage="No shorts found using this sound track yet. Be the first to create one!" />
      </div>
    </div>
  );
}
