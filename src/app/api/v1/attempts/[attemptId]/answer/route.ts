import { NextRequest, NextResponse } from "next/server";
import { saveAnswer } from "@/src/services/platform/actions";

export async function PUT(
  req: NextRequest,
  { params }: { params: { attemptId: string } }
) {
  const { attemptId } = params;
  const { questionId, selectedAnswer } = await req.json();
  const result = await saveAnswer(Number(attemptId), questionId, selectedAnswer);

  if (result?.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json(result);
}
