import * as fs from 'fs';
import * as path from 'path';

// Helper to construct a Postman request item
function makeItem(role: string, module: string, action: string, method: string, urlPath: string[], tokenVar: string, bodyJson?: any, eventTag?: string) {
  const name = `${role} - ${module} - ${action}`;
  const headers = [
    {
      key: 'Authorization',
      value: `Bearer {{${tokenVar}}}`
    }
  ];
  if (method === 'POST' || method === 'PUT') {
    headers.push({
      key: 'Content-Type',
      value: 'application/json'
    });
  }

  return {
    name,
    request: {
      method,
      header: headers,
      body: bodyJson ? {
        mode: 'raw',
        raw: JSON.stringify(bodyJson, null, 2)
      } : undefined,
      url: {
        raw: `{{base_url}}/${urlPath.join('/')}`,
        host: ['{{base_url}}'],
        path: urlPath
      },
      description: `Required Role: ${role}\nModule: ${module}\nEvent Tag: "${eventTag || 'NONE'}"`
    }
  };
}

// 1. Shared APIs Folder (COMMON APIs)
const sharedFolder = {
  name: "ERP - Shared APIs",
  description: "Shared APIs accessible by multiple roles with general tokens.",
  item: [
    makeItem('Shared', 'Auth', 'Register', 'POST', ['auth', 'register'], 'token', {
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane.doe@erp.com',
      password: 'Password@123',
      role: 'employee'
    }, 'USER_REGISTERED'),
    makeItem('Shared', 'Auth', 'Login', 'POST', ['auth', 'login'], 'token', {
      email: 'jane.doe@erp.com',
      password: 'Password@123'
    }, 'USER_LOGGED_IN'),
    makeItem('Shared', 'Auth', 'OTP Verify', 'POST', ['auth', 'otp-verify'], 'token', {
      email: 'jane.doe@erp.com',
      otp: '123456'
    }, 'OTP_VERIFIED'),
    makeItem('Shared', 'Auth', 'Refresh Token', 'POST', ['auth', 'refresh-token'], 'token', {
      refreshToken: 'sample_refresh_token_here'
    }, 'TOKEN_REFRESHED'),
    makeItem('Shared', 'Profile', 'Get Profile', 'GET', ['profile'], 'token', null, 'PROFILE_FETCHED'),
    makeItem('Shared', 'Notifications', 'List', 'GET', ['notifications'], 'token', null, 'NOTIFICATIONS_FETCHED'),
    makeItem('Shared', 'Files', 'Upload Attachment', 'POST', ['files', 'upload'], 'token', {
      fileName: 'contract_draft.pdf',
      fileSize: 2048576,
      contentType: 'application/pdf'
    }, 'FILE_UPLOADED'),
    makeItem('Shared', 'Auth', 'Logout', 'POST', ['auth', 'logout'], 'token', null, 'USER_LOGGED_OUT')
  ]
};

// 2. Admin APIs Folder (20 endpoints)
const adminFolder = {
  name: "ERP - Admin APIs (20 endpoints)",
  description: "Administrative configuration and system management endpoints.",
  item: [
    {
      name: "User Management",
      item: [
        makeItem('Admin', 'User', 'Create User', 'POST', ['admin', 'users'], 'admin_token', {
          firstName: 'John',
          lastName: 'Smith',
          email: 'john.smith@company.com',
          role: 'employee',
          department: 'Procurement'
        }, 'USER_CREATED'),
        makeItem('Admin', 'User', 'List Users', 'GET', ['admin', 'users'], 'admin_token', null, 'USERS_LISTED'),
        makeItem('Admin', 'User', 'Get User', 'GET', ['admin', 'users', '{{userId}}'], 'admin_token', null, 'USER_FETCHED'),
        makeItem('Admin', 'User', 'Update User', 'PUT', ['admin', 'users', '{{userId}}'], 'admin_token', {
          status: 'Active',
          department: 'Finance'
        }, 'USER_UPDATED'),
        makeItem('Admin', 'User', 'Delete User', 'DELETE', ['admin', 'users', '{{userId}}'], 'admin_token', null, 'USER_DELETED')
      ]
    },
    {
      name: "Vendor Management",
      item: [
        makeItem('Admin', 'Vendor', 'Create Vendor', 'POST', ['admin', 'vendors'], 'admin_token', {
          companyName: 'Apex Logistics',
          contactEmail: 'contact@apex.com',
          phone: '9988776655'
        }, 'VENDOR_CREATED'),
        makeItem('Admin', 'Vendor', 'List Vendors', 'GET', ['admin', 'vendors'], 'admin_token', null, 'VENDORS_LISTED'),
        makeItem('Admin', 'Vendor', 'Get Vendor', 'GET', ['admin', 'vendors', '{{vendorId}}'], 'admin_token', null, 'VENDOR_FETCHED'),
        makeItem('Admin', 'Vendor', 'Update Vendor', 'PUT', ['admin', 'vendors', '{{vendorId}}'], 'admin_token', {
          status: 'Approved'
        }, 'VENDOR_APPROVED'),
        makeItem('Admin', 'Vendor', 'Delete Vendor', 'DELETE', ['admin', 'vendors', '{{vendorId}}'], 'admin_token', null, 'VENDOR_DELETED')
      ]
    },
    {
      name: "Approvals",
      item: [
        makeItem('Admin', 'Approval', 'Approve Request', 'PUT', ['admin', 'approvals', '{{requestId}}', 'approve'], 'admin_token', {
          remarks: 'Budget aligned'
        }, 'REQUEST_APPROVED'),
        makeItem('Admin', 'Approval', 'Reject Request', 'PUT', ['admin', 'approvals', '{{requestId}}', 'reject'], 'admin_token', {
          remarks: 'Outside limits'
        }, 'REQUEST_REJECTED')
      ]
    },
    {
      name: "Reports",
      item: [
        makeItem('Admin', 'Report', 'Spend Analysis', 'GET', ['admin', 'reports', 'spend'], 'admin_token', null, 'REPORT_SPEND_GENERATED'),
        makeItem('Admin', 'Report', 'Vendor Performance', 'GET', ['admin', 'reports', 'vendor-performance'], 'admin_token', null, 'REPORT_PERFORMANCE_GENERATED')
      ]
    },
    {
      name: "Settings",
      item: [
        makeItem('Admin', 'Setting', 'Get Config', 'GET', ['admin', 'settings', 'config'], 'admin_token', null, 'CONFIG_FETCHED'),
        makeItem('Admin', 'Setting', 'Update Config', 'PUT', ['admin', 'settings', 'config'], 'admin_token', {
          maxPurchaseLimit: 500000,
          currency: 'USD'
        }, 'CONFIG_UPDATED')
      ]
    },
    {
      name: "System Operations",
      item: [
        makeItem('Admin', 'Contract', 'Get Contracts', 'GET', ['admin', 'contracts'], 'admin_token', null, 'CONTRACTS_LISTED'),
        makeItem('Admin', 'Payment', 'Monitor Payments', 'GET', ['admin', 'payments'], 'admin_token', null, 'PAYMENTS_MONITORED'),
        makeItem('Admin', 'Audit', 'View Logs', 'GET', ['admin', 'audit-logs'], 'admin_token', null, 'AUDIT_LOGS_VIEWED'),
        makeItem('Admin', 'Analytics', 'Dashboard Stats', 'GET', ['admin', 'analytics', 'dashboard'], 'admin_token', null, 'ADMIN_DASHBOARD_STATS_FETCHED')
      ]
    }
  ]
};

// 3. Vendor APIs Folder (20 endpoints)
const vendorFolder = {
  name: "ERP - Vendor APIs (20 endpoints)",
  description: "Vendor portal actions, order completions, and product additions.",
  item: [
    {
      name: "Products",
      item: [
        makeItem('Vendor', 'Product', 'Add Product', 'POST', ['vendor', 'products'], 'vendor_token', {
          name: 'High-Speed Router',
          sku: 'NET-HSR-001',
          price: 15000
        }, 'PRODUCT_ADDED'),
        makeItem('Vendor', 'Product', 'List Products', 'GET', ['vendor', 'products'], 'vendor_token', null, 'PRODUCTS_LISTED'),
        makeItem('Vendor', 'Product', 'Update Product', 'PUT', ['vendor', 'products', '{{productId}}'], 'vendor_token', {
          price: 14500
        }, 'PRODUCT_UPDATED'),
        makeItem('Vendor', 'Product', 'Delete Product', 'DELETE', ['vendor', 'products', '{{productId}}'], 'vendor_token', null, 'PRODUCT_DELETED')
      ]
    },
    {
      name: "Inventory",
      item: [
        makeItem('Vendor', 'Inventory', 'Get Inventory', 'GET', ['vendor', 'inventory'], 'vendor_token', null, 'INVENTORY_FETCHED'),
        makeItem('Vendor', 'Inventory', 'Update Stock', 'PUT', ['vendor', 'inventory'], 'vendor_token', {
          sku: 'NET-HSR-001',
          quantity: 250
        }, 'STOCK_UPDATED')
      ]
    },
    {
      name: "Orders",
      item: [
        makeItem('Vendor', 'Order', 'List Orders', 'GET', ['vendor', 'orders'], 'vendor_token', null, 'ORDERS_LISTED'),
        makeItem('Vendor', 'Order', 'Update Status', 'PUT', ['vendor', 'orders', '{{orderId}}', 'status'], 'vendor_token', {
          status: 'Shipped'
        }, 'ORDER_STATUS_UPDATED')
      ]
    },
    {
      name: "RFQ & Quotations",
      item: [
        makeItem('Vendor', 'RFQ', 'List RFQs', 'GET', ['vendor', 'rfqs'], 'vendor_token', null, 'RFQS_LISTED'),
        makeItem('Vendor', 'RFQ', 'View RFQ Details', 'GET', ['vendor', 'rfqs', '{{rfqId}}'], 'vendor_token', null, 'RFQ_VIEWED'),
        makeItem('Vendor', 'Quotation', 'Submit Quotation', 'POST', ['vendor', 'quotations'], 'vendor_token', {
          rfqId: 'rfqId...',
          pricing: 142000
        }, 'QUOTATION_SUBMITTED'),
        makeItem('Vendor', 'Quotation', 'View Quotations', 'GET', ['vendor', 'quotations'], 'vendor_token', null, 'QUOTATIONS_VIEWED')
      ]
    },
    {
      name: "Invoices & Payments",
      item: [
        makeItem('Vendor', 'Invoice', 'Upload Invoice', 'POST', ['vendor', 'invoices'], 'vendor_token', {
          orderId: 'orderId...',
          amount: 142000,
          pdfUrl: 'http://cloudinary.com/invoice.pdf'
        }, 'INVOICE_UPLOADED'),
        makeItem('Vendor', 'Invoice', 'View Invoices', 'GET', ['vendor', 'invoices'], 'vendor_token', null, 'INVOICES_VIEWED'),
        makeItem('Vendor', 'Payment', 'Track Payment', 'GET', ['vendor', 'payments', '{{paymentId}}'], 'vendor_token', null, 'PAYMENT_TRACKED')
      ]
    },
    {
      name: "Registration & Profile",
      item: [
        makeItem('Vendor', 'Registration', 'Submit Onboarding', 'POST', ['vendor', 'onboarding'], 'vendor_token', {
          gstin: '29AAACA0000A1Z1',
          address: '456 Business St'
        }, 'ONBOARDING_SUBMITTED'),
        makeItem('Vendor', 'Profile', 'Get Profile', 'GET', ['vendor', 'profile'], 'vendor_token', null, 'VENDOR_PROFILE_FETCHED'),
        makeItem('Vendor', 'Profile', 'Update Profile', 'PUT', ['vendor', 'profile'], 'vendor_token', {
          contactPhone: '9900990099'
        }, 'VENDOR_PROFILE_UPDATED'),
        makeItem('Vendor', 'Contract', 'View Contracts', 'GET', ['vendor', 'contracts'], 'vendor_token', null, 'CONTRACT_VIEWED'),
        makeItem('Vendor', 'Dashboard', 'Get Stats', 'GET', ['vendor', 'dashboard', 'stats'], 'vendor_token', null, 'VENDOR_STATS_FETCHED')
      ]
    }
  ]
};

// 4. User (Employee) Collection (30 endpoints)
const employeeFolder = {
  name: "ERP - Employee APIs (30 endpoints)",
  description: "Employee daily tasks, purchase requests, support ticketing, and profiles.",
  item: [
    {
      name: "Profile",
      item: [
        makeItem('Employee', 'Profile', 'Get Profile', 'GET', ['employee', 'profile'], 'employee_token', null, 'EMPLOYEE_PROFILE_FETCHED'),
        makeItem('Employee', 'Profile', 'Update Profile', 'PUT', ['employee', 'profile'], 'employee_token', {
          phone: '9944332211'
        }, 'EMPLOYEE_PROFILE_UPDATED')
      ]
    },
    {
      name: "Departments",
      item: [
        makeItem('Employee', 'Department', 'List', 'GET', ['employee', 'departments'], 'employee_token', null, 'DEPARTMENTS_LISTED')
      ]
    },
    {
      name: "Requests",
      item: [
        makeItem('Employee', 'PR', 'Create Request', 'POST', ['employee', 'requests'], 'employee_token', {
          item: 'Office Chair',
          quantity: 2,
          department: 'HR'
        }, 'PR_CREATED'),
        makeItem('Employee', 'PR', 'List Requests', 'GET', ['employee', 'requests'], 'employee_token', null, 'PR_LISTED'),
        makeItem('Employee', 'PR', 'Get Request', 'GET', ['employee', 'requests', '{{requestId}}'], 'employee_token', null, 'PR_FETCHED'),
        makeItem('Employee', 'PR', 'Update Request', 'PUT', ['employee', 'requests', '{{requestId}}'], 'employee_token', {
          quantity: 3
        }, 'PR_UPDATED'),
        makeItem('Employee', 'PR', 'Delete Request', 'DELETE', ['employee', 'requests', '{{requestId}}'], 'employee_token', null, 'PR_DELETED'),
        makeItem('Employee', 'PR', 'Track Request', 'GET', ['employee', 'requests', '{{requestId}}', 'track'], 'employee_token', null, 'PR_TRACKED'),
        makeItem('Employee', 'PR', 'Add Comment', 'POST', ['employee', 'requests', '{{requestId}}', 'comments'], 'employee_token', {
          comment: 'Need this by next Wednesday.'
        }, 'PR_COMMENT_ADDED'),
        makeItem('Employee', 'PR', 'View Comments', 'GET', ['employee', 'requests', '{{requestId}}', 'comments'], 'employee_token', null, 'PR_COMMENTS_FETCHED')
      ]
    },
    {
      name: "Tickets",
      item: [
        makeItem('Employee', 'Ticket', 'Raise Ticket', 'POST', ['employee', 'tickets'], 'employee_token', {
          subject: 'Broken monitor',
          priority: 'Medium'
        }, 'TICKET_RAISED'),
        makeItem('Employee', 'Ticket', 'List Tickets', 'GET', ['employee', 'tickets'], 'employee_token', null, 'TICKETS_LISTED'),
        makeItem('Employee', 'Ticket', 'Get Ticket', 'GET', ['employee', 'tickets', '{{ticketId}}'], 'employee_token', null, 'TICKET_FETCHED'),
        makeItem('Employee', 'Ticket', 'Update Ticket', 'PUT', ['employee', 'tickets', '{{ticketId}}'], 'employee_token', {
          description: 'It flashes red and does not show screen.'
        }, 'TICKET_UPDATED'),
        makeItem('Employee', 'Ticket', 'Get Ticket Status', 'GET', ['employee', 'tickets', '{{ticketId}}', 'status'], 'employee_token', null, 'TICKET_STATUS_CHECKED')
      ]
    },
    {
      name: "Tasks",
      item: [
        makeItem('Employee', 'Task', 'List Tasks', 'GET', ['employee', 'tasks'], 'employee_token', null, 'TASKS_LISTED'),
        makeItem('Employee', 'Task', 'Get Task', 'GET', ['employee', 'tasks', '{{taskId}}'], 'employee_token', null, 'TASK_FETCHED'),
        makeItem('Employee', 'Task', 'Update Task Status', 'PUT', ['employee', 'tasks', '{{taskId}}', 'status'], 'employee_token', {
          status: 'In Progress'
        }, 'TASK_STATUS_UPDATED')
      ]
    },
    {
      name: "Files",
      item: [
        makeItem('Employee', 'File', 'Upload File', 'POST', ['employee', 'files'], 'employee_token', {
          fileName: 'profile_pic.png'
        }, 'FILE_UPLOADED'),
        makeItem('Employee', 'File', 'List Files', 'GET', ['employee', 'files'], 'employee_token', null, 'FILES_LISTED')
      ]
    },
    {
      name: "Logs & History",
      item: [
        makeItem('Employee', 'Log', 'View History', 'GET', ['employee', 'history'], 'employee_token', null, 'HISTORY_LOG_VIEWED')
      ]
    },
    {
      name: "Support Chat",
      item: [
        makeItem('Employee', 'Chat', 'Send Message', 'POST', ['employee', 'chat', 'messages'], 'employee_token', {
          message: 'Can someone help with my laptop repair status?'
        }, 'CHAT_MESSAGE_SENT'),
        makeItem('Employee', 'Chat', 'Get Messages', 'GET', ['employee', 'chat', 'messages'], 'employee_token', null, 'CHAT_MESSAGES_FETCHED')
      ]
    },
    {
      name: "Notifications",
      item: [
        makeItem('Employee', 'Notification', 'Get All', 'GET', ['employee', 'notifications'], 'employee_token', null, 'NOTIFICATIONS_FETCHED'),
        makeItem('Employee', 'Notification', 'Mark Read', 'PUT', ['employee', 'notifications', '{{notificationId}}', 'read'], 'employee_token', null, 'NOTIFICATION_MARKED_READ')
      ]
    },
    {
      name: "Dashboard",
      item: [
        makeItem('Employee', 'Dashboard', 'Personal Stats', 'GET', ['employee', 'dashboard', 'stats'], 'employee_token', null, 'PERSONAL_STATS_FETCHED'),
        makeItem('Employee', 'Approval', 'Track Approval', 'GET', ['employee', 'approvals', 'status'], 'employee_token', null, 'APPROVAL_STATUS_TRACKED')
      ]
    }
  ]
};

// Main collection container
const consolidatedCollection = {
  info: {
    _postman_id: "erp-role-based-collection-id-9988",
    name: "ERP Role-Based API Suite",
    description: "Enterprise grade, fully structured Postman collection with strict role separations: Shared APIs, Admin APIs, Vendor APIs, and Employee APIs.",
    schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  item: [
    sharedFolder,
    adminFolder,
    vendorFolder,
    employeeFolder
  ]
};

fs.writeFileSync(
  path.resolve('ERP_Postman_Collection.json'),
  JSON.stringify(consolidatedCollection, null, 2),
  'utf8'
);

console.log('✓ ERP Role-Based Postman Collection generated at ERP_Postman_Collection.json successfully.');
