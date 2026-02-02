import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { ZodSchema } from "zod";
import { validateBody } from "./validation";

type SessionUser = {
  id: string;
  email?: string | null;
  name?: string | null;
  role: string;
};

type AuthSession = {
  user: SessionUser;
};

export type ApiHandler = (
  request: Request,
  context: { params: Promise<Record<string, string>>; session: AuthSession },
) => Promise<NextResponse>;

// Wrapper for authenticated API routes with error handling
export function withAuth(handler: ApiHandler) {
  return async (
    request: Request,
    context: { params: Promise<Record<string, string>> },
  ) => {
    try {
      const session = await getServerSession(authOptions);
      if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const authSession: AuthSession = {
        user: {
          id: (session.user as SessionUser).id,
          email: session.user.email,
          name: session.user.name,
          role: (session.user as SessionUser).role || "Account Manager",
        },
      };
      return await handler(request, { ...context, session: authSession });
    } catch (error) {
      console.error("API Error:", error);
      if (error instanceof Error) {
        if (
          error.message.includes("Record to update not found") ||
          error.message.includes("Record to delete does not exist")
        ) {
          return NextResponse.json(
            { error: "Resource not found" },
            { status: 404 },
          );
        }
        if (error.message.includes("Unique constraint")) {
          return NextResponse.json(
            { error: "Resource already exists" },
            { status: 409 },
          );
        }
      }
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 },
      );
    }
  };
}

// Parse and validate JSON body
export async function parseBody<T>(
  request: Request,
  schema: ZodSchema<T>,
): Promise<
  { success: true; data: T } | { success: false; response: NextResponse }
> {
  try {
    const body = await request.json();
    const result = validateBody(schema, body);
    if (!result.success) {
      return {
        success: false,
        response: NextResponse.json({ error: result.error }, { status: 400 }),
      };
    }
    return { success: true, data: result.data };
  } catch {
    return {
      success: false,
      response: NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 },
      ),
    };
  }
}

// Generate unique invoice number with collision resistance
export function generateInvoiceNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `INV-${timestamp}-${random}`;
}
