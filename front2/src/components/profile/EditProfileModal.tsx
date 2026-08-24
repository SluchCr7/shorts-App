"use client";

import { useState, useRef } from "react";
import { User } from "../../types";
import {
  useUpdateProfileMutation,
  useUpdateAvatarMutation,
  useUpdateCoverMutation,
} from "../../redux/api/usersApi";
import { FiX, FiCamera, FiCheck, FiUser, FiGlobe, FiFileText } from "react-icons/fi";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

export default function EditProfileModal({ isOpen, onClose, user }: EditProfileModalProps) {
  const [updateProfile, { isLoading: isUpdatingProfile }] = useUpdateProfileMutation();
  const [updateAvatar, { isLoading: isUpdatingAvatar }] = useUpdateAvatarMutation();
  const [updateCover, { isLoading: isUpdatingCover }] = useUpdateCoverMutation();

  const [fullName, setFullName] = useState(user.fullName || "");
  const [bio, setBio] = useState(user.bio || "");
  const [website, setWebsite] = useState(user.website || "");

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const isSaving = isUpdatingProfile || isUpdatingAvatar || isUpdatingCover;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    try {
      // 1. Update text profile info if changed
      if (
        fullName !== user.fullName ||
        bio !== (user.bio || "") ||
        website !== (user.website || "")
      ) {
        await updateProfile({
          fullName: fullName.trim(),
          bio: bio.trim(),
          website: website.trim(),
        }).unwrap();
      }

      // 2. Upload avatar if selected
      if (avatarFile) {
        const formData = new FormData();
        formData.append("avatar", avatarFile);
        await updateAvatar(formData).unwrap();
      }

      // 3. Upload cover image if selected
      if (coverFile) {
        const formData = new FormData();
        formData.append("coverImage", coverFile);
        await updateCover(formData).unwrap();
      }

      setSuccessMessage("Profile updated successfully!");
      setTimeout(() => {
        onClose();
      }, 800);
    } catch (err: any) {
      console.error("Profile update error", err);
      setErrorMessage(
        err?.data?.message || err?.message || "Failed to update profile. Please try again."
      );
    }
  };

  const currentAvatar =
    avatarPreview ||
    user.avatar ||
    "https://res.cloudinary.com/demo/image/upload/v1570972417/avatar-placeholder.png";

  const currentCover = coverPreview || user.coverImage;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-color)] bg-[var(--bg-surface)]">
          <h2 className="text-lg font-extrabold text-[var(--text-primary)]">Edit Profile</h2>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer disabled:opacity-50"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6 flex-1">
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-semibold text-center">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs font-semibold text-center flex items-center justify-center gap-2">
              <FiCheck className="w-4 h-4" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Cover & Avatar Banner Upload section */}
          <div className="relative">
            {/* Cover Image */}
            <div className="w-full h-36 rounded-2xl bg-gradient-to-r from-[var(--accent-primary)] via-purple-600 to-[var(--accent-cyan)] relative overflow-hidden group">
              {currentCover ? (
                <img src={currentCover} alt="Cover Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/70 text-xs font-bold">
                  No Cover Photo
                </div>
              )}
              <div
                onClick={() => coverInputRef.current?.click()}
                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer text-white text-xs font-bold gap-2"
              >
                <FiCamera className="w-5 h-5" />
                <span>Change Cover Banner</span>
              </div>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                onChange={handleCoverChange}
                className="hidden"
              />
            </div>

            {/* Avatar Image */}
            <div className="absolute -bottom-8 left-6 relative w-24 h-24 rounded-full border-4 border-[var(--bg-card)] shadow-xl overflow-hidden group bg-[var(--bg-elevated)]">
              <img src={currentAvatar} alt="Avatar Preview" className="w-full h-full object-cover" />
              <div
                onClick={() => avatarInputRef.current?.click()}
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer text-white"
              >
                <FiCamera className="w-6 h-6" />
              </div>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
          </div>

          <div className="pt-4 space-y-4">
            {/* Username Read-Only */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  disabled
                  value={`@${user.username}`}
                  className="w-full h-11 pl-10 pr-4 rounded-xl bg-[var(--bg-elevated)]/50 border border-[var(--border-color)] text-sm text-[var(--text-muted)] cursor-not-allowed font-medium"
                />
                <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
              </div>
            </div>

            {/* Full Name Input */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                Display Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Your full display name..."
                  maxLength={50}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] font-medium"
                />
                <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
              </div>
            </div>

            {/* Bio Input */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                  Bio
                </label>
                <span className="text-xs text-[var(--text-muted)]">{bio.length}/200</span>
              </div>
              <div className="relative">
                <textarea
                  rows={3}
                  placeholder="Tell the world about yourself..."
                  maxLength={200}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full p-3.5 pl-10 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] resize-none font-medium"
                />
                <FiFileText className="absolute left-3.5 top-4 w-4 h-4 text-[var(--text-muted)]" />
              </div>
            </div>

            {/* Website / Social Link Input */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                Website / Social Link
              </label>
              <div className="relative">
                <input
                  type="url"
                  placeholder="https://yourwebsite.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] font-medium"
                />
                <FiGlobe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
              </div>
            </div>
          </div>

          {/* Action Buttons Footer */}
          <div className="pt-4 border-t border-[var(--border-color)] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="h-11 px-5 rounded-xl border border-[var(--border-color)] text-sm font-bold text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="h-11 px-6 rounded-xl bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white text-sm font-bold shadow-md hover:opacity-95 transition-opacity disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
