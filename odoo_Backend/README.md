# Procurement Management System — API

A production-ready Node.js + Express + TypeScript + MongoDB backend for end-to-end procurement lifecycle management.

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy env file and fill in values
cp .env.example .env.development

# 3. Run in development
npm run dev

# 4. Seed sample data
node --import tsx scripts/seedData.ts
```

API docs available at: `http://localhost:3000/api/docs`

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `PORT` | No (default 3000) | HTTP port |
| `NODE_ENV` | No | `development` / `production` |
| `MONGO_URI` | **Yes** | MongoDB Atlas connection string |
| `JWT_SECRET` | **Yes** | JWT signing secret |
| `JWT_EXPIRES_IN` | No (default 1d) | Access token expiry |
| `JWT_REFRESH_SECRET` | No | Refresh token secret |
| `JWT_REFRESH_EXPIRES_IN` | No (default 7d) | Refresh token expiry |
| `SMTP_HOST` | No | SMTP server host |
| `SMTP_PORT` | No | SMTP port (587) |
| `SMTP_USER` | No | SMTP username |
| `SMTP_PASS` | No | SMTP password |
| `EMAIL_FROM` | No | Sender email address |
| `FRONTEND_URL` | No | Frontend URL for reset links |
| `TAX_RATE` | No (default 18) | Default GST tax rate % |

---

## API Overview

All procurement routes are under `/api/v1` and require a `Bearer <token>` Authorization header.

| Module | Base Path |
|---|---|
| Auth | `/api/v1/auth` |
| Dashboard | `/api/v1/dashboard` |
| Vendors | `/api/v1/vendors` |
| RFQs | `/api/v1/rfqs` |
| Quotations | `/api/v1/quotations` |
| Comparisons | `/api/v1/comparisons` |
| Approvals | `/api/v1/approvals` |
| Purchase Orders | `/api/v1/purchase-orders` |
| Invoices | `/api/v1/invoices` |
| Notifications | `/api/v1/notifications` |
| Activity Logs | `/api/v1/logs` |
| Reports | `/api/v1/reports` |

---

## Role-Permission Matrix

| Endpoint | admin | procurement_officer | vendor | manager |
|---|---|---|---|---|
| Create Vendor | ✅ | ✅ | ❌ | ❌ |
| Delete Vendor | ✅ | ❌ | ❌ | ❌ |
| Create RFQ | ✅ | ✅ | ❌ | ❌ |
| Assign Vendors to RFQ | ✅ | ✅ | ❌ | ❌ |
| Submit Quotation | ❌ | ❌ | ✅ | ❌ |
| View Quotation Comparison | ✅ | ✅ | ❌ | ✅ |
| Create Approval Request | ✅ | ✅ | ❌ | ❌ |
| Approve/Reject | ✅ | ❌ | ❌ | ✅ |
| Generate PO | ✅ | ✅ | ❌ | ❌ |
| Generate Invoice | ✅ | ✅ | ❌ | ❌ |
| View Logs | ✅ | ❌ | ❌ | ❌ |
| View Reports | ✅ | ✅ | ❌ | ❌ |

---

## Basic Workflow

1. `POST /api/v1/rfqs` — Procurement Officer creates an RFQ
2. `POST /api/v1/rfqs/:id/vendors` — Assign vendors (RFQ becomes Published; vendors notified)
3. `POST /api/v1/quotations` — Vendor submits a quotation
4. `GET /api/v1/comparisons/:rfqId` — Compare quotations side-by-side
5. `POST /api/v1/approvals` — Create approval request
6. `PUT /api/v1/approvals/:id/approve` — Manager approves
7. `POST /api/v1/purchase-orders` — Generate PO from approved quotation
8. `POST /api/v1/invoices` — Generate Invoice from PO
9. `GET /api/v1/invoices/:id/pdf` — Download invoice PDF
10. `POST /api/v1/invoices/:id/email` — Email invoice to vendor

---

## Seed Credentials

After running `node --import tsx scripts/seedData.ts`:

| Role | Email | Password |
|---|---|---|
| Admin | admin@pms.com | Admin@1234 |
| Procurement Officer | officer@pms.com | Officer@1234 |
| Vendor | vendor@acme.com | Vendor@1234 |
| Manager | manager@pms.com | Manager@1234 |

---

## Deployment (Render)

1. Connect your GitHub repo to Render
2. Set **Build Command**: `npm install && npm run build`
3. Set **Start Command**: `npm start`
4. Add all environment variables in the Render dashboard
5. Set `NODE_ENV=production`

---

## Tech Stack

- **Runtime**: Node.js with ESM modules
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB Atlas + Mongoose
- **Auth**: JWT (access + refresh tokens), bcryptjs
- **File Uploads**: Multer (disk storage)
- **PDF Generation**: PDFKit
- **Email**: Nodemailer
- **Validation**: Joi + express-validation
- **Security**: Helmet, rate-limiter, CORS
- **Docs**: Swagger UI at `/api/docs`
- **Logging**: Winston + Morgan
