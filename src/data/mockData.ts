import type { Vendor } from '@/types/vendor.types';
import type { Rfq } from '@/types/rfq.types';
import type { QuotationComparison } from '@/types/quotation.types';

export const MOCK_VENDORS: Vendor[] = [
  {
    id: 'v1',
    name: 'Infra Supplies Pvt ltd',
    category: 'IT',
    gstNumber: '27AABCS1429Bz0',
    contactNumber: '+91 98765 43210',
    email: 'contact@infrasupplies.com',
    status: 'active',
  },
  {
    id: 'v2',
    name: 'Tech Core LTD',
    category: 'logistics',
    gstNumber: '24AABCT1234C1Z5',
    contactNumber: '+91 91234 56789',
    email: 'sales@techcore.com',
    status: 'active',
  },
  {
    id: 'v3',
    name: 'FastLog Transport',
    category: 'logistics',
    gstNumber: '29AABCF5678D1Z2',
    contactNumber: '+91 99887 76655',
    email: 'info@fastlog.com',
    status: 'blocked',
  },
  {
    id: 'v4',
    name: 'Office Need Co.',
    category: 'furniture',
    gstNumber: '07AABCO9012E1Z8',
    contactNumber: '+91 98123 45678',
    status: 'pending',
  },
];

export const MOCK_RFQ: Rfq = {
  id: 'rfq-office-furniture-q2',
  title: 'Office Furniture procurement Q2',
  category: 'Furniture',
  deadline: '2025-06-15',
  description: 'Ergonomic chairs and standing desks for 3rd floor',
  status: 'published',
  lineItems: [
    { id: 'li1', item: 'Ergonomic chair', qty: 25, unit: 'NOS' },
    { id: 'li2', item: 'Standing desks', qty: 10, unit: 'NOS' },
  ],
  assignedVendorIds: ['v1', 'v2'],
};

export const MOCK_RFQS: Rfq[] = [
  MOCK_RFQ,
  {
    id: 'rfq-it-hardware-q2',
    title: 'IT Hardware refresh Q2',
    category: 'IT Hardware',
    deadline: '2025-07-01',
    description: 'Laptops and monitors for new hires',
    status: 'draft',
    lineItems: [{ id: 'li3', item: 'Laptop', qty: 15, unit: 'NOS' }],
    assignedVendorIds: ['v1'],
  },
];

export const MOCK_QUOTATION_COMPARISONS: QuotationComparison[] = [
  {
    vendorId: 'v1',
    vendorName: 'Infra Supplies',
    grandTotal: 185000,
    gstPercent: 18,
    deliveryDays: 10,
    rating: 4.5,
    paymentTerms: '30 days',
    isLowest: true,
  },
  {
    vendorId: 'v2',
    vendorName: 'TechCore LTD',
    grandTotal: 200010,
    gstPercent: 18,
    deliveryDays: 14,
    rating: 4.2,
    paymentTerms: '30 days',
  },
  {
    vendorId: 'v4',
    vendorName: 'Office Need Co.',
    grandTotal: 214800,
    gstPercent: 18,
    deliveryDays: 7,
    rating: 3.8,
    paymentTerms: '15 days',
  },
];

export const MOCK_SUBMIT_QUOTATION_ITEMS = [
  { item: 'Ergonomic chair', qty: 25, unitPrice: 3500, deliveryDays: 7 },
  { item: 'Standing desk', qty: 10, unitPrice: 8200, deliveryDays: 14 },
];

export const MOCK_APPROVALS = [
  {
    id: 'ap1',
    rfqTitle: 'Office furniture Q2',
    vendor: 'Infra Supplies',
    amount: 185400,
    status: 'pending' as const,
    currentStep: 'L2 approval',
    submittedAt: '2025-05-20',
  },
  {
    id: 'ap2',
    rfqTitle: 'IT Hardware refresh Q2',
    vendor: 'Tech Core LTD',
    amount: 140000,
    status: 'approved' as const,
    currentStep: 'Generate PO',
    submittedAt: '2025-05-15',
  },
  {
    id: 'ap3',
    rfqTitle: 'Stationery bulk order',
    vendor: 'Office Need Co.',
    amount: 34900,
    status: 'rejected' as const,
    currentStep: 'L1 Review',
    submittedAt: '2025-05-10',
  },
];

export const MOCK_APPROVAL_DETAIL = {
  id: 'ap1',
  rfqTitle: 'Office furniture Q2',
  vendor: 'Infra Supplies',
  amount: 185400,
  steps: [
    { label: 'Submitted', status: 'completed' as const },
    { label: 'L1 Review', status: 'completed' as const },
    { label: 'L2 approval', status: 'current' as const },
    { label: 'Generate PO', status: 'upcoming' as const },
  ],
  chain: [
    {
      name: 'Rahul Mehta',
      role: 'Procurement head',
      status: 'completed' as const,
      note: 'Approved on May 20, 10:32 AM',
    },
    {
      name: 'Priya Shah',
      role: 'Finance manager',
      status: 'current' as const,
      note: 'Awaiting — Assigned May 21',
    },
  ],
  quotation: {
    vendor: 'Infra Supplies PVT LTD',
    total: 185400,
    delivery: '10 days',
    rating: '4.5/5',
  },
};

export const MOCK_PURCHASE_ORDERS = [
  {
    id: 'po1',
    poNumber: 'PO-2025-0068',
    vendor: 'Infra Supplies Pvt ltd',
    amount: 200010,
    issueDate: '2025-05-21',
    deliveryDate: '2025-05-31',
    status: 'approved' as const,
  },
  {
    id: 'po2',
    poNumber: 'PO-2025-0067',
    vendor: 'Tech Core LTD',
    amount: 140000,
    issueDate: '2025-05-18',
    deliveryDate: '2025-06-01',
    status: 'pending' as const,
  },
  {
    id: 'po3',
    poNumber: 'PO-2025-0066',
    vendor: 'Office Need Co.',
    amount: 34900,
    issueDate: '2025-05-12',
    deliveryDate: '2025-05-19',
    status: 'draft' as const,
  },
];

export const MOCK_INVOICE_DETAIL = {
  id: 'inv1',
  invoiceNumber: 'INV-2025-0042',
  poNumber: 'PO-2025-0068',
  poDate: '21 May, 2025',
  invoiceDate: '22 May 2025',
  dueDate: '21 June 2025',
  status: 'pending' as const,
  billTo: {
    name: 'Your Organization Name',
    address: '123 Business Park, Ahmedabad',
    gstin: '25383438AFB',
  },
  vendor: {
    name: 'Infra supplies pvt ltd',
    address: '456, Industrial Estate, Surat',
    gstin: '343434DB4523',
  },
  lineItems: [
    { item: 'Ergonomic chair', qty: 25, unitPrice: 3500, total: 87500 },
    { item: 'Standing desk', qty: 10, unitPrice: 8200, total: 82000 },
  ],
  subtotal: 169500,
  cgst: 15255,
  sgst: 15255,
  grandTotal: 200010,
};

export const MOCK_INVOICES = [
  {
    id: 'inv1',
    invoiceNumber: 'INV-2025-0042',
    poNumber: 'PO-2025-0068',
    vendor: 'Infra Supplies Pvt ltd',
    amount: 200010,
    issueDate: '2025-05-22',
    dueDate: '2025-06-21',
    status: 'pending' as const,
  },
  {
    id: 'inv2',
    invoiceNumber: 'INV-2025-0041',
    poNumber: 'PO-2025-0067',
    vendor: 'Tech Core LTD',
    amount: 140000,
    issueDate: '2025-05-19',
    dueDate: '2025-06-18',
    status: 'paid' as const,
  },
  {
    id: 'inv3',
    invoiceNumber: 'INV-2025-0038',
    poNumber: 'PO-2025-0060',
    vendor: 'FastLog Transport',
    amount: 89000,
    issueDate: '2025-04-10',
    dueDate: '2025-05-10',
    status: 'overdue' as const,
  },
];

export const MOCK_ACTIVITY_LOGS = [
  {
    id: 'log1',
    type: 'quotation' as const,
    title: 'Quotation selected',
    description: 'Infra supplies pvt ltd selected for office furniture Q2',
    timestamp: '23 May 2025, 9:15 PM',
  },
  {
    id: 'log2',
    type: 'approval' as const,
    title: 'Approval pending',
    description: 'PO-2024 awaiting L2 approval by Priya Shah',
    timestamp: '22 May 2025, 09:15 AM',
  },
  {
    id: 'log3',
    type: 'rfq' as const,
    title: 'RFQ published',
    description: 'Office furniture Q2 sent to 3 vendors',
    timestamp: '19 May 2025',
  },
  {
    id: 'log4',
    type: 'vendor' as const,
    title: 'Vendor added',
    description: 'FastLog transport registered and pending verifications',
    timestamp: '18 May 2025, 3:20 PM',
  },
];

export const MOCK_REPORTS = {
  month: 'May 2025',
  kpis: {
    totalSpend: '12.4 L',
    activeVendors: 28,
    poFulfillment: '94%',
    overdueInvoices: 3,
  },
  categorySpend: [
    { name: 'IT Hardware', amount: '₹4.8L', percent: 80, color: 'bg-blue-500' },
    { name: 'Furniture', amount: '₹3.2L', percent: 55, color: 'bg-emerald-500' },
    { name: 'Stationery', amount: '₹2.1L', percent: 35, color: 'bg-amber-500' },
    { name: 'Logistics', amount: '₹2.3L', percent: 40, color: 'bg-orange-500' },
  ],
  topVendors: [
    { vendor: 'TechCore Ltd', spend: '4,20,000', pos: 6 },
    { vendor: 'Infra Supplies', spend: '3,10,000', pos: 4 },
    { vendor: 'FastLog', spend: '1,90,000', pos: 3 },
  ],
  monthlyTrend: [
    { month: 'Dec', value: 45 },
    { month: 'Jan', value: 52 },
    { month: 'Feb', value: 48 },
    { month: 'Mar', value: 61 },
    { month: 'Apr', value: 55 },
    { month: 'May', value: 72 },
  ],
};

