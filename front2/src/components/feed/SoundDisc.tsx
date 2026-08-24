"use client";

import { Sound } from "../../types";

interface SoundDiscProps {
  sound?: Sound | null;
  isPlaying: boolean;
}

export default function SoundDisc({ sound, isPlaying }: SoundDiscProps) {
  return (
    <div className="relative w-12 h-12 flex items-center justify-center">
      {/* Outer ambient glow */}
      {isPlaying && (
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] opacity-40 blur-xs animate-pulse" />
      )}
      <div
        className={`relative z-10 w-11 h-11 rounded-full bg-slate-950 border-2 border-white/20 shadow-2xl flex items-center justify-center overflow-hidden transition-all duration-300 ${
          isPlaying ? "animate-spin-slow ring-2 ring-[var(--accent-primary)]/50" : "scale-95 opacity-80"
        }`}
      >
        {/* Disc Grooves */}
        <div className="absolute inset-1 rounded-full border border-white/10" />
        <div className="absolute inset-2.5 rounded-full border border-white/10" />
        
        {/* Center Label */}
        <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-[var(--accent-primary)] via-rose-500 to-[var(--accent-secondary)] flex items-center justify-center shadow-inner">
          <div className="w-1.5 h-1.5 rounded-full bg-white shadow-xs" />
        </div>
      </div>
    </div>
  );
}

