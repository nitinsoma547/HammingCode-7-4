/**
 * Meta Graph API client — Facebook Pages + Instagram Business content publishing.
 *
 * What this implements:
 *  - Post photo / video / Reel / carousel to Instagram Business account
 *  - Post text / photo / video to Facebook Page feed
 *  - Schedule FB Page posts (IG doesn't support API-side scheduling — use a cron + dispatch)
 *
 * What this does NOT implement (v1):
 *  - Stories (different endpoint shape)
 *  - DMs / Messenger
 *  - Comment moderation
 *  - Insights / analytics
 *  - Threads / WhatsApp Business
 *
 * Reads creds via api/src/lib/config.ts only — never inline (CLAUDE.md §9).
 * All errors throw ServiceError("meta", code, message).
 */

import { requireMetaEnv } from "@/lib/config";
import { ServiceError } from "@/lib/errors";
import { log } from "@/lib/logger";
import type {
  FBPost,
  IGContainerStatus,
  IGPost,
  MetaClientOptions,
  PostResult,
} from "./types";

const CONTAINER_POLL_INTERVAL_MS = 2000;
const CONTAINER_MAX_WAIT_MS = 5 * 60_000;

function graphUrl(version: string, path: string): string {
  const trimmed = path.startsWith("/") ? path : `/${path}`;
  return `https://graph.facebook.com/${version}${trimmed}`;
}

interface GraphErrorBody {
  error?: {
    message?: string;
    type?: string;
    code?: number;
    fbtrace_id?: string;
  };
}

async function graphRequest<T>(
  method: "GET" | "POST",
  url: string,
  body?: Record<string, string | number | boolean | undefined>,
): Promise<T> {
  let init: RequestInit;
  if (method === "GET") {
    init = { method };
  } else {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(body ?? {})) {
      if (v !== undefined) params.append(k, String(v));
    }
    init = {
      method,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    };
  }

  const response = await fetch(url, init);
  const text = await response.text();
  let json: unknown;
  try {
    json = text.length > 0 ? JSON.parse(text) : {};
  } catch {
    throw new ServiceError("meta", "non-json-response", `${response.status} ${text.slice(0, 200)}`);
  }
  if (!response.ok) {
    const body = json as GraphErrorBody;
    const errCode = body.error?.code != null ? `graph-${body.error.code}` : `http-${response.status}`;
    const errMsg = body.error?.message ?? response.statusText;
    throw new ServiceError("meta", errCode, errMsg, body.error);
  }
  return json as T;
}

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

interface IGContainerCreateResponse {
  id: string;
}

interface IGContainerStatusResponse {
  status_code: IGContainerStatus;
}

interface IGPublishResponse {
  id: string;
}

interface FBFeedResponse {
  id: string;
}

interface FBPhotoResponse {
  id: string;
  post_id?: string;
}

/**
 * Publish a post to Instagram Business account. Two-step container flow.
 */
export async function publishInstagramPost(
  post: IGPost,
  options: MetaClientOptions = {},
): Promise<PostResult> {
  if (options.dryRun) {
    log.info("meta.ig.dry-run", { post });
    return { id: "dry-run", platform: "instagram", postedAt: Date.now() };
  }

  const env = requireMetaEnv();
  const token = options.accessToken ?? env.token;
  const containerEndpoint = graphUrl(env.apiVersion, `/${env.igUserId}/media`);
  const publishEndpoint = graphUrl(env.apiVersion, `/${env.igUserId}/media_publish`);

  let containerId: string;

  if (post.kind === "photo") {
    const res = await graphRequest<IGContainerCreateResponse>("POST", containerEndpoint, {
      image_url: post.imageUrl,
      caption: post.caption,
      access_token: token,
    });
    containerId = res.id;
  } else if (post.kind === "reel") {
    const res = await graphRequest<IGContainerCreateResponse>("POST", containerEndpoint, {
      media_type: "REELS",
      video_url: post.videoUrl,
      caption: post.caption,
      share_to_feed: post.shareToFeed ?? true,
      thumb_offset: post.thumbOffset,
      access_token: token,
    });
    containerId = res.id;
  } else {
    // Carousel: create children, then a parent carousel container.
    if (post.items.length < 2 || post.items.length > 10) {
      throw new ServiceError(
        "meta",
        "carousel-size",
        `Carousel must have 2-10 items; got ${post.items.length}`,
      );
    }
    const childIds: string[] = [];
    for (const item of post.items) {
      const childRes = await graphRequest<IGContainerCreateResponse>("POST", containerEndpoint, {
        image_url: item.imageUrl,
        video_url: item.videoUrl,
        is_carousel_item: true,
        access_token: token,
      });
      childIds.push(childRes.id);
    }
    const parentRes = await graphRequest<IGContainerCreateResponse>("POST", containerEndpoint, {
      media_type: "CAROUSEL",
      children: childIds.join(","),
      caption: post.caption,
      access_token: token,
    });
    containerId = parentRes.id;
  }

  // Poll container until FINISHED (or ERROR / EXPIRED).
  await waitForContainerReady(containerId, token, env.apiVersion);

  // Publish.
  const publishRes = await graphRequest<IGPublishResponse>("POST", publishEndpoint, {
    creation_id: containerId,
    access_token: token,
  });

  log.info("meta.ig.published", { mediaId: publishRes.id, kind: post.kind });
  return {
    id: publishRes.id,
    platform: "instagram",
    postedAt: Date.now(),
  };
}

async function waitForContainerReady(
  containerId: string,
  token: string,
  apiVersion: string,
): Promise<void> {
  const statusEndpoint = graphUrl(
    apiVersion,
    `/${containerId}?fields=status_code&access_token=${encodeURIComponent(token)}`,
  );
  const deadline = Date.now() + CONTAINER_MAX_WAIT_MS;
  while (Date.now() < deadline) {
    const res = await graphRequest<IGContainerStatusResponse>("GET", statusEndpoint);
    if (res.status_code === "FINISHED") return;
    if (res.status_code === "ERROR" || res.status_code === "EXPIRED") {
      throw new ServiceError(
        "meta",
        `container-${res.status_code.toLowerCase()}`,
        `Container ${containerId} status: ${res.status_code}`,
      );
    }
    await sleep(CONTAINER_POLL_INTERVAL_MS);
  }
  throw new ServiceError("meta", "container-timeout", `Container ${containerId} did not finish within ${CONTAINER_MAX_WAIT_MS}ms`);
}

/**
 * Publish a post to a Facebook Page.
 */
export async function publishFacebookPost(
  post: FBPost,
  options: MetaClientOptions = {},
): Promise<PostResult> {
  if (options.dryRun) {
    log.info("meta.fb.dry-run", { post });
    return { id: "dry-run", platform: "facebook", postedAt: Date.now() };
  }

  const env = requireMetaEnv();
  const token = options.accessToken ?? env.token;
  const isScheduled = post.scheduledPublishTime != null;

  if (post.kind === "text") {
    const res = await graphRequest<FBFeedResponse>(
      "POST",
      graphUrl(env.apiVersion, `/${env.fbPageId}/feed`),
      {
        message: post.message,
        link: post.link,
        published: isScheduled ? false : true,
        scheduled_publish_time: post.scheduledPublishTime,
        access_token: token,
      },
    );
    log.info("meta.fb.published", { postId: res.id, kind: post.kind, scheduled: isScheduled });
    return {
      id: res.id,
      platform: "facebook",
      postedAt: Date.now(),
      permalink: `https://www.facebook.com/${res.id}`,
    };
  }

  if (post.kind === "photo") {
    const res = await graphRequest<FBPhotoResponse>(
      "POST",
      graphUrl(env.apiVersion, `/${env.fbPageId}/photos`),
      {
        url: post.imageUrl,
        caption: post.message,
        published: isScheduled ? false : true,
        scheduled_publish_time: post.scheduledPublishTime,
        access_token: token,
      },
    );
    log.info("meta.fb.published", { mediaId: res.id, postId: res.post_id, kind: post.kind });
    return {
      id: res.post_id ?? res.id,
      platform: "facebook",
      postedAt: Date.now(),
    };
  }

  // video
  const res = await graphRequest<FBFeedResponse>(
    "POST",
    graphUrl(env.apiVersion, `/${env.fbPageId}/videos`),
    {
      file_url: post.videoUrl,
      description: post.description,
      published: isScheduled ? false : true,
      scheduled_publish_time: post.scheduledPublishTime,
      access_token: token,
    },
  );
  log.info("meta.fb.published", { videoId: res.id, kind: post.kind });
  return {
    id: res.id,
    platform: "facebook",
    postedAt: Date.now(),
  };
}

/**
 * Convenience: post to BOTH FB and IG from a single social-media-planner slot.
 * Reads the captions per channel from the slot and dispatches in parallel.
 */
export async function publishCrossPost(input: {
  imageUrl?: string;
  videoUrl?: string;
  fbCaption: string;
  igCaption: string;
  kind: "photo" | "video";
  fbScheduledPublishTime?: number;
}): Promise<{ fb: PostResult; ig: PostResult }> {
  const tasks: Array<Promise<PostResult>> = [];

  if (input.kind === "photo") {
    if (!input.imageUrl) throw new ServiceError("meta", "missing-image", "kind=photo requires imageUrl");
    const fbPost: FBPost = input.fbScheduledPublishTime != null
      ? { kind: "photo", imageUrl: input.imageUrl, message: input.fbCaption, scheduledPublishTime: input.fbScheduledPublishTime }
      : { kind: "photo", imageUrl: input.imageUrl, message: input.fbCaption };
    tasks.push(publishFacebookPost(fbPost));
    tasks.push(
      publishInstagramPost({ kind: "photo", imageUrl: input.imageUrl, caption: input.igCaption }),
    );
  } else {
    if (!input.videoUrl) throw new ServiceError("meta", "missing-video", "kind=video requires videoUrl");
    const fbPost: FBPost = input.fbScheduledPublishTime != null
      ? { kind: "video", videoUrl: input.videoUrl, description: input.fbCaption, scheduledPublishTime: input.fbScheduledPublishTime }
      : { kind: "video", videoUrl: input.videoUrl, description: input.fbCaption };
    tasks.push(publishFacebookPost(fbPost));
    tasks.push(
      publishInstagramPost({ kind: "reel", videoUrl: input.videoUrl, caption: input.igCaption }),
    );
  }

  const [fb, ig] = await Promise.all(tasks);
  if (!fb || !ig) {
    throw new ServiceError("meta", "cross-post-incomplete", "publishCrossPost did not resolve both results");
  }
  return { fb, ig };
}
