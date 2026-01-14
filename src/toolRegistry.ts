import { zodToJsonSchema } from "zod-to-json-schema";
import type { z } from "zod";
import type { FacebookManager } from "./manager.js";
import { toolDescriptions, toolSchemas, type ToolName } from "./toolSchemas.js";

export interface ToolDefinition {
  name: ToolName;
  description: string;
  inputSchema: Record<string, unknown>;
}

export type ToolHandler = (args: Record<string, unknown>) => Promise<unknown> | unknown;

export interface ToolRegistry {
  definitions: ToolDefinition[];
  handlers: Record<ToolName, ToolHandler>;
}

export const createToolRegistry = (manager: FacebookManager): ToolRegistry => {
  const handlers: Record<ToolName, ToolHandler> = {
    fb_post_to_facebook: async (args) =>
      manager.postToFacebook(castArgs(toolSchemas.fb_post_to_facebook, args).message),
    fb_reply_to_comment: async (args) => {
      const parsed = castArgs(toolSchemas.fb_reply_to_comment, args);
      return manager.replyToComment(parsed.comment_id, parsed.message);
    },
    fb_get_page_posts: async (args) => {
      const parsed = toolSchemas.fb_get_page_posts.parse(args);
      return manager.getPagePosts(parsed.limit, parsed.after);
    },
    fb_get_post_comments: async (args) => {
      const parsed = toolSchemas.fb_get_post_comments.parse(args);
      return manager.getPostComments(parsed.post_id, parsed.limit, parsed.after);
    },
    fb_delete_post: async (args) =>
      manager.deletePost(castArgs(toolSchemas.fb_delete_post, args).post_id),
    fb_delete_comment: async (args) =>
      manager.deleteComment(castArgs(toolSchemas.fb_delete_comment, args).comment_id),
    fb_delete_comment_from_post: async (args) =>
      manager.deleteComment(castArgs(toolSchemas.fb_delete_comment_from_post, args).comment_id),
    fb_filter_negative_comments: async (args) =>
      manager.filterNegativeComments(castArgs(toolSchemas.fb_filter_negative_comments, args).comments),
    fb_get_number_of_comments: async (args) =>
      manager.getNumberOfComments(castArgs(toolSchemas.fb_get_number_of_comments, args).post_id),
    fb_get_number_of_likes: async (args) =>
      manager.getNumberOfLikes(castArgs(toolSchemas.fb_get_number_of_likes, args).post_id),
    fb_get_post_insights: async (args) =>
      manager.getPostInsights(castArgs(toolSchemas.fb_get_post_insights, args).post_id),
    fb_get_post_impressions_unique: async (args) =>
      manager.getPostImpressionsUnique(
        castArgs(toolSchemas.fb_get_post_impressions_unique, args).post_id,
      ),
    fb_get_post_clicks: async (args) =>
      manager.getPostClicks(castArgs(toolSchemas.fb_get_post_clicks, args).post_id),
    fb_get_post_reactions_like_total: async (args) =>
      manager.getPostReactionsLikeTotal(
        castArgs(toolSchemas.fb_get_post_reactions_like_total, args).post_id,
      ),
    fb_get_post_reactions_love_total: async (args) =>
      manager.getPostReactionsLoveTotal(
        castArgs(toolSchemas.fb_get_post_reactions_love_total, args).post_id,
      ),
    fb_get_post_reactions_wow_total: async (args) =>
      manager.getPostReactionsWowTotal(
        castArgs(toolSchemas.fb_get_post_reactions_wow_total, args).post_id,
      ),
    fb_get_post_reactions_haha_total: async (args) =>
      manager.getPostReactionsHahaTotal(
        castArgs(toolSchemas.fb_get_post_reactions_haha_total, args).post_id,
      ),
    fb_get_post_reactions_sorry_total: async (args) =>
      manager.getPostReactionsSorryTotal(
        castArgs(toolSchemas.fb_get_post_reactions_sorry_total, args).post_id,
      ),
    fb_get_post_reactions_anger_total: async (args) =>
      manager.getPostReactionsAngerTotal(
        castArgs(toolSchemas.fb_get_post_reactions_anger_total, args).post_id,
      ),
    fb_get_post_top_commenters: async (args) =>
      manager.getPostTopCommenters(castArgs(toolSchemas.fb_get_post_top_commenters, args).post_id),
    fb_post_image_to_facebook: async (args) => {
      const parsed = castArgs(toolSchemas.fb_post_image_to_facebook, args);
      return manager.postImageToFacebook(parsed.image_url, parsed.caption);
    },
    fb_send_dm_to_user: async (args) => {
      const parsed = castArgs(toolSchemas.fb_send_dm_to_user, args);
      return manager.sendDmToUser(parsed.user_id, parsed.message);
    },
    fb_update_post: async (args) => {
      const parsed = castArgs(toolSchemas.fb_update_post, args);
      return manager.updatePost(parsed.post_id, parsed.new_message);
    },
    fb_schedule_post: async (args) => {
      const parsed = castArgs(toolSchemas.fb_schedule_post, args);
      return manager.schedulePost(parsed.message, parsed.publish_time);
    },
    fb_get_page_fan_count: async () => manager.getPageFanCount(),
    fb_get_post_share_count: async (args) =>
      manager.getPostShareCount(castArgs(toolSchemas.fb_get_post_share_count, args).post_id),
    fb_batch_request: async (args) => {
      const parsed = castArgs(toolSchemas.fb_batch_request, args);
      return manager.batchRequest(parsed.operations, parsed.include_headers);
    },
  };

  const definitions = (Object.keys(toolSchemas) as ToolName[]).map((name) => ({
    name,
    description: toolDescriptions[name],
    inputSchema: zodToJsonSchema(
      toolSchemas[name] as unknown as Parameters<typeof zodToJsonSchema>[0],
      {
        name,
        $refStrategy: "none",
      },
    ) as Record<string, unknown>,
  }));

  return { definitions, handlers };
};

const castArgs = <TSchema extends z.ZodTypeAny>(schema: TSchema, args: Record<string, unknown>) =>
  schema.parse(args);
