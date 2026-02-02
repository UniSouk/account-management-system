import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth } from "@/lib/api-utils";

export const GET = withAuth(async (request, { session }) => {
  // Only Admin can view audit logs
  if (session.user.role !== "Admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json(logs);
});
