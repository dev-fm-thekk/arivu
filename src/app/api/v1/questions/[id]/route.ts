import { NextRequest, NextResponse } from "next/server";
import { deleteQuestion } from "@/src/services/platform/actions";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const result = await deleteQuestion(Number(id));

  if (result?.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json(result);
}
