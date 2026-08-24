export interface User {
  _id: string;
  username: string;
  email: string;
  fullName: string;
  avatar: string;
  coverImage?: string;
  bio?: string;
  website?: string;
  isVerified: boolean;
  followersCount: number;
  followingCount: number;
  likesCount: number;
  shortsCount: number;
  isFollowing?: boolean;
  isSelf?: boolean;
  createdAt: string;
}

export interface Sound {
  _id: string;
  title: string;
  audioUrl: string;
  creator?: User | string;
  duration: number;
  shortsCount: number;
}

export interface Short {
  _id: string;
  owner: User;
  title: string;
  description: string;
  videoUrl: string;
  videoPublicId?: string;
  thumbnailUrl: string;
  duration: number;
  viewsCount: number;
  likesCount: number;
  commentsCount: number;
  savesCount: number;
  sharesCount: number;
  sound?: Sound | null;
  hashtags: string[];
  privacy: "public" | "private" | "unlisted";
  isLiked?: boolean;
  isSaved?: boolean;
  isFollowingOwner?: boolean;
  createdAt: string;
}

export interface Comment {
  _id: string;
  short: string;
  user: User;
  content: string;
  parentComment?: string | null;
  likesCount: number;
  repliesCount?: number;
  isLiked?: boolean;
  createdAt: string;
}
