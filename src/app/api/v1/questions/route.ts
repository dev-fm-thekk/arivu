import { NextRequest, NextResponse } from "next/server";
import { fetchQuestions, submitQuestion } from "@/src/services/platform/actions";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const contributorId = searchParams.get("contributorId") || undefined;
  const categoryId = searchParams.get("categoryId") ? Number(searchParams.get("categoryId")) : undefined;
  const search = searchParams.get("search") || undefined;
  const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : undefined;

  const options = { contributorId, categoryId, search, limit };
  const result = await fetchQuestions(options);

  if (result?.error) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json(result.data);
}

export async function POST(req: NextRequest) {
  const data = await req.json(); // Expect JSON data instead of FormData

  // Reconstruct FormData from JSON for the server action
  const formData = new FormData();
  formData.append("question", data.question);
  formData.append("optionA", data.options.A);
  formData.append("optionB", data.options.B);
  formData.append("optionC", data.options.C);
  formData.append("optionD", data.options.D);
  formData.append("correctAnswer", data.correctAnswer);
  formData.append("tags", data.tags.join(","));
  formData.append("categoryId", data.categoryId.toString());
  // Assuming 'contributer' is handled by getCurrentUserProfile inside submitQuestion

  const result = await submitQuestion(formData);

  if (result?.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json(result);
}
