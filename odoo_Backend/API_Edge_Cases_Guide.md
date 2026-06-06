# Procurement Management System (PMS) - API Edge Cases & Validation Guide

This document lists every API endpoint, detailing its purpose, validation parameters, and all possible business logic edge cases. The frontend team can use this to map out error-handling routes, form validation rules, and permission checks.

---

## 1. Authentication & Session Management (`/auth`)

### 1.1 Signup (`POST /auth/signup`)
* **Validation Rules**:
  * `firstName`, `lastName`: Required strings, no special characters.
  * `email`: Required valid email, lowercased.
  * `password`: Minimum 8 characters. Must contain:
    * At least 1 uppercase letter.
    * At least 1 numerical digit.
    * At least 1 special character (e.g., `@`, `#`, `!`).
  * `role`: Must be one of: `admin`, `procurement_officer`, `vendor`, `manager`.
* **Edge Cases & Errors**:
  * **`400 Bad Request` (Validation Failed)**: If password is weak or role is invalid.
  * **`409 Conflict` (Duplicate Email)**: If email already exists in the database. Returns: `"Email already in use."`

### 1.2 Login (`POST /auth/login`)
* **Validation Rules**:
  * `email`, `password`: Required.
* **Edge Cases & Errors**:
  * **`401 Unauthorized` (Invalid Credentials)**: If email is not registered, or password does not match the database hash. Returns: `"Invalid email or password."`

### 1.3 Change Password (`PUT /auth/change-password`)
* **Validation Rules**:
  * `currentPassword`: Required.
  * `newPassword`: Required, must meet the strong password criteria (1 uppercase, 1 digit, 1 special character, min 8 characters).
* **Edge Cases & Errors**:
  * **`400 Bad Request` (Invalid Current Password)**: If the provided current password does not match the logged-in user's password. Returns: `"Current password is incorrect."`

### 1.4 Reset Password (`POST /auth/reset-password`)
* **Validation Rules**:
  * `token`: Required reset token.
  * `password`: Required new strong password.
* **Edge Cases & Errors**:
  * **`400 Bad Request` (Token Expired/Invalid)**: If the reset token has expired (expires in 10 minutes) or has already been used. Returns: `"Invalid or expired reset token."`

---

## 2. Dashboard (`GET /dashboard`)

* **Query Filters**:
  * `startDate`, `endDate`: Valid ISO date strings.
  * `interval`: Must be one of `day`, `month`, `year`.
* **Edge Cases & Errors**:
  * **`401 Unauthorized` (No Session)**: Requests fail if the Bearer token is missing, expired, or invalid.
  * **`403 Forbidden` (Role Undefined)**: Users with unspecified or malformed roles will receive a `403` error or an empty dashboard object.
  * **`200 OK` (Vendor Profile Check)**: If the user is a `vendor` but has no vendor profile linked, they will receive empty analytics/charts arrays rather than `500` errors.

---

## 3. Vendor Management (`/vendors`)

### 3.1 Create Vendor (`POST /vendors`)
* **Validation Rules**:
  * `GSTNumber`: Must match the standard 15-character Indian GSTIN format (regex: `/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/`). Crucially, the 14th character must be **Z**.
  * `phone`: Exactly 10 digits.
  * `email`: Valid unique email address.
  * `rating`: Optional number between `0` and `5`.
* **Edge Cases & Errors**:
  * **`400 Bad Request` (GST Validation)**: GST number fails format checks.
  * **`400 Bad Request` (Phone Validation)**: Phone number is not 10 digits.
  * **`409 Conflict` (Duplicate Vendor)**: GSTNumber or Email is already registered.

### 3.2 Update Vendor (`PUT /vendors/:id`)
* **Edge Cases**:
  * **`404 Not Found`**: Vendor record does not exist or has been soft-deleted.
  * **`400 Bad Request` (Invalid ID)**: The requested ID string is not a valid 24-character MongoDB ObjectId.

### 3.3 Delete Vendor (`DELETE /vendors/:id`)
* **Edge Cases**:
  * **`403 Forbidden` (Procurement Officer access)**: Soft-deletion of vendors is strictly restricted to `admin` role. Procurement Officers get a `403` response.
  * **Soft-Deleted Check**: Once deleted, the vendor's `isDeleted` flag is set to `true`. Subseqent `GET /vendors/:id` requests will return `404 Not Found`.

---

## 4. RFQ Management (`/rfqs`)

### 4.1 Create RFQ (`POST /rfqs`)
* **Validation Rules**:
  * `deadline`: Must be a valid ISO date and must be in the **future**.
  * `products`: Must contain at least one item, where each item has a `name` and `quantity` >= 1.
* **Edge Cases & Errors**:
  * **`400 Bad Request` (Past Deadline)**: If the deadline date is set in the past. Returns: `"Deadline cannot be a past date."`

### 4.2 Update RFQ (`PUT /rfqs/:id`)
* **Business Logic Edge Cases**:
  * **`400 Bad Request` (Closed/Cancelled)**: Once an RFQ's status changes to `Closed` or `Cancelled`, it becomes **immutable**. Any further edit attempts fail. Returns: `"Closed or cancelled RFQs cannot be edited."`

### 4.3 Assign Vendors (`POST /rfqs/:id/vendors`)
* **Business Logic Edge Cases**:
  * **Status Transition**: Staging an assignment transitions the RFQ from `Draft` to `Published`.
  * **`400 Bad Request` (Already Closed)**: Cannot assign vendors to a closed or cancelled RFQ.

### 4.4 Upload Attachment (`POST /rfqs/:id/attachment`)
* **Validation Rules**:
  * Must be a valid file upload (PDF, PNG, JPG, JPEG).
* **Edge Cases**:
  * **`400 Bad Request` (Unsupported Type)**: Uploading zip, exe, or script files.
  * **Cloudinary Fallback**: If remote file storage fails, the local temp file is removed, and the transaction is rolled back with a `500` error.

---

## 5. Quotation Management (`/quotations`)

### 5.1 Submit Quotation (`POST /quotations`)
* **Business Logic Edge Cases**:
  * **`403 Forbidden` (Not Assigned)**: A vendor can only submit quotations for RFQs they were explicitly assigned to (added to `assignedVendors` array). If not assigned, returns: `"You are not assigned to this RFQ."`
  * **`409 Conflict` (Duplicate Quote)**: A vendor can submit exactly **one** quote per RFQ. Submitting a second quote returns: `"You have already submitted a quotation for this RFQ."`
  * **`400 Bad Request` (Deadline Passed)**: If the current time exceeds the RFQ's deadline date, quotations are rejected. Returns: `"Submission deadline has passed."`

### 5.2 Withdraw Quotation (`PUT /quotations/:id/withdraw`)
* **Business Logic Edge Cases**:
  * **`400 Bad Request` (Cannot Update Withdrawn)**: Once a quote is withdrawn, its status changes to `Withdrawn` and it cannot be modified or re-submitted. Returns: `"Cannot update a withdrawn quotation."`

---

## 6. Approval Workflow (`/approvals`)

### 6.1 Create Approval Request (`POST /approvals`)
* **Business Logic Edge Cases**:
  * **`400 Bad Request` (Not Approved status)**: Purchase Orders (POs) and approvals can only be created from a quote that is in `Submitted` status.
  * **Role Restriction**: Only Procurement Officers can initiate approvals.

### 6.2 Approve/Reject (`PUT /approvals/:id/approve` or `/reject`)
* **Business Logic Edge Cases**:
  * **`400 Bad Request` (Remarks Required for Rejection)**: Rejections must contain a body with a `remarks` string.
  * **`400 Bad Request` (Immutable status)**: Once approved or rejected, the approval record status is locked and cannot be modified again. Returns: `"Approved or rejected records cannot be modified."`

---

## 7. Purchase Orders & Invoices

### 7.1 Generate PO (`POST /purchase-orders`)
* **Business Logic Edge Cases**:
  * **`400 Bad Request` (Unapproved Quote)**: A PO can only be generated if the associated quotation has been approved by the Manager (Approval status = `Approved`). If not approved, returns: `"Purchase order can only be generated from an approved quotation."`
  * **Cloudinary PDF Upload**: On PO generation, the PDF is generated and pushed to Cloudinary. If Cloudinary fails, the PO creation rolls back.
  * **Hanging PDF Download**: Outgoing download redirects/streams from Cloudinary have a `5000ms` connection timeout. If it times out, the backend generates the PDF on-the-fly and sends the local buffer.

### 7.2 Generate Invoice (`POST /invoices`)
* **Business Logic Edge Cases**:
  * **Role Restriction**: Invoices are generated by vendors/procurement officers.
  * **Mark Paid**: Once an invoice status transitions to `Paid`, it cannot be sent or updated.

---

## 8. General Errors

### 8.1 JWT Auth Failures (`401 Unauthorized`)
* If the `Authorization` header is missing, return: `"No token provided. Authorization denied."`
* If the token is invalid, expired, or malformed, return: `"Token is invalid or expired."`

### 8.2 Rate Limiting (`429 Too Many Requests`)
* Production API endpoints enforce a rate limit. If a user exceeds the threshold, the API blocks requests and returns: `"Too many requests from this IP, please try again after 15 minutes."`
