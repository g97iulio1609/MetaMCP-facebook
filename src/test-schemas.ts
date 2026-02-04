
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { toolSchemas } from "./toolSchemas.js";

async function runSchemaTest() {
    console.log("🔍 Inspecting Consolidated Facebook Tool Schemas...\n");

    // 1. Inspect fb_create_post Schema (consolidated)
    const postToolName = "fb_create_post";
    const postSchema = toolSchemas[postToolName];

    const jsonSchema = zodToJsonSchema(postSchema, {
        name: postToolName,
        $refStrategy: "none",
    });

    console.log(`📋 JSON Schema for '${postToolName}':`);
    console.log(JSON.stringify(jsonSchema, null, 2));

    // 2. Test Validation Logic
    console.log("\n🧪 Testing Validation Logic:");

    // Test text post
    const validTextPost = {
        message: "Test post with all fields",
        link: "https://example.com",
        place: "123456789",
        published: false,
        scheduled_publish_time: 1735689600
    };

    try {
        const parsed = postSchema.parse(validTextPost);
        console.log("✅ Valid text post parsed successfully:", parsed);
    } catch (e) {
        console.error("❌ Failed to parse valid input:", e);
    }

    // Test image post
    const validImagePost = {
        image_url: "https://example.com/image.jpg",
        message: "Image caption"
    };

    try {
        const parsed = postSchema.parse(validImagePost);
        console.log("✅ Valid image post parsed successfully:", parsed);
    } catch (e) {
        console.error("❌ Failed to parse image post:", e);
    }

    // Test invalid input (missing both message and image_url)
    const invalidInput = {
        link: "https://example.com"
    };

    try {
        postSchema.parse(invalidInput);
        console.log("❌ Invalid input unexpectedly passed!");
    } catch (e) {
        if (e instanceof z.ZodError) {
            console.log("✅ Invalid input correctly rejected with errors:");
            e.errors.forEach(err => console.log(`   - ${err.path.join(".")}: ${err.message}`));
        }
    }

    // 3. Inspect fb_get_insights schema
    console.log("\n📋 JSON Schema for 'fb_get_insights':");
    const insightsSchema = zodToJsonSchema(toolSchemas.fb_get_insights, {
        name: "fb_get_insights",
        $refStrategy: "none",
    });
    console.log(JSON.stringify(insightsSchema, null, 2));
}

runSchemaTest();
