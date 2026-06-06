import { BaseDocument } from '../shared/schema.type.js';

export type VendorStatus = 'Active' | 'Inactive' | 'Blacklisted';

export interface IVendor extends BaseDocument {
  companyName: string;
  vendorCode: string;
  category: string;
  GSTNumber: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  rating: number;
  status: VendorStatus;
}
