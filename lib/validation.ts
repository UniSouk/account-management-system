import { z } from "zod";

// Seller schemas
export const createSellerSchema = z.object({
  businessName: z.string().min(1, "Business name is required").max(255),
  contactName: z.string().max(255).optional().nullable(),
  email: z
    .string()
    .email("Invalid email")
    .optional()
    .nullable()
    .or(z.literal("")),
  phone: z.string().max(20).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  accountManagerName: z.string().max(255).optional().nullable(),
  accountManagerMobile: z.string().max(20).optional().nullable(),
  accountManagerEmail: z
    .string()
    .email("Invalid email")
    .optional()
    .nullable()
    .or(z.literal("")),
  serviceNote: z.string().max(2000).optional().nullable(),
});

export const updateSellerSchema = createSellerSchema.partial();

// Document schemas
export const createDocumentSchema = z.object({
  fileName: z.string().min(1, "File name is required").max(255),
  fileUrl: z.string().url("Invalid URL").min(1),
  tags: z.string().max(500),
});

export const updateDocumentSchema = createDocumentSchema.partial();

// Payment schemas
export const createPaymentSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  paymentDate: z
    .string()
    .or(z.date())
    .transform((val) => new Date(val)),
  reference: z.string().max(255).optional().nullable(),
  proofOfPayment: z.string().min(1, "Proof of payment is required"),
});

// Note schemas
export const createNoteSchema = z.object({
  content: z.string().min(1, "Content is required").max(5000),
  attachmentUrl: z
    .string()
    .url("Invalid URL")
    .optional()
    .nullable()
    .or(z.literal("")),
});

// Proposal schemas
export const createProposalSchema = z.object({
  fileName: z.string().min(1, "File name is required").max(255),
  fileUrl: z.string().url("Invalid URL").min(1),
  shareable: z.boolean().default(false),
});

// Lifecycle schemas
export const createLifecycleSchema = z.object({
  marketplace: z.string().min(1, "Marketplace is required").max(100),
  stage: z.string().min(1, "Stage is required").max(100),
});

// Helper to validate and return typed data or error response
export function validateBody<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);
  if (!result.success) {
    const errors = result.error.issues
      .map((e: z.ZodIssue) => `${e.path.join(".")}: ${e.message}`)
      .join(", ");
    return { success: false, error: errors };
  }
  return { success: true, data: result.data };
}
