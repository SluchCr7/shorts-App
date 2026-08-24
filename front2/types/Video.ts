import { UserSummary } from "./User";
import { Music } from "./Music";

export type VideoVisibility = 'public' | 'private' | 'friends';
export type VideoStatus = 'processing' | 'ready' | 'failed';

export interface VideoDimensions {
  width: number;
  height: number;
  aspectRatio: string;
}

export interface Video {
  _id: string;
  title: string;
  description: string;
  url: string;
  hlsUrl?: string;
  thumbnail: string;
  duration: number;
  dimensions?: VideoDimensions;
  creator: UserSummary;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  savesCount: number;
  views: number;
  hashtags: string[];
  category?: string;
  sound?: Music;
  visibility: VideoVisibility;
  status: VideoStatus;
  isLiked?: boolean;
  isSaved?: boolean;
  isFollowingCreator?: boolean;
  createdAt: Date | string;
  updatedAt?: Date | string;
}

export type FeedType = 'for_you' | 'following' | 'trending' | 'saved' | 'hashtag' | 'sound';

export interface VideoFilter {
  feedType?: FeedType;
  category?: string;
  hashtag?: string;
  soundId?: string;
  creatorId?: string;
}

export interface VideoUploadPayload {
  title: string;
  description?: string;
  videoFile: File | string;
  thumbnailFile?: File | string;
  hashtags?: string[];
  category?: string;
  soundId?: string;
  visibility?: VideoVisibility;
}

export interface VideoUpdatePayload {
  title?: string;
  description?: string;
  hashtags?: string[];
  category?: string;
  visibility?: VideoVisibility;
}