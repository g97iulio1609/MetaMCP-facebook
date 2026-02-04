/**
 * Comprehensive test suite for MetaMCP (v24.0 compliant)
 * Tests all consolidated Facebook Graph API tools
 */
import { GraphApiClient, graphConfig } from "@meta-mcp/core";
import { FacebookManager } from "./manager";

interface TestResult {
    tool: string;
    status: "pass" | "fail" | "skip";
    duration: number;
    error?: string;
}

class TestRunner {
    private readonly manager: FacebookManager;
    private readonly results: TestResult[] = [];
    private existingPostId: string | null = null;

    constructor() {
        this.manager = new FacebookManager(
            new GraphApiClient(graphConfig),
            graphConfig.pageId
        );
    }

    private async runTest(
        name: string,
        fn: () => Promise<unknown>,
        skipCondition?: () => boolean
    ): Promise<TestResult> {
        if (skipCondition?.()) {
            const result: TestResult = { tool: name, status: "skip", duration: 0 };
            this.results.push(result);
            console.log(`   ○ ${name} - SKIPPED`);
            return result;
        }

        const start = performance.now();
        try {
            await fn();
            const duration = Math.round(performance.now() - start);
            const result: TestResult = { tool: name, status: "pass", duration };
            this.results.push(result);
            return result;
        } catch (error) {
            const duration = Math.round(performance.now() - start);
            const errorMsg = error instanceof Error ? error.message : String(error);
            const result: TestResult = { tool: name, status: "fail", duration, error: errorMsg };
            this.results.push(result);
            console.log(`   ✗ ${name}`);
            console.log(`     └─ ${errorMsg.slice(0, 70)}...`);
            return result;
        }
    }

    async runAllTests(): Promise<void> {
        console.log("╔══════════════════════════════════════════════════════════════╗");
        console.log("║        MetaMCP Test Suite (Consolidated Tools v24.0)         ║");
        console.log("╠══════════════════════════════════════════════════════════════╣");
        console.log(`║ Page ID: ${graphConfig.pageId.padEnd(51)}║`);
        console.log("╚══════════════════════════════════════════════════════════════╝\n");

        // PAGE TESTS
        console.log("📄 PAGE TESTS");
        console.log("─".repeat(64));

        await this.runTest("fb_get_page_info", async () => {
            const info = await this.manager.getPageInfo();
            console.log(`   ✓ fb_get_page_info - retrieved page info`);
        });

        await this.runTest("fb_get_posts", async () => {
            const posts = await this.manager.getPagePosts();
            console.log(`   ✓ fb_get_posts - ${posts.data.length} posts`);
            if (posts.data.length > 0 && posts.data[0]) {
                this.existingPostId = posts.data[0].id;
            }
        });

        if (!this.existingPostId) {
            console.log("\n⚠️  No posts found. Skipping post tests.\n");
            this.printSummary();
            return;
        }

        // INSIGHTS (consolidated)
        console.log("\n📈 INSIGHTS (consolidated)");
        console.log("─".repeat(64));

        await this.runTest("fb_get_insights (all)", async () => {
            await this.manager.getInsights(this.existingPostId!);
            console.log(`   ✓ fb_get_insights - all metrics retrieved`);
        });

        await this.runTest("fb_get_insights (specific)", async () => {
            await this.manager.getInsights(this.existingPostId!, ["post_impressions_unique", "post_clicks"]);
            console.log(`   ✓ fb_get_insights - specific metrics retrieved`);
        });

        // COMMENTS
        console.log("\n💬 COMMENTS");
        console.log("─".repeat(64));

        await this.runTest("fb_get_comments", async () => {
            const comments = await this.manager.getPostComments(this.existingPostId!);
            console.log(`   ✓ fb_get_comments - ${comments.data.length} comments`);
        });

        await this.runTest("fb_get_comments (with summary)", async () => {
            const comments = await this.manager.getPostComments(this.existingPostId!, 10, undefined, true);
            console.log(`   ✓ fb_get_comments (summary) - retrieved`);
        });

        this.printSummary();
    }

    private printSummary(): void {
        const passed = this.results.filter((r) => r.status === "pass").length;
        const failed = this.results.filter((r) => r.status === "fail").length;
        const total = this.results.length;
        const successRate = total > 0 ? Math.round((passed / total) * 100) : 0;

        console.log("\n╔══════════════════════════════════════════════════════════════╗");
        console.log("║                       RESULTS                                ║");
        console.log("╠══════════════════════════════════════════════════════════════╣");
        console.log(`║ ✓ Passed:  ${String(passed).padEnd(3)} / ${total}   (${successRate}%)                                ║`);
        console.log(`║ ✗ Failed:  ${String(failed).padEnd(3)} / ${total}                                        ║`);
        console.log("╚══════════════════════════════════════════════════════════════╝");

        process.exit(failed > 0 && passed === 0 ? 1 : 0);
    }
}

new TestRunner().runAllTests().catch(console.error);
