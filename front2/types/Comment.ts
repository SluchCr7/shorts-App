import { UserSummary } from "./User";

export interface Comment {
  _id: string;
  text: string;
  creator: UserSummary;
  videoId: string;
  parentCommentId?: string | null;
  replies?: Comment[];
  repliesCount: number;
  likesCount: number;
  isLiked?: boolean;
  createdAt: Date | string;
  updatedAt?: Date | string;
}

export interface CreateCommentPayload {
  videoId: string;
  text: string;
  parentCommentId?: string;
}

export interface CommentFilter {
  videoId: string;
  parentCommentId?: string;
  sortBy?: 'newest' | 'popular';
}