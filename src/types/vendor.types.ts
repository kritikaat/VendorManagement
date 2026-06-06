export type VendorStatus = 'active' | 'pending' | 'blocked';

export interface Vendor {
  id: string;
  name: string;
  category: string;
  gstNumber: string;
  contactNumber: string;
  email?: string;
  address?: string;
  rating?: number;
  vendorCode?: string;
  status: VendorStatus;
}
