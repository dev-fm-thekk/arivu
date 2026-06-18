import { NextRequest, NextResponse } from "next/server";
import { promoteUser } from "@/src/services/auth/server-actions";

export async function PUT(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  const { userId } = params;

  const result = await promoteUser(userId);

  if (result?.error) {
    return NextResponse.json({ error: result.error }, { status: 403 });
  }

  return NextResponse.json({ message: "User promoted successfully" });
}
