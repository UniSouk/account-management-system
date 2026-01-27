import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sellers = await prisma.seller.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(sellers);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const seller = await prisma.seller.create({
    data: {
      businessName: body.businessName,
      contactName: body.contactName,
      email: body.email,
      phone: body.phone,
      address: body.address,
      accountManagerName: body.accountManagerName,
      accountManagerMobile: body.accountManagerMobile,
      accountManagerEmail: body.accountManagerEmail,
      serviceNote: body.serviceNote,
    },
  });
  
  await createAuditLog(session.user.id, "CREATE_SELLER", "Seller", seller.id, `Created seller: ${seller.businessName}`);
  
  return NextResponse.json(seller);
}
