import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { withAuth, parseBody } from "@/lib/api-utils";
import { updateSellerSchema } from "@/lib/validation";

export const GET = withAuth(async (request, { params, session }) => {
  const { id } = await params;
  const seller = await prisma.seller.findUnique({ where: { id } });

  if (!seller) {
    return NextResponse.json({ error: "Seller not found" }, { status: 404 });
  }

  return NextResponse.json(seller);
});

export const PUT = withAuth(async (request, { params, session }) => {
  const { id } = await params;
  const parsed = await parseBody(request, updateSellerSchema);
  if (!parsed.success) return parsed.response;

  const seller = await prisma.seller.update({
    where: { id },
    data: parsed.data,
  });

  await createAuditLog(
    session.user.id,
    "UPDATE_SELLER",
    "Seller",
    seller.id,
    `Updated seller: ${seller.businessName}`,
  );

  return NextResponse.json(seller);
});
