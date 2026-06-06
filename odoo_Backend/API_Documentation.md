# Procurement Management System (PMS) API Documentation

This documentation provides comprehensive details for the PMS Backend API suite, designed to help the frontend team integrate seamlessly.

## Backend Architecture
- **Tech Stack**: Node.js, Express, TypeScript, Mongoose (MongoDB).
- **Remote Storage (Cloudinary)**: All uploaded attachments (RFQs) and system-generated PDF documents (POs and Invoices) are stored remotely on Cloudinary.
- **Authentication**: Stateless JWT token-based (`Bearer <token>`). Tokens expire in 1 day (default) and include a 7-day refresh token mechanism.
- **Global Base URL**: `http://localhost:3000/api/v1`

---

## Global API Error & Edge Cases

All error responses follow this standard format:
```json
{
  "success": false,
  "message": "Detailed error message explanation",
  "errors": { ... } // Optional object detailing validation violations
}
```

### Standard HTTP Status Codes Used:
- **`200 OK`**: Request succeeded. Returns data payload.
- **`201 Created`**: Resource successfully created.
- **`400 Bad Request`**: Input validation failed, or business logic rule violated (e.g. attempting to approve an already approved record).
- **`401 Unauthorized`**: Missing, invalid, or expired JWT token.
- **`403 Forbidden`**: Authenticated user lacks the necessary role permissions.
- **`404 Not Found`**: The requested resource does not exist.
- **`409 Conflict`**: Database constraint violation (e.g. signup with duplicate email, duplicate quotation for an RFQ).
- **`429 Too Many Requests`**: Rate limiting triggered (Max 100 requests per 15 mins for production, relaxed to 10,000 for local development/testing).

---

## 1. Authentication (`/auth`)

### 1.1 POST `/auth/signup`
- **Description**: Registers a new user.
- **Access**: Public
- **Request Body**:
  ```json
  {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@pms.com",
    "password": "Password@1234",
    "role": "admin" // Options: admin | procurement_officer | vendor | manager
  }
  ```
- **Validation Rules**:
  - `password`: Must be at least 8 characters and contain at least one uppercase letter, one lowercase letter, one number, and one special character.
  - `role`: Must be one of `admin`, `procurement_officer`, `vendor`, `manager`.
- **Edge Cases**:
  - **`400 Bad Request`**: Password too weak, role invalid, or missing required fields.
  - **`409 Conflict`**: Email is already registered.

### 1.2 POST `/auth/login`
- **Description**: Authenticates user and returns JWT token.
- **Access**: Public
- **Request Body**:
  ```json
  {
    "email": "john.doe@pms.com",
    "password": "Password@1234"
  }
  ```
- **Edge Cases**:
  - **`401 Unauthorized`**: Wrong email or password.

### 1.3 GET `/auth/me`
- **Description**: Retrieves profile info of the currently logged-in user.
- **Access**: Bearer Token required.

### 1.4 POST `/auth/forgot-password`
- **Description**: Sends a password reset email to the user.
- **Access**: Public
- **Request Body**:
  ```json
  {
    "email": "john.doe@pms.com"
  }
  ```
- **Edge Cases**:
  - **`200 OK`**: Always returns success even if the email does not exist to prevent user enumeration.

### 1.5 POST `/auth/reset-password`
- **Description**: Resets password using the token sent via email.
- **Access**: Public
- **Request Body**:
  ```json
  {
    "token": "resetTokenString...",
    "password": "NewSecurePassword@1234"
  }
  ```
- **Edge Cases**:
  - **`400 Bad Request`**: Token is invalid or expired.

### 1.6 PUT `/auth/change-password`
- **Description**: Updates the password for the currently logged-in user.
- **Access**: Bearer Token required.
- **Request Body**:
  ```json
  {
    "currentPassword": "Password@1234",
    "newPassword": "AnotherPassword@5678"
  }
  ```
- **Edge Cases**:
  - **`400 Bad Request`**: Current password does not match.

### 1.7 POST `/auth/refresh-token`
- **Description**: Renews an expired access token using refresh tokens.
- **Access**: Bearer Token required.

### 1.8 POST `/auth/logout`
- **Description**: Blacklists the current session token.
- **Access**: Bearer Token required.

---

## 2. Dashboard (`/dashboard`)
 
 ### 2.1 GET `/dashboard`
 - **Description**: Fetch role-based summary metrics, coordinate-formatted data for trends/pie charts, and paginated tables tailored for the authenticated user's role.
 - **Access**: Bearer Token (Any logged-in user).
 - **Query Parameters**:
   - `startDate` (optional): Filter analytics from this date (ISO string or YYYY-MM-DD). Defaults to 30 days ago.
   - `endDate` (optional): Filter analytics up to this date (ISO string or YYYY-MM-DD). Defaults to now.
   - `interval` (optional): `'day' | 'month' | 'year'`. Truncation interval for trend coordinates. Defaults to `'day'` if range <= 30 days, else `'month'`.
   - `page` (optional): Page number for tables (default: 1).
   - `limit` (optional): Records limit per table (default: 5).
 - **Chart Coordinates Format**:
   All charts return coordinates as objects conforming to `{ x: string, y: number, count?: number }` where `x` is the category or date label, `y` is the sum value/count, and `count` (optional) is the document count for that group.
 - **Response (Admin Role)**:
   ```json
   {
     "success": true,
     "message": "Dashboard data fetched successfully.",
     "data": {
       "role": "admin",
       "pendingApprovals": 0,
       "activeRFQs": 10,
       "analytics": {
         "totalVendors": 13,
         "totalPOs": 6,
         "monthlySpend": 1826640
       },
       "metrics": {
         "totalSpend": 1826640,
         "spendGrowthPercentage": 100,
         "totalRFQs": 10,
         "rfqGrowthPercentage": 100,
         "activeVendors": 13,
         "pendingApprovals": 0
       },
       "charts": {
         "poTrend": [{ "x": "2026-06-06", "y": 1826640, "count": 6 }],
         "invoiceTrend": [{ "x": "2026-06-06", "y": 1826640, "count": 6 }],
         "rfqStatusDistribution": [{ "x": "Published", "y": 10 }],
         "spendByVendor": [{ "x": "Acme Corp", "y": 913320 }]
       },
       "tables": {
         "recentHighValuePOs": [...],
         "topVendors": [...]
       }
     }
   }
   ```
 - **Response (Procurement Officer)**:
   Returns officer-specific `metrics` (created RFQs, active RFQs, quotes received, spend authorized), `charts` (`rfqStatusDistribution`, `rfqCreationTrend`, `quotationsReceivedTrend`), and paginated `tables.recentRFQs`.
 - **Response (Vendor)**:
   Returns vendor-specific `metrics` (assigned RFQs, quotes submitted, POs received, revenue), `charts` (`quotationStatusDistribution`, `revenueTrend`), and paginated `tables.pendingRFQs` and `tables.activePOs`.
 - **Response (Manager)**:
   Returns manager-specific `metrics` (pending approvals, approved/rejected counts, approved amount), `charts` (`approvalStatusDistribution`, `approvalTrend`), and paginated `tables.pendingApprovalsList`.

---

## 3. Vendor Management (`/vendors`)

### 3.1 POST `/vendors`
- **Description**: Creates a new vendor profile.
- **Access**: Restricted to `admin` and `procurement_officer`.
- **Request Body**:
  ```json
  {
    "companyName": "Acme Electronics",
    "category": "Electronics",
    "GSTNumber": "29ABCDE1234F1Z5",
    "email": "vendor@acme.com",
    "phone": "9876543210",
    "address": "123 Tech Park",
    "city": "Bangalore",
    "state": "Karnataka",
    "country": "India",
    "rating": 4.5
  }
  ```
- **Validation Rules**:
  - `GSTNumber`: Must match the 15-character Indian GST format (14th character must be `Z`).
  - `phone`: Must be a valid 10-digit number.
- **Edge Cases**:
  - **`400 Bad Request`**: Invalid GST format, invalid phone, or missing fields.

### 3.2 GET `/vendors`
- **Description**: Fetch all vendors (paginated & filterable).
- **Access**: Authenticated users.
- **Query Parameters**:
  - `page` (default: 1), `limit` (default: 10)
  - `category` (filter by category)
  - `status` (Active | Inactive)
  - `keyword` (fuzzy text search on company name)

---

## 4. RFQ Management (`/rfqs`)

### 4.1 POST `/rfqs`
- **Description**: Creates an RFQ in `Draft` status.
- **Access**: Restricted to `procurement_officer` and `admin`.
- **Request Body**:
  ```json
  {
    "title": "Office Supplies 2026",
    "description": "Procurement of stationeries",
    "products": [
      { "name": "Laptops", "specification": "16GB RAM", "quantity": 5 }
    ],
    "deadline": "2026-12-31T23:59:00.000Z"
  }
  ```
- **Validation**:
  - `deadline`: Must be a future ISO timestamp.
- **Edge Cases**:
  - **`400 Bad Request`**: Deadline in the past.

### 4.2 POST `/rfqs/:id/vendors`
- **Description**: Assigns vendors to an RFQ. This transitions the RFQ status to `Published`.
- **Access**: Restricted to `procurement_officer` and `admin`.
- **Request Body**:
  ```json
  {
    "vendorIds": ["6a23a4aa4f28eb975eace040"]
  }
  ```
- **Edge Cases**:
  - **`404 Not Found`**: RFQ ID not found.

### 4.3 POST `/rfqs/:id/attachment`
- **Description**: Uploads a document attachment for the RFQ. The file is uploaded directly to Cloudinary remote storage, and the local temporary file is automatically cleaned up from the server disk.
- **Access**: Restricted to `procurement_officer` and `admin`.
- **Request Body**: Multipart form data with key `file`.
- **Response**:
  ```json
  {
    "success": true,
    "message": "Attachment uploaded successfully.",
    "data": {
      "_id": "rfqId...",
      "attachments": ["https://res.cloudinary.com/daaoeufe5/image/upload/v1234/pms/attachment.pdf"]
    }
  }
  ```

---

## 5. Quotation Management (`/quotations`)

### 5.1 POST `/quotations`
- **Description**: Submits a quote for an RFQ.
- **Access**: Restricted to `vendor`.
- **Request Body**:
  ```json
  {
    "rfqId": "rfqIdHere...",
    "pricing": [
      { "productName": "Laptops", "unitPrice": 45000, "quantity": 5, "totalPrice": 225000 }
    ],
    "deliveryTimeline": 14,
    "notes": "Price includes 1-year warranty"
  }
  ```
- **Edge Cases**:
  - **`409 Conflict`**: Vendor has already submitted a quotation for this RFQ.

### 5.2 GET `/comparisons/:rfqId`
- **Description**: Compares all quotations submitted for an RFQ. Automatically calculates lowest price, fastest delivery, and highest vendor ratings.
- **Access**: Restricted to `procurement_officer`, `manager`, and `admin`.
- **Query Params**:
  - `sortBy`: `price` | `delivery` | `rating`

---

## 6. Approval Workflow (`/approvals`)

### 6.1 POST `/approvals`
- **Description**: Submits a quotation approval request. Status defaults to `Pending`.
- **Access**: Restricted to `procurement_officer`.

### 6.2 PUT `/approvals/:id/approve`
- **Description**: Approves the quotation request.
- **Access**: Restricted to `manager` and `admin`.
- **Request Body**:
  ```json
  { "remarks": "Approved. Fits budget" }
  ```
- **Edge Cases**:
  - **`400 Bad Request`**: Attempting to approve an already approved/rejected approval.

---

## 7. Purchase Orders & Invoices

### 7.1 POST `/purchase-orders`
- **Description**: Generates a PO for an approved quotation. Automatically generates a PO PDF and uploads it to Cloudinary.
- **Access**: Restricted to `procurement_officer` and `admin`.
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "poId...",
      "poNumber": "PO-20260606-0001",
      "pdfUrl": "https://res.cloudinary.com/daaoeufe5/image/upload/v1234/pms/PO-20260606-0001.pdf",
      "status": "Generated"
    }
  }
  ```

### 7.2 GET `/purchase-orders/:id/pdf`
- **Description**: Returns the generated PO PDF. If the PDF was already uploaded to Cloudinary, it downloads and streams the remote buffer back (preserving headers); otherwise, it falls back to local generation.
- **Headers Returned**:
  - `Content-Type`: `application/pdf`
  - `Content-Disposition`: `attachment; filename="PO-xxxx.pdf"`

### 7.3 POST `/invoices`
- **Description**: Generates an Invoice from a PO. Automatically uploads the generated Invoice PDF to Cloudinary.
- **Access**: Restricted to `procurement_officer` and `admin`.
