import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const documents = await prisma.document.findMany({ where: { sellerId: id } });
  return NextResponse.json(documents);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { fileName, fileUrl, tags } = await req.json();
  const document = await prisma.document.create({
    data: { sellerId: id, fileName, fileUrl, tags },
  });
  
  await createAuditLog(session.user.id, "UPLOAD_DOCUMENT", "Document", document.id, `Uploaded document: ${fileName}`);
  
  return NextResponse.json(document);
}
