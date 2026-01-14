/**
 * Interactive operations test for MetaMCP
 * Tests real operations on the Facebook page
 */
import { GraphApiClient, graphConfig } from "@meta-mcp/core";

import { FacebookManager } from "./manager.js";

const manager = new FacebookManager(new GraphApiClient(graphConfig), graphConfig.pageId);

async function testOperations() {
    console.log("╔══════════════════════════════════════════════════════════════╗");
    console.log("║           MetaMCP Interactive Operations Test                ║");
    console.log("╚══════════════════════════════════════════════════════════════╝\n");

    // 1. Get page posts with pagination (Testing 'limit' and 'after' schema fields)
    console.log("📄 1. Fetching page posts (Pagination Test)...");
    try {
        console.log("   - Requesting limit: 1");
        const page1 = await manager.getPagePosts(1);
        console.log(`   ✓ Page 1 received ${page1.data.length} post(s).`);

        if (page1.data.length > 0) {
            const firstPost = page1.data[0];
            if (firstPost) {
                console.log(`   📝 Post ID: ${firstPost.id} (${firstPost.created_time})`);
            }

            if (page1.paging?.cursors?.after) {
                const afterCursor = page1.paging.cursors.after;
                console.log(`   - Found 'after' cursor: ${afterCursor.substring(0, 15)}...`);
                console.log("   - Requesting next page (limit: 1, after: ...)");

                const page2 = await manager.getPagePosts(1, afterCursor);
                console.log(`   ✓ Page 2 received ${page2.data.length} post(s).`);
                if (page2.data.length > 0) {
                    const post2 = page2.data[0];
                    if (post2) {
                        console.log(`   📝 Post ID: ${post2.id} (${post2.created_time})`);
                    }
                }
            } else {
                console.log("   ℹ️ No 'after' cursor found (only 1 post exists?)");
            }
        }

        // Fetch defaults for context
        const posts = await manager.getPagePosts(3);

        if (posts.data.length > 0 && posts.data[0]) {
            const postId = posts.data[0].id;

            // 2. Get post insights
            console.log("📊 2. Fetching post insights...");
            try {
                const insights = await manager.getPostInsights(postId);
                console.log("   ✓ Insights retrieved:");
                console.log(JSON.stringify(insights, null, 2).split('\n').map(l => '   ' + l).join('\n'));
            } catch (e) {
                console.log(`   ✗ ${e instanceof Error ? e.message : e}`);
            }

            // 3. Get reactions
            console.log("\n❤️ 3. Fetching reactions...");
            try {
                const likes = await manager.getPostReactionsLikeTotal(postId);
                console.log("   ✓ Reactions retrieved:");
                console.log(JSON.stringify(likes, null, 2).split('\n').map(l => '   ' + l).join('\n'));
            } catch (e) {
                console.log(`   ✗ ${e instanceof Error ? e.message : e}`);
            }

            // 4. Try to create a post (requires pages_manage_posts)
            console.log("\n✏️ 4. Testing post creation with link (new field feature)...");
            try {
                const newPost = await manager.postToFacebook(
                    `MetaMCP Link Test - ${new Date().toISOString()}`,
                    {
                        link: "https://developers.facebook.com",
                        published: true
                    }
                );
                console.log("   ✓ Post created:", JSON.stringify(newPost));
            } catch (e) {
                const msg = e instanceof Error ? e.message : String(e);
                if (msg.includes("pages_manage_posts")) {
                    console.log("   ⚠️ Skipped: requires pages_manage_posts permission");
                } else {
                    console.log(`   ✗ ${msg}`);
                }
            }
        }
    } catch (e) {
        console.log(`   ✗ Error: ${e instanceof Error ? e.stack : e}`);
    }
    console.log("\n" + "═".repeat(64));
    console.log("Test complete!");
}

testOperations().catch(console.error);
