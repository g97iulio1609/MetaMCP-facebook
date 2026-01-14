import { z } from "zod";

const postIdSchema = z.string().min(1);
const commentIdSchema = z.string().min(1);
const messageSchema = z.string().min(1);
const imageUrlSchema = z.string().url();
const userIdSchema = z.string().min(1);

const facebookUserSchema = z.object({
  id: z.string().min(1),
  name: z.string().optional(),
});

const commentSchema = z.object({
  id: z.string().min(1),
  message: z.string().optional(),
  from: facebookUserSchema.optional(),
  created_time: z.string().optional(),
});

const commentsSchema = z.object({
  data: z.array(commentSchema).default([]),
});

const batchOperationSchema = z.object({
  method: z.enum(["GET", "POST", "DELETE", "PATCH"]),
  relative_url: z.string().min(1),
  body: z.record(z.string(), z.string()).optional(),
  name: z.string().optional(),
  omit_response_on_success: z.boolean().optional(),
});

export const toolSchemas = {
  fb_post_to_facebook: z.object({
    message: messageSchema,
    link: z.string().url().optional().describe("URL to attach to the post"),
    place: z.string().optional().describe("Page ID of a location to associate with the post"),
    published: z.boolean().optional().default(true).describe("Whether to publish immediately (true) or schedule/draft (false)."),
    scheduled_publish_time: z.number().int().optional().describe("Unix timestamp for scheduling (requires published: false)."),
  }),
  fb_reply_to_comment: z.object({
    post_id: postIdSchema,
    comment_id: commentIdSchema,
    message: messageSchema,
  }),
  fb_get_page_posts: z.object({
    limit: z.number().int().min(1).max(100).optional().default(25),
    after: z.string().optional(),
  }),
  fb_get_post_comments: z.object({
    post_id: postIdSchema,
    limit: z.number().int().min(1).max(100).optional().default(25),
    after: z.string().optional(),
  }),
  fb_delete_post: z.object({
    post_id: postIdSchema,
  }),
  fb_delete_comment: z.object({
    comment_id: commentIdSchema,
  }),
  fb_delete_comment_from_post: z.object({
    post_id: postIdSchema,
    comment_id: commentIdSchema,
  }),
  fb_filter_negative_comments: z.object({
    comments: commentsSchema,
  }),
  fb_get_number_of_comments: z.object({
    post_id: postIdSchema,
  }),
  fb_get_number_of_likes: z.object({
    post_id: postIdSchema,
  }),
  fb_get_post_insights: z.object({
    post_id: postIdSchema,
  }),
  fb_get_post_impressions_unique: z.object({
    post_id: postIdSchema,
  }),
  fb_get_post_clicks: z.object({
    post_id: postIdSchema,
  }),
  fb_get_post_reactions_like_total: z.object({
    post_id: postIdSchema,
  }),
  fb_get_post_reactions_love_total: z.object({
    post_id: postIdSchema,
  }),
  fb_get_post_reactions_wow_total: z.object({
    post_id: postIdSchema,
  }),
  fb_get_post_reactions_haha_total: z.object({
    post_id: postIdSchema,
  }),
  fb_get_post_reactions_sorry_total: z.object({
    post_id: postIdSchema,
  }),
  fb_get_post_reactions_anger_total: z.object({
    post_id: postIdSchema,
  }),
  fb_get_post_top_commenters: z.object({
    post_id: postIdSchema,
  }),
  fb_post_image_to_facebook: z.object({
    image_url: imageUrlSchema,
    caption: z.string().optional().default(""),
  }),
  fb_send_dm_to_user: z.object({
    user_id: userIdSchema,
    message: messageSchema,
  }),
  fb_update_post: z.object({
    post_id: postIdSchema,
    new_message: messageSchema,
  }),
  fb_schedule_post: z.object({
    message: messageSchema,
    publish_time: z.number().int().positive(),
  }),
  fb_get_page_fan_count: z.object({}),
  fb_get_post_share_count: z.object({
    post_id: postIdSchema,
  }),
  fb_batch_request: z.object({
    operations: z.array(batchOperationSchema).min(1),
    include_headers: z.boolean().optional().default(false),
  }),
};

export const toolDescriptions = {
  fb_post_to_facebook: "Create a new Facebook Page post with a text message.",
  fb_reply_to_comment: "Reply to a specific comment on a Facebook post.",
  fb_get_page_posts: "Fetch the most recent posts on the Page.",
  fb_get_post_comments: "Retrieve all comments for a given post.",
  fb_delete_post: "Delete a specific post from the Facebook Page.",
  fb_delete_comment: "Delete a specific comment from the Page.",
  fb_delete_comment_from_post: "Alias to delete a comment on a post.",
  fb_filter_negative_comments: "Filter comments for basic negative sentiment.",
  fb_get_number_of_comments: "Count the number of comments on a given post.",
  fb_get_number_of_likes: "Return the number of likes on a post.",
  fb_get_post_insights: "Fetch all insights metrics (impressions, reactions, clicks, etc).",
  fb_get_post_impressions_unique: "Fetch unique impressions of a post (reach).",
  fb_get_post_clicks: "Fetch number of post clicks.",
  fb_get_post_reactions_like_total: "Fetch number of 'Like' reactions.",
  fb_get_post_reactions_love_total: "Fetch number of 'Love' reactions.",
  fb_get_post_reactions_wow_total: "Fetch number of 'Wow' reactions.",
  fb_get_post_reactions_haha_total: "Fetch number of 'Haha' reactions.",
  fb_get_post_reactions_sorry_total: "Fetch number of 'Sorry' reactions.",
  fb_get_post_reactions_anger_total: "Fetch number of 'Anger' reactions.",
  fb_get_post_top_commenters: "Get the top commenters on a post.",
  fb_post_image_to_facebook: "Post an image with a caption to the Facebook page.",
  fb_send_dm_to_user: "Send a direct message to a user.",
  fb_update_post: "Updates an existing post's message.",
  fb_schedule_post: "Schedule a new post for future publishing.",
  fb_get_page_fan_count: "Get the Page's total fan/like count.",
  fb_get_post_share_count: "Get the number of shares for a post.",
  fb_batch_request: "Execute a Facebook Graph batch request.",
};

export type ToolName = keyof typeof toolSchemas;
export type ToolSchemaMap = typeof toolSchemas;

// Export inferred types for each tool schema
export type FbPostToFacebookArgs = z.infer<typeof toolSchemas.fb_post_to_facebook>;
export type FbReplyToCommentArgs = z.infer<typeof toolSchemas.fb_reply_to_comment>;
export type FbGetPagePostsArgs = z.infer<typeof toolSchemas.fb_get_page_posts>;
export type FbGetPostCommentsArgs = z.infer<typeof toolSchemas.fb_get_post_comments>;
export type FbDeletePostArgs = z.infer<typeof toolSchemas.fb_delete_post>;
export type FbDeleteCommentArgs = z.infer<typeof toolSchemas.fb_delete_comment>;
export type FbFilterNegativeCommentsArgs = z.infer<typeof toolSchemas.fb_filter_negative_comments>;
export type FbGetPostInsightsArgs = z.infer<typeof toolSchemas.fb_get_post_insights>;
export type FbPostImageToFacebookArgs = z.infer<typeof toolSchemas.fb_post_image_to_facebook>;
export type FbSendDmToUserArgs = z.infer<typeof toolSchemas.fb_send_dm_to_user>;
export type FbUpdatePostArgs = z.infer<typeof toolSchemas.fb_update_post>;
export type FbSchedulePostArgs = z.infer<typeof toolSchemas.fb_schedule_post>;
export type FbBatchRequestArgs = z.infer<typeof toolSchemas.fb_batch_request>;
