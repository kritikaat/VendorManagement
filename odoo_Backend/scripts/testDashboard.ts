import axios from 'axios';

const BASE = 'http://localhost:3000/api/v1';

async function runTests() {
  console.log('\n=== Testing Dashboard APIs & Coordinates ===');

  const ts = Date.now();
  const emails = {
    admin: `db.admin.${ts}@test.com`,
    officer: `db.officer.${ts}@test.com`,
    vendor: `db.vendor.${ts}@test.com`,
    manager: `db.manager.${ts}@test.com`,
  };

  const tokens: Record<string, string> = {};

  // 1. Register & Login Users
  for (const [role, email] of Object.entries(emails)) {
    try {
      const signupRes = await axios.post(`${BASE}/auth/signup`, {
        firstName: 'Test',
        lastName: role,
        email,
        password: 'Password@123',
        role: role === 'officer' ? 'procurement_officer' : role,
      });
      tokens[role] = signupRes.data.data.token;
      console.log(`✓ Signed up and logged in ${role}`);
    } catch (err: any) {
      console.error(`✗ Failed to setup user ${role}:`, err.response?.data || err.message);
      process.exit(1);
    }
  }

  // Helper to test dashboard request
  const testDashboardForRole = async (role: string, token: string, params = {}) => {
    try {
      const res = await axios.get(`${BASE}/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });

      console.log('\n--- Dashboard response for ' + role.toUpperCase() + ' ---');
      console.log('Status Code:', res.status);
      console.log('Full Response Data:', JSON.stringify(res.data, null, 2));
      console.log('Role Returned:', res.data.data?.role);

      const { metrics, charts, tables } = res.data.data || {};

      // Assert structure
      if (!metrics) throw new Error(`Missing metrics for ${role}. Response: ${JSON.stringify(res.data)}`);
      if (!charts) throw new Error(`Missing charts for ${role}`);
      if (!tables) throw new Error(`Missing tables for ${role}`);

      console.log('Metrics Keys:', Object.keys(metrics));
      console.log('Charts Keys:', Object.keys(charts));
      console.log('Tables Keys:', Object.keys(tables));

      // Assert coordinates format
      for (const [chartName, data] of Object.entries(charts)) {
        if (!Array.isArray(data)) {
          throw new Error(`Chart ${chartName} is not an array`);
        }
        console.log(`Chart "${chartName}" coordinate sample (count: ${data.length}):`, data.slice(0, 2));
        for (const pt of data as any[]) {
          if (pt.x === undefined || pt.y === undefined) {
            throw new Error(`Invalid coordinate format for ${chartName}: ${JSON.stringify(pt)}`);
          }
        }
      }

      console.log(`✓ Passed tests for ${role}`);
    } catch (err: any) {
      console.error(`✗ Failed dashboard test for ${role}:`, err.response?.data || err.message);
      process.exit(1);
    }
  };

  // 2. Test Admin Dashboard
  await testDashboardForRole('admin', tokens.admin);

  // 3. Test Procurement Officer Dashboard
  await testDashboardForRole('officer', tokens.officer);

  // 4. Test Manager Dashboard
  await testDashboardForRole('manager', tokens.manager);

  // 5. Test Vendor Dashboard
  await testDashboardForRole('vendor', tokens.vendor);

  // 6. Test filters on Admin Dashboard
  console.log('\nTesting date range and interval filters...');
  const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days ago
  const endDate = new Date().toISOString();
  await testDashboardForRole('admin', tokens.admin, {
    startDate,
    endDate,
    interval: 'day',
  });

  console.log('\n=== All Dashboard Coordinates Tests Passed! ===\n');
}

runTests();
