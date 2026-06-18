import { NextRequest, NextResponse } from "next/server";
import { fetchAttemptResult, submitAttempt } from "@/src/services/platform/actions";

export async function GET(
  req: NextRequest,
  { params }: { params: { attemptId: string } }
) {
  const { attemptId } = params;
  const result = await fetchAttemptResult(Number(attemptId));

  if (result?.error) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json(result);
}

export async function POST(
  req: NextRequest,
  { params }: { params: { attemptId: string } }
) {
  const { attemptId } = params;
  const result = await submitAttempt(Number(attemptId));

  if (result?.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json(result);
}
