import { createClient } from "@supabase/supabase-js";
import { describe, it } from "vitest";

describe("Inspect Database Rows", () => {
  it("should query attempts and enum types", async () => {
    const supabase = createClient(
      "https://kfhgxuighunlmnkeqybh.supabase.co",
      "sb_publishable_DD6rUEhTlpw85wSsdZWbjA_vYk24vCo"
    );

    // 1. Query existing attempts
    const { data: attempts, error: err } = await supabase
      .from("attempts")
      .select("*")
      .limit(10);

    console.log("Existing attempts in DB:", { attempts, err });

    // 2. Query tests
    const { data: tests, error: testErr } = await supabase
      .from("tests")
      .select("*")
      .limit(10);

    console.log("Existing tests in DB:", { tests, testErr });
  });
});
