export interface VideoAnalytics {
  videoId: string;
  viewsCount: number;
  uniqueViews: number;
  totalWatchTimeSeconds: number;
  averageWatchTimeSeconds: number;
  completionRate: number;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  savesCount: number;
  engagementRate: number;
}

export interface CreatorAnalytics {
  creatorId: string;
  totalViews: number;
  totalWatchTimeHours: number;
  totalFollowers: number;
  newFollowersPeriod: number;
  profileViews: number;
  topVideos: VideoAnalytics[];
}
