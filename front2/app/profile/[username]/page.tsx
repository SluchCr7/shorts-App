"use client";

import { use, useState } from "react";
import { useCheckAuthQuery } from "../../../src/redux/api/authApi";
import {
  useGetUserProfileQuery,
  useGetUserShortsQuery,
  useGetUserLikedShortsQuery,
  useGetUserSavedShortsQuery,
} from "../../../src/redux/api/usersApi";
import ProfileHeader from "../../../src/components/profile/ProfileHeader";
import VideoGrid from "../../../src/components/profile/VideoGrid";
import { FiVideo, FiHeart, FiBookmark } from "react-icons/fi";

export default function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const resolvedParams = use(params);
  const username = resolvedParams.username;

  const { data: currentUser } = useCheckAuthQuery();
  const { data: profileUser, isLoading: isProfileLoading } = useGetUserProfileQuery(username);

  const [activeTab, setActiveTab] = useState<"shorts" | "liked" | "saved">("shorts");

  const userId = profileUser?._id || "";

  const { data: uploadedShorts = [], isLoading: isUploadedLoading } = useGetUserShortsQuery(userId, {
    skip: !userId || activeTab !== "shorts",
  });

  const { data: likedShorts = [], isLoading: isLikedLoading } = useGetUserLikedShortsQuery(userId, {
    skip: !userId || activeTab !== "liked",
  });

  const { data: savedShorts = [], isLoading: isSavedLoading } = useGetUserSavedShortsQuery(undefined, {
    skip: !userId || activeTab !== "saved",
  });

  const shorts = activeTab === "shorts" ? uploadedShorts : activeTab === "liked" ? likedShorts : savedShorts;
  const isShortsLoading = activeTab === "shorts" ? isUploadedLoading : activeTab === "liked" ? isLikedLoading : isSavedLoading;

  if (isProfileLoading || !profileUser) {
    return (
      <div className="w-full min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-[var(--accent-primary)] border-t-transparent animate-spin" />
      </div>
    );
  }

  const isSelf = currentUser?._id === profileUser._id;

  return (
    <div className="w-full min-h-[calc(100vh-4rem)]">
      {/* Profile Header Banner */}
      <ProfileHeader
        profileUser={profileUser}
        isSelf={isSelf}
        initialIsFollowing={profileUser.isFollowing}
      />

      {/* Tabs */}
      <div className="max-w-5xl mx-auto border-b border-[var(--border-color)] px-4 flex gap-8">
        <button
          onClick={() => setActiveTab("shorts")}
          className={`py-4 font-bold text-sm flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === "shorts"
              ? "border-[var(--accent-primary)] text-[var(--accent-primary)]"
              : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          <FiVideo className="w-4 h-4" />
          <span>Shorts</span>
        </button>

        <button
          onClick={() => setActiveTab("liked")}
          className={`py-4 font-bold text-sm flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === "liked"
              ? "border-[var(--accent-primary)] text-[var(--accent-primary)]"
              : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          <FiHeart className="w-4 h-4" />
          <span>Liked</span>
        </button>

        {isSelf && (
          <button
            onClick={() => setActiveTab("saved")}
            className={`py-4 font-bold text-sm flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === "saved"
                ? "border-[var(--accent-primary)] text-[var(--accent-primary)]"
                : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <FiBookmark className="w-4 h-4" />
            <span>Saved</span>
          </button>
        )}
      </div>

      {/* Video Content Grid */}
      {isShortsLoading ? (
        <div className="py-20 flex justify-center">
          <div className="w-10 h-10 rounded-full border-4 border-[var(--accent-primary)] border-t-transparent animate-spin" />
        </div>
      ) : (
        <VideoGrid
          shorts={shorts}
          emptyMessage={
            activeTab === "shorts"
              ? "No short videos uploaded yet"
              : activeTab === "liked"
              ? "No liked videos yet"
              : "No saved videos yet"
          }
        />
      )}
    </div>
  );
}
