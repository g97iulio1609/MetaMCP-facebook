import { z } from "zod";

/**
 * Consolidated Facebook MCP Tool Schemas
 * 
 * Follows MCP best practices:
 * - Group related operations into single tools with parameters
 * - Use enums for action variants instead of separate tools
 * - Batch operations supported via fb_batch
 * - ~10 tools instead of 27
 */

// ─────────────────────────────────────────────────────────────────────────────
// Shared Schema Components
// ─────────────────────────────────────────────────────────────────────────────

const postIdSchema = z.string().min(1).describe("Facebook post ID");
const commentIdSchema = z.string().min(1).describe("Facebook comment ID");
const messageSchema = z.string().min(1).describe("Message text");
const userIdSchema = z.string().min(1).describe("Facebook user ID");

const paginationSchema = {
  limit: z.number().int().min(1).max(100).optional().default(25).describe("Max items to return"),
  after: z.string().optional().describe("Pagination cursor for next page"),
};

const batchOperationSchema = z.object({
  method: z.enum(["GET", "POST", "DELETE", "PATCH"]),
  relative_url: z.string().min(1),
  body: z.record(z.string(), z.string()).optional(),
  name: z.string().optional().describe("Name for referencing in dependent requests"),
  omit_response_on_success: z.boolean().optional(),
});

// Insight metrics available in Graph API v24.0+
const insightMetricSchema = z.enum([
  "post_impressions_unique",
  "post_clicks",
  "post_reactions_like_total",
  "post_reactions_love_total", 
  "post_reactions_wow_total",
  "post_reactions_haha_total",
  "post_reactions_sorry_total",
  "post_reactions_anger_total",
]).describe("Insight metric to retrieve");

// ─────────────────────────────────────────────────────────────────────────────
// Consolidated Tool Schemas (11 tools)
// ─────────────────────────────────────────────────────────────────────────────

export const toolSchemas = {
  /**
   * Create a post (text, image, link, or scheduled)
   * Consolidates: fb_post_to_facebook, fb_post_image_to_facebook, fb_schedule_post
   */
  fb_create_post: z.object({
    message: messageSchema.optional().describe("Post text (required unless image_url provided)"),
    image_url: z.string().url().optional().describe("Image URL to post as photo"),
    link: z.string().url().optional().describe("URL to attach to the post"),
    place: z.string().optional().describe("Page ID of location to associate"),
    published: z.boolean().optional().default(true).describe("Publish immediately (true) or draft/schedule (false)"),
    scheduled_publish_time: z.number().int().optional().describe("Unix timestamp for scheduling (requires published: false)"),
  }).refine(
    (data) => data.message || data.image_url,
    { message: "Either message or image_url is required" }
  ),

  /**
   * Update an existing post
   */
  fb_update_post: z.object({
    post_id: postIdSchema,
    message: messageSchema.describe("New message text"),
  }),

  /**
   * Delete a post
   */
  fb_delete_post: z.object({
    post_id: postIdSchema,
  }),

  /**
   * Get page posts with pagination
   */
  fb_get_posts: z.object({
    ...paginationSchema,
    fields: z.string().optional().default("id,message,created_time").describe("Comma-separated fields to return"),
  }),

  /**
   * Get comments on a post
   * Consolidates: fb_get_post_comments, fb_get_number_of_comments
   */
  fb_get_comments: z.object({
    post_id: postIdSchema,
    ...paginationSchema,
    include_summary: z.boolean().optional().default(false).describe("Include total count summary"),
  }),

  /**
   * Reply to a comment
   */
  fb_reply_comment: z.object({
    comment_id: commentIdSchema,
    message: messageSchema,
  }),

  /**
   * Delete a comment
   * Consolidates: fb_delete_comment, fb_delete_comment_from_post
   */
  fb_delete_comment: z.object({
    comment_id: commentIdSchema,
  }),

  /**
   * Get post insights (metrics, reactions, engagement)
   * Consolidates: fb_get_post_insights, fb_get_post_impressions_unique, fb_get_post_clicks, all fb_get_post_reactions_*
   */
  fb_get_insights: z.object({
    post_id: postIdSchema,
    metrics: z.array(insightMetricSchema).optional().describe("Specific metrics to fetch (default: all)"),
  }),

  /**
   * Get page information (fan count, etc.)
   * Consolidates: fb_get_page_fan_count
   */
  fb_get_page_info: z.object({
    fields: z.string().optional().default("id,name,fan_count").describe("Comma-separated fields to return"),
  }),

  /**
   * Send direct message to user
   */
  fb_send_message: z.object({
    user_id: userIdSchema,
    message: messageSchema,
  }),

  /**
   * Execute batch Graph API requests
   * Use for complex multi-operation workflows
   */
  fb_batch: z.object({
    operations: z.array(batchOperationSchema).min(1).max(50).describe("Batch operations (max 50)"),
    include_headers: z.boolean().optional().default(false),
  }),
};

export const toolDescriptions: Record<ToolName, string> = {
  fb_create_post: "Create a Facebook post (text, image, link, or scheduled). Supports immediate publishing or scheduling.",
  fb_update_post: "Update an existing post's message.",
  fb_delete_post: "Delete a post from the Facebook Page.",
  fb_get_posts: "Get page posts with pagination. Use 'after' cursor for next page.",
  fb_get_comments: "Get comments on a post. Set include_summary=true for total count.",
  fb_reply_comment: "Reply to a specific comment.",
  fb_delete_comment: "Delete a comment.",
  fb_get_insights: "Get post insights (impressions, clicks, reactions). Specify metrics or get all.",
  fb_get_page_info: "Get page information including fan count.",
  fb_send_message: "Send a direct message to a user via Messenger.",
  fb_batch: "Execute multiple Graph API requests in a single call. Max 50 operations.",
};

export type ToolName = keyof typeof toolSchemas;
export type ToolSchemaMap = typeof toolSchemas;

// Export inferred types
export type FbCreatePostArgs = z.infer<typeof toolSchemas.fb_create_post>;
export type FbUpdatePostArgs = z.infer<typeof toolSchemas.fb_update_post>;
export type FbDeletePostArgs = z.infer<typeof toolSchemas.fb_delete_post>;
export type FbGetPostsArgs = z.infer<typeof toolSchemas.fb_get_posts>;
export type FbGetCommentsArgs = z.infer<typeof toolSchemas.fb_get_comments>;
export type FbReplyCommentArgs = z.infer<typeof toolSchemas.fb_reply_comment>;
export type FbDeleteCommentArgs = z.infer<typeof toolSchemas.fb_delete_comment>;
export type FbGetInsightsArgs = z.infer<typeof toolSchemas.fb_get_insights>;
export type FbGetPageInfoArgs = z.infer<typeof toolSchemas.fb_get_page_info>;
export type FbSendMessageArgs = z.infer<typeof toolSchemas.fb_send_message>;
export type FbBatchArgs = z.infer<typeof toolSchemas.fb_batch>;
