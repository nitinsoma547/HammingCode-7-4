/**
 * Types for the Meta Graph API client.
 * Pinned to v21.0 of the Graph API — see config.meta.apiVersion.
 */

export type MediaKind = "photo" | "video" | "reel" | "carousel";

export interface IGPhotoPost {
  kind: "photo";
  imageUrl: string;
  caption: string;
}

export interface IGReelPost {
  kind: "reel";
  videoUrl: string;
  caption: string;
  /** Cover frame URL, optional. */
  thumbOffset?: number;
  shareToFeed?: boolean;
}

export interface IGCarouselPost {
  kind: "carousel";
  /** 2-10 children. Each is photo or video. */
  items: Array<{ imageUrl?: string; videoUrl?: string }>;
  caption: string;
}

export type IGPost = IGPhotoPost | IGReelPost | IGCarouselPost;

export interface FBTextPost {
  kind: "text";
  message: string;
  /** Optional link to include — Meta renders OG preview. */
  link?: string;
  /** UNIX seconds. If set, the post is scheduled instead of published immediately. */
  scheduledPublishTime?: number;
}

export interface FBPhotoPost {
  kind: "photo";
  imageUrl: string;
  message: string;
  scheduledPublishTime?: number;
}

export interface FBVideoPost {
  kind: "video";
  videoUrl: string;
  description: string;
  scheduledPublishTime?: number;
}

export type FBPost = FBTextPost | FBPhotoPost | FBVideoPost;

export interface PostResult {
  /** Platform-assigned post ID (different shape across IG/FB). */
  id: string;
  /** Platform we posted to. */
  platform: "facebook" | "instagram";
  /** UNIX ms when we got the confirmed ID back. */
  postedAt: number;
  /** Optional URL to view the post (FB Page posts only). */
  permalink?: string;
}

export interface MetaClientOptions {
  /** Override the access token for a specific call (e.g., test page token). */
  accessToken?: string;
  /** Set to true to log + return what would be sent instead of calling Meta. */
  dryRun?: boolean;
}

/** Container statuses from IG media-container status_code. */
export type IGContainerStatus = "EXPIRED" | "ERROR" | "FINISHED" | "IN_PROGRESS" | "PUBLISHED";
