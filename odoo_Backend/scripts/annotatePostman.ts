import * as fs from 'fs';
import * as path from 'path';

const postmanPath = path.resolve('Postman_Collection.json');

const collection = JSON.parse(fs.readFileSync(postmanPath, 'utf8'));

// Helper to determine role permissions for a request
function getPermission(method: string, pathSegments: string[]): string {
  const methodUpper = method.toUpperCase();
  const pathStr = '/' + pathSegments.join('/');

  // Auth routes
  if (pathStr.startsWith('/auth')) {
    if (['/auth/signup', '/auth/login', '/auth/forgot-password', '/auth/reset-password'].includes(pathStr)) {
      return 'Public (No Token Required)';
    }
    return 'All Authenticated Users';
  }

  // Dashboard
  if (pathStr === '/dashboard') {
    return 'All Authenticated Users';
  }

  // Vendors
  if (pathStr.startsWith('/vendors')) {
    if (methodUpper === 'POST' || methodUpper === 'PUT') {
      return 'Admin, Procurement Officer';
    }
    if (methodUpper === 'DELETE') {
      return 'Admin';
    }
    return 'All Authenticated Users';
  }

  // RFQs
  if (pathStr.startsWith('/rfqs')) {
    if (pathStr.endsWith('/vendors') || pathStr.endsWith('/attachment') || pathStr.endsWith('/close')) {
      return 'Admin, Procurement Officer';
    }
    if (methodUpper === 'POST' || methodUpper === 'PUT') {
      return 'Admin, Procurement Officer';
    }
    if (methodUpper === 'DELETE') {
      return 'Admin';
    }
    return 'All Authenticated Users';
  }

  // Quotations
  if (pathStr.startsWith('/quotations')) {
    if (pathStr.endsWith('/vendor') || pathStr.endsWith('/withdraw')) {
      return 'Vendor';
    }
    if (pathStr.startsWith('/quotations/rfq')) {
      return 'Admin, Procurement Officer, Manager';
    }
    if (methodUpper === 'POST' || methodUpper === 'PUT') {
      return 'Vendor';
    }
    return 'All Authenticated Users';
  }

  // Comparisons
  if (pathStr.startsWith('/comparisons')) {
    return 'Admin, Procurement Officer, Manager';
  }

  // Approvals
  if (pathStr.startsWith('/approvals')) {
    if (pathStr.endsWith('/approve') || pathStr.endsWith('/reject')) {
      return 'Admin, Manager';
    }
    if (methodUpper === 'POST') {
      return 'Admin, Procurement Officer';
    }
    return 'All Authenticated Users';
  }

  // Purchase Orders
  if (pathStr.startsWith('/purchase-orders')) {
    if (methodUpper === 'POST' || pathStr.endsWith('/email')) {
      return 'Admin, Procurement Officer';
    }
    return 'All Authenticated Users';
  }

  // Invoices
  if (pathStr.startsWith('/invoices')) {
    if (methodUpper === 'POST' || pathStr.endsWith('/email') || pathStr.endsWith('/paid')) {
      return 'Admin, Procurement Officer';
    }
    return 'All Authenticated Users';
  }

  // Logs
  if (pathStr.startsWith('/logs')) {
    return 'Admin';
  }

  // Reports
  if (pathStr.startsWith('/reports')) {
    if (pathStr.endsWith('/vendor-performance') || pathStr.endsWith('/spend-analysis')) {
      return 'Admin, Procurement Officer';
    }
    return 'All Authenticated Users';
  }

  // Notifications
  if (pathStr.startsWith('/notifications')) {
    return 'All Authenticated Users';
  }

  return 'All Authenticated Users';
}

// Recursive function to traverse items
function annotateItems(items: any[]) {
  for (const item of items) {
    if (item.item && Array.isArray(item.item)) {
      annotateItems(item.item);
    } else if (item.request) {
      const request = item.request;
      const method = request.method || 'GET';
      const pathSegments = request.url?.path || [];

      // Determine required role/permission
      const requiredRole = getPermission(method, pathSegments);

      // Set description
      const descPrefix = `**Required Permissions:** ${requiredRole}\n\n`;
      const originalDesc = request.description || '';

      if (!originalDesc.includes('Required Permissions:')) {
        request.description = descPrefix + originalDesc;
      }
    }
  }
}

annotateItems(collection.item);

fs.writeFileSync(postmanPath, JSON.stringify(collection, null, 2), 'utf8');
console.log('✓ Successfully annotated all requests in Postman_Collection.json with role/permission requirements.');
