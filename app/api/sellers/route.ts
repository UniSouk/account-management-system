import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { withAuth, parseBody } from "@/lib/api-utils";
import { createSellerSchema } from "@/lib/validation";

export const GET = withAuth(async (request, { session }) => {
  const sellers = await prisma.seller.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(sellers);
});

export const POST = withAuth(async (request, { session }) => {
  const parsed = await parseBody(request, createSellerSchema);
  if (!parsed.success) return parsed.response;

  const seller = await prisma.seller.create({
    data: parsed.data,
  });

  await createAuditLog(
    session.user.id,
    "CREATE_SELLER",
    "Seller",
    seller.id,
    `Created seller: ${seller.businessName}`,
  );

  return NextResponse.json(seller, { status: 201 });
});
