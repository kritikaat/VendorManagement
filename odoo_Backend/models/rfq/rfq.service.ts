import { RFQModel } from './rfq.model.js';
import { IRFQ, RFQStatus } from './rfq.type.js';
import { QueryOptions } from '../../types/common.type.js';

export class RFQService {
  public static async create(data: Partial<IRFQ>): Promise<IRFQ> {
    const rfq = new RFQModel(data);
    return rfq.save();
  }

  public static async findById(id: string): Promise<IRFQ | null> {
    return RFQModel.findById(id)
      .populate('createdBy', 'firstName lastName email')
      .populate('assignedVendors', 'companyName vendorCode email')
      .exec();
  }

  public static async findRaw(id: string): Promise<IRFQ | null> {
    return RFQModel.findOne({ _id: id, isDeleted: false }).exec();
  }

  public static async list(
    filter: Record<string, any>,
    options: QueryOptions
  ): Promise<{ docs: IRFQ[]; total: number }> {
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
      RFQModel.find(baseFilter)
        .populate('createdBy', 'firstName lastName email')
        .populate('assignedVendors', 'companyName vendorCode email')
        .sort(sort).skip(skip).limit(limit).exec(),
      RFQModel.countDocuments(baseFilter).exec(),
    ]);
    return { docs, total };
  }

  public static async update(id: string, data: Partial<IRFQ>): Promise<IRFQ | null> {
    return RFQModel.findByIdAndUpdate(id, data, { new: true, runValidators: true }).exec();
  }

  public static async softDelete(id: string): Promise<IRFQ | null> {
    return RFQModel.findByIdAndUpdate(id, { isDeleted: true, isActive: false }, { new: true }).exec();
  }

  public static async assignVendors(id: string, vendorIds: string[]): Promise<IRFQ | null> {
    return RFQModel.findByIdAndUpdate(
      id,
      { $addToSet: { assignedVendors: { $each: vendorIds } }, status: 'Published' },
      { new: true }
    ).exec();
  }

  public static async addAttachment(id: string, url: string): Promise<IRFQ | null> {
    return RFQModel.findByIdAndUpdate(
      id,
      { $push: { attachments: url } },
      { new: true }
    ).exec();
  }

  public static async close(id: string): Promise<IRFQ | null> {
    return RFQModel.findByIdAndUpdate(id, { status: 'Closed' }, { new: true }).exec();
  }
}
