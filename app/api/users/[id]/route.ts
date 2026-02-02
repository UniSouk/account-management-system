import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { withAuth } from "@/lib/api-utils";

// DELETE account manager (Admin only)
export const DELETE = withAuth(async (request, { params, session }) => {
  if (session.user.role !== "Admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  // Prevent deleting self
  if (id === session.user.id) {
    return NextResponse.json(
      { error: "Cannot delete your own account" },
      { status: 400 },
    );
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Prevent deleting other admins
  if (user.role === "Admin") {
    return NextResponse.json(
      { error: "Cannot delete admin users" },
      { status: 400 },
    );
  }

  await prisma.user.delete({ where: { id } });

  await createAuditLog(
    session.user.id,
    "DELETE_USER",
    "User",
    id,
    `Deleted account manager: ${user.email}`,
  );

  return NextResponse.json({ success: true });
});
