"use client";

import { use } from "react";
import { useGetSoundByIdQuery, useGetSoundShortsQuery } from "../../../src/redux/api/soundsApi";
import VideoGrid from "../../../src/components/profile/VideoGrid";
import { FiMusic, FiPlay } from "react-icons/fi";

export default function SoundDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const soundId = resolvedParams.id;

  const { data: sound, isLoading: isSoundLoading } = useGetSoundByIdQuery(soundId);
  const { data: shorts = [], isLoading: isShortsLoading } = useGetSoundShortsQuery(soundId);

  const loading = isSoundLoading || isShortsLoading;

  if (loading) {
    return (
      <div className="w-full min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-[var(--accent-primary)] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] p-4 sm:p-8 space-y-6">
      {sound && (
        <div className="max-w-5xl mx-auto bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-6 flex flex-col sm:flex-row items-center gap-6 shadow-sm">
          <div className="w-24 h-24 rounded-full bg-slate-900 border-4 border-slate-700 flex items-center justify-center text-[var(--accent-primary)] shadow-xl flex-shrink-0 animate-spin-slow">
            <FiMusic className="w-10 h-10" />
          </div>

          <div className="space-y-2 text-center sm:text-left">
            <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">{sound.title}</h1>
            <p className="text-sm font-semibold text-[var(--accent-secondary)] flex items-center justify-center sm:justify-start gap-1">
              <FiPlay className="w-3.5 h-3.5 fill-current" />
              {sound.shortsCount || shorts.length} videos using this sound
            </p>
          </div>
        </div>
      )}

      <VideoGrid shorts={shorts} emptyMessage="No shorts found for this sound track" />
    </div>
  );
}
