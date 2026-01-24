import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const notes = await prisma.internalNote.findMany({ where: { sellerId: id }, orderBy: { createdAt: "desc" } });
  return NextResponse.json(notes);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { content, attachmentUrl } = await req.json();
  const note = await prisma.internalNote.create({ data: { sellerId: id, content, attachmentUrl } });
  return NextResponse.json(note);
}
