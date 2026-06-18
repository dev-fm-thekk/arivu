import { NextRequest, NextResponse } from "next/server";
import { createCategory, fetchCategory } from "@/src/services/categories/action";

export async function POST(req: NextRequest) {
  const { name, slug } = await req.json();
  const result = await createCategory({ name, slug });

  if (result?.err) {
    return NextResponse.json({ error: result.err }, { status: 400 });
  }

  return NextResponse.json(result);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const fetchAll = searchParams.get("fetchAll") === "true";
  const fields = searchParams.get("fields")?.split(",") || [];
  const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : 0;
  const start = searchParams.get("start") ? Number(searchParams.get("start")) : 0;
  const stop = searchParams.get("stop") ? Number(searchParams.get("stop")) : 0;

  const options = { fetchAll, fields, limit, start, stop };
  const result = await fetchCategory(options);

  if (result?.error) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json(result.data);
}
