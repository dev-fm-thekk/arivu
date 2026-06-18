import { NextRequest, NextResponse } from "next/server";
import { editCategory, deleteCategory } from "@/src/services/categories/action";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const { name, slug } = await req.json();
  const result = await editCategory(Number(id), { name, slug });

  if (result?.err) {
    return NextResponse.json({ error: result.err }, { status: 400 });
  }

  return NextResponse.json(result);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const result = await deleteCategory(Number(id));

  if (result?.err) {
    return NextResponse.json({ error: result.err }, { status: 400 });
  }

  return NextResponse.json(result);
}
