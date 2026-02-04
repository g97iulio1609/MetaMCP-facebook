import { tool } from "ai";
import type { z } from "zod";
import { GraphApiClient, graphConfig } from "@meta-mcp/core";
import { FacebookManager } from "./manager.js";
import { toolDescriptions, toolSchemas } from "./toolSchemas.js";

/**
 * Helper to build a Vercel AI SDK tool from a Zod schema
 */
const buildTool = <TInput>(
  schema: z.ZodType<TInput>,
  description: string,
  execute: (args: TInput) => Promise<unknown>,
) =>
  tool({
    description,
    parameters: schema,
    execute: async (args) => execute(args),
  });

/**
 * Consolidated Facebook AI SDK Tools (11 tools)
 * 
 * - fb_create_post: Create text/image/scheduled posts
 * - fb_update_post: Update existing post
 * - fb_delete_post: Delete a post
 * - fb_get_posts: Get page posts
 * - fb_get_comments: Get post comments
 * - fb_reply_comment: Reply to a comment
 * - fb_delete_comment: Delete a comment
 * - fb_get_insights: Get all insights
 * - fb_get_page_info: Get page info
 * - fb_send_message: Send DM
 * - fb_batch: Execute batch requests
 */
export const createAiSdkTools = (manager = defaultManager()) => ({
  fb_create_post: buildTool(
    toolSchemas.fb_create_post,
    toolDescriptions.fb_create_post,
    async (args) => {
      if (args.image_url) {
        return manager.postImageToFacebook(args.image_url, args.message ?? "");
      }
      return manager.postToFacebook(args.message!, {
        link: args.link,
        place: args.place,
        published: args.published,
        scheduled_publish_time: args.scheduled_publish_time,
      });
    },
  ),

  fb_update_post: buildTool(
    toolSchemas.fb_update_post,
    toolDescriptions.fb_update_post,
    async (args) => manager.updatePost(args.post_id, args.message),
  ),

  fb_delete_post: buildTool(
    toolSchemas.fb_delete_post,
    toolDescriptions.fb_delete_post,
    async (args) => manager.deletePost(args.post_id),
  ),

  fb_get_posts: buildTool(
    toolSchemas.fb_get_posts,
    toolDescriptions.fb_get_posts,
    async (args) => manager.getPagePosts(args.limit, args.after, args.fields),
  ),

  fb_get_comments: buildTool(
    toolSchemas.fb_get_comments,
    toolDescriptions.fb_get_comments,
    async (args) => manager.getPostComments(args.post_id, args.limit, args.after, args.include_summary),
  ),

  fb_reply_comment: buildTool(
    toolSchemas.fb_reply_comment,
    toolDescriptions.fb_reply_comment,
    async (args) => manager.replyToComment(args.comment_id, args.message),
  ),

  fb_delete_comment: buildTool(
    toolSchemas.fb_delete_comment,
    toolDescriptions.fb_delete_comment,
    async (args) => manager.deleteComment(args.comment_id),
  ),

  fb_get_insights: buildTool(
    toolSchemas.fb_get_insights,
    toolDescriptions.fb_get_insights,
    async (args) => manager.getInsights(args.post_id, args.metrics),
  ),

  fb_get_page_info: buildTool(
    toolSchemas.fb_get_page_info,
    toolDescriptions.fb_get_page_info,
    async (args) => manager.getPageInfo(args.fields),
  ),

  fb_send_message: buildTool(
    toolSchemas.fb_send_message,
    toolDescriptions.fb_send_message,
    async (args) => manager.sendDmToUser(args.user_id, args.message),
  ),

  fb_batch: buildTool(
    toolSchemas.fb_batch,
    toolDescriptions.fb_batch,
    async (args) => manager.batchRequest(args.operations, args.include_headers),
  ),
});

const defaultManager = () =>
  new FacebookManager(new GraphApiClient(graphConfig), graphConfig.pageId);
