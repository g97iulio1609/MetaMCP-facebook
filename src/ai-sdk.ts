import { tool } from "ai";
import type { z } from "zod";
import { GraphApiClient, graphConfig } from "@meta-mcp/core";
import { FacebookManager } from "./manager.js";
import { toolDescriptions, toolSchemas } from "./toolSchemas.js";

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

export const createAiSdkTools = (manager = defaultManager()) => ({
  fb_post_to_facebook: buildTool(
    toolSchemas.fb_post_to_facebook,
    toolDescriptions.fb_post_to_facebook,
    async (args) => manager.postToFacebook(args.message, {
      link: args.link,
      place: args.place,
      published: args.published,
      scheduled_publish_time: args.scheduled_publish_time,
    }),
  ),
  fb_reply_to_comment: buildTool(
    toolSchemas.fb_reply_to_comment,
    toolDescriptions.fb_reply_to_comment,
    async (args) => manager.replyToComment(args.comment_id, args.message),
  ),
  fb_get_page_posts: buildTool(
    toolSchemas.fb_get_page_posts,
    toolDescriptions.fb_get_page_posts,
    async (args) => manager.getPagePosts(args.limit, args.after),
  ),
  fb_get_post_comments: buildTool(
    toolSchemas.fb_get_post_comments,
    toolDescriptions.fb_get_post_comments,
    async (args) => manager.getPostComments(args.post_id, args.limit, args.after),
  ),
  fb_delete_post: buildTool(
    toolSchemas.fb_delete_post,
    toolDescriptions.fb_delete_post,
    async (args) => manager.deletePost(args.post_id),
  ),
  fb_delete_comment: buildTool(
    toolSchemas.fb_delete_comment,
    toolDescriptions.fb_delete_comment,
    async (args) => manager.deleteComment(args.comment_id),
  ),
  fb_delete_comment_from_post: buildTool(
    toolSchemas.fb_delete_comment_from_post,
    toolDescriptions.fb_delete_comment_from_post,
    async (args) => manager.deleteComment(args.comment_id),
  ),
  fb_filter_negative_comments: buildTool(
    toolSchemas.fb_filter_negative_comments,
    toolDescriptions.fb_filter_negative_comments,
    async (args) => manager.filterNegativeComments(args.comments as any),
  ),
  fb_get_number_of_comments: buildTool(
    toolSchemas.fb_get_number_of_comments,
    toolDescriptions.fb_get_number_of_comments,
    async (args) => manager.getNumberOfComments(args.post_id),
  ),
  fb_get_number_of_likes: buildTool(
    toolSchemas.fb_get_number_of_likes,
    toolDescriptions.fb_get_number_of_likes,
    async (args) => manager.getNumberOfLikes(args.post_id),
  ),
  fb_get_post_insights: buildTool(
    toolSchemas.fb_get_post_insights,
    toolDescriptions.fb_get_post_insights,
    async (args) => manager.getPostInsights(args.post_id),
  ),
  fb_get_post_impressions_unique: buildTool(
    toolSchemas.fb_get_post_impressions_unique,
    toolDescriptions.fb_get_post_impressions_unique,
    async (args) => manager.getPostImpressionsUnique(args.post_id),
  ),
  fb_get_post_clicks: buildTool(
    toolSchemas.fb_get_post_clicks,
    toolDescriptions.fb_get_post_clicks,
    async (args) => manager.getPostClicks(args.post_id),
  ),
  fb_get_post_reactions_like_total: buildTool(
    toolSchemas.fb_get_post_reactions_like_total,
    toolDescriptions.fb_get_post_reactions_like_total,
    async (args) => manager.getPostReactionsLikeTotal(args.post_id),
  ),
  fb_get_post_reactions_love_total: buildTool(
    toolSchemas.fb_get_post_reactions_love_total,
    toolDescriptions.fb_get_post_reactions_love_total,
    async (args) => manager.getPostReactionsLoveTotal(args.post_id),
  ),
  fb_get_post_reactions_wow_total: buildTool(
    toolSchemas.fb_get_post_reactions_wow_total,
    toolDescriptions.fb_get_post_reactions_wow_total,
    async (args) => manager.getPostReactionsWowTotal(args.post_id),
  ),
  fb_get_post_reactions_haha_total: buildTool(
    toolSchemas.fb_get_post_reactions_haha_total,
    toolDescriptions.fb_get_post_reactions_haha_total,
    async (args) => manager.getPostReactionsHahaTotal(args.post_id),
  ),
  fb_get_post_reactions_sorry_total: buildTool(
    toolSchemas.fb_get_post_reactions_sorry_total,
    toolDescriptions.fb_get_post_reactions_sorry_total,
    async (args) => manager.getPostReactionsSorryTotal(args.post_id),
  ),
  fb_get_post_reactions_anger_total: buildTool(
    toolSchemas.fb_get_post_reactions_anger_total,
    toolDescriptions.fb_get_post_reactions_anger_total,
    async (args) => manager.getPostReactionsAngerTotal(args.post_id),
  ),
  fb_get_post_top_commenters: buildTool(
    toolSchemas.fb_get_post_top_commenters,
    toolDescriptions.fb_get_post_top_commenters,
    async (args) => manager.getPostTopCommenters(args.post_id),
  ),
  fb_post_image_to_facebook: buildTool(
    toolSchemas.fb_post_image_to_facebook,
    toolDescriptions.fb_post_image_to_facebook,
    async (args) => manager.postImageToFacebook(args.image_url, args.caption ?? ""),
  ),
  fb_send_dm_to_user: buildTool(
    toolSchemas.fb_send_dm_to_user,
    toolDescriptions.fb_send_dm_to_user,
    async (args) => manager.sendDmToUser(args.user_id, args.message),
  ),
  fb_update_post: buildTool(
    toolSchemas.fb_update_post,
    toolDescriptions.fb_update_post,
    async (args) => manager.updatePost(args.post_id, args.new_message),
  ),
  fb_schedule_post: buildTool(
    toolSchemas.fb_schedule_post,
    toolDescriptions.fb_schedule_post,
    async (args) => manager.schedulePost(args.message, args.publish_time),
  ),
  fb_get_page_fan_count: buildTool(
    toolSchemas.fb_get_page_fan_count,
    toolDescriptions.fb_get_page_fan_count,
    async () => manager.getPageFanCount(),
  ),
  fb_get_post_share_count: buildTool(
    toolSchemas.fb_get_post_share_count,
    toolDescriptions.fb_get_post_share_count,
    async (args) => manager.getPostShareCount(args.post_id),
  ),
  fb_batch_request: buildTool(
    toolSchemas.fb_batch_request,
    toolDescriptions.fb_batch_request,
    async (args) => manager.batchRequest(args.operations, args.include_headers),
  ),
});

const defaultManager = () =>
  new FacebookManager(new GraphApiClient(graphConfig), graphConfig.pageId);
