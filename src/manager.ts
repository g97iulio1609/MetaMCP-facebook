import { graphConfig, GraphApiClient } from "@meta-mcp/core";
import type {
  FacebookComment,
  FacebookPost,
  GraphApiCollection,
  PostShareCount,
} from "@meta-mcp/core";

/**
 * Facebook Graph API Manager
 * 
 * Provides methods for interacting with Facebook Page APIs.
 * Methods are organized to support consolidated MCP tools.
 */
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

  // ─────────────────────────────────────────────────────────────────────────
  // Post Operations
  // ─────────────────────────────────────────────────────────────────────────

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

  async postImageToFacebook(imageUrl: string, caption: string): Promise<Record<string, unknown>> {
    return this.client.request({
      method: "POST",
      endpoint: `${this.pageId}/photos`,
      params: { url: imageUrl, caption },
    });
  }

  async updatePost(postId: string, message: string): Promise<Record<string, unknown>> {
    return this.client.request({
      method: "POST",
      endpoint: postId,
      params: { message },
    });
  }

  async deletePost(postId: string): Promise<Record<string, unknown>> {
    return this.client.request({
      method: "DELETE",
      endpoint: postId,
    });
  }

  async getPagePosts(
    limit = 25, 
    after?: string,
    fields = "id,message,created_time"
  ): Promise<GraphApiCollection<FacebookPost>> {
    return this.client.request({
      method: "GET",
      endpoint: `${this.pageId}/posts`,
      params: { fields, limit, after },
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Comment Operations
  // ─────────────────────────────────────────────────────────────────────────

  async getPostComments(
    postId: string, 
    limit = 25, 
    after?: string,
    includeSummary = false
  ): Promise<GraphApiCollection<FacebookComment> & { summary?: { total_count: number } }> {
    return this.client.request({
      method: "GET",
      endpoint: `${postId}/comments`,
      params: {
        fields: "id,message,from,created_time",
        limit,
        after,
        summary: includeSummary ? "true" : undefined,
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

  async deleteComment(commentId: string): Promise<Record<string, unknown>> {
    return this.client.request({
      method: "DELETE",
      endpoint: commentId,
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Insights & Analytics
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Default metrics available in Graph API v24.0+
   */
  private static readonly DEFAULT_METRICS = [
    "post_impressions_unique",
    "post_clicks",
    "post_reactions_like_total",
    "post_reactions_love_total",
    "post_reactions_wow_total",
    "post_reactions_haha_total",
    "post_reactions_sorry_total",
    "post_reactions_anger_total",
  ] as const;

  /**
   * Get post insights.
   * @param postId - Post ID
   * @param metrics - Specific metrics to fetch (optional, defaults to all available)
   */
  async getInsights(postId: string, metrics?: string[]): Promise<Record<string, unknown>> {
    const metricsToFetch = metrics?.length ? metrics : FacebookManager.DEFAULT_METRICS;
    return this.client.request({
      method: "GET",
      endpoint: `${postId}/insights`,
      params: {
        metric: metricsToFetch.join(","),
        period: "lifetime",
      },
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Page Information
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Get page information.
   * @param fields - Comma-separated fields to return (default: id,name,fan_count)
   */
  async getPageInfo(fields = "id,name,fan_count"): Promise<Record<string, unknown>> {
    return this.client.request({
      method: "GET",
      endpoint: this.pageId,
      params: { fields },
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Messaging
  // ─────────────────────────────────────────────────────────────────────────

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

  // ─────────────────────────────────────────────────────────────────────────
  // Batch Operations
  // ─────────────────────────────────────────────────────────────────────────

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
}

type BatchOperation = {
  method: "GET" | "POST" | "DELETE" | "PATCH";
  relative_url: string;
  body?: Record<string, string> | undefined;
  name?: string | undefined;
  omit_response_on_success?: boolean | undefined;
};
