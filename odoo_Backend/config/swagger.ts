import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Procurement Management System API',
      version: '1.0.0',
      description: 'A complete production-ready Procurement Management System backend API. Manages RFQs, vendor quotations, approvals, purchase orders, and invoices.',
      contact: {
        name: 'PMS Support',
        email: 'support@procurement.com',
      },
    },
    servers: [
      { url: '/api/v1', description: 'API v1' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            errors: { type: 'array', items: { type: 'object' } },
          },
        },
        Vendor: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            companyName: { type: 'string' },
            vendorCode: { type: 'string' },
            category: { type: 'string' },
            GSTNumber: { type: 'string' },
            email: { type: 'string' },
            phone: { type: 'string' },
            rating: { type: 'number', minimum: 0, maximum: 5 },
            status: { type: 'string', enum: ['Active', 'Inactive', 'Blacklisted'] },
          },
        },
        RFQ: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            title: { type: 'string' },
            description: { type: 'string' },
            deadline: { type: 'string', format: 'date-time' },
            status: { type: 'string', enum: ['Draft', 'Published', 'Closed', 'Cancelled'] },
          },
        },
        Quotation: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            rfqId: { type: 'string' },
            vendorId: { type: 'string' },
            deliveryTimeline: { type: 'number' },
            status: { type: 'string', enum: ['Draft', 'Submitted', 'Withdrawn'] },
          },
        },
        Approval: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            rfqId: { type: 'string' },
            quotationId: { type: 'string' },
            status: { type: 'string', enum: ['Pending', 'Approved', 'Rejected'] },
            remarks: { type: 'string' },
          },
        },
        PurchaseOrder: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            poNumber: { type: 'string' },
            subtotal: { type: 'number' },
            tax: { type: 'number' },
            total: { type: 'number' },
            status: { type: 'string', enum: ['Generated', 'Sent', 'Accepted', 'Closed'] },
          },
        },
        Invoice: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            invoiceNumber: { type: 'string' },
            subtotal: { type: 'number' },
            tax: { type: 'number' },
            total: { type: 'number' },
            status: { type: 'string', enum: ['Draft', 'Sent', 'Paid', 'Cancelled'] },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Dashboard', description: 'Dashboard statistics' },
      { name: 'Vendors', description: 'Vendor management' },
      { name: 'RFQs', description: 'Request for Quotation management' },
      { name: 'Quotations', description: 'Vendor quotation management' },
      { name: 'Comparisons', description: 'Quotation comparison' },
      { name: 'Approvals', description: 'Approval workflow' },
      { name: 'Purchase Orders', description: 'Purchase order management' },
      { name: 'Invoices', description: 'Invoice management' },
      { name: 'Notifications', description: 'User notifications' },
      { name: 'Logs', description: 'Activity audit logs' },
      { name: 'Reports', description: 'Analytics and reports' },
    ],
    paths: {
      '/auth/signup': {
        post: {
          tags: ['Auth'],
          summary: 'Register a new user',
          security: [],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['firstName', 'lastName', 'email', 'password'],
                  properties: {
                    firstName: { type: 'string', example: 'John' },
                    lastName: { type: 'string', example: 'Doe' },
                    email: { type: 'string', example: 'john@example.com' },
                    password: { type: 'string', example: 'SecurePass@1' },
                    role: { type: 'string', enum: ['admin', 'procurement_officer', 'vendor', 'manager'], example: 'procurement_officer' },
                  },
                },
              },
            },
          },
          responses: {
            '201': { description: 'User created successfully' },
            '409': { description: 'Email already in use' },
          },
        },
      },
      '/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Login with email and password',
          security: [],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', example: 'john@example.com' },
                    password: { type: 'string', example: 'SecurePass@1' },
                  },
                },
              },
            },
          },
          responses: {
            '200': { description: 'Login successful, returns JWT token' },
            '401': { description: 'Invalid credentials' },
          },
        },
      },
      '/vendors': {
        get: {
          tags: ['Vendors'],
          summary: 'List all vendors with pagination and filtering',
          parameters: [
            { in: 'query', name: 'category', schema: { type: 'string' } },
            { in: 'query', name: 'status', schema: { type: 'string', enum: ['Active', 'Inactive', 'Blacklisted'] } },
            { in: 'query', name: 'rating', schema: { type: 'number' } },
            { in: 'query', name: 'keyword', schema: { type: 'string' } },
            { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
            { in: 'query', name: 'limit', schema: { type: 'integer', default: 10 } },
          ],
          responses: { '200': { description: 'Vendor list' } },
        },
        post: {
          tags: ['Vendors'],
          summary: 'Create a new vendor (admin/procurement_officer)',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['companyName', 'category', 'GSTNumber', 'email', 'phone', 'address', 'city', 'state', 'country'],
                  properties: {
                    companyName: { type: 'string', example: 'Acme Corp' },
                    category: { type: 'string', example: 'Electronics' },
                    GSTNumber: { type: 'string', example: '29ABCDE1234F1Z5' },
                    email: { type: 'string', example: 'vendor@acme.com' },
                    phone: { type: 'string', example: '9876543210' },
                    address: { type: 'string', example: '123 Main St' },
                    city: { type: 'string', example: 'Bangalore' },
                    state: { type: 'string', example: 'Karnataka' },
                    country: { type: 'string', example: 'India' },
                  },
                },
              },
            },
          },
          responses: { '201': { description: 'Vendor created' } },
        },
      },
      '/rfqs': {
        get: {
          tags: ['RFQs'],
          summary: 'List RFQs (role-filtered)',
          parameters: [
            { in: 'query', name: 'status', schema: { type: 'string', enum: ['Draft', 'Published', 'Closed', 'Cancelled'] } },
            { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
            { in: 'query', name: 'limit', schema: { type: 'integer', default: 10 } },
          ],
          responses: { '200': { description: 'RFQ list' } },
        },
        post: {
          tags: ['RFQs'],
          summary: 'Create a new RFQ',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['title', 'products', 'deadline'],
                  properties: {
                    title: { type: 'string', example: 'Office Supplies RFQ' },
                    description: { type: 'string' },
                    products: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          name: { type: 'string' },
                          specification: { type: 'string' },
                          quantity: { type: 'integer', minimum: 1 },
                        },
                      },
                    },
                    deadline: { type: 'string', format: 'date-time', example: '2027-01-01T00:00:00Z' },
                  },
                },
              },
            },
          },
          responses: { '201': { description: 'RFQ created' } },
        },
      },
      '/comparisons/{rfqId}': {
        get: {
          tags: ['Comparisons'],
          summary: 'Compare quotations for an RFQ',
          parameters: [
            { in: 'path', name: 'rfqId', required: true, schema: { type: 'string' } },
            { in: 'query', name: 'sortBy', schema: { type: 'string', enum: ['price', 'delivery', 'rating'], default: 'price' } },
            { in: 'query', name: 'vendorId', schema: { type: 'string' } },
          ],
          responses: { '200': { description: 'Comparison data with annotations' } },
        },
      },
      '/purchase-orders/{id}/pdf': {
        get: {
          tags: ['Purchase Orders'],
          summary: 'Download Purchase Order as PDF',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: {
            '200': { description: 'PDF file', content: { 'application/pdf': {} } },
          },
        },
      },
      '/invoices/{id}/pdf': {
        get: {
          tags: ['Invoices'],
          summary: 'Download Invoice as PDF',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: {
            '200': { description: 'PDF file', content: { 'application/pdf': {} } },
          },
        },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);
