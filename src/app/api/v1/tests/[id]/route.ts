import { NextRequest, NextResponse } from "next/server";
import { fetchTestById, deleteTest } from "@/src/services/platform/actions";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const result = await fetchTestById(Number(id));

  if (result?.error) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json(result);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const result = await deleteTest(Number(id));

  if (result?.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json(result);
}
