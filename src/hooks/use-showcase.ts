import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";
import type { ShowcaseProject } from "@/types";

interface ShowcaseParams {
  search?: string;
  tech_stack?: string;
  skip?: number;
  limit?: number;
}

export function useShowcaseProjects(params?: ShowcaseParams, options?: { initialData?: ShowcaseProject[] }) {
  return useQuery({
    queryKey: ["showcase", params],
    queryFn: () => api.get<ShowcaseProject[]>("/showcase", params as Record<string, string | number | boolean | undefined>),
    initialData: options?.initialData,
  });
}

export function useShowcaseProject(slug: string) {
  return useQuery({
    queryKey: ["showcase", slug],
    queryFn: () => api.get<ShowcaseProject>(`/showcase/${slug}`),
    enabled: !!slug,
  });
}

/** Slugs of launches the signed-in user has upvoted. */
export const myLaunchUpvotesQuery = {
  queryKey: ["showcase", "my-upvotes"],
  queryFn: () => api.get<string[]>("/showcase/account/upvotes"),
};

export function useMyLaunchUpvotes(enabled: boolean) {
  return useQuery({ ...myLaunchUpvotesQuery, enabled });
}

/** Toggles the user's upvote. The response carries the new count and `voted`. */
export function useUpvoteShowcase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (slug: string) => api.post<ShowcaseProject & { voted?: boolean }>(`/showcase/${slug}/upvote`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["showcase"] }),
  });
}

export function useMyShowcaseProjects(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["showcase", "me"],
    queryFn: () => api.get<ShowcaseProject[]>("/showcase/account/me"),
    enabled: options?.enabled ?? true,
  });
}

export interface ShowcaseSubmission {
  title: string;
  tagline?: string;
  description: string;
  app_url: string;
  demo_url?: string;
  github_url?: string;
  category?: string;
  tech_stack: string[];
  skills_used: string[];
  use_cases: string[];
  feedback_prompt?: string;
  badge_page_url: string;
  gallery_images?: string[];
  demo_video_url?: string;
  platforms?: string[];
  overview?: ShowcaseProject["overview"];
  creator_socials?: ShowcaseProject["creator_socials"];
  logo_url?: string;
  video_url?: string;
}

export type UploadKind = "logo" | "screenshot" | "video";

export interface UploadConfig {
  enabled: boolean;
  limits: Record<UploadKind, { max_bytes: number; types: string[] }>;
}

/** Whether direct media uploads are configured on the server. */
export function useUploadConfig() {
  return useQuery({
    queryKey: ["showcase", "upload-config"],
    queryFn: () => api.get<UploadConfig>("/showcase/uploads/config"),
    staleTime: 10 * 60_000,
    retry: false,
  });
}

export interface LaunchAutofill {
  url: string;
  name: string;
  tagline: string;
  description: string;
  image: string | null;
  twitter: string | null;
}

/** Suggest name, tagline, description and image from the app's own meta tags. */
export function useLaunchAutofill() {
  return useMutation({
    mutationFn: (url: string) => api.post<LaunchAutofill>("/showcase/autofill", { url }),
  });
}

export function useSubmitShowcaseProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ShowcaseSubmission) => api.post<ShowcaseProject>("/showcase", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["showcase"] });
      queryClient.invalidateQueries({ queryKey: ["showcase", "me"] });
    },
  });
}

export function useVerifyShowcaseBadge() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ slug, badge_page_url }: { slug: string; badge_page_url?: string }) =>
      api.post<ShowcaseProject>(`/showcase/${slug}/verify-badge`, { badge_page_url }),
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: ["showcase"] });
      queryClient.invalidateQueries({ queryKey: ["showcase", "me"] });
      queryClient.invalidateQueries({ queryKey: ["showcase", project.id] });
    },
  });
}

export interface LaunchVoters {
  total: number;
  voters: { username?: string; name?: string; avatar?: string | null }[];
}

/** Recent upvoters for the avatar stack. Refreshes when the user votes. */
export function useLaunchVoters(slug: string) {
  return useQuery({
    queryKey: ["showcase", slug, "voters"],
    queryFn: () => api.get<LaunchVoters>(`/showcase/${slug}/voters`),
    enabled: !!slug,
  });
}

export type LaunchUpdate = Partial<
  Pick<
    ShowcaseProject,
    | "title" | "tagline" | "description" | "category" | "tech_stack" | "use_cases" | "platforms" | "overview"
    | "gallery_images" | "demo_video_url" | "github_url" | "feedback_prompt" | "creator_socials"
  >
> & { logo_url?: string; video_url?: string };

/** Owner edits a launch (details and media). */
export function useUpdateLaunch(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (changes: LaunchUpdate) => api.put<ShowcaseProject>(`/showcase/${slug}`, changes),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["showcase"] }),
  });
}
