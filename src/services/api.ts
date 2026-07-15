import type { Message, Profile, ProfilesQuery, User } from "../types/api";
import { request } from "./http-client";
export const api = {
  health: () => request<string>("/"),
  login: (email: string, password: string) =>
    request<User>("/auth/login", { method: "POST", body: { email, password } }),
  getMe: (email: string) => request<User>("/auth/me", {}, { email }),
  updateMe: (
    email: string,
    body: Partial<Pick<User, "bio" | "preferences" | "images">>,
  ) =>
    request<{ success: boolean }>("/auth/me", {
      method: "PUT",
      body: { email, ...body },
    }),
  deleteMe: (email: string) =>
    request<{ success: boolean }>("/auth/me", { method: "DELETE" }, { email }),
  getProfiles: (q: ProfilesQuery) => request<Profile[]>("/profiles", {}, q),
  swipe: (swiperEmail: string, targetId: string, action: "like" | "dislike") =>
    request<{ isMatch: boolean }>("/profiles/swipe", {
      method: "POST",
      body: { swiperEmail, targetId, action },
    }),
  getMatches: (email: string) =>
    request<Profile[]>("/profiles/matches", {}, { email }),
  block: (blockerEmail: string, targetId: string) =>
    request<boolean>("/profiles/block", {
      method: "POST",
      body: { blockerEmail, targetId },
    }),
  report: (reporterEmail: string, targetId: string, reason: string) =>
    request<boolean>("/profiles/report", {
      method: "POST",
      body: { reporterEmail, targetId, reason },
    }),
  unlike: (userEmail: string, targetId: string) =>
    request<boolean>("/profiles/unlike", {
      method: "POST",
      body: { userEmail, targetId },
    }),
  getMessages: (id: string) => request<Message[]>("/profiles/messages/" + id),
  sendMessage: (
    conversationId: string,
    senderEmail: string,
    text?: string,
    mediaUrl?: string,
  ) =>
    request<Message>("/profiles/messages", {
      method: "POST",
      body: { conversationId, senderEmail, text, mediaUrl },
    }),
  uploadImages: (images: File[]) => {
    const body = new FormData();
    images.forEach((x) => body.append("images", x));
    return request<string[]>("/uploads", { method: "POST", body });
  },
};
