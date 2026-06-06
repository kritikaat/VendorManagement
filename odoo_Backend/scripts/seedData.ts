/**
 * Seed script — creates sample data for development
 * Run: node --import tsx scripts/seedData.ts
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.development') });

import { UserModel } from '../models/user/user.model.js';
import { VendorModel } from '../models/vendor/vendor.model.js';
import { RFQModel } from '../models/rfq/rfq.model.js';

const MONGO_URI = process.env.MONGO_URI!;

async function seed() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log('Connected.');

  // Clear existing seed data
  await Promise.all([
    UserModel.deleteMany({ email: { $in: ['admin@pms.com', 'officer@pms.com', 'vendor@pms.com', 'manager@pms.com'] } }),
    VendorModel.deleteMany({ vendorCode: { $regex: /^VND-SEED/ } }),
  ]);

  // Create users
  const [admin, officer, vendor, manager] = await UserModel.create([
    {
      firstName: 'Super',
      lastName: 'Admin',
      email: 'admin@pms.com',
      password: 'Admin@1234',
      role: 'admin',
    },
    {
      firstName: 'Procurement',
      lastName: 'Officer',
      email: 'officer@pms.com',
      password: 'Officer@1234',
      role: 'procurement_officer',
    },
    {
      firstName: 'Vendor',
      lastName: 'User',
      email: 'vendor@acme.com',
      password: 'Vendor@1234',
      role: 'vendor',
    },
    {
      firstName: 'Manager',
      lastName: 'User',
      email: 'manager@pms.com',
      password: 'Manager@1234',
      role: 'manager',
    },
  ]);

  console.log('Users created:', admin.email, officer.email, vendor.email, manager.email);

  // Create vendors
  const vendors = await VendorModel.create([
    {
      companyName: 'Acme Corp',
      vendorCode: 'VND-SEED-0001',
      category: 'Electronics',
      GSTNumber: '29ABCDE1234F1Z5',
      email: 'vendor@acme.com',
      phone: '9876543210',
      address: '123 Main St',
      city: 'Bangalore',
      state: 'Karnataka',
      country: 'India',
      rating: 4.5,
      status: 'Active',
    },
    {
      companyName: 'Global Supplies Ltd',
      vendorCode: 'VND-SEED-0002',
      category: 'Office Supplies',
      GSTNumber: '27FGHIJ5678K2L6',
      email: 'contact@global.com',
      phone: '9123456780',
      address: '456 Park Ave',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      rating: 3.8,
      status: 'Active',
    },
  ]);

  console.log('Vendors created:', vendors.map((v) => v.companyName).join(', '));

  // Create sample RFQ
  const rfq = await RFQModel.create({
    title: 'Q4 Office Equipment Procurement',
    description: 'Procuring laptops and peripherals for Q4',
    products: [
      { name: 'Laptop', specification: '16GB RAM, 512GB SSD', quantity: 10 },
      { name: 'Wireless Mouse', specification: 'Ergonomic, Bluetooth', quantity: 20 },
    ],
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    status: 'Published',
    createdBy: officer._id,
    assignedVendors: [vendors[0]._id],
  });

  console.log('RFQ created:', rfq.title);

  console.log('\n=== SEED COMPLETE ===');
  console.log('Login credentials:');
  console.log('  Admin:             admin@pms.com / Admin@1234');
  console.log('  Procurement Officer: officer@pms.com / Officer@1234');
  console.log('  Vendor:            vendor@acme.com / Vendor@1234');
  console.log('  Manager:           manager@pms.com / Manager@1234');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
