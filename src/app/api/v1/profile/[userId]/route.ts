import { NextRequest, NextResponse } from "next/server";
import { fetchUserProfileData } from "@/src/services/platform/actions";

export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  const { userId } = params;
  const result = await fetchUserProfileData(userId);

  return NextResponse.json(result);
}
