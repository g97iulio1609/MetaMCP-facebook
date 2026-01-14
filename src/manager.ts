import { graphConfig, GraphApiClient } from "@meta-mcp/core";
import type {
  FacebookComment,
  FacebookPost,
  GraphApiCollection,
  PostLikeSummary,
  PostShareCount,
} from "@meta-mcp/core";

const NEGATIVE_KEYWORDS = [
  "bad",
  "terrible",
  "awful",
  "hate",
  "dislike",
  "problem",
  "issue",
  "scam",
  "refund",
  "broken",
];

export class FacebookManager {
  private readonly client: GraphApiClient;
  private readonly pageId: string;

  constructor(client: GraphApiClient, pageId: string) {
    this.client = client;
    this.pageId = pageId;
  }

  static fromEnv(): FacebookManager {
    return new FacebookManager(new GraphApiClient(graphConfig), graphConfig.pageId);
  }

  async postToFacebook(message: string, options: {
    link?: string;
    place?: string;
    published?: boolean;
    scheduled_publish_time?: number;
  } = {}): Promise<Record<string, unknown>> {
    return this.client.request({
      method: "POST",
      endpoint: `${this.pageId}/feed`,
      params: {
        message,
        ...options,
      },
    });
  }

  async replyToComment(commentId: string, message: string): Promise<Record<string, unknown>> {
    return this.client.request({
      method: "POST",
      endpoint: `${commentId}/comments`,
      params: { message },
    });
  }

  async getPagePosts(limit = 25, after?: string): Promise<GraphApiCollection<FacebookPost>> {
    return this.client.request({
      method: "GET",
      endpoint: `${this.pageId}/posts`,
      params: {
        fields: "id,message,created_time",
        limit,
        after,
      },
    });
  }

  async getPostComments(postId: string, limit = 25, after?: string): Promise<GraphApiCollection<FacebookComment>> {
    return this.client.request({
      method: "GET",
      endpoint: `${postId}/comments`,
      params: {
        fields: "id,message,from,created_time",
        limit,
        after,
      },
    });
  }

  async deletePost(postId: string): Promise<Record<string, unknown>> {
    return this.client.request({
      method: "DELETE",
      endpoint: postId,
    });
  }

  async deleteComment(commentId: string): Promise<Record<string, unknown>> {
    return this.client.request({
      method: "DELETE",
      endpoint: commentId,
    });
  }

  filterNegativeComments(comments: GraphApiCollection<FacebookComment>) {
    return (comments.data ?? []).filter((comment) => {
      const text = comment.message?.toLowerCase();
      if (!text) return false;
      for (const keyword of NEGATIVE_KEYWORDS) {
        if (text.includes(keyword)) {
          return true;
        }
      }
      return false;
    });
  }

  async getNumberOfComments(postId: string): Promise<number> {
    const response = await this.getPostComments(postId);
    return response.data.length;
  }

  async getNumberOfLikes(postId: string): Promise<number> {
    const response = await this.client.request<PostLikeSummary>({
      method: "GET",
      endpoint: postId,
      params: { fields: "likes.summary(true)" },
    });

    return response.likes?.summary?.total_count ?? 0;
  }

  /**
   * Get all post insights.
   * Note: Many metrics were deprecated in v24.0 (March 2024).
   * Only valid metrics are requested to avoid API errors.
   */
  async getPostInsights(postId: string): Promise<Record<string, unknown>> {
    // Use only v24.0 valid metrics - others were deprecated
    return this.getInsights(postId, [
      "post_impressions_unique",
      "post_clicks",
      "post_reactions_like_total",
      "post_reactions_love_total",
      "post_reactions_wow_total",
      "post_reactions_haha_total",
      "post_reactions_sorry_total",
      "post_reactions_anger_total",
    ]);
  }

  /**
   * Get unique impressions of a post.
   * This is the only non-deprecated impression metric in v24.0.
   */
  async getPostImpressionsUnique(postId: string): Promise<Record<string, unknown>> {
    return this.getInsights(postId, ["post_impressions_unique"]);
  }

  /**
   * Get post clicks.
   */
  async getPostClicks(postId: string): Promise<Record<string, unknown>> {
    return this.getInsights(postId, ["post_clicks"]);
  }

  async getPostReactionsLikeTotal(postId: string): Promise<Record<string, unknown>> {
    return this.getInsights(postId, ["post_reactions_like_total"]);
  }

  async getPostReactionsLoveTotal(postId: string): Promise<Record<string, unknown>> {
    return this.getInsights(postId, ["post_reactions_love_total"]);
  }

  async getPostReactionsWowTotal(postId: string): Promise<Record<string, unknown>> {
    return this.getInsights(postId, ["post_reactions_wow_total"]);
  }

  async getPostReactionsHahaTotal(postId: string): Promise<Record<string, unknown>> {
    return this.getInsights(postId, ["post_reactions_haha_total"]);
  }

  async getPostReactionsSorryTotal(postId: string): Promise<Record<string, unknown>> {
    return this.getInsights(postId, ["post_reactions_sorry_total"]);
  }

  async getPostReactionsAngerTotal(postId: string): Promise<Record<string, unknown>> {
    return this.getInsights(postId, ["post_reactions_anger_total"]);
  }

  async getPostTopCommenters(postId: string) {
    const comments = await this.getPostComments(postId);
    const counter = new Map<string, number>();

    for (const comment of comments.data ?? []) {
      const userId = comment.from?.id;
      if (!userId) continue;
      counter.set(userId, (counter.get(userId) ?? 0) + 1);
    }

    return [...counter.entries()]
      .map(([userId, count]) => ({ user_id: userId, count }))
      .sort((a, b) => b.count - a.count);
  }

  async postImageToFacebook(imageUrl: string, caption: string): Promise<Record<string, unknown>> {
    return this.client.request({
      method: "POST",
      endpoint: `${this.pageId}/photos`,
      params: { url: imageUrl, caption },
    });
  }

  async sendDmToUser(userId: string, message: string): Promise<Record<string, unknown>> {
    return this.client.request({
      method: "POST",
      endpoint: "me/messages",
      body: {
        recipient: { id: userId },
        message: { text: message },
        messaging_type: "RESPONSE",
      },
    });
  }

  async updatePost(postId: string, newMessage: string): Promise<Record<string, unknown>> {
    return this.client.request({
      method: "POST",
      endpoint: postId,
      params: { message: newMessage },
    });
  }

  async schedulePost(message: string, publishTime: number): Promise<Record<string, unknown>> {
    return this.client.request({
      method: "POST",
      endpoint: `${this.pageId}/feed`,
      params: {
        message,
        published: false,
        scheduled_publish_time: publishTime,
      },
    });
  }

  async getPageFanCount(): Promise<number> {
    const response = await this.client.request<{ fan_count?: number }>({
      method: "GET",
      endpoint: this.pageId,
      params: { fields: "fan_count" },
    });

    return response.fan_count ?? 0;
  }

  async getPostShareCount(postId: string): Promise<number> {
    const response = await this.client.request<PostShareCount>({
      method: "GET",
      endpoint: postId,
      params: { fields: "shares" },
    });

    return response.shares?.count ?? 0;
  }

  async batchRequest(operations: BatchOperation[], includeHeaders = false) {
    return this.client.request({
      method: "POST",
      endpoint: "",
      params: {
        batch: JSON.stringify(operations.map((operation) => ({
          method: operation.method,
          relative_url: operation.relative_url,
          body: operation.body ? new URLSearchParams(operation.body).toString() : undefined,
          name: operation.name,
          omit_response_on_success: operation.omit_response_on_success,
        }))),
        include_headers: includeHeaders,
      },
    });
  }

  private async getInsights(postId: string, metrics: string[]) {
    return this.client.request({
      method: "GET",
      endpoint: `${postId}/insights`,
      params: {
        metric: metrics.join(","),
        period: "lifetime",
      },
    });
  }
}

type BatchOperation = {
  method: "GET" | "POST" | "DELETE" | "PATCH";
  relative_url: string;
  body?: Record<string, string> | undefined;
  name?: string | undefined;
  omit_response_on_success?: boolean | undefined;
};
