import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const payment = await prisma.payment.create({
    data: { sellerId: id, ...body },
  });
  return NextResponse.json(payment);
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const payments = await prisma.payment.findMany({ where: { sellerId: id } });
  return NextResponse.json(payments);
}
