import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { withAuth, parseBody } from "@/lib/api-utils";
import { createDocumentSchema } from "@/lib/validation";

export const GET = withAuth(async (request, { params }) => {
  const { id } = await params;
  const documents = await prisma.document.findMany({
    where: { sellerId: id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(documents);
});

export const POST = withAuth(async (request, { params, session }) => {
  const { id } = await params;
  const parsed = await parseBody(request, createDocumentSchema);
  if (!parsed.success) return parsed.response;

  const document = await prisma.document.create({
    data: { sellerId: id, ...parsed.data },
  });

  await createAuditLog(
    session.user.id,
    "UPLOAD_DOCUMENT",
    "Document",
    document.id,
    `Uploaded document: ${document.fileName}`,
  );

  return NextResponse.json(document, { status: 201 });
});
