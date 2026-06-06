import { Schema, model } from 'mongoose';
import { IVendor } from './vendor.type.js';
import { baseSchemaDefinition, softDeletePlugin } from '../shared/schema.js';

const vendorSchema = new Schema<IVendor>(
  {
    companyName: { type: String, required: true, trim: true },
    vendorCode: { type: String, required: true, unique: true, index: true },
    category: { type: String, required: true, trim: true, index: true },
    GSTNumber: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Blacklisted'],
      default: 'Active',
      index: true,
    },
    ...baseSchemaDefinition,
  },
  { timestamps: true }
);

vendorSchema.index({ companyName: 'text', email: 'text' });
vendorSchema.plugin(softDeletePlugin);

export const VendorModel = model<IVendor>('Vendor', vendorSchema);
export default VendorModel;
