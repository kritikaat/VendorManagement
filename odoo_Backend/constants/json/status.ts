export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export type HttpStatus = typeof HTTP_STATUS[keyof typeof HTTP_STATUS];

// ─── Auth messages ────────────────────────────────────────────────────────────
export const AUTH_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful.',
  SIGNUP_SUCCESS: 'Account created successfully.',
  LOGOUT_SUCCESS: 'Logged out successfully.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  TOKEN_MISSING: 'No token provided. Authorization denied.',
  TOKEN_INVALID: 'Token is invalid or expired.',
  UNAUTHORIZED: 'User session not found. Please authenticate.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  PASSWORD_RESET_EMAIL: 'Password reset link sent to your email.',
  PASSWORD_RESET_SUCCESS: 'Password has been reset successfully.',
  PASSWORD_CHANGED: 'Password changed successfully.',

  // ─── OTP ───────────────────────────────────────────────────────────────────
  OTP_SENT: 'A 6-digit OTP has been sent to your email address.',
  OTP_VERIFIED: 'OTP verified successfully.',
  OTP_INVALID: 'The OTP entered is incorrect.',
  OTP_EXPIRED: 'The OTP has expired. Please request a new one.',

} as const;

// ─── Vendor messages ──────────────────────────────────────────────────────────
export const VENDOR_MESSAGES = {
  CREATED: 'Vendor created successfully.',
  UPDATED: 'Vendor updated successfully.',
  DELETED: 'Vendor deleted successfully.',
  NOT_FOUND: 'Vendor not found.',
  FETCHED: 'Vendors fetched successfully.',
  NO_LINKED_ACCOUNT: 'No vendor account linked.',
  NO_LINKED_ACCOUNT_USER: 'No vendor account linked to this user.',
} as const;

// ─── RFQ messages ─────────────────────────────────────────────────────────────
export const RFQ_MESSAGES = {
  CREATED: 'RFQ created successfully.',
  UPDATED: 'RFQ updated successfully.',
  DELETED: 'RFQ deleted successfully.',
  NOT_FOUND: 'RFQ not found.',
  FETCHED: 'RFQs fetched successfully.',
  CLOSED: 'RFQ closed successfully.',
  CANNOT_EDIT: 'Closed or cancelled RFQs cannot be edited.',
  VENDORS_ASSIGNED: 'Vendors assigned successfully.',
  ATTACHMENT_UPLOADED: 'Attachment uploaded successfully.',
  DEADLINE_PAST: 'Deadline cannot be a past date.',
} as const;

// ─── Quotation messages ───────────────────────────────────────────────────────
export const QUOTATION_MESSAGES = {
  SUBMITTED: 'Quotation submitted successfully.',
  UPDATED: 'Quotation updated successfully.',
  WITHDRAWN: 'Quotation withdrawn successfully.',
  NOT_FOUND: 'Quotation not found.',
  FETCHED: 'Quotations fetched successfully.',
  DEADLINE_PASSED: 'Submission deadline has passed.',
  NOT_ASSIGNED: 'You are not assigned to this RFQ.',
  ALREADY_SUBMITTED: 'You have already submitted a quotation for this RFQ.',
  CANNOT_UPDATE_WITHDRAWN: 'Cannot update a withdrawn quotation.',
} as const;

// ─── Approval messages ────────────────────────────────────────────────────────
export const APPROVAL_MESSAGES = {
  CREATED: 'Approval request created successfully.',
  APPROVED: 'Quotation approved successfully.',
  REJECTED: 'Quotation rejected successfully.',
  NOT_FOUND: 'Approval not found.',
  FETCHED: 'Approvals fetched successfully.',
  IMMUTABLE: 'Approved or rejected records cannot be modified.',
} as const;

// ─── PO messages ──────────────────────────────────────────────────────────────
export const PO_MESSAGES = {
  CREATED: 'Purchase order generated successfully.',
  FETCHED: 'Purchase order fetched successfully.',
  NOT_FOUND: 'Purchase order not found.',
  EMAIL_SENT: 'Purchase order emailed to vendor.',
  NOT_APPROVED: 'Purchase order can only be generated from an approved quotation.',
} as const;

// ─── Invoice messages ─────────────────────────────────────────────────────────
export const INVOICE_MESSAGES = {
  CREATED: 'Invoice generated successfully.',
  FETCHED: 'Invoice fetched successfully.',
  NOT_FOUND: 'Invoice not found.',
  EMAIL_SENT: 'Invoice emailed to vendor.',
  MARKED_PAID: 'Invoice marked as paid.',
} as const;

// ─── Notification messages ────────────────────────────────────────────────────
export const NOTIFICATION_MESSAGES = {
  FETCHED: 'Notifications fetched successfully.',
  MARKED_READ: 'Notification marked as read.',
  ALL_READ: 'All notifications marked as read.',
} as const;

// ─── Dashboard messages ────────────────────────────────────────────────────────
export const DASHBOARD_MESSAGES = {
  FETCHED: 'Dashboard data fetched successfully.',
} as const;
