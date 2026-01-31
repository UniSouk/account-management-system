# Invoice Customization Guide

## Overview

The invoice generation feature uses the `pdfkit` npm package to create PDF invoices dynamically.

## Location

- API Route: `app/api/invoices/[id]/download/route.ts`
- UI Integration: `app/sellers/[id]/page.tsx`

## Customizing Your Invoice

### 1. Company Information

Edit the company details in `app/api/invoices/[id]/download/route.ts` (around line 40):

```typescript
doc
  .fontSize(10)
  .text("Your Company Name", { continued: false }) // Change this
  .fontSize(9)
  .text("123 Business Street") // Change this
  .text("City, State 12345") // Change this
  .text("Email: contact@company.com") // Change this
  .text("Phone: (123) 456-7890"); // Change this
```

### 2. Adding a Company Logo

To add a logo, add this code after creating the PDFDocument (around line 35):

```typescript
// Add logo (make sure the image file exists in your public folder)
doc.image("public/logo.png", 50, 45, { width: 100 });
doc.moveDown(3);
```

### 3. Customizing Colors and Styling

PDFKit supports various styling options:

```typescript
// Change text color
doc.fillColor("#333333").text("Your text");

// Add colored rectangles
doc.rect(50, 100, 500, 30).fill("#f0f0f0");

// Change font
doc.font("Helvetica-Bold").text("Bold text");
```

### 4. Adding More Line Items

Currently, the invoice shows a single payment line. To add more items, modify the table section (around line 100).

## How It Works

1. User clicks "Generate Invoice" button on a payment
2. System creates an invoice record in the database
3. User clicks "Download Invoice" button
4. API fetches invoice, payment, and seller data
5. PDFKit generates a PDF with all the information
6. PDF is downloaded to the user's computer

## Testing

1. Go to a seller's detail page
2. Add a payment if none exists
3. Click "Generate Invoice"
4. Click "Download Invoice" to get the PDF

## Dependencies

- `pdfkit`: PDF generation library
- `@types/pdfkit`: TypeScript types for pdfkit
