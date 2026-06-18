import { NextRequest, NextResponse } from "next/server";
import { fetchLeaderboard } from "@/src/services/platform/actions";

export async function GET(
  req: NextRequest,
  { params }: { params: { testId: string } }
) {
  const { testId } = params;
  const result = await fetchLeaderboard(Number(testId));

  if (result?.test === null || result?.attempts === null) {
    return NextResponse.json({ error: "Leaderboard not found" }, { status: 404 });
  }

  return NextResponse.json(result);
}
