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
