export interface UserPreferences {
  excludedGenders: string[];
  excludedHairColors: string[];
  maxDistance: number;
  excludedHabits: string[];
  strictMode: boolean;
  excludeTattoos: boolean;
  excludedTattooLocations: string[];
  excludePiercings: boolean;
  excludedPiercingLocations: string[];
  excludeGlasses: boolean;
  excludedAgeRanges: string[];
}
export interface User {
  id: string;
  email: string;
  name: string;
  age: number;
  gender: string;
  preferences: UserPreferences;
  bio: string;
  images: string[];
  role?: "admin" | "user";
}
export interface Profile {
  id: string;
  name: string;
  age: number;
  gender: string;
  hairColor: string;
  distance?: number;
  bio: string;
  habits: string[];
  avatarUrl: string;
  images: string[];
}
export interface ProfilesQuery {
  email?: string;
  excludedGenders?: string[];
  excludedHairColors?: string[];
  maxDistance?: number;
  excludedHabits?: string[];
  limit?: number;
  latitude?: number;
  longitude?: number;
}
export interface Message {
  conversationId: string;
  sender: string;
  text?: string;
  mediaUrl?: string;
  createdAt?: string;
}
export interface AcquisitionStats {
  totalUsers: number;
  newUsersLast7Days: number;
  newUsersThisWeek: number;
}
export interface ActivationStats {
  totalProfiles: number;
  completedProfiles: number;
  profilesWithPhotos: number;
  completionRate: number;
}
export interface EngagementStats {
  totalSwipes: number;
  totalLikes: number;
  totalDislikes: number;
  profilesViewed: number;
  activeUsersLast7Days: number;
}
export interface QualityStats {
  totalReports: number;
  totalBlocks: number;
  totalModerationActions: number;
}
export interface ConversionStats {
  totalMatches: number;
  matchRate: number;
}
export interface TechnicalStats {
  totalRequests: number;
  totalErrors: number;
  errorRate: number;
  avgResponseTimeMs: number;
  uptimeSeconds: number;
}
export interface AdminAnalytics {
  acquisition: AcquisitionStats;
  activation: ActivationStats;
  engagement: EngagementStats;
  quality: QualityStats;
  conversion: ConversionStats;
  technical: TechnicalStats;
}
export interface AdminMatchUser {
  id: string;
  name: string;
  email: string;
}
export interface AdminMatch {
  id: string;
  userA: AdminMatchUser;
  userB: AdminMatchUser;
  matchedAt: string;
  messageCount?: number;
}
export interface RedFlag {
  id: string;
  key: string;
  label: string;
}
