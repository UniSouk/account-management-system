import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import PDFDocument from "pdfkit";
import path from "path";
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Fetch invoice with related data
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      payment: {
        include: {
          seller: true,
        },
      },
    },
  });

  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  const { payment } = invoice;
  const seller = payment.seller;

  const fontPath = path.join(
    process.cwd(),
    "public",
    "fonts",
    "Roboto-Regular.ttf",
  );

  // Create PDF
  const doc = new PDFDocument({
    margin: 50,
    autoFirstPage: true,
    font: fontPath,
  });
  const chunks: Buffer[] = [];

  // doc.font(fontPath);

  doc.on("data", (chunk) => chunks.push(chunk));

  // Company Header
  doc.fontSize(20).text("INVOICE", { align: "center" }).moveDown();

  // Company Info (left side)
  doc
    .fontSize(10)
    .text("NEXANODE TECHNOLOGIES", { continued: false })
    .fontSize(9)
    .text("601, solaris cube")
    .text("Surat, Gujarat 395007")
    .text("Email: info@unisouk.com")
    .text("Phone: (123) 456-7890")
    .moveDown();

  // Invoice Details (right side)
  doc
    .fontSize(10)
    .text(`Invoice Number: ${invoice.invoiceNumber}`, 350, 150)
    .text(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`, 350)
    .text(
      `Payment Date: ${new Date(payment.paymentDate).toLocaleDateString()}`,
      350,
    )
    .moveDown();

  // Client Info
  doc
    .fontSize(12)
    .text("Bill To:", 50, 250)
    .fontSize(10)
    .text(seller.businessName)
    .text(seller.contactName || "")
    .text(seller.email || "")
    .text(seller.phone || "")
    .text(seller.address || "")
    .moveDown(2);

  // Table Header
  const tableTop = 380;
  doc
    .fontSize(10)
    .text("Description", 50, tableTop)
    .text("Quantity", 300, tableTop)
    .text("Price", 400, tableTop)
    .text("Amount", 480, tableTop);

  // Line under header
  doc
    .moveTo(50, tableTop + 15)
    .lineTo(550, tableTop + 15)
    .stroke();

  // Table Row
  const itemY = tableTop + 30;
  doc
    .fontSize(9)
    .text("Payment Received", 50, itemY)
    .text("1", 300, itemY)
    .text(`$${payment.amount.toFixed(2)}`, 400, itemY)
    .text(`$${payment.amount.toFixed(2)}`, 480, itemY);

  // Total
  doc
    .moveTo(50, itemY + 30)
    .lineTo(550, itemY + 30)
    .stroke();

  doc
    .fontSize(12)
    .text("Total:", 400, itemY + 45)
    .text(`$${payment.amount.toFixed(2)}`, 480, itemY + 45);

  // Reference if available
  if (payment.reference) {
    doc.fontSize(9).text(`Reference: ${payment.reference}`, 50, itemY + 80);
  }

  // Footer
  doc
    .fontSize(8)
    .text("Thank you for your business!", 50, 700, { align: "center" });

  doc.end();

  // Wait for PDF to be generated
  const pdfBuffer = await new Promise<Buffer>((resolve) => {
    doc.on("end", () => {
      resolve(Buffer.concat(chunks));
    });
  });

  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="invoice-${invoice.invoiceNumber}.pdf"`,
    },
  });
}
