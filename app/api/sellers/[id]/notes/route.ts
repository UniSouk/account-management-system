import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { withAuth, parseBody } from "@/lib/api-utils";
import { createNoteSchema } from "@/lib/validation";

export const GET = withAuth(async (request, { params }) => {
  const { id } = await params;
  const notes = await prisma.internalNote.findMany({
    where: { sellerId: id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(notes);
});

export const POST = withAuth(async (request, { params, session }) => {
  const { id } = await params;
  const parsed = await parseBody(request, createNoteSchema);
  if (!parsed.success) return parsed.response;

  const note = await prisma.internalNote.create({
    data: {
      sellerId: id,
      content: parsed.data.content,
      attachmentUrl: parsed.data.attachmentUrl || null,
    },
  });

  await createAuditLog(
    session.user.id,
    "CREATE_NOTE",
    "InternalNote",
    note.id,
    `Created internal note for seller`,
  );

  return NextResponse.json(note, { status: 201 });
});
