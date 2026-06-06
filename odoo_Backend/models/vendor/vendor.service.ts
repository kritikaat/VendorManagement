import { VendorModel } from './vendor.model.js';
import { IVendor } from './vendor.type.js';
import { QueryOptions } from '../../types/common.type.js';

function generateVendorCode(): string {
  const date = new Date();
  const datePart = date.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `VND-${datePart}-${rand}`;
}

export class VendorService {
  public static async create(data: Partial<IVendor>): Promise<IVendor> {
    let vendorCode = generateVendorCode();
    // Ensure uniqueness
    let exists = await VendorModel.findOne({ vendorCode });
    while (exists) {
      vendorCode = generateVendorCode();
      exists = await VendorModel.findOne({ vendorCode });
    }
    const vendor = new VendorModel({ ...data, vendorCode });
    return vendor.save();
  }

  public static async findById(id: string): Promise<IVendor | null> {
    return VendorModel.findById(id).exec();
  }

  public static async findByEmail(email: string): Promise<IVendor | null> {
    return VendorModel.findOne({ email: email.toLowerCase(), isDeleted: false }).exec();
  }

  public static async findByIdRaw(id: string): Promise<IVendor | null> {
    return VendorModel.findOne({ _id: id, isDeleted: false }).exec();
  }

  public static async list(
    filter: Record<string, any>,
    options: QueryOptions
  ): Promise<{ docs: IVendor[]; total: number }> {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;
    const sort: Record<string, any> = {};
    if (options.sortBy) {
      sort[options.sortBy] = options.sortOrder === 'desc' ? -1 : 1;
    } else {
      sort.createdAt = -1;
    }
    const baseFilter = { ...filter, isDeleted: false };
    const [docs, total] = await Promise.all([
      VendorModel.find(baseFilter).sort(sort).skip(skip).limit(limit).exec(),
      VendorModel.countDocuments(baseFilter).exec(),
    ]);
    return { docs, total };
  }

  public static async update(id: string, data: Partial<IVendor>): Promise<IVendor | null> {
    return VendorModel.findByIdAndUpdate(id, data, { new: true, runValidators: true }).exec();
  }

  public static async softDelete(id: string): Promise<IVendor | null> {
    return VendorModel.findByIdAndUpdate(id, { isDeleted: true, isActive: false }, { new: true }).exec();
  }
}