import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { withAuth, parseBody } from "@/lib/api-utils";
import { createLifecycleSchema } from "@/lib/validation";

export const GET = withAuth(async (request, { params }) => {
  const { id } = await params;
  const history = await prisma.lifecycleHistory.findMany({
    where: { sellerId: id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(history);
});

export const POST = withAuth(async (request, { params, session }) => {
  const { id } = await params;
  const parsed = await parseBody(request, createLifecycleSchema);
  if (!parsed.success) return parsed.response;

  const entry = await prisma.lifecycleHistory.create({
    data: { sellerId: id, ...parsed.data },
  });

  await createAuditLog(
    session.user.id,
    "UPDATE_LIFECYCLE",
    "LifecycleHistory",
    entry.id,
    `Updated lifecycle: ${entry.marketplace} - ${entry.stage}`,
  );

  return NextResponse.json(entry, { status: 201 });
});
