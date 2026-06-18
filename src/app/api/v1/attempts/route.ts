import { NextRequest, NextResponse } from "next/server";
import { startAttempt, fetchUserLastAttempt } from "@/src/services/platform/actions";

export async function POST(req: NextRequest) {
  const { testId } = await req.json();
  const result = await startAttempt(testId);

  if (result?.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json(result);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const testId = searchParams.get("testId") ? Number(searchParams.get("testId")) : undefined;
  const userId = searchParams.get("userId") || undefined;

  if (!testId || !userId) {
    return NextResponse.json({ error: "Missing testId or userId" }, { status: 400 });
  }

  const result = await fetchUserLastAttempt(testId, userId);

  return NextResponse.json(result);
}
