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
