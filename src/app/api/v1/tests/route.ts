import { NextRequest, NextResponse } from "next/server";
import { fetchTests, createTestFromSelection } from "@/src/services/platform/actions";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || undefined;
  const sort = searchParams.get("sort") as "newest" | "popular" || undefined;

  const options = { search, sort };
  const result = await fetchTests(options);

  if (result?.error) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json(result.data);
}

export async function POST(req: NextRequest) {
  const { title, timeLimit, questionIds } = await req.json();
  const result = await createTestFromSelection(title, timeLimit, questionIds);

  if (result?.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json(result);
}
