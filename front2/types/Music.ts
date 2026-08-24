import { UserSummary } from "./User";

export interface Music {
  _id: string;
  title: string;
  artist: string;
  audioUrl: string;
  coverUrl?: string;
  duration: number;
  usageCount: number;
  isOriginal: boolean;
  creator?: UserSummary;
  createdAt?: Date | string;
}

export interface MusicFilter {
  query?: string;
  trending?: boolean;
  category?: string;
}
