# PMS & ERP - Exhaustive API Specifications, Pagination, Filters & Test Scenarios

This document serves as the absolute guide for the frontend team, detailing every API endpoint, its required headers, request query filters, pagination options, raw body JSON schemas, successful output payloads, and a comprehensive suite of edge-case test scenarios.

---

## Table of Contents
1. [Global Configuration & Headers](#global-configuration--headers)
2. [Authentication & Profile APIs (`/auth`)](#1-authentication--profile-apis-auth)
3. [Dashboard Analytics APIs (`/dashboard`)](#2-dashboard-analytics-apis-dashboard)
4. [Vendor Management APIs (`/vendors`)](#3-vendor-management-apis-vendors)
5. [RFQ Management APIs (`/rfqs`)](#4-rfq-management-apis-rfqs)
6. [Quotation Management APIs (`/quotations`)](#5-quotation-management-apis-quotations)
7. [Quotation Comparison APIs (`/comparisons`)](#6-quotation-comparison-apis-comparisons)
8. [Approval Workflow APIs (`/approvals`)](#7-approval-workflow-apis-approvals)
9. [Purchase Order APIs (`/purchase-orders`)](#8-purchase-order-apis-purchase-orders)
10. [Invoice Management APIs (`/invoices`)](#9-invoice-management-apis-invoices)
11. [Notifications & Logs APIs](#10-notifications--logs-apis)
12. [Reports & Analytics APIs (`/reports`)](#11-reports--analytics-apis-reports)

---

## Global Configuration & Headers

* **Base URL**: `http://localhost:3000/api/v1`
* **Common Headers**:
  * `Content-Type`: `application/json` (for POST/PUT)
  * `Authorization`: `Bearer {{token}}` (where `token` corresponds to the role-specific JWT: `admin_token`, `officer_token`, `vendor_token`, or `employee_token`)

---

## 1. Authentication & Profile APIs (`/auth`)

### 1.1 Signup (`POST /auth/signup`)
* **Description**: Registers a new system user.
* **Role Permissions**: Public
* **Request Body Schema**:
  ```json
  {
    "firstName": "Jane", // string, required
    "lastName": "Doe",   // string, required
    "email": "jane.doe@erp.com", // string (valid email), required
    "password": "Password@123", // string, required (regex: min 8 chars, 1 upper, 1 number, 1 special)
    "role": "procurement_officer", // string, optional (admin | procurement_officer | vendor | manager)
    "photo": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde", // string (image URL or base64 data URL), optional
    "phone": "9876543210", // string, optional
    "country": "India", // string, optional
    "additionalInfo": "Procurement officer profile details" // string, optional
  }
  ```
* **Success Output (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Account created successfully.",
    "data": {
      "user": {
        "id": "6a23a4aa4f28eb975eace040",
        "firstName": "Jane",
        "lastName": "Doe",
        "email": "jane.doe@erp.com",
        "role": "procurement_officer",
        "photo": "https://res.cloudinary.com/daaoeufe5/image/upload/v1780721661/avatars/avatar.jpg",
        "phone": "9876543210",
        "country": "India",
        "additionalInfo": "Procurement officer profile details"
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```
* **Test Scenarios**:
  * **TC_AUTH_01 (Success)**: Register with all valid inputs.
  * **TC_AUTH_02 (Weak Password)**: Pass `password` as `"12345"` $\rightarrow$ `400 Bad Request` (`Password must be at least 8 characters...`).
  * **TC_AUTH_03 (Duplicate Email)**: Register again with `"jane.doe@erp.com"` $\rightarrow$ `409 Conflict` (`Email already in use.`).
  * **TC_AUTH_06 (Pasted Photo / Base64)**: Register with `photo` starting with `data:image/` $\rightarrow$ `201 Created` (automatically uploads to Cloudinary and saves secure URL).
  * **TC_AUTH_07 (Standard URL Photo)**: Register with standard HTTPS image URL in `photo` $\rightarrow$ `201 Created` (saves raw URL directly).

---

### 1.2 Login (`POST /auth/login`)
* **Description**: Authenticates user credentials.
* **Role Permissions**: Public
* **Request Body Schema**:
  ```json
  {
    "email": "jane.doe@erp.com", // required
    "password": "Password@123" // required
  }
  ```
* **Success Output (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Login successful.",
    "data": {
      "user": {
        "id": "6a23a4aa4f28eb975eace040",
        "firstName": "Jane",
        "lastName": "Doe",
        "email": "jane.doe@erp.com",
        "role": "procurement_officer"
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```
* **Test Scenarios**:
  * **TC_AUTH_04 (Success)**: Login with correct credentials.
  * **TC_AUTH_05 (Invalid Password)**: Pass correct email but wrong password $\rightarrow$ `401 Unauthorized` (`Invalid email or password.`).

---

## 2. Dashboard Analytics APIs (`/dashboard`)

### 2.1 Get Dashboard (`GET /dashboard`)
* **Description**: Returns summary cards, coordinates for trends, status distribution pie charts, and paginated listings.
* **Role Permissions**: All Authenticated Roles (data changes dynamically based on role).
* **Request Query Filters**:
  * `startDate` (optional): ISO date format (`YYYY-MM-DD`). Defaults to 30 days ago.
  * `endDate` (optional): ISO date format (`YYYY-MM-DD`). Defaults to now.
  * `interval` (optional): `'day' | 'month' | 'year'`. Truncates coordinates. Defaults to `'day'` if range <= 30 days, else `'month'`.
  * `page` (optional): Pagination index for tables. Defaults to `1`.
  * `limit` (optional): Pagination size. Defaults to `5`.
* **Success Output - Admin (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Dashboard data fetched successfully.",
    "data": {
      "role": "admin",
      "pendingApprovals": 2,
      "activeRFQs": 10,
      "analytics": {
        "totalVendors": 13,
        "totalPOs": 6,
        "monthlySpend": 1826640
      },
      "metrics": {
        "totalSpend": 1826640,
        "spendGrowthPercentage": 45,
        "totalRFQs": 10,
        "rfqGrowthPercentage": 10,
        "activeVendors": 13,
        "pendingApprovals": 2
      },
      "charts": {
        "poTrend": [
          { "x": "2026-06-01", "y": 608880, "count": 2 },
          { "x": "2026-06-06", "y": 1217760, "count": 4 }
        ],
        "invoiceTrend": [
          { "x": "2026-06-01", "y": 304440, "count": 1 },
          { "x": "2026-06-06", "y": 1522200, "count": 5 }
        ],
        "rfqStatusDistribution": [
          { "x": "Draft", "y": 2 },
          { "x": "Published", "y": 10 }
        ],
        "spendByVendor": [
          { "x": "Acme Corp", "y": 913320 },
          { "x": "Apex Logistics", "y": 608880 }
        ]
      },
      "tables": {
        "recentHighValuePOs": [
          {
            "_id": "6a23a7fb469b3f4572fb6db8",
            "poNumber": "PO-20260606-0004",
            "total": 304440,
            "status": "Sent",
            "createdAt": "2026-06-06T04:54:19.443Z"
          }
        ],
        "topVendors": [
          {
            "vendorId": "6a23a7f5469b3f4572fb6d1b",
            "companyName": "Acme Corp",
            "totalSpend": 913320,
            "poCount": 3
          }
        ]
      }
    }
  }
  ```
* **Success Output - Vendor (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Dashboard data fetched successfully.",
    "data": {
      "role": "vendor",
      "metrics": {
        "assignedRFQs": 5,
        "quotationsSubmitted": 3,
        "purchaseOrdersReceived": 2,
        "totalRevenue": 608880
      },
      "charts": {
        "quotationStatusDistribution": [
          { "x": "Approved", "y": 2 },
          { "x": "Pending", "y": 1 }
        ],
        "revenueTrend": [
          { "x": "2026-06-06", "y": 608880, "count": 2 }
        ]
      },
      "tables": {
        "pendingRFQs": [],
        "activePOs": []
      }
    }
  }
  ```
* **Test Scenarios**:
  * **TC_DASH_01 (Valid Filter)**: Fetch dashboard using `?startDate=2026-05-01&endDate=2026-06-06&interval=month` $\rightarrow$ `200 OK` (returns aggregates grouped by month).
  * **TC_DASH_02 (Unauthorized)**: Pass invalid token in header $\rightarrow$ `401 Unauthorized` (`Token is invalid or expired.`).

---

## 3. Vendor Management APIs (`/vendors`)

### 3.1 Create Vendor (`POST /vendors`)
* **Role Permissions**: Admin, Procurement Officer
* **Request Body Schema**:
  ```json
  {
    "companyName": "Acme Electronics", // string, required
    "category": "Electronics", // string, required
    "GSTNumber": "29ABCDE1234F1Z5", // string, required (exactly 15 chars, 14th is Z)
    "email": "vendor@acme.com", // string (valid email), required
    "phone": "9876543210", // string, exactly 10 digits, required
    "address": "123 Tech Park", // string, required
    "city": "Bangalore", // string, required
    "state": "Karnataka", // string, required
    "country": "India", // string, required
    "rating": 4.5 // number, 0-5, optional
  }
  ```
* **Success Output (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Vendor created successfully.",
    "data": {
      "_id": "6a23a7f5469b3f4572fb6d1b",
      "companyName": "Acme Electronics",
      "vendorCode": "VND-20260606-4029",
      "GSTNumber": "29ABCDE1234F1Z5",
      "email": "vendor@acme.com",
      "phone": "9876543210",
      "rating": 4.5
    }
  }
  ```
* **Test Scenarios**:
  * **TC_VND_01 (GST Failure)**: Submit `GSTNumber` = `"12345"` $\rightarrow$ `400 Bad Request` (`Validation failed`).
  * **TC_VND_02 (Phone Length Failure)**: Submit `phone` = `"98765"` $\rightarrow$ `400 Bad Request` (`Phone must be a valid 10-digit number`).
  * **TC_VND_03 (Role Violation)**: Try using a Vendor token $\rightarrow$ `403 Forbidden` (`You do not have permission...`).

---

### 3.2 List Vendors (`GET /vendors`)
* **Role Permissions**: All Authenticated Users
* **Request Query Filters**:
  * `page`: Defaults to `1`.
  * `limit`: Defaults to `10`.
  * `keyword` (optional): Fuzzy search on `companyName`.
  * `category` (optional): Filter on categories (e.g. `Electronics`).
  * `status` (optional): `Active | Inactive`.
* **Success Output (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Vendors fetched successfully.",
    "data": {
      "docs": [
        {
          "_id": "6a23a7f5469b3f4572fb6d1b",
          "companyName": "Acme Electronics",
          "category": "Electronics",
          "status": "Active"
        }
      ],
      "totalDocs": 1,
      "limit": 10,
      "page": 1,
      "totalPages": 1
    }
  }
  ```

---

## 4. RFQ Management APIs (`/rfqs`)

### 4.1 Create RFQ (`POST /rfqs`)
* **Role Permissions**: Admin, Procurement Officer
* **Request Body Schema**:
  ```json
  {
    "title": "Office Laptops Purchase", // string, required
    "description": "RFQ for 16GB laptops", // string, optional
    "products": [
      {
        "name": "Laptops", // string, required
        "specification": "16GB RAM, SSD", // string, optional
        "quantity": 5 // number, min 1, required
      }
    ],
    "deadline": "2026-12-31T23:59:00.000Z" // future ISO date, required
  }
  ```
* **Success Output (201 Created)**:
  ```json
  {
    "success": true,
    "message": "RFQ created successfully.",
    "data": {
      "_id": "6a23a7f5469b3f4572fb6d33",
      "title": "Office Laptops Purchase",
      "status": "Draft",
      "deadline": "2026-12-31T23:59:00.000Z",
      "createdBy": "6a23a4aa4f28eb975eace040"
    }
  }
  ```
* **Test Scenarios**:
  * **TC_RFQ_01 (Past Deadline)**: Set `deadline` = `"2020-01-01"` $\rightarrow$ `400 Bad Request` (`Deadline cannot be a past date.`).
  * **TC_RFQ_02 (Empty Products)**: Pass `products` = `[]` $\rightarrow$ `400 Bad Request` (`Validation failed`).

---

### 4.2 Update RFQ (`PUT /rfqs/:id`)
* **Role Permissions**: Admin, Procurement Officer
* **Request Body Schema**: Same as Create RFQ.
* **Test Scenarios**:
  * **TC_RFQ_03 (Closed RFQ Edit)**: Attempt to edit RFQ that has been closed $\rightarrow$ `400 Bad Request` (`Closed or cancelled RFQs cannot be edited.`).

---

### 4.3 Assign Vendors (`POST /rfqs/:id/vendors`)
* **Role Permissions**: Admin, Procurement Officer
* **Request Body Schema**:
  ```json
  {
    "vendorIds": ["6a23a7f5469b3f4572fb6d1b"] // array of ObjectIds, required
  }
  ```
* **Success Output (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Vendors assigned successfully.",
    "data": {
      "_id": "6a23a7f5469b3f4572fb6d33",
      "title": "Office Laptops Purchase",
      "status": "Published", // Automatically transitions from Draft to Published
      "assignedVendors": ["6a23a7f5469b3f4572fb6d1b"]
    }
  }
  ```

---

## 5. Quotation Management APIs (`/quotations`)

### 5.1 Submit Quotation (`POST /quotations`)
* **Role Permissions**: Vendor
* **Request Body Schema**:
  ```json
  {
    "rfqId": "6a23a7f5469b3f4572fb6d33", // string, required
    "pricing": [
      {
        "productName": "Laptops", // string, required
        "unitPrice": 45000, // number, required
        "quantity": 5, // number, required
        "totalPrice": 225000 // number, required
      }
    ],
    "deliveryTimeline": 14, // number (days), required
    "notes": "Fast shipping included" // string, optional
  }
  ```
* **Success Output (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Quotation submitted successfully.",
    "data": {
      "_id": "6a23a7f7469b3f4572fb6d58",
      "rfqId": "6a23a7f5469b3f4572fb6d33",
      "vendorId": "6a23a7f5469b3f4572fb6d1b",
      "deliveryTimeline": 14,
      "status": "Submitted"
    }
  }
  ```
* **Test Scenarios**:
  * **TC_QTN_01 (Unassigned Vendor)**: Login as a Vendor not assigned to this RFQ $\rightarrow$ `403 Forbidden` (`You are not assigned to this RFQ.`).
  * **TC_QTN_02 (Duplicate Submission)**: Submit quote again for same RFQ $\rightarrow$ `409 Conflict` (`You have already submitted a quotation for this RFQ.`).
  * **TC_QTN_03 (RFQ Deadline Passed)**: Submit quote after deadline date $\rightarrow$ `400 Bad Request` (`Submission deadline has passed.`).

---

### 5.2 Withdraw Quotation (`PUT /quotations/:id/withdraw`)
* **Role Permissions**: Vendor
* **Success Output (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Quotation withdrawn successfully.",
    "data": {
      "_id": "6a23a7f7469b3f4572fb6d58",
      "status": "Withdrawn"
    }
  }
  ```
* **Test Scenarios**:
  * **TC_QTN_04 (Update Withdrawn Quote)**: Try to edit a withdrawn quote $\rightarrow$ `400 Bad Request` (`Cannot update a withdrawn quotation.`).

---

## 6. Quotation Comparison APIs (`/comparisons`)

### 6.1 Compare RFQ Quotations (`GET /comparisons/:rfqId`)
* **Role Permissions**: Admin, Procurement Officer, Manager
* **Request Query Filters**:
  * `sortBy` (optional): `price` | `delivery` | `rating`. Defaults to `price`.
* **Success Output (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Comparison data fetched.",
    "data": {
      "quotations": [
        {
          "_id": "6a23a7f7469b3f4572fb6d58",
          "vendorId": {
            "_id": "6a23a7f5469b3f4572fb6d1b",
            "companyName": "Acme Electronics",
            "rating": 4.5
          },
          "totalCost": 225000,
          "deliveryTimeline": 14
        }
      ],
      "summary": {
        "lowestPriceQuote": "6a23a7f7469b3f4572fb6d58",
        "fastestDeliveryQuote": "6a23a7f7469b3f4572fb6d58",
        "highestRatedVendorQuote": "6a23a7f7469b3f4572fb6d58"
      }
    }
  }
  ```

---

## 7. Approval Workflow APIs (`/approvals`)

### 7.1 Approve Request (`PUT /approvals/:id/approve`)
* **Role Permissions**: Admin, Manager
* **Request Body**:
  ```json
  {
    "remarks": "Approved. Fits constraints" // string, optional
  }
  ```
* **Success Output (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Quotation approved successfully.",
    "data": {
      "_id": "6a23a7f9469b3f4572fb6d88",
      "status": "Approved",
      "remarks": "Approved. Fits constraints"
    }
  }
  ```
* **Test Scenarios**:
  * **TC_APP_01 (Double Approval)**: Call approve on an already approved workflow $\rightarrow$ `400 Bad Request` (`Approved or rejected records cannot be modified.`).

---

## 8. Purchase Order APIs (`/purchase-orders`)

### 8.1 Create Purchase Order (`POST /purchase-orders`)
* **Role Permissions**: Admin, Procurement Officer
* **Request Body**:
  ```json
  {
    "quotationId": "6a23a7f7469b3f4572fb6d58" // string (ObjectId), required
  }
  ```
* **Success Output (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Purchase order generated successfully.",
    "data": {
      "_id": "6a23a7fb469b3f4572fb6db8",
      "poNumber": "PO-20260606-0004",
      "status": "Generated",
      "pdfUrl": "https://res.cloudinary.com/daaoeufe5/image/upload/v1780721661/pms/PO-PO-20260606-0004.pdf",
      "total": 304440
    }
  }
  ```
* **Test Scenarios**:
  * **TC_PO_01 (Unapproved Quote)**: Try to generate PO for quote that is not approved $\rightarrow$ `400 Bad Request` (`Purchase order can only be generated from an approved quotation.`).

---

### 8.2 Get PO PDF (`GET /purchase-orders/:id/pdf`)
* **Role Permissions**: All Authenticated Users
* **Output Headers**:
  * `Content-Type`: `application/pdf`
  * `Content-Disposition`: `attachment; filename="PO-PO-20260606-0004.pdf"`
* **Edge Cases**:
  * **Cloudinary Hang**: If Cloudinary hangs during download, request times out after `5000ms`, falls back to local on-the-fly generation, and returns a valid PDF stream.

---

## 9. Invoice Management APIs (`/invoices`)

### 9.1 Mark Paid (`PUT /invoices/:id/paid`)
* **Role Permissions**: Admin, Procurement Officer
* **Success Output (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Invoice marked as paid.",
    "data": {
      "_id": "6a23a8d599c7bc359bdf324c",
      "status": "Paid"
    }
  }
  ```

---

## 10. Notifications & Logs APIs

### 10.1 List Notifications (`GET /notifications`)
* **Query Params**:
  * `unread`: `true | false` (optional)
  * `page` (default 1), `limit` (default 10)
* **Success Output**: Paginated list of user notifications.

### 10.2 View Logs (`GET /logs`)
* **Role Permissions**: Admin
* **Query Filters**:
  * `action` (optional, e.g. `USER_LOGIN`, `RFQ_CREATED`)
  * `dateFrom`, `dateTo` (optional)

---

## 11. Reports & Analytics APIs (`/reports`)

### 11.1 Monthly Spend Trends (`GET /reports/monthly-trends`)
* **Success Output (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Monthly trends.",
    "data": {
      "rfqTrends": [{ "x": "2026-06", "y": 10 }],
      "poTrends": [{ "x": "2026-06", "y": 1826640, "count": 6 }],
      "invoiceTrends": [{ "x": "2026-06", "y": 1826640, "count": 6 }]
    }
  }
  ```
