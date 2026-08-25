"use client";

import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import { closeUploadModal } from "../../redux/slices/uiSlice";
import { useUploadShortMutation } from "../../redux/api/shortsApi";
import { MAIN_STATIC_HASHTAGS } from "../../constants/hashtags";
import { FiX, FiUploadCloud, FiFilm, FiImage, FiHash } from "react-icons/fi";

export default function UploadModal() {
  const dispatch = useAppDispatch();
  const isUploadOpen = useAppSelector((state) => state.ui.isUploadOpen);
  const [uploadShort, { isLoading: uploading }] = useUploadShortMutation();

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [privacy, setPrivacy] = useState<"public" | "private" | "unlisted">("public");
  const [errorMsg, setErrorMsg] = useState("");

  if (!isUploadOpen) return null;

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("video/")) {
        setErrorMsg("Please select a valid video file");
        return;
      }
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
      setErrorMsg("");
    }
  };

  const handleThumbnailSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoFile) {
      setErrorMsg("Video file is required");
      return;
    }
    if (!title.trim()) {
      setErrorMsg("Title is required");
      return;
    }

    setErrorMsg("");

    const formData = new FormData();
    formData.append("video", videoFile);
    if (thumbnailFile) {
      formData.append("thumbnail", thumbnailFile);
    }
    formData.append("title", title.trim());
    formData.append("description", description.trim());
    formData.append("privacy", privacy);

    try {
      await uploadShort(formData).unwrap();
      handleClose();
    } catch (err: any) {
      setErrorMsg(err?.data?.message || err?.message || "Failed to upload video short");
    }
  };

  const handleClose = () => {
    setVideoFile(null);
    setThumbnailFile(null);
    setVideoPreview(null);
    setTitle("");
    setDescription("");
    setErrorMsg("");
    dispatch(closeUploadModal());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div onClick={handleClose} className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity duration-300" />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-3xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-[var(--border-color)] flex items-center justify-between bg-[var(--bg-elevated)]/40 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] flex items-center justify-center font-bold">
              <FiFilm className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-[var(--text-primary)] leading-none">Upload Short Video</h3>
              <p className="text-[11px] font-semibold text-[var(--text-secondary)] leading-tight pt-0.5">Share your content with the community</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] transition-colors cursor-pointer"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-bold animate-in fade-in duration-150">
              {errorMsg}
            </div>
          )}

          {/* Video Selector / Preview */}
          {!videoPreview ? (
            <label className="flex flex-col items-center justify-center w-full h-60 border-2 border-dashed border-[var(--border-color)] hover:border-[var(--accent-primary)] rounded-3xl cursor-pointer bg-[var(--bg-elevated)]/40 hover:bg-[var(--bg-elevated)]/70 transition-all duration-200 p-6 text-center group">
              <div className="w-14 h-14 rounded-2xl bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <FiUploadCloud className="w-7 h-7" />
              </div>
              <p className="font-bold text-sm text-[var(--text-primary)]">
                Click or Drag & Drop video file to upload
              </p>
              <p className="text-xs text-[var(--text-muted)] mt-1 font-medium">MP4, WebM or MOV up to 100MB</p>
              <input type="file" accept="video/*" onChange={handleVideoSelect} className="hidden" />
            </label>
          ) : (
            <div className="relative w-full max-h-64 rounded-2xl overflow-hidden bg-black flex items-center justify-center border border-white/10 shadow-lg">
              <video src={videoPreview} controls className="max-h-64 rounded-2xl" />
              <button
                type="button"
                onClick={() => {
                  setVideoFile(null);
                  setVideoPreview(null);
                }}
                className="absolute top-3 right-3 p-2 rounded-full bg-black/70 text-white hover:bg-black transition-colors shadow-md"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
              Title *
            </label>
            <input
              type="text"
              placeholder="Give your short a catchy title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full h-11 px-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] font-medium focus:outline-none focus:border-[var(--accent-primary)] focus:ring-2 focus:ring-[var(--accent-primary)]/20 transition-all"
            />
          </div>

          {/* Description & Hashtags */}
          <div>
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5 flex items-center justify-between">
              <span>Description & Hashtags</span>
              <span className="text-[10px] text-[var(--text-muted)] font-normal">Click a hashtag below to add</span>
            </label>
            <textarea
              placeholder="Describe your short... Use #hashtags to increase reach!"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] font-medium focus:outline-none focus:border-[var(--accent-primary)] focus:ring-2 focus:ring-[var(--accent-primary)]/20 transition-all resize-none"
            />
            {/* Quick Main Hashtags Bar */}
            <div className="mt-2.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              <span className="text-[10px] font-bold text-[var(--text-muted)] shrink-0 flex items-center gap-1">
                <FiHash className="w-3 h-3 text-[var(--accent-primary)]" />
                Quick Hashtags:
              </span>
              {MAIN_STATIC_HASHTAGS.slice(0, 10).map((tag) => (
                <button
                  type="button"
                  key={tag.name}
                  onClick={() => {
                    const tagToAdd = `#${tag.name}`;
                    if (!description.includes(tagToAdd)) {
                      setDescription((prev) => (prev ? `${prev.trim()} ${tagToAdd}` : tagToAdd));
                    }
                  }}
                  className="px-2.5 py-1 rounded-lg bg-[var(--bg-elevated)] hover:bg-[var(--accent-primary)]/20 hover:text-[var(--accent-primary)] border border-[var(--border-color)] text-[11px] font-bold text-[var(--text-secondary)] transition-all cursor-pointer whitespace-nowrap shrink-0"
                >
                  {tag.icon} {tag.label}
                </button>
              ))}
            </div>
          </div>

          {/* Thumbnail & Privacy */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                Custom Thumbnail (Optional)
              </label>
              <label className="flex items-center gap-2.5 h-11 px-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-sm font-semibold text-[var(--text-secondary)] cursor-pointer hover:bg-[var(--bg-elevated)]/80 hover:border-[var(--accent-secondary)] transition-all">
                <FiImage className="w-4 h-4 text-[var(--accent-secondary)]" />
                <span className="truncate">{thumbnailFile ? thumbnailFile.name : "Choose Image"}</span>
                <input type="file" accept="image/*" onChange={handleThumbnailSelect} className="hidden" />
              </label>
            </div>

            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                Privacy Settings
              </label>
              <select
                value={privacy}
                onChange={(e) => setPrivacy(e.target.value as any)}
                className="w-full h-11 px-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-sm font-semibold text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] focus:ring-2 focus:ring-[var(--accent-primary)]/20 transition-all"
              >
                <option value="public">Public (Everyone can see)</option>
                <option value="unlisted">Unlisted (Anyone with link)</option>
                <option value="private">Private (Only me)</option>
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-5 h-11 rounded-xl border border-[var(--border-color)] text-sm font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="px-6 h-11 rounded-xl bg-gradient-to-r from-[var(--accent-primary)] via-rose-500 to-[var(--accent-secondary)] text-white text-sm font-bold shadow-md shadow-[var(--accent-primary)]/20 hover:shadow-lg hover:shadow-[var(--accent-primary)]/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer flex items-center gap-2"
            >
              {uploading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Uploading video...</span>
                </>
              ) : (
                <span>Publish Short</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
