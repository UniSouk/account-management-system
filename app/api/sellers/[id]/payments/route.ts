import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { withAuth, parseBody } from "@/lib/api-utils";
import { createPaymentSchema } from "@/lib/validation";

export const GET = withAuth(async (request, { params }) => {
  const { id } = await params;
  const payments = await prisma.payment.findMany({
    where: { sellerId: id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(payments);
});

export const POST = withAuth(async (request, { params, session }) => {
  const { id } = await params;
  const parsed = await parseBody(request, createPaymentSchema);
  if (!parsed.success) return parsed.response;

  const payment = await prisma.payment.create({
    data: { sellerId: id, ...parsed.data },
  });

  await createAuditLog(
    session.user.id,
    "CREATE_PAYMENT",
    "Payment",
    payment.id,
    `Created payment: ${payment.amount}`,
  );

  return NextResponse.json(payment, { status: 201 });
});
