import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const proposals = await prisma.proposal.findMany({
    where: { sellerId: id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(proposals);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const proposal = await prisma.proposal.create({
    data: {
      sellerId: id,
      fileName: body.fileName,
      fileUrl: body.fileUrl,
      shareable: body.shareable || false,
    },
  });
  return NextResponse.json(proposal);
}
