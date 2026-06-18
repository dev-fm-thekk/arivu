import { NextRequest, NextResponse } from "next/server";
import { fetchAdminStats } from "@/src/services/platform/actions";

export async function GET(req: NextRequest) {
  const result = await fetchAdminStats();

  return NextResponse.json(result);
}
