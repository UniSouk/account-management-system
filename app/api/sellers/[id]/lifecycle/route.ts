import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const history = await prisma.lifecycleHistory.findMany({
    where: { sellerId: id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(history);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { marketplace, stage } = await req.json();
  const entry = await prisma.lifecycleHistory.create({
    data: { sellerId: id, marketplace, stage },
  });
  return NextResponse.json(entry);
}
