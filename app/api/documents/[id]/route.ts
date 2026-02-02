import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { withAuth, parseBody } from "@/lib/api-utils";
import { updateDocumentSchema } from "@/lib/validation";

export const PUT = withAuth(async (request, { params, session }) => {
  const { id } = await params;
  const parsed = await parseBody(request, updateDocumentSchema);
  if (!parsed.success) return parsed.response;

  const document = await prisma.document.update({
    where: { id },
    data: parsed.data,
  });

  await createAuditLog(
    session.user.id,
    "UPDATE_DOCUMENT",
    "Document",
    document.id,
    `Updated document: ${document.fileName}`,
  );

  return NextResponse.json(document);
});

export const DELETE = withAuth(async (request, { params, session }) => {
  const { id } = await params;

  const document = await prisma.document.findUnique({ where: { id } });
  if (!document) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  await prisma.document.delete({ where: { id } });

  await createAuditLog(
    session.user.id,
    "DELETE_DOCUMENT",
    "Document",
    id,
    `Deleted document: ${document.fileName}`,
  );

  return NextResponse.json({ success: true });
});
