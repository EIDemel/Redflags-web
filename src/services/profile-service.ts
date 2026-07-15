import type { User, UserPreferences } from "../types/api";
import { request } from "./http-client";

export type ProfileUpdate = {
  name: string;
  age: number;
  gender: string;
  bio: string;
  preferences: UserPreferences;
  images: string[];
};
export const profileService = {
  get: (email: string) => request<User>("/auth/me", {}, { email }),
  update: (email: string, profile: ProfileUpdate) =>
    request<{ success: boolean }>("/auth/me", {
      method: "PUT",
      body: { email, ...profile },
    }),
  upload: (files: File[]) => {
    const body = new FormData();
    files.forEach((file) => body.append("images", file));
    return request<string[]>("/uploads", { method: "POST", body });
  },
};
