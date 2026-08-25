export interface SocialLinks {
  instagram?: string;
  youtube?: string;
  twitter?: string;
  website?: string;
}

export interface UserSummary {
  _id: string;
  username?: string;
  name: string;
  profilePic: string;
  isVerified: boolean;
  isVerify?: boolean;
}

export interface User {
  _id: string;
  username: string;
  name: string;
  email: string;
  bio?: string;
  profilePic: string;
  coverImage?: string;
  isVerified: boolean;
  isVerify?: boolean;
  followers?: UserSummary[];
  following?: UserSummary[];
  followersCount: number;
  followingCount: number;
  totalLikesCount: number;
  videoCount: number;
  isFollowing?: boolean;
  socialLinks?: SocialLinks;
  createdAt: Date | string;
  updatedAt?: Date | string;
}

export interface AuthUser {
  _id: string;
  username: string;
  name: string;
  email: string;
  profilePic: string;
  isVerified: boolean;
  isVerify?: boolean;
  token?: string;
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface UpdateProfilePayload {
  name?: string;
  username?: string;
  bio?: string;
  profilePic?: string;
  coverImage?: string;
  socialLinks?: SocialLinks;
}

export interface UserPreferences {
  darkMode: boolean;
  autoplay: boolean;
  pushNotifications: boolean;
  privateAccount: boolean;
  language: string;
}