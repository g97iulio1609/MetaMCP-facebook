# MetaMCP Facebook

A Model Context Protocol (MCP) server for the Facebook Graph API.

## Installation

```bash
npm install @meta-mcp/facebook
# or
pnpm add @meta-mcp/facebook
```

## Configuration

This package requires the following environment variables:

- `PAGE_ACCESS_TOKEN`: Long-lived Page Access Token.
- `PAGE_ID`: The ID of the Facebook Page you want to manage.

## Usage

```typescript
import { FacebookManager, createToolRegistry } from "@meta-mcp/facebook";

// Initialize the manager (loads from process.env)
const manager = FacebookManager.fromEnv();

// Create the tool registry for MCP
const registry = createToolRegistry(manager);

// Use registry.definitions and registry.handlers in your MCP server
```

## Available Tools

### Posting & Content
- **fb_post_to_facebook**: Create a text post (optional link/place).
- **fb_post_image_to_facebook**: Upload an image with a caption.
- **fb_schedule_post**: Schedule a text post for a future time (Unix timestamp).
- **fb_update_post**: Edit the text of an existing post.
- **fb_delete_post**: Delete a post by ID.

### Interaction
- **fb_reply_to_comment**: Reply to a specific comment.
- **fb_send_dm_to_user**: Send a private message to a user.
- **fb_delete_comment**: Delete a comment by ID.
- **fb_delete_comment_from_post**: Alias for deleting a comment.

### Retrieval
- **fb_get_page_posts**: Get recent posts from the page.
- **fb_get_post_comments**: Get comments for a specific post.
- **fb_get_page_fan_count**: Get total page likes/followers.

### Insights & Metrics
- **fb_get_post_insights**: Comprehensive post metrics.
- **fb_get_post_impressions_unique**: Reach count.
- **fb_get_post_clicks**: Click count.
- **fb_get_post_share_count**: Share count.
- **fb_get_number_of_likes**: Total likes on a post.
- **fb_get_number_of_comments**: Total comments on a post.

### Reactions Breakdown
- **fb_get_post_reactions_like_total**
- **fb_get_post_reactions_love_total**
- **fb_get_post_reactions_wow_total**
- **fb_get_post_reactions_haha_total**
- **fb_get_post_reactions_sorry_total**
- **fb_get_post_reactions_anger_total**

### Analysis
- **fb_filter_negative_comments**: Simple sentiment filtering for a list of comments.
- **fb_get_post_top_commenters**: Identify most active commenters.
