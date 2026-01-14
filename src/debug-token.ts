/**
 * Token debug utility for MetaMCP
 * Checks token validity, permissions, and page access
 */
import { graphConfig } from "@meta-mcp/core";

interface TokenDebugInfo {
    app_id: string;
    type: string;
    application: string;
    data_access_expires_at: number;
    expires_at: number;
    is_valid: boolean;
    scopes: string[];
    user_id?: string;
    profile_id?: string;
    page_id?: string;
    error?: {
        code: number;
        message: string;
        subcode?: number;
    };
}

interface PageInfo {
    id: string;
    name: string;
    access_token: string;
    category?: string;
    tasks?: string[];
}

interface MeAccountsResponse {
    data: PageInfo[];
    paging?: {
        cursors: { before: string; after: string };
        next?: string;
    };
}

async function debugToken(): Promise<void> {
    console.log("╔══════════════════════════════════════════════════════════════╗");
    console.log("║                   MetaMCP Token Debugger                     ║");
    console.log("╚══════════════════════════════════════════════════════════════╝\n");

    const token = graphConfig.accessToken;
    const pageId = graphConfig.pageId;
    const baseUrl = graphConfig.baseUrl;

    console.log(`📋 Configured Page ID: ${pageId}`);
    console.log(`🌐 API Base URL: ${baseUrl}\n`);

    // Step 1: Debug the token
    console.log("1️⃣  DEBUGGING TOKEN...");
    console.log("─".repeat(64));

    try {
        const debugUrl = `${baseUrl}/debug_token?input_token=${token}&access_token=${token}`;
        const debugResponse = await fetch(debugUrl);
        const debugData = (await debugResponse.json()) as { data?: TokenDebugInfo; error?: { message: string } };

        if (debugData.error) {
            console.log(`   ❌ Error: ${debugData.error.message}`);
            return;
        }

        const info = debugData.data;
        if (!info) {
            console.log("   ❌ No debug data returned");
            return;
        }

        console.log(`   Token Type: ${info.type}`);
        console.log(`   App ID: ${info.app_id}`);
        console.log(`   App Name: ${info.application}`);
        console.log(`   Is Valid: ${info.is_valid ? "✅ Yes" : "❌ No"}`);
        console.log(`   User ID: ${info.user_id ?? "N/A"}`);
        console.log(`   Profile ID: ${info.profile_id ?? "N/A"}`);

        if (info.expires_at) {
            const expiresDate = new Date(info.expires_at * 1000);
            const now = new Date();
            const isExpired = expiresDate < now;
            console.log(`   Expires: ${expiresDate.toISOString()} ${isExpired ? "❌ EXPIRED" : "✅"}`);
        } else {
            console.log(`   Expires: Never (long-lived token)`);
        }

        console.log(`\n   Scopes (${info.scopes?.length ?? 0}):`);
        for (const scope of info.scopes ?? []) {
            console.log(`      • ${scope}`);
        }

        // Check for required permissions
        const requiredScopes = [
            "pages_manage_posts",
            "pages_read_engagement",
            "pages_show_list",
            "pages_read_user_content",
        ];

        console.log("\n   Required Permissions Check:");
        for (const scope of requiredScopes) {
            const hasScope = info.scopes?.includes(scope);
            console.log(`      ${hasScope ? "✅" : "❌"} ${scope}`);
        }

    } catch (error) {
        console.log(`   ❌ Failed to debug token: ${error instanceof Error ? error.message : String(error)}`);
    }

    // Step 2: Get pages the user manages
    console.log("\n2️⃣  FETCHING MANAGED PAGES...");
    console.log("─".repeat(64));

    try {
        const pagesUrl = `${baseUrl}/me/accounts?fields=id,name,access_token,category,tasks&access_token=${token}`;
        const pagesResponse = await fetch(pagesUrl);
        const pagesData = (await pagesResponse.json()) as MeAccountsResponse & { error?: { message: string } };

        if (pagesData.error) {
            console.log(`   ❌ Error: ${pagesData.error.message}`);
            console.log("\n   💡 This usually means:");
            console.log("      • The token is a User token without pages_show_list permission");
            console.log("      • Or the token is already a Page token (which can't list pages)");
            return;
        }

        const pages = pagesData.data ?? [];
        console.log(`   Found ${pages.length} page(s):\n`);

        let foundConfiguredPage = false;
        for (const page of pages) {
            const isConfiguredPage = page.id === pageId;
            if (isConfiguredPage) foundConfiguredPage = true;

            console.log(`   ${isConfiguredPage ? "👉" : "  "} Page: ${page.name}`);
            console.log(`      ID: ${page.id}`);
            console.log(`      Category: ${page.category ?? "N/A"}`);
            console.log(`      Tasks: ${page.tasks?.join(", ") ?? "N/A"}`);

            if (isConfiguredPage) {
                console.log(`      Page Token: ${page.access_token.slice(0, 20)}...`);
                console.log("\n   ✅ FOUND CONFIGURED PAGE!");
                console.log("\n   📝 To fix the permission error, update your .env:");
                console.log("   ─────────────────────────────────────────────────");
                console.log(`   FACEBOOK_ACCESS_TOKEN=${page.access_token}`);
                console.log("   ─────────────────────────────────────────────────\n");
            }
            console.log();
        }

        if (!foundConfiguredPage && pages.length > 0) {
            console.log(`   ⚠️  Configured Page ID (${pageId}) not found in managed pages.`);
            console.log("   Available page IDs:");
            for (const page of pages) {
                console.log(`      • ${page.id} (${page.name})`);
            }
        }

    } catch (error) {
        console.log(`   ❌ Failed to fetch pages: ${error instanceof Error ? error.message : String(error)}`);
    }

    // Step 3: Try to access the configured page directly
    console.log("\n3️⃣  TESTING DIRECT PAGE ACCESS...");
    console.log("─".repeat(64));

    try {
        const pageUrl = `${baseUrl}/${pageId}?fields=id,name,fan_count,category&access_token=${token}`;
        const pageResponse = await fetch(pageUrl);
        const pageData = (await pageResponse.json()) as { id?: string; name?: string; fan_count?: number; error?: { message: string; code: number } };

        if (pageData.error) {
            console.log(`   ❌ Cannot access page: ${pageData.error.message}`);
            console.log(`   Error code: ${pageData.error.code}`);

            if (pageData.error.code === 100) {
                console.log("\n   💡 This error means:");
                console.log("      • You're using a User Access Token instead of a Page Access Token");
                console.log("      • Solution: Use /me/accounts to get the Page Access Token (see step 2)");
            }
        } else {
            console.log(`   ✅ Page accessible!`);
            console.log(`   Name: ${pageData.name}`);
            console.log(`   ID: ${pageData.id}`);
            console.log(`   Fans: ${pageData.fan_count ?? "N/A"}`);
        }

    } catch (error) {
        console.log(`   ❌ Failed: ${error instanceof Error ? error.message : String(error)}`);
    }

    console.log("\n" + "═".repeat(64));
    console.log("Debug complete.");
}

debugToken().catch(console.error);
