"use client";

import { useState } from "react";
import { User } from "../../types";
import { useCheckAuthQuery } from "../../redux/api/authApi";
import { useToggleFollowUserMutation } from "../../redux/api/usersApi";
import EditProfileModal from "./EditProfileModal";
import VerifiedBadge from "../common/VerifiedBadge";
import { FiCheck, FiPlus, FiGlobe, FiUsers, FiHeart, FiVideo, FiEdit3, FiCamera } from "react-icons/fi";

interface ProfileHeaderProps {
  profileUser: User;
  isSelf: boolean;
  initialIsFollowing?: boolean;
}

export default function ProfileHeader({ profileUser, isSelf, initialIsFollowing = false }: ProfileHeaderProps) {
  const { data: user } = useCheckAuthQuery();
  const isAuthenticated = !!user;
  const [toggleFollowUser] = useToggleFollowUserMutation();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const isFollowing = profileUser.isFollowing ?? initialIsFollowing;
  const followersCount = profileUser.followersCount || 0;

  const handleFollowToggle = async () => {
    if (!isAuthenticated) return;
    try {
      await toggleFollowUser({
        userId: profileUser._id,
        username: profileUser.username,
        isFollowing,
      }).unwrap();
    } catch (error) {
      console.error("Failed to toggle follow", error);
    }
  };

  return (
    <div className="w-full bg-[var(--bg-surface)] border-b border-[var(--border-color)]">
      {/* Cover Banner */}
      <div className="w-full h-44 sm:h-60 bg-gradient-to-r from-[var(--accent-primary)] via-purple-700 to-[var(--accent-cyan)] relative group overflow-hidden shadow-inner">
        {profileUser.coverImage ? (
          <img src={profileUser.coverImage} alt="Cover" className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-rose-500/30 via-slate-900/40 to-transparent" />
        )}
        {isSelf && (
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-xs font-bold px-3.5 py-2 rounded-full flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-all cursor-pointer border border-white/10 shadow-lg"
          >
            <FiCamera className="w-3.5 h-3.5" />
            <span>Change Cover</span>
          </button>
        )}
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-6 relative">
        {/* Avatar & Action Button Row */}
        <div className="flex justify-between items-end -mt-16 sm:-mt-20 mb-5">
          <div className="relative group">
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full border-4 border-[var(--bg-surface)] overflow-hidden shadow-2xl bg-[var(--bg-card)] ring-4 ring-[var(--accent-primary)]/20">
              <img
                src={profileUser.avatar || "https://res.cloudinary.com/demo/image/upload/v1570972417/avatar-placeholder.png"}
                alt={profileUser.username}
                className="w-full h-full object-cover"
              />
            </div>
            {isSelf && (
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-xs font-bold transition-opacity cursor-pointer border-4 border-transparent backdrop-blur-xs"
              >
                <FiCamera className="w-6 h-6 mb-1" />
                <span>Edit Photo</span>
              </button>
            )}
          </div>

          {isSelf ? (
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="h-11 px-6 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-color)] text-[var(--text-primary)] font-bold text-sm shadow-sm hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center gap-2"
            >
              <FiEdit3 className="w-4 h-4" />
              <span>Edit Profile</span>
            </button>
          ) : (
            <button
              onClick={handleFollowToggle}
              className={`h-11 px-6 rounded-full font-bold text-sm shadow-md transition-all cursor-pointer flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] ${
                isFollowing
                  ? "bg-[var(--bg-elevated)] text-[var(--text-primary)] border border-[var(--border-color)] hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/30"
                  : "bg-[var(--accent-primary)] text-white hover:opacity-95 shadow-[var(--accent-primary)]/25"
              }`}
            >
              {isFollowing ? (
                <>
                  <FiCheck className="w-4 h-4 text-emerald-500" />
                  <span>Following</span>
                </>
              ) : (
                <>
                  <FiPlus className="w-4 h-4 stroke-[3]" />
                  <span>Follow</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* User Details */}
        <div className="space-y-3.5">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
                {profileUser.fullName}
              </h1>
              {profileUser.isVerified && (
                <VerifiedBadge size="lg" />
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <p className="text-sm font-semibold text-[var(--text-secondary)]">@{profileUser.username}</p>
              {profileUser.isVerified && (
                <VerifiedBadge size="sm" />
              )}
            </div>
          </div>

          {profileUser.bio && (
            <p className="text-sm text-[var(--text-primary)] max-w-2xl leading-relaxed font-medium">{profileUser.bio}</p>
          )}

          {profileUser.website && (
            <a
              href={profileUser.website.startsWith("http") ? profileUser.website : `https://${profileUser.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--accent-primary)] hover:underline bg-[var(--accent-primary)]/10 px-3 py-1 rounded-full border border-[var(--accent-primary)]/20"
            >
              <FiGlobe className="w-3.5 h-3.5" />
              {profileUser.website.replace(/^https?:\/\//, "")}
            </a>
          )}

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-[var(--bg-elevated)]/60 border border-[var(--border-color)]">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <FiUsers className="w-5 h-5" />
              </div>
              <div>
                <p className="font-extrabold text-base text-[var(--text-primary)] leading-tight">{followersCount}</p>
                <p className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Followers</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-[var(--bg-elevated)]/60 border border-[var(--border-color)]">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                <FiUsers className="w-5 h-5" />
              </div>
              <div>
                <p className="font-extrabold text-base text-[var(--text-primary)] leading-tight">{profileUser.followingCount || 0}</p>
                <p className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Following</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-[var(--bg-elevated)]/60 border border-[var(--border-color)]">
              <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                <FiHeart className="w-5 h-5" />
              </div>
              <div>
                <p className="font-extrabold text-base text-[var(--text-primary)] leading-tight">{profileUser.likesCount || 0}</p>
                <p className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Total Likes</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-[var(--bg-elevated)]/60 border border-[var(--border-color)]">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
                <FiVideo className="w-5 h-5" />
              </div>
              <div>
                <p className="font-extrabold text-base text-[var(--text-primary)] leading-tight">{profileUser.shortsCount || 0}</p>
                <p className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Shorts</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isSelf && (
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          user={profileUser}
        />
      )}
    </div>
  );
}
