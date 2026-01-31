# Invoice Generation Feature - Design Document

## Overview

This document outlines the technical design for implementing a downloadable PDF invoice generation feature. The system will generate professional invoices with company branding, client information, and itemized line items. The implementation will use a PDF generation library to create downloadable invoices that can be triggered from the existing payment interface.

## Architecture

The invoice generation system follows a layered architecture:

1. **API Layer**: Next.js API route that handles invoice generation requests
2. **Service Layer**: Invoice generation service that orchestrates data retrieval and PDF creation
3. **Data Layer**: Invoice data models and database operations via Prisma
4. **PDF Generation Layer**: PDF creation using jspdf library
5. **Storage Layer**: Company settings configuration (initially hardcoded, later configurable)

### Component Interaction Flow

```
User clicks "Download Invoice" 
  → Frontend calls API endpoint with invoice ID
  → API retrieves invoice, payment, and seller data
  → Service fetches company settings
  → Service creates invoice data structure with line items
  → PDF generator creates PDF document
  → API returns PDF as downloadable blob
  → Browser triggers download
```

## Components and Interfaces

### 1. Company Settings Service

```typescript
interface CompanySettings {
  name: string;
  logo: string;
  address: string;
}

function getCompanySettings(): CompanySettings;
```

Initially, this will return hardcoded values. Future enhancement: store in database or environment variables.

### 2. Invoice Data Models

```typescript
interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: Date;
  billingDate: Date;
  company: CompanySettings;
  client: {
    businessName: string;
    contactName?: string;
    address?: string;
    email?: string;
  };
  lineItems: LineItem[];
  subtotal: number;
  total: number;
}
```

### 3. Invoice Service

```typescript
async function generateInvoiceData(invoiceId: string): Promise<InvoiceData>;
function validateLineItems(lineItems: LineItem[]): ValidationResult;
function calculateTotals(lineItems: LineItem[]): { subtotal: number; total: number };
```

### 4. PDF Generator

```typescript
function generateInvoicePDF(invoiceData: InvoiceData): Blob;
```

### 5. API Endpoint

```typescript
// app/api/invoices/[id]/download/route.ts
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse>
```

## Data Models

### Database Schema Updates

Update the Invoice model to store line items as JSON:

```prisma
model Invoice {
  id            String   @id @default(cuid())
  paymentId     String
  payment       Payment  @relation(fields: [paymentId], references: [id], onDelete: Cascade)
  invoiceNumber String   @unique
  pdfUrl        String?
  lineItemsJson String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

### Line Items Storage

Line items will be stored as JSON in the lineItemsJson field. For the initial implementation, we'll create default line items based on the payment amount.

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Company branding inclusion

*For any* invoice data with company settings, the generated PDF output should contain the company logo reference, company name, and company address.
**Validates: Requirements 1.1, 1.2, 1.3**

### Property 2: Client information inclusion

*For any* invoice data with seller information, the generated PDF output should contain the sellers business name, and if available, contact name, address, and email.
**Validates: Requirements 2.1, 2.2, 2.3, 2.4**

### Property 3: Line item calculation correctness

*For any* line item with quantity Q and unit price P, the calculated line total should equal Q times P.
**Validates: Requirements 3.2**

### Property 4: Subtotal calculation correctness

*For any* collection of line items, the calculated subtotal should equal the sum of all line item totals.
**Validates: Requirements 3.3**

### Property 5: Total matches payment amount

*For any* invoice generated from a payment, the displayed total should equal the payment amount.
**Validates: Requirements 3.4**

### Property 6: Invalid quantity rejection

*For any* line item with quantity less than or equal to zero, the validation should reject the line item and return an error.
**Validates: Requirements 3.5**

### Property 7: PDF content completeness

*For any* invoice data, the generated PDF should include all invoice fields: company info, client info, line items, and totals.
**Validates: Requirements 4.2**

### Property 8: Filename format correctness

*For any* invoice with invoice number N, the download filename should match the pattern Invoice-N.pdf.
**Validates: Requirements 4.3**

### Property 9: Invoice number format

*For any* generated invoice, the invoice number should match the format INV-timestamp where timestamp is a valid number.
**Validates: Requirements 5.1**

### Property 10: Date inclusion

*For any* generated invoice, the output should contain both the invoice generation date and the payment billing date.
**Validates: Requirements 5.2, 5.3**

### Property 11: Serialization round-trip

*For any* invoice data structure, serializing to JSON and then deserializing should produce an equivalent structure with all fields preserved.
**Validates: Requirements 6.1, 6.2, 6.3**

## Error Handling

### Validation Errors

- Invalid line item quantities
- Missing required invoice data
- Missing payment or seller data

### Runtime Errors

- PDF generation failures
- Database query failures

Error responses will follow the standard API error format with error message and optional details.

## Testing Strategy

### Unit Tests

- Company settings retrieval
- Line item validation logic
- Total calculation functions
- Invoice data structure creation
- JSON serialization and deserialization

### Property-Based Tests

We will use fast-check for property-based testing in TypeScript. Each property-based test should run a minimum of 100 iterations.

Property-based tests will cover:
- Line item calculations with random quantities and prices
- Subtotal calculations with random collections of line items
- Invoice data serialization round-trips
- Filename format validation with random invoice numbers
- PDF content inclusion with random invoice data

Each property-based test must be tagged with a comment referencing the design document property in this format:
Feature: invoice-generation, Property N: property description

### Integration Tests

- End-to-end invoice generation from API call to PDF download
- Database operations for storing and retrieving invoice data
- PDF generation with complete invoice data

## Implementation Notes

### PDF Library Selection

Recommended: jspdf with jspdf-autotable for table rendering
- Lightweight and browser-compatible
- Good documentation and community support
- Supports images for logo
- Table rendering for line items

### Default Line Items

For the initial implementation, when generating an invoice, create a single default line item:
- Description: Services Rendered
- Quantity: 1
- Unit Price: Payment amount
- Total: Payment amount

Future enhancement: Allow users to add custom line items via UI.

### Company Settings

Initial implementation will use hardcoded company settings that can be configured in a constants file.

Future enhancement: Create a settings management UI and database table.

## Security Considerations

- Validate invoice ID belongs to authenticated users accessible sellers
- Sanitize all user input in line item descriptions
- Limit line item count to prevent DoS attacks (max 100 items)

## Performance Considerations

- PDF generation should complete within 2 seconds for typical invoices
- Cache company settings to avoid repeated lookups
- Consider background job processing for bulk invoice generation (future feature)

## Future Enhancements

1. Custom line items UI for adding and editing line items before generation
2. Invoice templates with different styles
3. Tax calculation and display
4. Multi-currency support
5. Email invoice directly to client
6. Bulk invoice generation
7. Invoice history and search
8. Company settings management UI
