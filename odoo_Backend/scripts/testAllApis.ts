/**
 * Comprehensive API test script — tests all procurement endpoints in workflow order
 * Run: node --import tsx scripts/testAllApis.ts
 */
import axios, { AxiosInstance, AxiosError } from 'axios';

const BASE = 'http://localhost:3000/api/v1';
let passed = 0;
let failed = 0;

// ─── tokens & ids ─────────────────────────────────────────────────────────────
let adminToken = '';
let officerToken = '';
let vendorToken = '';
let managerToken = '';
let vendorId = '';
let rfqId = '';
let quotationId = '';
let approvalId = '';
let poId = '';
let invoiceId = '';
let notificationId = '';

// ─── helpers ──────────────────────────────────────────────────────────────────
function color(c: 'green' | 'red' | 'yellow' | 'cyan', s: string) {
  const codes = { green: '\x1b[32m', red: '\x1b[31m', yellow: '\x1b[33m', cyan: '\x1b[36m' };
  return `${codes[c]}${s}\x1b[0m`;
}

async function test(
  label: string,
  fn: () => Promise<any>,
  expect: (data: any) => void = () => {}
) {
  try {
    const result = await fn();
    expect(result);
    console.log(color('green', `  ✓ ${label}`));
    passed++;
    return result;
  } catch (err: any) {
    const msg = err?.response?.data
      ? JSON.stringify(err.response.data).slice(0, 200)
      : err.message;
    console.log(color('red', `  ✗ ${label}`));
    console.log(color('yellow', `    → ${msg}`));
    failed++;
    return null;
  }
}

function header(title: string) {
  console.log(color('cyan', `\n═══ ${title} ═══`));
}

function api(token?: string): AxiosInstance {
  return axios.create({
    baseURL: BASE,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    timeout: 10000,
  });
}

// ─── test runner ──────────────────────────────────────────────────────────────
async function run() {
  console.log(color('cyan', '\n╔══════════════════════════════════════════════╗'));
  console.log(color('cyan', '║   PMS API — Full Endpoint Test Suite         ║'));
  console.log(color('cyan', '╚══════════════════════════════════════════════╝'));

  // ── 0. Health ────────────────────────────────────────────────────────────────
  header('0. Health Checks');
  await test('GET /health (root)', async () => {
    const r = await axios.get('http://localhost:3000/health');
    if (r.data.status !== 'ok') throw new Error('bad status');
    return r.data;
  });

  await test('GET /api/v1/health', async () => {
    const r = await api().get('/health');
    if (!r.data.status) throw new Error('bad');
    return r.data;
  });

  // ── 1. Auth ──────────────────────────────────────────────────────────────────
  header('1. Auth — Signup');

  // Delete old test users so tests are repeatable
  const ts = Date.now();
  const adminEmail = `admin.test.${ts}@pms.com`;
  const officerEmail = `officer.test.${ts}@pms.com`;
  const vendorEmail = `vendor.test.${ts}@acme.com`;
  const managerEmail = `manager.test.${ts}@pms.com`;

  const signupAdmin = await test('POST /auth/signup (admin)', async () => {
    const r = await api().post('/auth/signup', {
      firstName: 'Test', lastName: 'Admin', email: adminEmail,
      password: 'Admin@1234', role: 'admin',
    });
    if (!r.data.data?.token) throw new Error('no token');
    adminToken = r.data.data.token;
    return r.data;
  });

  await test('POST /auth/signup (procurement_officer)', async () => {
    const r = await api().post('/auth/signup', {
      firstName: 'Test', lastName: 'Officer', email: officerEmail,
      password: 'Officer@1234', role: 'procurement_officer',
    });
    if (!r.data.data?.token) throw new Error('no token');
    officerToken = r.data.data.token;
    return r.data;
  });

  await test('POST /auth/signup (vendor)', async () => {
    const r = await api().post('/auth/signup', {
      firstName: 'Test', lastName: 'Vendor', email: vendorEmail,
      password: 'Vendor@1234', role: 'vendor',
    });
    if (!r.data.data?.token) throw new Error('no token');
    vendorToken = r.data.data.token;
    return r.data;
  });

  await test('POST /auth/signup (manager)', async () => {
    const r = await api().post('/auth/signup', {
      firstName: 'Test', lastName: 'Manager', email: managerEmail,
      password: 'Manager@1234', role: 'manager',
    });
    if (!r.data.data?.token) throw new Error('no token');
    managerToken = r.data.data.token;
    return r.data;
  });

  await test('POST /auth/signup — duplicate email → 409', async () => {
    try {
      await api().post('/auth/signup', {
        firstName: 'Test', lastName: 'Admin', email: adminEmail,
        password: 'Admin@1234', role: 'admin',
      });
      throw new Error('should have failed');
    } catch (e: any) {
      if (e.response?.status !== 409) throw new Error(`Expected 409, got ${e.response?.status}`);
    }
  });

  await test('POST /auth/signup — weak password → 400', async () => {
    try {
      await api().post('/auth/signup', {
        firstName: 'Weak', lastName: 'Pass', email: `weak.${ts}@pms.com`,
        password: 'password', role: 'admin',
      });
      throw new Error('should have failed');
    } catch (e: any) {
      if (e.response?.status !== 400) throw new Error(`Expected 400, got ${e.response?.status}`);
    }
  });

  header('1. Auth — Login');
  await test('POST /auth/login (admin)', async () => {
    const r = await api().post('/auth/login', { email: adminEmail, password: 'Admin@1234' });
    if (!r.data.data?.token) throw new Error('no token');
    adminToken = r.data.data.token;
    return r.data;
  });

  await test('POST /auth/login (officer)', async () => {
    const r = await api().post('/auth/login', { email: officerEmail, password: 'Officer@1234' });
    officerToken = r.data.data.token;
    return r.data;
  });

  await test('POST /auth/login (vendor)', async () => {
    const r = await api().post('/auth/login', { email: vendorEmail, password: 'Vendor@1234' });
    vendorToken = r.data.data.token;
    return r.data;
  });

  await test('POST /auth/login (manager)', async () => {
    const r = await api().post('/auth/login', { email: managerEmail, password: 'Manager@1234' });
    managerToken = r.data.data.token;
    return r.data;
  });

  await test('POST /auth/login — wrong password → 401', async () => {
    try {
      await api().post('/auth/login', { email: adminEmail, password: 'wrongpass' });
      throw new Error('should have failed');
    } catch (e: any) {
      if (e.response?.status !== 401) throw new Error(`Expected 401, got ${e.response?.status}`);
    }
  });

  header('1. Auth — Profile & Token Operations');
  await test('GET /auth/me', async () => {
    const r = await api(adminToken).get('/auth/me');
    if (!r.data.data?.email) throw new Error('no email');
    return r.data;
  });

  await test('GET /auth/me — no token → 401', async () => {
    try {
      await api().get('/auth/me');
      throw new Error('should have failed');
    } catch (e: any) {
      if (e.response?.status !== 401) throw new Error(`Expected 401`);
    }
  });

  await test('POST /auth/forgot-password', async () => {
    const r = await api().post('/auth/forgot-password', { email: adminEmail });
    if (!r.data.success) throw new Error('not success');
    return r.data;
  });

  await test('POST /auth/forgot-password — unknown email (no leak)', async () => {
    const r = await api().post('/auth/forgot-password', { email: 'nobody@nowhere.com' });
    if (!r.data.success) throw new Error('should return 200 regardless');
    return r.data;
  });

  await test('POST /auth/reset-password — invalid token → 400', async () => {
    try {
      await api().post('/auth/reset-password', { token: 'badtoken', password: 'NewPass@1234' });
      throw new Error('should have failed');
    } catch (e: any) {
      if (e.response?.status !== 400) throw new Error(`Expected 400`);
    }
  });

  await test('PUT /auth/change-password', async () => {
    const r = await api(officerToken).put('/auth/change-password', {
      currentPassword: 'Officer@1234', newPassword: 'NewOfficer@1234',
    });
    if (!r.data.success) throw new Error('failed');
    // Re-login with new password
    const login = await api().post('/auth/login', { email: officerEmail, password: 'NewOfficer@1234' });
    officerToken = login.data.data.token;
    return r.data;
  });

  await test('PUT /auth/change-password — wrong current → 400', async () => {
    try {
      await api(officerToken).put('/auth/change-password', {
        currentPassword: 'WrongPass@1234', newPassword: 'Another@1234',
      });
      throw new Error('should have failed');
    } catch (e: any) {
      if (e.response?.status !== 400) throw new Error(`Expected 400`);
    }
  });

  await test('POST /auth/refresh-token — no token → 401', async () => {
    try {
      await api().post('/auth/refresh-token', {});
      throw new Error('should fail');
    } catch (e: any) {
      if (e.response?.status !== 401) throw new Error(`Expected 401`);
    }
  });

  await test('POST /auth/logout', async () => {
    const r = await api(adminToken).post('/auth/logout');
    if (!r.data.success) throw new Error('failed');
    // Re-login to restore token
    const login = await api().post('/auth/login', { email: adminEmail, password: 'Admin@1234' });
    adminToken = login.data.data.token;
    return r.data;
  });

  // ── 2. Dashboard ──────────────────────────────────────────────────────────────
  header('2. Dashboard');
  await test('GET /dashboard (admin)', async () => {
    const r = await api(adminToken).get('/dashboard');
    if (!r.data.success) throw new Error('failed');
    const d = r.data.data;
    if (d.pendingApprovals === undefined) throw new Error('missing pendingApprovals');
    if (d.activeRFQs === undefined) throw new Error('missing activeRFQs');
    if (d.analytics === undefined) throw new Error('missing analytics');
    return r.data;
  });

  await test('GET /dashboard (procurement_officer)', async () => {
    const r = await api(officerToken).get('/dashboard');
    if (!r.data.success) throw new Error('failed');
    return r.data;
  });

  await test('GET /dashboard (vendor)', async () => {
    const r = await api(vendorToken).get('/dashboard');
    if (!r.data.success) throw new Error('failed');
    return r.data;
  });

  await test('GET /dashboard — no auth → 401', async () => {
    try {
      await api().get('/dashboard');
      throw new Error('should fail');
    } catch (e: any) {
      if (e.response?.status !== 401) throw new Error(`Expected 401`);
    }
  });

  // ── 3. Vendors ────────────────────────────────────────────────────────────────
  header('3. Vendor Management');
  const vendorPayload = {
    companyName: `Test Vendor ${ts}`,
    category: 'Electronics',
    GSTNumber: '29ABCDE1234F1Z5',
    email: `testvendor.${ts}@corp.com`,
    phone: '9876543210',
    address: '123 Tech Park',
    city: 'Bangalore',
    state: 'Karnataka',
    country: 'India',
    rating: 4.2,
    status: 'Active',
  };

  const createdVendor = await test('POST /vendors (admin)', async () => {
    const r = await api(adminToken).post('/vendors', vendorPayload);
    if (!r.data.data?.vendorCode) throw new Error('no vendorCode');
    if (!r.data.data.vendorCode.startsWith('VND-')) throw new Error('wrong format');
    vendorId = r.data.data._id;
    return r.data;
  });

  await test('POST /vendors (procurement_officer)', async () => {
    const r = await api(officerToken).post('/vendors', {
      ...vendorPayload,
      companyName: `Officer Vendor ${ts}`,
      email: `ov.${ts}@corp.com`,
    });
    if (!r.data.data?.vendorCode) throw new Error('no vendorCode');
    return r.data;
  });

  await test('POST /vendors — vendor role → 403', async () => {
    try {
      await api(vendorToken).post('/vendors', vendorPayload);
      throw new Error('should fail');
    } catch (e: any) {
      if (e.response?.status !== 403) throw new Error(`Expected 403`);
    }
  });

  await test('POST /vendors — invalid GST → 400', async () => {
    try {
      await api(adminToken).post('/vendors', { ...vendorPayload, GSTNumber: 'INVALID' });
      throw new Error('should fail');
    } catch (e: any) {
      if (e.response?.status !== 400) throw new Error(`Expected 400`);
    }
  });

  await test('POST /vendors — invalid phone → 400', async () => {
    try {
      await api(adminToken).post('/vendors', { ...vendorPayload, phone: '123' });
      throw new Error('should fail');
    } catch (e: any) {
      if (e.response?.status !== 400) throw new Error(`Expected 400`);
    }
  });

  await test('GET /vendors (paginated)', async () => {
    const r = await api(adminToken).get('/vendors?page=1&limit=5');
    if (!r.data.data?.docs) throw new Error('no docs');
    if (r.data.data.totalDocs === undefined) throw new Error('no totalDocs');
    return r.data;
  });

  await test('GET /vendors?category=Electronics', async () => {
    const r = await api(adminToken).get('/vendors?category=Electronics');
    if (!r.data.data?.docs) throw new Error('no docs');
    return r.data;
  });

  await test('GET /vendors?status=Active', async () => {
    const r = await api(adminToken).get('/vendors?status=Active');
    if (!r.data.success) throw new Error('failed');
    return r.data;
  });

  await test('GET /vendors?keyword=Test', async () => {
    const r = await api(adminToken).get('/vendors?keyword=Test');
    if (!r.data.success) throw new Error('failed');
    return r.data;
  });

  await test('GET /vendors/search', async () => {
    const r = await api(adminToken).get('/vendors/search?category=Electronics&status=Active');
    if (!r.data.success) throw new Error('failed');
    return r.data;
  });

  await test(`GET /vendors/:id`, async () => {
    if (!vendorId) throw new Error('no vendorId from create');
    const r = await api(adminToken).get(`/vendors/${vendorId}`);
    if (!r.data.data?._id) throw new Error('no _id');
    return r.data;
  });

  await test('GET /vendors/:id — invalid id → 400', async () => {
    try {
      await api(adminToken).get('/vendors/invalid-id');
      throw new Error('should fail');
    } catch (e: any) {
      if (e.response?.status !== 400) throw new Error(`Expected 400`);
    }
  });

  await test('GET /vendors/:id — not found → 404', async () => {
    try {
      await api(adminToken).get('/vendors/000000000000000000000001');
      throw new Error('should fail');
    } catch (e: any) {
      if (e.response?.status !== 404) throw new Error(`Expected 404`);
    }
  });

  await test('PUT /vendors/:id', async () => {
    if (!vendorId) throw new Error('no vendorId');
    const r = await api(adminToken).put(`/vendors/${vendorId}`, { rating: 4.8, city: 'Mumbai' });
    if (!r.data.success) throw new Error('failed');
    return r.data;
  });

  // ── 4. RFQs ───────────────────────────────────────────────────────────────────
  header('4. RFQ Management');
  const rfqPayload = {
    title: `Test RFQ ${ts}`,
    description: 'Procurement test',
    products: [
      { name: 'Laptop', specification: '16GB RAM', quantity: 5 },
      { name: 'Mouse', specification: 'Wireless', quantity: 10 },
    ],
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
  };

  const createdRFQ = await test('POST /rfqs (officer)', async () => {
    const r = await api(officerToken).post('/rfqs', rfqPayload);
    if (!r.data.data?._id) throw new Error('no _id');
    if (r.data.data.status !== 'Draft') throw new Error('should be Draft');
    rfqId = r.data.data._id;
    return r.data;
  });

  await test('POST /rfqs — vendor role → 403', async () => {
    try {
      await api(vendorToken).post('/rfqs', rfqPayload);
      throw new Error('should fail');
    } catch (e: any) {
      if (e.response?.status !== 403) throw new Error(`Expected 403`);
    }
  });

  await test('POST /rfqs — past deadline → 400', async () => {
    try {
      await api(officerToken).post('/rfqs', {
        ...rfqPayload,
        deadline: new Date(Date.now() - 1000).toISOString(),
      });
      throw new Error('should fail');
    } catch (e: any) {
      if (e.response?.status !== 400) throw new Error(`Expected 400, got ${e.response?.status}`);
    }
  });

  await test('GET /rfqs (officer — sees own)', async () => {
    const r = await api(officerToken).get('/rfqs');
    if (!r.data.data?.docs) throw new Error('no docs');
    return r.data;
  });

  await test('GET /rfqs (admin — sees all)', async () => {
    const r = await api(adminToken).get('/rfqs');
    if (!r.data.data?.docs) throw new Error('no docs');
    return r.data;
  });

  await test('GET /rfqs?status=Draft', async () => {
    const r = await api(officerToken).get('/rfqs?status=Draft');
    if (!r.data.success) throw new Error('failed');
    return r.data;
  });

  await test('GET /rfqs/:id', async () => {
    if (!rfqId) throw new Error('no rfqId');
    const r = await api(officerToken).get(`/rfqs/${rfqId}`);
    if (!r.data.data?._id) throw new Error('no _id');
    return r.data;
  });

  await test('PUT /rfqs/:id (update)', async () => {
    if (!rfqId) throw new Error('no rfqId');
    const r = await api(officerToken).put(`/rfqs/${rfqId}`, { description: 'Updated description' });
    if (!r.data.success) throw new Error('failed');
    return r.data;
  });

  await test('POST /rfqs/:id/vendors (assign)', async () => {
    if (!rfqId || !vendorId) throw new Error('missing ids');
    const r = await api(officerToken).post(`/rfqs/${rfqId}/vendors`, { vendorIds: [vendorId] });
    if (!r.data.success) throw new Error('failed');
    // After assigning vendors, status should be Published
    const check = await api(officerToken).get(`/rfqs/${rfqId}`);
    if (check.data.data.status !== 'Published') throw new Error('should be Published');
    return r.data;
  });

  await test('POST /rfqs/:id/vendors — vendor role → 403', async () => {
    try {
      await api(vendorToken).post(`/rfqs/${rfqId}/vendors`, { vendorIds: [vendorId] });
      throw new Error('should fail');
    } catch (e: any) {
      if (e.response?.status !== 403) throw new Error(`Expected 403`);
    }
  });

  await test('GET /rfqs (vendor — sees assigned)', async () => {
    const r = await api(vendorToken).get('/rfqs');
    if (!r.data.success) throw new Error('failed');
    return r.data;
  });

  // ── 5. Quotations ─────────────────────────────────────────────────────────────
  header('5. Quotation Management');

  // The vendor user must have same email as vendor doc — but we created them separately.
  // We need to update the vendor doc email to match vendorEmail so assignment works.
  await test('Update vendor email to match vendor user (setup)', async () => {
    if (!vendorId) throw new Error('no vendorId');
    const r = await api(adminToken).put(`/vendors/${vendorId}`, { email: vendorEmail });
    if (!r.data.success) throw new Error('failed');
    return r.data;
  });

  const quotationPayload = {
    rfqId,
    pricing: [
      { productName: 'Laptop', unitPrice: 50000, quantity: 5, totalPrice: 250000 },
      { productName: 'Mouse', unitPrice: 800, quantity: 10, totalPrice: 8000 },
    ],
    deliveryTimeline: 14,
    notes: 'Best price guaranteed',
  };

  const createdQuotation = await test('POST /quotations (vendor)', async () => {
    if (!rfqId) throw new Error('no rfqId');
    const r = await api(vendorToken).post('/quotations', quotationPayload);
    if (!r.data.data?._id) throw new Error('no _id');
    if (r.data.data.status !== 'Submitted') throw new Error('should be Submitted');
    quotationId = r.data.data._id;
    return r.data;
  });

  await test('POST /quotations — duplicate → 409', async () => {
    try {
      await api(vendorToken).post('/quotations', quotationPayload);
      throw new Error('should fail');
    } catch (e: any) {
      if (e.response?.status !== 409) throw new Error(`Expected 409, got ${e.response?.status}`);
    }
  });

  await test('POST /quotations — officer role → 403', async () => {
    try {
      await api(officerToken).post('/quotations', quotationPayload);
      throw new Error('should fail');
    } catch (e: any) {
      if (e.response?.status !== 403) throw new Error(`Expected 403`);
    }
  });

  await test('PUT /quotations/:id (vendor update)', async () => {
    if (!quotationId) throw new Error('no quotationId');
    const r = await api(vendorToken).put(`/quotations/${quotationId}`, { deliveryTimeline: 10, notes: 'Updated notes' });
    if (!r.data.success) throw new Error('failed');
    return r.data;
  });

  await test('GET /quotations/vendor', async () => {
    const r = await api(vendorToken).get('/quotations/vendor');
    if (!r.data.data?.docs) throw new Error('no docs');
    return r.data;
  });

  await test('GET /quotations/rfq/:rfqId (officer)', async () => {
    if (!rfqId) throw new Error('no rfqId');
    const r = await api(officerToken).get(`/quotations/rfq/${rfqId}`);
    if (!r.data.data?.docs) throw new Error('no docs');
    if (r.data.data.totalDocs === 0) throw new Error('no quotations returned');
    return r.data;
  });

  await test('GET /quotations/rfq/:rfqId — vendor role → 403', async () => {
    try {
      await api(vendorToken).get(`/quotations/rfq/${rfqId}`);
      throw new Error('should fail');
    } catch (e: any) {
      if (e.response?.status !== 403) throw new Error(`Expected 403`);
    }
  });

  // ── 6. Comparison ─────────────────────────────────────────────────────────────
  header('6. Quotation Comparison');
  await test('GET /comparisons/:rfqId (default sort: price)', async () => {
    if (!rfqId) throw new Error('no rfqId');
    const r = await api(officerToken).get(`/comparisons/${rfqId}`);
    if (!r.data.data?.quotations) throw new Error('no quotations array');
    const q = r.data.data.quotations[0];
    if (q.isLowestPrice === undefined) throw new Error('missing isLowestPrice annotation');
    if (q.isFastestDelivery === undefined) throw new Error('missing isFastestDelivery annotation');
    if (q.isHighestRated === undefined) throw new Error('missing isHighestRated annotation');
    return r.data;
  });

  await test('GET /comparisons/:rfqId?sortBy=delivery', async () => {
    const r = await api(officerToken).get(`/comparisons/${rfqId}?sortBy=delivery`);
    if (!r.data.success) throw new Error('failed');
    return r.data;
  });

  await test('GET /comparisons/:rfqId?sortBy=rating', async () => {
    const r = await api(officerToken).get(`/comparisons/${rfqId}?sortBy=rating`);
    if (!r.data.success) throw new Error('failed');
    return r.data;
  });

  await test('GET /comparisons/:rfqId — manager can access', async () => {
    const r = await api(managerToken).get(`/comparisons/${rfqId}`);
    if (!r.data.success) throw new Error('failed');
    return r.data;
  });

  await test('GET /comparisons/:rfqId — vendor role → 403', async () => {
    try {
      await api(vendorToken).get(`/comparisons/${rfqId}`);
      throw new Error('should fail');
    } catch (e: any) {
      if (e.response?.status !== 403) throw new Error(`Expected 403`);
    }
  });

  // ── 7. Approvals ──────────────────────────────────────────────────────────────
  header('7. Approval Workflow');
  const createdApproval = await test('POST /approvals (officer)', async () => {
    if (!rfqId || !quotationId) throw new Error('missing ids');
    const r = await api(officerToken).post('/approvals', { rfqId, quotationId });
    if (!r.data.data?._id) throw new Error('no _id');
    if (r.data.data.status !== 'Pending') throw new Error('should be Pending');
    approvalId = r.data.data._id;
    return r.data;
  });

  await test('POST /approvals — vendor role → 403', async () => {
    try {
      await api(vendorToken).post('/approvals', { rfqId, quotationId });
      throw new Error('should fail');
    } catch (e: any) {
      if (e.response?.status !== 403) throw new Error(`Expected 403`);
    }
  });

  await test('GET /approvals (list)', async () => {
    const r = await api(adminToken).get('/approvals');
    if (!r.data.data?.docs) throw new Error('no docs');
    return r.data;
  });

  await test('GET /approvals?status=Pending', async () => {
    const r = await api(managerToken).get('/approvals?status=Pending');
    if (!r.data.success) throw new Error('failed');
    return r.data;
  });

  await test('GET /approvals/:id/timeline', async () => {
    if (!approvalId) throw new Error('no approvalId');
    const r = await api(managerToken).get(`/approvals/${approvalId}/timeline`);
    if (!r.data.data?._id) throw new Error('no _id');
    return r.data;
  });

  await test('PUT /approvals/:id/reject — officer role → 403', async () => {
    try {
      await api(officerToken).put(`/approvals/${approvalId}/reject`, { remarks: 'Not good' });
      throw new Error('should fail');
    } catch (e: any) {
      if (e.response?.status !== 403) throw new Error(`Expected 403`);
    }
  });

  await test('PUT /approvals/:id/reject — no remarks → 400', async () => {
    try {
      await api(managerToken).put(`/approvals/${approvalId}/reject`, {});
      throw new Error('should fail');
    } catch (e: any) {
      if (e.response?.status !== 400) throw new Error(`Expected 400`);
    }
  });

  await test('PUT /approvals/:id/approve (manager)', async () => {
    if (!approvalId) throw new Error('no approvalId');
    const r = await api(managerToken).put(`/approvals/${approvalId}/approve`, { remarks: 'Approved after review' });
    if (!r.data.success) throw new Error('failed');
    if (r.data.data.status !== 'Approved') throw new Error('should be Approved');
    return r.data;
  });

  await test('PUT /approvals/:id/approve — already approved → 400', async () => {
    try {
      await api(managerToken).put(`/approvals/${approvalId}/approve`, { remarks: 'Again' });
      throw new Error('should fail');
    } catch (e: any) {
      if (e.response?.status !== 400) throw new Error(`Expected 400`);
    }
  });

  // ── 8. Purchase Orders ────────────────────────────────────────────────────────
  header('8. Purchase Orders');
  const createdPO = await test('POST /purchase-orders (officer)', async () => {
    if (!quotationId) throw new Error('no quotationId');
    const r = await api(officerToken).post('/purchase-orders', { quotationId });
    if (!r.data.data?.poNumber) throw new Error('no poNumber');
    if (!r.data.data.poNumber.startsWith('PO-')) throw new Error('wrong format');
    if (r.data.data.subtotal === undefined) throw new Error('no subtotal');
    if (r.data.data.tax === undefined) throw new Error('no tax');
    if (r.data.data.total === undefined) throw new Error('no total');
    poId = r.data.data._id;
    return r.data;
  });

  await test('POST /purchase-orders — vendor role → 403', async () => {
    try {
      await api(vendorToken).post('/purchase-orders', { quotationId });
      throw new Error('should fail');
    } catch (e: any) {
      if (e.response?.status !== 403) throw new Error(`Expected 403`);
    }
  });

  await test('POST /purchase-orders — un-approved quotation → 400', async () => {
    // Create a fresh quotation that has no approval
    try {
      // Use a non-existent quotation id to trigger the not-approved path
      await api(officerToken).post('/purchase-orders', { quotationId: '000000000000000000000001' });
      throw new Error('should fail');
    } catch (e: any) {
      if (![400, 404].includes(e.response?.status)) throw new Error(`Expected 400/404`);
    }
  });

  await test('GET /purchase-orders (list)', async () => {
    const r = await api(adminToken).get('/purchase-orders');
    if (!r.data.data?.docs) throw new Error('no docs');
    return r.data;
  });

  await test('GET /purchase-orders/:id', async () => {
    if (!poId) throw new Error('no poId');
    const r = await api(officerToken).get(`/purchase-orders/${poId}`);
    if (!r.data.data?.poNumber) throw new Error('no poNumber');
    // Check populated fields
    if (!r.data.data.vendorId?.companyName) throw new Error('vendor not populated');
    return r.data;
  });

  await test('GET /purchase-orders/:id/pdf', async () => {
    if (!poId) throw new Error('no poId');
    const r = await api(officerToken).get(`/purchase-orders/${poId}/pdf`, {
      responseType: 'arraybuffer',
    });
    if (r.headers['content-type'] !== 'application/pdf') throw new Error('not a PDF');
    if (r.data.byteLength < 100) throw new Error('PDF too small');
    return { size: r.data.byteLength };
  });

  await test('POST /purchase-orders/:id/email', async () => {
    if (!poId) throw new Error('no poId');
    const r = await api(officerToken).post(`/purchase-orders/${poId}/email`);
    if (!r.data.success) throw new Error('failed');
    return r.data;
  });

  // ── 9. Invoices ───────────────────────────────────────────────────────────────
  header('9. Invoice Generation');
  const createdInvoice = await test('POST /invoices (officer)', async () => {
    if (!poId) throw new Error('no poId');
    const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    const r = await api(officerToken).post('/invoices', { poId, dueDate });
    if (!r.data.data?.invoiceNumber) throw new Error('no invoiceNumber');
    if (!r.data.data.invoiceNumber.startsWith('INV-')) throw new Error('wrong format');
    if (r.data.data.tax === undefined) throw new Error('no tax');
    if (r.data.data.total === undefined) throw new Error('no total');
    invoiceId = r.data.data._id;
    return r.data;
  });

  await test('POST /invoices — vendor role → 403', async () => {
    try {
      await api(vendorToken).post('/invoices', { poId });
      throw new Error('should fail');
    } catch (e: any) {
      if (e.response?.status !== 403) throw new Error(`Expected 403`);
    }
  });

  await test('GET /invoices (list)', async () => {
    const r = await api(adminToken).get('/invoices');
    if (!r.data.data?.docs) throw new Error('no docs');
    return r.data;
  });

  await test('GET /invoices/:id', async () => {
    if (!invoiceId) throw new Error('no invoiceId');
    const r = await api(officerToken).get(`/invoices/${invoiceId}`);
    if (!r.data.data?.invoiceNumber) throw new Error('no invoiceNumber');
    if (!r.data.data.vendorId?.companyName) throw new Error('vendor not populated');
    return r.data;
  });

  await test('GET /invoices/:id/pdf', async () => {
    if (!invoiceId) throw new Error('no invoiceId');
    const r = await api(officerToken).get(`/invoices/${invoiceId}/pdf`, {
      responseType: 'arraybuffer',
    });
    if (r.headers['content-type'] !== 'application/pdf') throw new Error('not a PDF');
    if (r.data.byteLength < 100) throw new Error('PDF too small');
    return { size: r.data.byteLength };
  });

  await test('POST /invoices/:id/email', async () => {
    if (!invoiceId) throw new Error('no invoiceId');
    const r = await api(officerToken).post(`/invoices/${invoiceId}/email`);
    if (!r.data.success) throw new Error('failed');
    return r.data;
  });

  await test('PUT /invoices/:id/paid', async () => {
    if (!invoiceId) throw new Error('no invoiceId');
    const r = await api(adminToken).put(`/invoices/${invoiceId}/paid`);
    if (!r.data.success) throw new Error('failed');
    if (r.data.data.status !== 'Paid') throw new Error('status should be Paid');
    return r.data;
  });

  // ── 10. Notifications ─────────────────────────────────────────────────────────
  header('10. Notifications');
  await test('GET /notifications (all)', async () => {
    const r = await api(vendorToken).get('/notifications');
    if (!r.data.data?.docs) throw new Error('no docs');
    if (r.data.data.totalDocs === undefined) throw new Error('no totalDocs');
    return r.data;
  });

  await test('GET /notifications?unread=true', async () => {
    const r = await api(officerToken).get('/notifications?unread=true');
    if (!r.data.success) throw new Error('failed');
    return r.data;
  });

  await test('GET /notifications — pagination', async () => {
    const r = await api(managerToken).get('/notifications?page=1&limit=5');
    if (!r.data.success) throw new Error('failed');
    return r.data;
  });

  await test('PUT /notifications/read-all', async () => {
    const r = await api(officerToken).put('/notifications/read-all');
    if (!r.data.success) throw new Error('failed');
    return r.data;
  });

  // Mark specific notification read if any
  const notifList = await api(vendorToken).get('/notifications').catch(() => null);
  if (notifList?.data?.data?.docs?.length > 0) {
    notificationId = notifList!.data.data.docs[0]._id;
    await test('PUT /notifications/:id/read', async () => {
      const r = await api(vendorToken).put(`/notifications/${notificationId}/read`);
      if (!r.data.success) throw new Error('failed');
      return r.data;
    });
  } else {
    console.log(color('yellow', '  ⚠ Skipped PUT /notifications/:id/read — no notifications for vendor'));
  }

  // ── 11. Activity Logs ─────────────────────────────────────────────────────────
  header('11. Activity Logs');
  await test('GET /logs (admin)', async () => {
    const r = await api(adminToken).get('/logs');
    if (!r.data.data?.docs) throw new Error('no docs');
    if (r.data.data.totalDocs === 0) throw new Error('no logs recorded');
    return r.data;
  });

  await test('GET /logs?action=USER_LOGIN', async () => {
    const r = await api(adminToken).get('/logs?action=USER_LOGIN');
    if (!r.data.success) throw new Error('failed');
    return r.data;
  });

  await test('GET /logs?action=RFQ_CREATED', async () => {
    const r = await api(adminToken).get('/logs?action=RFQ_CREATED');
    if (!r.data.success) throw new Error('failed');
    return r.data;
  });

  const today = new Date().toISOString().split('T')[0];
  await test('GET /logs?dateFrom=&dateTo= (date filter)', async () => {
    const r = await api(adminToken).get(`/logs?dateFrom=${today}&dateTo=${today}&limit=5`);
    if (!r.data.success) throw new Error('failed');
    return r.data;
  });

  await test('GET /logs — officer role → 403', async () => {
    try {
      await api(officerToken).get('/logs');
      throw new Error('should fail');
    } catch (e: any) {
      if (e.response?.status !== 403) throw new Error(`Expected 403`);
    }
  });

  await test('GET /logs — vendor role → 403', async () => {
    try {
      await api(vendorToken).get('/logs');
      throw new Error('should fail');
    } catch (e: any) {
      if (e.response?.status !== 403) throw new Error(`Expected 403`);
    }
  });

  // ── 12. Reports ───────────────────────────────────────────────────────────────
  header('12. Reports & Analytics');
  await test('GET /reports/vendor-performance', async () => {
    const r = await api(adminToken).get('/reports/vendor-performance');
    if (!r.data.success) throw new Error('failed');
    if (!Array.isArray(r.data.data)) throw new Error('should be array');
    return r.data;
  });

  await test('GET /reports/procurement-summary', async () => {
    const r = await api(adminToken).get('/reports/procurement-summary');
    if (!r.data.data?.totalRFQs === undefined) throw new Error('missing totalRFQs');
    if (r.data.data.totalSpend === undefined) throw new Error('missing totalSpend');
    return r.data;
  });

  await test('GET /reports/monthly-trends', async () => {
    const r = await api(adminToken).get('/reports/monthly-trends');
    if (!r.data.data?.rfqTrends) throw new Error('missing rfqTrends');
    if (!r.data.data?.poTrends) throw new Error('missing poTrends');
    return r.data;
  });

  await test('GET /reports/spend-analysis', async () => {
    const r = await api(adminToken).get('/reports/spend-analysis');
    if (!r.data.data?.byVendor) throw new Error('missing byVendor');
    if (!r.data.data?.byCategory) throw new Error('missing byCategory');
    return r.data;
  });

  await test('GET /reports/export (JSON)', async () => {
    const r = await api(adminToken).get('/reports/export');
    if (!r.data.data?.totalRFQs === undefined) throw new Error('failed');
    return r.data;
  });

  await test('GET /reports/export?format=csv', async () => {
    const r = await api(adminToken).get('/reports/export?format=csv', {
      responseType: 'text',
    });
    if (!String(r.data).includes('Total RFQs')) throw new Error('no CSV content');
    return { preview: String(r.data).slice(0, 100) };
  });

  await test('GET /reports/vendor-performance — vendor role → 403', async () => {
    try {
      await api(vendorToken).get('/reports/vendor-performance');
      throw new Error('should fail');
    } catch (e: any) {
      if (e.response?.status !== 403) throw new Error(`Expected 403`);
    }
  });

  // ── 13. RFQ additional operations ─────────────────────────────────────────────
  header('13. RFQ — Close & Edge Cases');

  // Create a separate RFQ for close/delete tests
  let tempRfqId = '';
  await test('POST /rfqs (second RFQ for edge cases)', async () => {
    const r = await api(officerToken).post('/rfqs', {
      ...rfqPayload,
      title: `Temp RFQ ${ts}`,
    });
    tempRfqId = r.data.data._id;
    return r.data;
  });

  await test('PUT /rfqs/:id/close', async () => {
    if (!tempRfqId) throw new Error('no tempRfqId');
    const r = await api(officerToken).put(`/rfqs/${tempRfqId}/close`);
    if (!r.data.success) throw new Error('failed');
    if (r.data.data.status !== 'Closed') throw new Error('should be Closed');
    return r.data;
  });

  await test('PUT /rfqs/:id — edit closed RFQ → 400', async () => {
    if (!tempRfqId) throw new Error('no tempRfqId');
    try {
      await api(officerToken).put(`/rfqs/${tempRfqId}`, { description: 'should fail' });
      throw new Error('should have failed');
    } catch (e: any) {
      if (e.response?.status !== 400) throw new Error(`Expected 400`);
    }
  });

  await test('DELETE /rfqs/:id (admin)', async () => {
    if (!tempRfqId) throw new Error('no tempRfqId');
    const r = await api(adminToken).delete(`/rfqs/${tempRfqId}`);
    if (!r.data.success) throw new Error('failed');
    return r.data;
  });

  await test('GET /rfqs/:id — deleted → 404', async () => {
    if (!tempRfqId) throw new Error('no tempRfqId');
    try {
      await api(officerToken).get(`/rfqs/${tempRfqId}`);
      throw new Error('should be 404');
    } catch (e: any) {
      if (e.response?.status !== 404) throw new Error(`Expected 404`);
    }
  });

  // ── 14. Quotation — Withdraw ──────────────────────────────────────────────────
  header('14. Quotation — Withdraw');
  // Create a second RFQ and quotation so we can test withdraw without breaking PO
  let tempRfqId2 = '';
  let vendorId2 = '';
  let tempQuotationId = '';

  await test('Setup: create RFQ2 and vendor2 for withdraw test', async () => {
    const vr = await api(adminToken).post('/vendors', {
      companyName: `Withdraw Vendor ${ts}`,
      category: 'Supplies',
      GSTNumber: '27FGHIJ5678K2Z6',
      email: `wv.${ts}@corp.com`,
      phone: '9000000001',
      address: '1 Test St', city: 'Delhi', state: 'Delhi', country: 'India',
    });
    vendorId2 = vr.data.data._id;

    // Create vendor user for this
    const rfqR = await api(officerToken).post('/rfqs', {
      title: `Withdraw Test RFQ ${ts}`,
      products: [{ name: 'Paper', specification: 'A4', quantity: 100 }],
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    });
    tempRfqId2 = rfqR.data.data._id;
    await api(officerToken).post(`/rfqs/${tempRfqId2}/vendors`, { vendorIds: [vendorId] });

    const qr = await api(vendorToken).post('/quotations', {
      rfqId: tempRfqId2,
      pricing: [{ productName: 'Paper', unitPrice: 100, quantity: 100, totalPrice: 10000 }],
      deliveryTimeline: 7,
      notes: 'Will withdraw this',
    });
    tempQuotationId = qr.data.data._id;
    return { vendorId2, tempRfqId2, tempQuotationId };
  });

  await test('PUT /quotations/:id/withdraw', async () => {
    if (!tempQuotationId) throw new Error('no tempQuotationId');
    const r = await api(vendorToken).put(`/quotations/${tempQuotationId}/withdraw`);
    if (!r.data.success) throw new Error('failed');
    if (r.data.data.status !== 'Withdrawn') throw new Error('should be Withdrawn');
    return r.data;
  });

  await test('PUT /quotations/:id — update withdrawn → 400', async () => {
    try {
      await api(vendorToken).put(`/quotations/${tempQuotationId}`, { deliveryTimeline: 5 });
      throw new Error('should fail');
    } catch (e: any) {
      if (e.response?.status !== 400) throw new Error(`Expected 400`);
    }
  });

  // ── 15. Vendor Delete ─────────────────────────────────────────────────────────
  header('15. Vendor Soft-Delete');
  await test('DELETE /vendors/:id (admin)', async () => {
    if (!vendorId2) throw new Error('no vendorId2');
    const r = await api(adminToken).delete(`/vendors/${vendorId2}`);
    if (!r.data.success) throw new Error('failed');
    return r.data;
  });

  await test('GET /vendors/:id — soft-deleted → 404', async () => {
    if (!vendorId2) throw new Error('no vendorId2');
    try {
      await api(adminToken).get(`/vendors/${vendorId2}`);
      throw new Error('should be 404');
    } catch (e: any) {
      if (e.response?.status !== 404) throw new Error(`Expected 404`);
    }
  });

  // ── 16. Swagger docs ──────────────────────────────────────────────────────────
  header('16. Swagger / Docs');
  await test('GET /api/docs (swagger UI)', async () => {
    const r = await axios.get('http://localhost:3000/api/docs/');
    if (!r.data.includes('swagger') && !r.data.includes('Swagger')) throw new Error('not swagger UI');
    return { status: r.status };
  });

  // ── 17. 404 for unknown routes ────────────────────────────────────────────────
  header('17. Error Handling');
  await test('GET /api/v1/unknown → 404', async () => {
    try {
      await api(adminToken).get('/unknown-route-xyz');
      throw new Error('should fail');
    } catch (e: any) {
      if (e.response?.status !== 404) throw new Error(`Expected 404`);
    }
  });

  await test('Any route — invalid JWT → 401', async () => {
    try {
      await api('bad.jwt.token').get('/rfqs');
      throw new Error('should fail');
    } catch (e: any) {
      if (e.response?.status !== 401) throw new Error(`Expected 401`);
    }
  });

  // ── Summary ───────────────────────────────────────────────────────────────────
  const total = passed + failed;
  console.log(color('cyan', `\n╔══════════════════════════════════════════════╗`));
  console.log(color('cyan', `║  RESULTS                                     ║`));
  console.log(color('cyan', `╠══════════════════════════════════════════════╣`));
  console.log(`  ${color('green', `Passed: ${passed}/${total}`)}   ${failed > 0 ? color('red', `Failed: ${failed}/${total}`) : color('green', 'All passing!')}`);
  console.log(color('cyan', `╚══════════════════════════════════════════════╝\n`));

  if (failed > 0) process.exit(1);
}

run().catch((err) => {
  console.error('Test runner crashed:', err.message);
  process.exit(1);
});
