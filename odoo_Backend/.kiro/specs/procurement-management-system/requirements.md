# Procurement Management System — Requirements

## Overview

Build a complete, production-ready Procurement Management System (PMS) backend API on top of the existing Express/TypeScript/MongoDB boilerplate. The system manages the full procurement lifecycle: RFQ creation → vendor quotation submission → quotation comparison → approval → Purchase Order generation → Invoice generation → analytics & audit logs.

The existing codebase provides a solid foundation: JWT auth, RBAC middleware, soft-delete, pagination, DTOs, response formatting, error handling, and CI/CD. All procurement domain logic is to be built on top of it.

---

## Requirements

### REQ-1: Authentication & User Management

**REQ-1.1** The system SHALL support user signup via `POST /api/v1/auth/signup` accepting `firstName`, `lastName`, `email`, `password`, and `role` fields, with email uniqueness validation and minimum 8-character strong password enforcement.

**REQ-1.2** The system SHALL support user login via `POST /api/v1/auth/login` returning a JWT access token, refresh token, and safe user fields (no password).

**REQ-1.3** The system SHALL support logout via `POST /api/v1/auth/logout` that clears the HTTP-only cookie and invalidates the refresh token.

**REQ-1.4** The system SHALL support forgot-password via `POST /api/v1/auth/forgot-password` that generates a hashed reset token, stores its expiry, and sends a reset link to the user's email.

**REQ-1.5** The system SHALL support password reset via `POST /api/v1/auth/reset-password` that validates the token, checks expiry, and updates the password.

**REQ-1.6** The system SHALL support change-password via `PUT /api/v1/auth/change-password` for authenticated users, requiring current password verification.

**REQ-1.7** The system SHALL expose `GET /api/v1/auth/me` returning the current authenticated user's profile.

**REQ-1.8** The system SHALL support JWT refresh tokens via `POST /api/v1/auth/refresh-token`.

**REQ-1.9** The existing `ROLES` constant SHALL be updated to define four procurement-specific roles: `admin`, `procurement_officer`, `vendor`, `manager`. The old generic roles (`staff`, `user`, `guest`, `super_admin`) may be retained for backward compatibility but the new roles drive RBAC for all procurement routes.

---

### REQ-2: Role-Based Access Control (RBAC)

**REQ-2.1** The `admin` role SHALL have full access: manage users, manage vendors, view reports, view analytics, manage all RFQs, manage approvals, view logs.

**REQ-2.2** The `procurement_officer` role SHALL be able to: create/update RFQs, assign vendors to RFQs, compare quotations, generate Purchase Orders, generate Invoices.

**REQ-2.3** The `vendor` role SHALL be able to: view only their assigned RFQs, submit/update quotations (before deadline), view their own Purchase Orders.

**REQ-2.4** The `manager` role SHALL be able to: approve/reject RFQs (via the approval workflow), add remarks, monitor procurement workflows.

**REQ-2.5** The `AuthMiddleware.restrictTo()` SHALL be used on every route to enforce role boundaries. Unauthenticated requests SHALL return 401. Unauthorized role access SHALL return 403.

---

### REQ-3: Dashboard

**REQ-3.1** `GET /api/v1/dashboard` SHALL return role-specific summary data including: pending approvals count, active RFQs count, recent purchase orders (last 5), recent invoices (last 5), and analytics cards (total spend this month, vendor count, PO count).

**REQ-3.2** Dashboard data SHALL be filtered by the requesting user's role — vendors see only their own data, managers see pending approvals relevant to them, procurement officers see their own RFQs.

---

### REQ-4: Vendor Management

**REQ-4.1** A `Vendor` document SHALL contain: `companyName`, `vendorCode` (auto-generated, unique), `category`, `GSTNumber`, `email`, `phone`, `address`, `city`, `state`, `country`, `rating` (0–5), `status` (`Active` | `Inactive` | `Blacklisted`), `isDeleted`, timestamps.

**REQ-4.2** `POST /api/v1/vendors` (admin/procurement_officer) SHALL create a new vendor, auto-generating a unique `vendorCode` in the format `VND-YYYYMMDD-XXXX`.

**REQ-4.3** `GET /api/v1/vendors` SHALL return a paginated, sortable list of vendors supporting query filters: `category`, `rating`, `status`, `keyword` (name/email full-text).

**REQ-4.4** `GET /api/v1/vendors/:id` SHALL return a single vendor by ID.

**REQ-4.5** `PUT /api/v1/vendors/:id` (admin/procurement_officer) SHALL update vendor fields.

**REQ-4.6** `DELETE /api/v1/vendors/:id` (admin) SHALL soft-delete a vendor.

**REQ-4.7** `GET /api/v1/vendors/search` SHALL support searching by `category`, `rating`, `status`, `keyword` with pagination.

**REQ-4.8** GST number SHALL be validated against the Indian GST format: `[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}` (15 characters).

---

### REQ-5: RFQ (Request for Quotation) Management

**REQ-5.1** An `RFQ` document SHALL contain: `title`, `description`, `products[]` (each with `name`, `specification`, `quantity`), `attachments[]` (file URLs), `deadline` (Date), `status` (`Draft` | `Published` | `Closed` | `Cancelled`), `createdBy` (User ref), `assignedVendors[]` (Vendor refs), timestamps.

**REQ-5.2** `POST /api/v1/rfqs` (procurement_officer/admin) SHALL create a new RFQ in `Draft` status.

**REQ-5.3** `GET /api/v1/rfqs` SHALL return paginated RFQs. Procurement officers see their own; admins see all; vendors see only RFQs they are assigned to.

**REQ-5.4** `GET /api/v1/rfqs/:id` SHALL return a single RFQ with populated vendor and creator fields.

**REQ-5.5** `PUT /api/v1/rfqs/:id` (procurement_officer/admin) SHALL update RFQ fields. A `Closed` or `Cancelled` RFQ SHALL NOT be editable (return 400).

**REQ-5.6** `DELETE /api/v1/rfqs/:id` (admin) SHALL soft-delete an RFQ. A deleted RFQ SHALL NOT accept new quotations.

**REQ-5.7** `POST /api/v1/rfqs/:id/vendors` SHALL assign one or more vendors to an RFQ, setting it to `Published` status if in `Draft`.

**REQ-5.8** `POST /api/v1/rfqs/:id/attachments` SHALL accept multipart file upload (Multer) and store the file URL in the RFQ's `attachments[]` array.

**REQ-5.9** `PUT /api/v1/rfqs/:id/close` SHALL set RFQ status to `Closed`.

**REQ-5.10** The RFQ `deadline` SHALL be validated — it cannot be a past date.

---

### REQ-6: Quotation Management

**REQ-6.1** A `Quotation` document SHALL contain: `rfqId` (RFQ ref), `vendorId` (Vendor ref), `pricing[]` (each with `productName`, `unitPrice`, `quantity`, `totalPrice`), `deliveryTimeline` (number of days), `notes`, `submittedAt`, `status` (`Draft` | `Submitted` | `Withdrawn`), timestamps.

**REQ-6.2** `POST /api/v1/quotations` (vendor) SHALL submit a quotation. The vendor MUST be assigned to the RFQ. Submission SHALL be blocked if the RFQ deadline has passed. One quotation per vendor per RFQ (unique constraint).

**REQ-6.3** `PUT /api/v1/quotations/:id` (vendor) SHALL update a quotation. Updates SHALL be blocked if the RFQ deadline has passed or if quotation is `Withdrawn`.

**REQ-6.4** `PUT /api/v1/quotations/:id/withdraw` (vendor) SHALL set quotation status to `Withdrawn`.

**REQ-6.5** `GET /api/v1/quotations/vendor` SHALL return all quotations submitted by the authenticated vendor.

**REQ-6.6** `GET /api/v1/quotations/rfq/:rfqId` (procurement_officer/admin/manager) SHALL return all quotations for an RFQ.

---

### REQ-7: Quotation Comparison

**REQ-7.1** `GET /api/v1/comparisons/:rfqId` (procurement_officer/admin/manager) SHALL return a structured comparison of all `Submitted` quotations for an RFQ.

**REQ-7.2** The comparison response SHALL include: vendor list, side-by-side pricing per product, delivery timelines, vendor ratings.

**REQ-7.3** The comparison engine SHALL automatically annotate: lowest total price (highlight), fastest delivery, highest-rated vendor.

**REQ-7.4** The comparison SHALL support sorting by `price`, `delivery`, or `rating` and filtering by vendor.

---

### REQ-8: Approval Workflow

**REQ-8.1** An `Approval` document SHALL contain: `rfqId`, `quotationId`, `approverId` (User ref), `remarks`, `status` (`Pending` | `Approved` | `Rejected`), `approvedAt`, timestamps.

**REQ-8.2** `POST /api/v1/approvals` (procurement_officer/admin) SHALL create an approval request for a specific quotation. The status defaults to `Pending`.

**REQ-8.3** `PUT /api/v1/approvals/:id/approve` (manager/admin) SHALL approve a request, set `status` to `Approved`, record `approvedAt`, and optionally save `remarks`.

**REQ-8.4** `PUT /api/v1/approvals/:id/reject` (manager/admin) SHALL reject a request, set `status` to `Rejected`, and require `remarks`.

**REQ-8.5** `GET /api/v1/approvals/:id/timeline` SHALL return the full approval history for an approval document.

**REQ-8.6** Only `manager` and `admin` roles SHALL be able to approve or reject. Non-managers attempting approval SHALL receive 403.

**REQ-8.7** A `Rejected` approval SHALL block PO generation from the associated quotation.

**REQ-8.8** Approval history SHALL be immutable — approved/rejected records SHALL NOT be modifiable.

---

### REQ-9: Purchase Order Generation

**REQ-9.1** A `PurchaseOrder` document SHALL contain: `poNumber` (auto-generated `PO-YYYYMMDD-XXXX`), `vendorId`, `rfqId`, `quotationId`, `approvalId`, `items[]` (from quotation pricing), `subtotal`, `tax`, `total`, `status` (`Generated` | `Sent` | `Accepted` | `Closed`), timestamps.

**REQ-9.2** `POST /api/v1/purchase-orders` (procurement_officer/admin) SHALL generate a PO only from an `Approved` quotation. Attempting to create a PO from a `Rejected` or `Pending` quotation SHALL return 400.

**REQ-9.3** `GET /api/v1/purchase-orders/:id` SHALL return a single PO with fully populated vendor, RFQ, quotation fields.

**REQ-9.4** `GET /api/v1/purchase-orders/:id/pdf` SHALL generate and stream a PDF of the PO using PDFKit or Puppeteer.

**REQ-9.5** `POST /api/v1/purchase-orders/:id/email` SHALL send the PO as an email attachment to the vendor's email.

**REQ-9.6** `poNumber` SHALL be auto-generated, unique, and follow the format `PO-YYYYMMDD-XXXX` where XXXX is a zero-padded sequential counter per day.

---

### REQ-10: Invoice Generation

**REQ-10.1** An `Invoice` document SHALL contain: `invoiceNumber` (auto-generated `INV-YYYYMMDD-XXXX`), `poId` (PO ref), `vendorId`, `items[]`, `subtotal`, `taxRate`, `tax`, `total`, `status` (`Draft` | `Sent` | `Paid` | `Cancelled`), `dueDate`, timestamps.

**REQ-10.2** `POST /api/v1/invoices` (procurement_officer/admin) SHALL generate an Invoice only from an existing PO. Tax SHALL be auto-calculated. Total SHALL be `subtotal + tax`.

**REQ-10.3** `GET /api/v1/invoices/:id` SHALL return a single invoice with populated PO, vendor fields.

**REQ-10.4** `GET /api/v1/invoices/:id/pdf` SHALL generate and stream a PDF invoice.

**REQ-10.5** `POST /api/v1/invoices/:id/email` SHALL send the invoice PDF to the vendor via email.

**REQ-10.6** `PUT /api/v1/invoices/:id/paid` (admin/procurement_officer) SHALL mark the invoice as `Paid`.

**REQ-10.7** `invoiceNumber` SHALL follow the format `INV-YYYYMMDD-XXXX`.

---

### REQ-11: Notifications

**REQ-11.1** A `Notification` document SHALL contain: `recipientId` (User ref), `title`, `message`, `type` (`RFQ` | `APPROVAL` | `INVOICE` | `PO`), `readStatus` (boolean), `relatedId` (polymorphic ref), timestamps.

**REQ-11.2** Notifications SHALL be automatically created on these events:
- RFQ published → notify assigned vendors
- Quotation submitted → notify procurement officer
- Approval created → notify assigned manager
- Approval approved/rejected → notify procurement officer
- PO generated → notify vendor
- Invoice generated → notify vendor

**REQ-11.3** `GET /api/v1/notifications` SHALL return all unread/all notifications for the authenticated user with pagination.

**REQ-11.4** `PUT /api/v1/notifications/:id/read` SHALL mark a notification as read.

**REQ-11.5** `PUT /api/v1/notifications/read-all` SHALL mark all of the user's notifications as read.

---

### REQ-12: Activity Logs

**REQ-12.1** An `ActivityLog` document SHALL contain: `userId`, `action` (string enum), `entityType`, `entityId`, `description`, `ipAddress`, `userAgent`, `metadata` (JSON), timestamps.

**REQ-12.2** Activity logs SHALL be created automatically for: user login, user signup, RFQ created, RFQ updated, vendor registered, quotation submitted, approval action (approve/reject), invoice generated, PO generated.

**REQ-12.3** `GET /api/v1/logs` (admin) SHALL return paginated activity logs supporting filters: `dateFrom`, `dateTo`, `userId`, `action`.

---

### REQ-13: Reports & Analytics

**REQ-13.1** `GET /api/v1/reports/vendor-performance` (admin/procurement_officer) SHALL return per-vendor stats: total quotations, win rate, average price, average delivery time, rating.

**REQ-13.2** `GET /api/v1/reports/procurement-summary` SHALL return: total RFQs, total POs, total invoices, total spend, pending approvals count, vendor count.

**REQ-13.3** `GET /api/v1/reports/monthly-trends` SHALL return monthly breakdown of RFQs created, POs generated, invoices raised, and total spend for the last 12 months.

**REQ-13.4** `GET /api/v1/reports/spend-analysis` SHALL return spending breakdown by vendor category, month, and individual vendor.

**REQ-13.5** `GET /api/v1/reports/export` SHALL support exporting report data in CSV format (JSON by default, CSV via `?format=csv`).

---

### REQ-14: Validation

**REQ-14.1** Every request body SHALL be validated using Joi + express-validation. Invalid requests SHALL return 400 with structured error details.

**REQ-14.2** All MongoDB ObjectId params SHALL be validated with the regex `/^[0-9a-fA-F]{24}$/`.

**REQ-14.3** Specific validations SHALL be enforced:
- Email: valid format, lowercase
- GST number: 15-character Indian GST format
- Phone: 10-digit numeric
- Password: min 8 chars, at least 1 uppercase, 1 number, 1 special char
- Prices: non-negative numbers
- Quantities: positive integers
- Dates: ISO 8601, not in the past for deadlines

---

### REQ-15: Security

**REQ-15.1** All passwords SHALL be hashed with bcryptjs (salt rounds 12) before storage. Passwords SHALL never appear in API responses.

**REQ-15.2** JWT access tokens SHALL expire in 1 day; refresh tokens SHALL expire in 7 days. Both SHALL be signed with `config.JWT_SECRET`.

**REQ-15.3** HTTP-only secure cookies SHALL be used for token transport in browser clients.

**REQ-15.4** `helmet` SHALL be installed and applied to the Express app for HTTP security headers.

**REQ-15.5** Mongo query injection SHALL be prevented by using Mongoose typed schemas and rejecting plain-string queries in filter objects.

**REQ-15.6** The rate limiter SHALL remain at 100 req/15 min globally. Auth routes SHALL have a stricter limiter: 10 req/15 min.

---

### REQ-16: Infrastructure & Developer Experience

**REQ-16.1** `nodemailer` SHALL be fully wired with SMTP config from environment variables (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM`).

**REQ-16.2** `multer` SHALL be installed and wired for RFQ attachment uploads (disk storage or memory buffer for S3 forwarding, max 10MB per file, allowed types: PDF, JPEG, PNG, DOCX).

**REQ-16.3** `pdfkit` or `puppeteer` SHALL be installed and used for PDF generation of POs and Invoices.

**REQ-16.4** `swagger-jsdoc` and `swagger-ui-express` SHALL be installed and configured at `GET /api/docs`.

**REQ-16.5** A comprehensive `.env.example` SHALL document every required and optional environment variable.

**REQ-16.6** A seed script at `scripts/seedData.ts` SHALL create sample admin, procurement officer, vendor, and manager users, sample vendors, and sample RFQs for development use.

**REQ-16.7** A `README.md` SHALL document: project setup, environment variables, npm scripts, API overview, role matrix, and deployment guide for Render.

---

### REQ-17: Error Handling & Response Format

**REQ-17.1** All success responses SHALL use the existing `ResponseFormatter.send()` format: `{ success: true, message, data, meta }`.

**REQ-17.2** All error responses SHALL follow: `{ success: false, message, errors?: [] }`.

**REQ-17.3** The existing `GlobalMiddleware.handleError` and `ErrorParser.parse()` SHALL handle all domain errors — no unhandled promise rejections in controllers.

**REQ-17.4** HTTP status codes SHALL be used semantically: 200 (OK), 201 (Created), 400 (Bad Request/Validation), 401 (Unauthenticated), 403 (Forbidden), 404 (Not Found), 409 (Conflict/Duplicate), 422 (Unprocessable), 429 (Rate Limited), 500 (Server Error).

---

### REQ-18: Database

**REQ-18.1** All Mongoose models SHALL use the existing `baseSchemaDefinition` (isActive, isDeleted) and `softDeletePlugin`.

**REQ-18.2** All models SHALL have `{ timestamps: true }` enabled.

**REQ-18.3** Database indexes SHALL be defined for all frequently queried fields: `email` (unique), `vendorCode` (unique), `rfqId`, `vendorId`, `status`, `createdAt`, `deadline`, `poNumber` (unique), `invoiceNumber` (unique).

**REQ-18.4** Soft-delete SHALL be the default deletion strategy — no hard deletes in production flows.
