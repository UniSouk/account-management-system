import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { withAuth, parseBody } from "@/lib/api-utils";
import { createProposalSchema } from "@/lib/validation";

export const GET = withAuth(async (request, { params }) => {
  const { id } = await params;
  const proposals = await prisma.proposal.findMany({
    where: { sellerId: id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(proposals);
});

export const POST = withAuth(async (request, { params, session }) => {
  const { id } = await params;
  const parsed = await parseBody(request, createProposalSchema);
  if (!parsed.success) return parsed.response;

  const proposal = await prisma.proposal.create({
    data: {
      sellerId: id,
      ...parsed.data,
    },
  });

  await createAuditLog(
    session.user.id,
    "CREATE_PROPOSAL",
    "Proposal",
    proposal.id,
    `Created proposal: ${proposal.fileName}`,
  );

  return NextResponse.json(proposal, { status: 201 });
});
