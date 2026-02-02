import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { withAuth, parseBody } from "@/lib/api-utils";
import { changePasswordSchema } from "@/lib/validation";
import { hashPassword, verifyPassword } from "@/lib/auth";

export const POST = withAuth(async (request, { session }) => {
  const parsed = await parseBody(request, changePasswordSchema);
  if (!parsed.success) return parsed.response;

  // Get user's credential account
  const account = await prisma.account.findFirst({
    where: {
      userId: session.user.id,
      provider: "credentials",
    },
  });

  if (!account?.refresh_token) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 });
  }

  // Verify current password
  const isValid = await verifyPassword(
    parsed.data.currentPassword,
    account.refresh_token,
  );
  if (!isValid) {
    return NextResponse.json(
      { error: "Current password is incorrect" },
      { status: 400 },
    );
  }

  // Hash and update new password
  const newPasswordHash = await hashPassword(parsed.data.newPassword);

  await prisma.account.update({
    where: {
      provider_providerAccountId: {
        provider: "credentials",
        providerAccountId: account.providerAccountId,
      },
    },
    data: { refresh_token: newPasswordHash },
  });

  await createAuditLog(
    session.user.id,
    "CHANGE_PASSWORD",
    "User",
    session.user.id,
    "Changed password",
  );

  return NextResponse.json({ success: true });
});
