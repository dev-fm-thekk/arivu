"use server";

import { createClient } from "@/src/utils/supabase/server";
import { Question, Test } from "@/src/utils/type";
import { getCurrentUserProfile } from "../auth/server-actions";
import { revalidatePath } from "next/cache";

export async function fetchQuestions(options?: {
  contributorId?: string;
  categoryId?: number;
  search?: string;
  limit?: number;
}) {
  const supabase = await createClient();
  let query = supabase
    .from("questions")
    .select("*, AptitudeCategories(name, slug)")
    .order("id", { ascending: false });

  if (options?.contributorId) {
    query = query.eq("contributer", options.contributorId);
  }
  if (options?.categoryId) {
    query = query.eq("category_id", options.categoryId);
  }
  if (options?.search) {
    query = query.ilike("question", `%${options.search}%`);
  }
  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;
  return { data: data ?? [], error };
}

export async function deleteQuestion(id: number) {
  const supabase = await createClient();
  const profile = await getCurrentUserProfile();
  if (!profile) return { error: "Not authenticated" };

  const { data: question } = await supabase
    .from("questions")
    .select("contributer")
    .eq("id", id)
    .single();

  if (
    question?.contributer !== profile.id &&
    profile.role !== "admin"
  ) {
    return { error: "Unauthorized" };
  }

  const { error } = await supabase.from("questions").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/questions/my");
  return { success: true };
}

export async function submitQuestion(formData: FormData) {
  const profile = await getCurrentUserProfile();
  if (!profile) return { error: "Not authenticated" };

  const options = {
    A: formData.get("optionA") as string,
    B: formData.get("optionB") as string,
    C: formData.get("optionC") as string,
    D: formData.get("optionD") as string,
  };

  const correctKey = formData.get("correctAnswer") as string;
  const tagsRaw = formData.get("tags") as string;

  const question: Omit<Question, "id"> & { difficulty?: string; explanation?: string } = {
    question: formData.get("question") as string,
    options,
    answer: options[correctKey as keyof typeof options],
    tags: tagsRaw ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean) : [],
    category_id: Number(formData.get("categoryId")),
    contributer: profile.id,
  };

  const supabase = await createClient();
  const { error } = await supabase.from("questions").insert(question);

  if (error) return { error: error.message };

  revalidatePath("/questions/my");
  return { success: true };
}

export async function fetchTests(options?: {
  search?: string;
  sort?: "newest" | "popular";
}) {
  const supabase = await createClient();
  let query = supabase
    .from("tests")
    .select("*")
    .order(options?.sort === "popular" ? "total_attempts" : "id", {
      ascending: false,
    });

  if (options?.search) {
    query = query.ilike("title", `%${options.search}%`);
  }

  const { data, error } = await query;
  return { data: data ?? [], error };
}

export async function fetchTestById(id: number) {
  const supabase = await createClient();
  const { data: test, error } = await supabase
    .from("tests")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return { test: null, error };

  const { data: testQuestions } = await supabase
    .from("test_questions")
    .select("question_id, order_index, questions(*)")
    .eq("test_id", id)
    .order("order_index");

  return { test, questions: testQuestions ?? [] };
}

export async function createTestFromSelection(
  title: string,
  timeLimit: number,
  questionIds: number[]
) {
  const profile = await getCurrentUserProfile();
  if (!profile) return { error: "Not authenticated" };
  if (questionIds.length === 0) return { error: "Select at least one question" };

  const supabase = await createClient();

  const { data: test, error: testError } = await supabase
    .from("tests")
    .insert({
      title,
      time_limit: timeLimit,
      total_attempts: 0,
      created_by: profile.id,
    })
    .select()
    .single();

  if (testError) return { error: testError.message };

  const testQuestions = questionIds.map((qId, index) => ({
    test_id: test.id,
    question_id: qId,
    order_index: index,
  }));

  const { error: tqError } = await supabase
    .from("test_questions")
    .insert(testQuestions);

  if (tqError) return { error: tqError.message };

  revalidatePath("/tests");
  return { success: true, testId: test.id };
}

export async function startAttempt(testId: number) {
  const profile = await getCurrentUserProfile();
  if (!profile) return { error: "Not authenticated" };

  const supabase = await createClient();

  const { data: attempt, error } = await supabase
    .from("attempts")
    .insert({
      userId: profile.id,
      test_id: testId,
      score: 0,
      started_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) return { error: error.message };

  const { data: testQuestions } = await supabase
    .from("test_questions")
    .select("question_id")
    .eq("test_id", testId);

  if (testQuestions?.length) {
    await supabase.from("test_attempt_questions").insert(
      testQuestions.map((tq) => ({
        attempt_id: attempt.id,
        question_id: tq.question_id,
        selected_answer: null,
        is_correct: null,
      }))
    );
  }

  const { data: currentTest } = await supabase
    .from("tests")
    .select("total_attempts")
    .eq("id", testId)
    .single();

  if (currentTest) {
    await supabase
      .from("tests")
      .update({ total_attempts: (currentTest.total_attempts ?? 0) + 1 })
      .eq("id", testId);
  }

  return { attemptId: attempt.id };
}

export async function saveAnswer(
  attemptId: number,
  questionId: number,
  selectedAnswer: string
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("test_attempt_questions")
    .update({ selected_answer: selectedAnswer })
    .eq("attempt_id", attemptId)
    .eq("question_id", questionId);

  if (error) return { error: error.message };
  return { success: true };
}

export async function fetchAttemptAnswers(attemptId: number) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("test_attempt_questions")
    .select("question_id, selected_answer")
    .eq("attempt_id", attemptId);

  return { data: data ?? [], error };
}

export async function submitAttempt(attemptId: number) {
  const { evaluateTest } = await import("../tests/action");
  const result = await evaluateTest(attemptId);
  if (result.status === "failed") {
    return { error: String(result.error) };
  }
  return { score: result.score };
}

export async function fetchAttemptResult(attemptId: number) {
  const supabase = await createClient();

  const { data: attempt } = await supabase
    .from("attempts")
    .select("*, tests(*)")
    .eq("id", attemptId)
    .single();

  const { data: answers } = await supabase
    .from("test_attempt_questions")
    .select("*, questions(*)")
    .eq("attempt_id", attemptId);

  return { attempt, answers: answers ?? [] };
}

export async function fetchLeaderboard(testId: number) {
  const supabase = await createClient();

  const { data: test } = await supabase
    .from("tests")
    .select("*")
    .eq("id", testId)
    .single();

  const { data: attempts } = await supabase
    .from("attempts")
    .select("*, user(name, email)")
    .eq("test_id", testId)
    .not("submitted_at", "is", null)
    .order("score", { ascending: false })
    .limit(50);

  return { test, attempts: attempts ?? [] };
}

export async function fetchDashboardStats(userId: string) {
  const supabase = await createClient();

  const [
    { count: contributed },
    { data: attempts },
    { data: trendingTests },
    { data: recentAttempts },
  ] = await Promise.all([
    supabase
      .from("questions")
      .select("*", { count: "exact", head: true })
      .eq("contributer", userId),
    supabase
      .from("attempts")
      .select("score")
      .eq("userId", userId)
      .not("submitted_at", "is", null),
    supabase
      .from("tests")
      .select("*")
      .order("total_attempts", { ascending: false })
      .limit(6),
    supabase
      .from("attempts")
      .select("*, tests(title)")
      .eq("userId", userId)
      .not("submitted_at", "is", null)
      .order("submitted_at", { ascending: false })
      .limit(5),
  ]);

  const scores = attempts?.map((a) => Number(a.score)) ?? [];
  const avgScore =
    scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;

  return {
    contributed: contributed ?? 0,
    testsTaken: scores.length,
    avgScore,
    trendingTests: trendingTests ?? [],
    recentAttempts: recentAttempts ?? [],
  };
}

export async function fetchAdminStats() {
  const supabase = await createClient();

  const [
    { count: questions },
    { count: tests },
    { count: users },
    { count: attempts },
    { data: recentQuestions },
    { data: allUsers },
  ] = await Promise.all([
    supabase.from("questions").select("*", { count: "exact", head: true }),
    supabase.from("tests").select("*", { count: "exact", head: true }),
    supabase.from("user").select("*", { count: "exact", head: true }),
    supabase.from("attempts").select("*", { count: "exact", head: true }),
    supabase
      .from("questions")
      .select("*, user(name)")
      .order("id", { ascending: false })
      .limit(5),
    supabase.from("user").select("*").order("id"),
  ]);

  return {
    questions: questions ?? 0,
    tests: tests ?? 0,
    users: users ?? 0,
    attempts: attempts ?? 0,
    recentQuestions: recentQuestions ?? [],
    allUsers: allUsers ?? [],
  };
}

export async function fetchUserLastAttempt(testId: number, userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("attempts")
    .select("*")
    .eq("test_id", testId)
    .eq("userId", userId)
    .not("submitted_at", "is", null)
    .order("submitted_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return data;
}

export async function fetchUserProfileData(userId: string) {
  const supabase = await createClient();

  const [
    { data: profile },
    { count: contributed },
    { data: attempts },
    { data: questions },
  ] = await Promise.all([
    supabase.from("user").select("*").eq("id", userId).single(),
    supabase
      .from("questions")
      .select("*", { count: "exact", head: true })
      .eq("contributer", userId),
    supabase
      .from("attempts")
      .select("*, tests(title)")
      .eq("userId", userId)
      .not("submitted_at", "is", null)
      .order("submitted_at", { ascending: false }),
    supabase
      .from("questions")
      .select("*, AptitudeCategories(name)")
      .eq("contributer", userId)
      .order("id", { ascending: false }),
  ]);

  const scores = attempts?.map((a) => Number(a.score)) ?? [];
  const bestScore = scores.length > 0 ? Math.max(...scores) : 0;

  return {
    profile,
    contributed: contributed ?? 0,
    testsTaken: scores.length,
    bestScore,
    attempts: attempts ?? [],
    questions: questions ?? [],
  };
}

export async function deleteTest(id: number) {
  const profile = await getCurrentUserProfile();
  if (!profile) return { error: "Not authenticated" };

  const supabase = await createClient();
  const { data: test } = await supabase
    .from("tests")
    .select("created_by")
    .eq("id", id)
    .single();

  if (test?.created_by !== profile.id && profile.role !== "admin") {
    return { error: "Unauthorized" };
  }

  await supabase.from("test_questions").delete().eq("test_id", id);
  const { error } = await supabase.from("tests").delete().eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/tests");
  return { success: true };
}
