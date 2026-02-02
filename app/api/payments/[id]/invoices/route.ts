import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { withAuth, generateInvoiceNumber } from "@/lib/api-utils";

export const GET = withAuth(async (request, { params }) => {
  const { id } = await params;
  const invoices = await prisma.invoice.findMany({
    where: { paymentId: id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(invoices);
});

export const POST = withAuth(async (request, { params, session }) => {
  const { id } = await params;

  // Verify payment exists
  const payment = await prisma.payment.findUnique({ where: { id } });
  if (!payment) {
    return NextResponse.json({ error: "Payment not found" }, { status: 404 });
  }

  const invoiceNumber = generateInvoiceNumber();

  const invoice = await prisma.invoice.create({
    data: {
      paymentId: id,
      invoiceNumber,
      pdfUrl: `/invoices/${invoiceNumber}.pdf`,
    },
  });

  await createAuditLog(
    session.user.id,
    "CREATE_INVOICE",
    "Invoice",
    invoice.id,
    `Created invoice: ${invoiceNumber}`,
  );

  return NextResponse.json(invoice, { status: 201 });
});
