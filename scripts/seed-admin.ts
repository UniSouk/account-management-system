/**
 * Seed script to create initial admin user
 * Run with: npx tsx scripts/seed-admin.ts
 *
 * Set environment variables:
 * - ADMIN_EMAIL: Admin email (default: admin@company.com)
 * - ADMIN_PASSWORD: Admin password (required)
 * - ADMIN_NAME: Admin name (default: Admin User)
 */

import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { createHash } from "crypto";

async function main() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  const email = process.env.ADMIN_EMAIL || "admin@company.com";
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME || "Admin User";

  if (!password) {
    console.error("Error: ADMIN_PASSWORD environment variable is required");
    process.exit(1);
  }

  const passwordHash = createHash("sha256")
    .update(password + process.env.NEXTAUTH_SECRET)
    .digest("hex");

  // Create or update user
  const user = await prisma.user.upsert({
    where: { email },
    update: { name, role: "Admin" },
    create: { email, name, role: "Admin" },
  });

  // Create or update credentials account (using refresh_token to store password hash)
  await prisma.account.upsert({
    where: {
      provider_providerAccountId: {
        provider: "credentials",
        providerAccountId: user.id,
      },
    },
    update: { refresh_token: passwordHash },
    create: {
      userId: user.id,
      type: "credentials",
      provider: "credentials",
      providerAccountId: user.id,
      refresh_token: passwordHash,
    },
  });

  console.log(`Admin user created/updated: ${user.email}`);

  await pool.end();
}

main().catch(console.error);
