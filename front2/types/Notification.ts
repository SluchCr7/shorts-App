import { UserSummary } from "./User";

export type NotificationType =
  | 'like_video'
  | 'like_comment'
  | 'comment'
  | 'reply'
  | 'follow'
  | 'mention';

export interface Notification {
  _id: string;
  recipientId: string;
  sender: UserSummary;
  type: NotificationType;
  videoId?: string;
  videoThumbnail?: string;
  commentId?: string;
  commentText?: string;
  isRead: boolean;
  createdAt: Date | string;
}

export interface NotificationFilter {
  unreadOnly?: boolean;
  type?: NotificationType;
}
