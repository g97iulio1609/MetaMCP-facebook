import type { FacebookManager } from "./manager.js";
import { toolDescriptions, toolSchemas, type ToolName } from "./toolSchemas.js";
import { buildToolDefinitions, parseToolArgs, type ToolDefinition, type ToolHandler, type ToolRegistry } from "@meta-mcp/core";

export type { ToolDefinition, ToolHandler, ToolRegistry };

/**
 * Consolidated Facebook Tool Registry
 * 
 * 11 tools (down from 27):
 * - fb_create_post: Create text/image/scheduled posts
 * - fb_update_post: Update existing post
 * - fb_delete_post: Delete a post
 * - fb_get_posts: Get page posts with pagination
 * - fb_get_comments: Get post comments
 * - fb_reply_comment: Reply to a comment
 * - fb_delete_comment: Delete a comment
 * - fb_get_insights: Get all insights (reactions, clicks, impressions)
 * - fb_get_page_info: Get page info (fan count, etc.)
 * - fb_send_message: Send DM via Messenger
 * - fb_batch: Execute batch Graph API requests
 */
export const createToolRegistry = (manager: FacebookManager): ToolRegistry<ToolName> => {
  const handlers: Record<ToolName, ToolHandler> = {
    // Create post (text, image, link, scheduled)
    fb_create_post: async (args) => {
      const parsed = parseToolArgs(toolSchemas.fb_create_post, args);
      
      // Image post
      if (parsed.image_url) {
        return manager.postImageToFacebook(parsed.image_url, parsed.message ?? "");
      }
      
      // Text/link post (optionally scheduled)
      return manager.postToFacebook(parsed.message!, {
        link: parsed.link,
        place: parsed.place,
        published: parsed.published,
        scheduled_publish_time: parsed.scheduled_publish_time,
      });
    },

    // Update post
    fb_update_post: async (args) => {
      const parsed = parseToolArgs(toolSchemas.fb_update_post, args);
      return manager.updatePost(parsed.post_id, parsed.message);
    },

    // Delete post
    fb_delete_post: async (args) => {
      const parsed = parseToolArgs(toolSchemas.fb_delete_post, args);
      return manager.deletePost(parsed.post_id);
    },

    // Get page posts
    fb_get_posts: async (args) => {
      const parsed = parseToolArgs(toolSchemas.fb_get_posts, args);
      return manager.getPagePosts(parsed.limit, parsed.after, parsed.fields);
    },

    // Get comments with optional summary
    fb_get_comments: async (args) => {
      const parsed = parseToolArgs(toolSchemas.fb_get_comments, args);
      return manager.getPostComments(parsed.post_id, parsed.limit, parsed.after, parsed.include_summary);
    },

    // Reply to comment
    fb_reply_comment: async (args) => {
      const parsed = parseToolArgs(toolSchemas.fb_reply_comment, args);
      return manager.replyToComment(parsed.comment_id, parsed.message);
    },

    // Delete comment
    fb_delete_comment: async (args) => {
      const parsed = parseToolArgs(toolSchemas.fb_delete_comment, args);
      return manager.deleteComment(parsed.comment_id);
    },

    // Get insights (all metrics or specific ones)
    fb_get_insights: async (args) => {
      const parsed = parseToolArgs(toolSchemas.fb_get_insights, args);
      return manager.getInsights(parsed.post_id, parsed.metrics);
    },

    // Get page info
    fb_get_page_info: async (args) => {
      const parsed = parseToolArgs(toolSchemas.fb_get_page_info, args);
      return manager.getPageInfo(parsed.fields);
    },

    // Send message
    fb_send_message: async (args) => {
      const parsed = parseToolArgs(toolSchemas.fb_send_message, args);
      return manager.sendDmToUser(parsed.user_id, parsed.message);
    },

    // Batch requests
    fb_batch: async (args) => {
      const parsed = parseToolArgs(toolSchemas.fb_batch, args);
      return manager.batchRequest(parsed.operations, parsed.include_headers);
    },
  };

  const definitions = buildToolDefinitions(toolSchemas, toolDescriptions) as ToolDefinition<ToolName>[];

  return { definitions, handlers };
};

export type FacebookToolRegistry = ToolRegistry<ToolName>;
