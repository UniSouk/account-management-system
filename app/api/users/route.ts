import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { withAuth, parseBody } from "@/lib/api-utils";
import { createUserSchema } from "@/lib/validation";
import { hashPassword, generatePassword } from "@/lib/auth";

// GET all account managers (Admin only)
export const GET = withAuth(async (request, { session }) => {
  if (session.user.role !== "Admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    where: { role: "Account Manager" },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(users);
});

// POST create new account manager (Admin only)
export const POST = withAuth(async (request, { session }) => {
  if (session.user.role !== "Admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = await parseBody(request, createUserSchema);
  if (!parsed.success) return parsed.response;

  // Check if user already exists
  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });

  if (existing) {
    return NextResponse.json(
      { error: "User with this email already exists" },
      { status: 409 },
    );
  }

  // Generate random password
  const tempPassword = generatePassword();
  const passwordHash = await hashPassword(tempPassword);

  // Create user and credentials account in transaction
  const user = await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: {
        email: parsed.data.email,
        name: parsed.data.name,
        role: "Account Manager",
      },
    });

    await tx.account.create({
      data: {
        userId: newUser.id,
        type: "credentials",
        provider: "credentials",
        providerAccountId: newUser.id,
        refresh_token: passwordHash,
      },
    });

    return newUser;
  });

  await createAuditLog(
    session.user.id,
    "CREATE_USER",
    "User",
    user.id,
    `Created account manager: ${user.email}`,
  );

  // Return user with temporary password (shown once)
  return NextResponse.json(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      tempPassword,
    },
    { status: 201 },
  );
});
