
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { toolSchemas } from "./toolSchemas.js";

async function runSchemaTest() {
    console.log("🔍 Inspecting Facebook Tool Schemas...\n");

    // 1. Inspect fb_post_to_facebook Schema
    const postToolName = "fb_post_to_facebook";
    const postSchema = toolSchemas[postToolName];

    const jsonSchema = zodToJsonSchema(postSchema, {
        name: postToolName,
        $refStrategy: "none",
    });

    console.log(`📋 JSON Schema for '${postToolName}':`);
    console.log(JSON.stringify(jsonSchema, null, 2));

    // 2. Test Validation Logic
    console.log("\n🧪 Testing Validation Logic:");

    const validFullInput = {
        message: "Test post with all fields",
        link: "https://example.com",
        place: "123456789",
        published: false,
        scheduled_publish_time: 1735689600
    };

    try {
        const parsed = postSchema.parse(validFullInput);
        console.log("✅ Valid full input parsed successfully:", parsed);
    } catch (e) {
        console.error("❌ Failed to parse valid input:", e);
    }

    const validMinimalInput = {
        message: "Just a message"
    };

    try {
        const parsed = postSchema.parse(validMinimalInput);
        console.log("✅ Valid minimal input parsed successfully:", parsed);
    } catch (e) {
        console.error("❌ Failed to parse minimal input:", e);
    }

    const invalidInput = {
        link: "not-a-url" // Missing message, invalid url
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
}

runSchemaTest();
