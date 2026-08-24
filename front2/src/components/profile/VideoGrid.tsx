"use client";

import Link from "next/link";
import { Short } from "../../types";
import { FiPlay, FiHeart } from "react-icons/fi";

interface VideoGridProps {
  shorts: Short[];
  emptyMessage?: string;
}

export default function VideoGrid({ shorts, emptyMessage = "No shorts uploaded yet" }: VideoGridProps) {
  if (shorts.length === 0) {
    return (
      <div className="py-16 text-center text-[var(--text-secondary)] space-y-2">
        <p className="font-bold text-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-5 p-4 max-w-6xl mx-auto">
      {shorts.map((short) => (
        <Link
          key={short._id}
          href={`/shorts/${short._id}`}
          className="group relative aspect-[9/16] rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-950 border border-[var(--border-color)] shadow-md hover:shadow-2xl hover:border-[var(--accent-primary)]/50 transition-all duration-300 transform hover:-translate-y-1"
        >
          <img
            src={short.thumbnailUrl || short.videoUrl.replace(/\.[^/.]+$/, ".jpg")}
            alt={short.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-85 group-hover:opacity-100 transition-opacity p-3 sm:p-4 flex flex-col justify-between text-white">
            <div className="flex justify-end">
              <span className="px-2.5 py-1 rounded-full glass-panel text-[10px] font-extrabold text-white flex items-center gap-1.5 shadow-sm border border-white/20">
                <FiPlay className="w-2.5 h-2.5 fill-current text-[var(--accent-primary)]" />
                {short.viewsCount || 0}
              </span>
            </div>

            <div className="space-y-1.5">
              <p className="text-xs sm:text-sm font-bold line-clamp-2 leading-snug drop-shadow-md text-slate-100 group-hover:text-white">
                {short.title}
              </p>
              <div className="flex items-center gap-1.5 text-[11px] text-rose-400 font-extrabold drop-shadow-sm">
                <FiHeart className="w-3.5 h-3.5 fill-current text-rose-500" />
                <span>{short.likesCount || 0}</span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
