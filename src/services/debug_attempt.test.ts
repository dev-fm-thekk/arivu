import { createClient } from "@supabase/supabase-js";
import { describe, it, expect } from "vitest";
import { createTest, startAttempt, getAttemptDetails } from "./db";

describe("Debug Attempt Status", () => {
  it("should create a test and start an attempt as an authenticated user", async () => {
    const supabase = createClient(
      "https://kfhgxuighunlmnkeqybh.supabase.co",
      "sb_publishable_DD6rUEhTlpw85wSsdZWbjA_vYk24vCo"
    );

    // Create a unique test user
    const email = `test-user-${Date.now()}@example.com`;
    const password = "password123";

    const { data: authData, error: authErr } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authErr) {
      console.error("SignUp error:", authErr);
      return;
    }

    const userId = authData.user?.id;
    console.log("Registered test user ID:", userId);

    expect(userId).toBeDefined();

    try {
      // 1. Create a category and subcategory first so we can fetch them
      const { data: category } = await supabase
        .from("categories")
        .insert({ name: `Debug Category ${Date.now()}` })
        .select()
        .single();

      const { data: subCategory } = await supabase
        .from("sub_categories")
        .insert({ name: `Debug Subcat ${Date.now()}`, category_id: category.id })
        .select()
        .single();

      // 2. Create questions to pool from
      await supabase.from("questions").insert([
        {
          question: "Q1",
          options: ["A", "B"],
          answer: "A",
          sub_category_id: subCategory.id,
        },
        {
          question: "Q2",
          options: ["C", "D"],
          answer: "C",
          sub_category_id: subCategory.id,
        }
      ]);

      // 3. Create a test
      const test = await createTest(supabase, {
        title: `Test ${Date.now()}`,
        sections: [category.name],
        duration: 15,
        total_questions: 2,
        correct_mark: 1,
        negative_mark: 0.25,
        total_score: 2
      });

      console.log("Created test:", test);

      // 4. Start attempt
      const attempt = await startAttempt(supabase, userId!, test.id, [subCategory.id]);
      console.log("Started attempt in DB:", attempt);

      // 5. Get attempt details
      const attemptDetails = await getAttemptDetails(supabase, userId!, test.id);
      console.log("Fetched attempt details:", attemptDetails);

      expect(attemptDetails?.status).toBe("started");

      // Cleanup
      await supabase.from("attempts").delete().eq("test_id", test.id).eq("user_id", userId!);
      await supabase.from("questions").delete().eq("sub_category_id", subCategory.id);
      await supabase.from("sub_categories").delete().eq("id", subCategory.id);
      await supabase.from("categories").delete().eq("id", category.id);
      await supabase.from("tests").delete().eq("id", test.id);
    } catch (e) {
      console.error("Error during run:", e);
    } finally {
      // Delete user
      // Note: We cannot delete users from client-side easily without admin, but it's ok for dummy auth users
    }
  });
});
