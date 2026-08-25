"use client";

import { useState } from "react";
import Link from "next/link";
import { Short } from "../../types";
import { useCheckAuthQuery } from "../../redux/api/authApi";
import { useDeleteShortMutation } from "../../redux/api/shortsApi";
import { FiPlay, FiHeart, FiTrash2, FiAlertTriangle, FiX } from "react-icons/fi";

interface VideoGridProps {
  shorts: Short[];
  emptyMessage?: string;
}

export default function VideoGrid({ shorts, emptyMessage = "No shorts uploaded yet" }: VideoGridProps) {
  const { data: currentUser } = useCheckAuthQuery();
  const [deleteShort, { isLoading: isDeleting }] = useDeleteShortMutation();
  const [shortToDelete, setShortToDelete] = useState<Short | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleConfirmDelete = async () => {
    if (!shortToDelete) return;
    try {
      setDeleteError(null);
      await deleteShort(shortToDelete._id).unwrap();
      setShortToDelete(null);
    } catch (err: any) {
      console.error("Failed to delete short video:", err);
      setDeleteError(err?.data?.message || "Failed to delete short video. Please try again.");
    }
  };

  if (shorts.length === 0) {
    return (
      <div className="py-16 text-center text-[var(--text-secondary)] space-y-2">
        <p className="font-bold text-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-5 p-4 max-w-6xl mx-auto">
        {shorts.map((short) => {
          const ownerId = typeof short.owner === "object" ? short.owner?._id : short.owner;
          const isOwner = currentUser?._id && ownerId === currentUser._id;

          return (
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
                <div className="flex justify-between items-center w-full">
                  {isOwner && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDeleteError(null);
                        setShortToDelete(short);
                      }}
                      title="Delete video"
                      className="p-2 rounded-full bg-black/60 backdrop-blur-md text-rose-400 hover:text-white hover:bg-rose-600 border border-white/20 hover:border-rose-500 shadow-md transition-all duration-200 cursor-pointer transform hover:scale-110 active:scale-95"
                    >
                      <FiTrash2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <span className="px-2.5 py-1 rounded-full glass-panel text-[10px] font-extrabold text-white flex items-center gap-1.5 shadow-sm border border-white/20 ml-auto">
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
          );
        })}
      </div>

      {/* Delete Confirmation Modal */}
      {shortToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => !isDeleting && setShortToDelete(null)}
        >
          <div
            className="bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 text-left relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center flex-shrink-0">
                  <FiAlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[var(--text-primary)]">Delete Short Video</h3>
                  <p className="text-xs text-[var(--text-secondary)]">This action cannot be undone.</p>
                </div>
              </div>
              <button
                disabled={isDeleting}
                onClick={() => setShortToDelete(null)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Video Card Preview */}
            <div className="flex gap-3.5 p-3 rounded-xl bg-slate-900/60 border border-white/10 items-center">
              <div className="relative aspect-[9/16] w-12 rounded-lg overflow-hidden flex-shrink-0 bg-slate-950">
                <img
                  src={shortToDelete.thumbnailUrl || shortToDelete.videoUrl.replace(/\.[^/.]+$/, ".jpg")}
                  alt={shortToDelete.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <p className="text-xs font-bold text-white line-clamp-2 leading-snug">
                  {shortToDelete.title || "Untitled Video"}
                </p>
                <div className="flex items-center gap-3 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <FiPlay className="w-3 h-3 text-[var(--accent-primary)]" />
                    {shortToDelete.viewsCount || 0} views
                  </span>
                  <span className="flex items-center gap-1 text-rose-400">
                    <FiHeart className="w-3 h-3 fill-current" />
                    {shortToDelete.likesCount || 0}
                  </span>
                </div>
              </div>
            </div>

            {deleteError && (
              <p className="text-xs text-rose-400 font-semibold bg-rose-500/10 p-2.5 rounded-lg border border-rose-500/20">
                {deleteError}
              </p>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setShortToDelete(null)}
                className="px-4 py-2.5 rounded-xl border border-[var(--border-color)] text-xs font-semibold text-[var(--text-secondary)] hover:bg-white/5 transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <FiTrash2 className="w-3.5 h-3.5" />
                    <span>Delete Video</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
