import { Category, SubCategory, Question, Test, Attempt, AttemptWithTest } from "@/src/utils/type";

export async function getCategories(supabase: any): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function getSubCategories(supabase: any): Promise<SubCategory[]> {
  const { data, error } = await supabase
    .from("sub_categories")
    .select("*")
    .order("name", { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function createTest(
  supabase: any,
  test: Omit<Test, "id" | "created_at" | "updated_at">
): Promise<Test> {
  const { data, error } = await supabase
    .from("tests")
    .insert(test)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function startAttempt(
  supabase: any,
  userId: string,
  testId: string,
  selectedSubcategoryIds: string[]
): Promise<Attempt> {
  // 1. Fetch test details to get total_questions
  const { data: test, error: testErr } = await supabase
    .from("tests")
    .select("*")
    .eq("id", testId)
    .single();
  if (testErr) throw testErr;

  const totalQuestions = test.total_questions || 10;

  // 2. Fetch questions from the selected subcategories
  let { data: questions, error: qErr } = await supabase
    .from("questions")
    .select("*")
    .in("sub_category_id", selectedSubcategoryIds);
  if (qErr) throw qErr;

  let questionsToUse: Question[] = [];
  if (questions && questions.length > 0) {
    // Shuffle questions
    const shuffled = [...questions].sort(() => 0.5 - Math.random());
    questionsToUse = shuffled.slice(0, totalQuestions);
  }

  // Fallback: If no questions match the subcategories, fetch any random questions
  if (questionsToUse.length === 0) {
    const { data: fallbackQs, error: fallbackErr } = await supabase
      .from("questions")
      .select("*")
      .limit(totalQuestions);
    if (fallbackErr) throw fallbackErr;
    questionsToUse = fallbackQs || [];
  }

  // 3. Insert the new attempt
  const newAttempt = {
    test_id: testId,
    user_id: userId,
    status: "in_progress",
    questions: questionsToUse,
    answers: {},
    submitted_at: null,
    score: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data, error: insertErr } = await supabase
    .from("attempts")
    .insert(newAttempt)
    .select()
    .single();

  if (insertErr) throw insertErr;
  return data;
}

export async function getUserAttempts(
  supabase: any,
  userId: string
): Promise<AttemptWithTest[]> {
  const { data, error } = await supabase
    .from("attempts")
    .select("*, test:tests(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getAttemptDetails(
  supabase: any,
  userId: string,
  testId: string
): Promise<AttemptWithTest | null> {
  const { data, error } = await supabase
    .from("attempts")
    .select("*, test:tests(*)")
    .eq("user_id", userId)
    .eq("test_id", testId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function updateAttemptAnswers(
  supabase: any,
  userId: string,
  testId: string,
  answers: Record<string, string>
): Promise<Attempt> {
  const { data, error } = await supabase
    .from("attempts")
    .update({
      answers,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .eq("test_id", testId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function submitAttempt(
  supabase: any,
  userId: string,
  testId: string,
  answers: Record<string, string>
): Promise<Attempt> {
  // Fetch attempt details (specifically, questions and correct/negative marks)
  const { data: attempt, error: fetchErr } = await supabase
    .from("attempts")
    .select("*, test:tests(*)")
    .eq("user_id", userId)
    .eq("test_id", testId)
    .single();
  if (fetchErr) throw fetchErr;

  const test = attempt.test;
  const questions = attempt.questions || [];

  let correctCount = 0;
  let incorrectCount = 0;

  questions.forEach((q: any) => {
    const userAnswer = answers[q.id];
    if (userAnswer) {
      if (userAnswer.trim().toUpperCase() === q.answer.trim().toUpperCase()) {
        correctCount++;
      } else {
        incorrectCount++;
      }
    }
  });

  const correctMark = Number(test.correct_mark) || 1;
  const negativeMark = Number(test.negative_mark) || 0;
  const score = correctCount * correctMark - incorrectCount * negativeMark;

  const { data, error: updateErr } = await supabase
    .from("attempts")
    .update({
      status: "submitted",
      answers,
      score,
      submitted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .eq("test_id", testId)
    .select()
    .single();

  if (updateErr) throw updateErr;
  return data;
}
