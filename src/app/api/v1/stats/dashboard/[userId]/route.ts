import { NextRequest, NextResponse } from "next/server";
import { fetchDashboardStats } from "@/src/services/platform/actions";

export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  const { userId } = params;
  const result = await fetchDashboardStats(userId);

  return NextResponse.json(result);
}
