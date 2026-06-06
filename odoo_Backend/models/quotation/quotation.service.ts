import { QuotationModel } from './quotation.model.js';
import { IQuotation } from './quotation.type.js';
import { QueryOptions } from '../../types/common.type.js';

export class QuotationService {
  public static async create(data: Partial<IQuotation>): Promise<IQuotation> {
    const q = new QuotationModel(data);
    return q.save();
  }

  public static async findById(id: string): Promise<IQuotation | null> {
    return QuotationModel.findById(id)
      .populate('rfqId', 'title deadline status')
      .populate('vendorId', 'companyName vendorCode email')
      .exec();
  }

  public static async findRaw(id: string): Promise<IQuotation | null> {
    return QuotationModel.findOne({ _id: id, isDeleted: false }).exec();
  }

  public static async findOne(filter: Record<string, any>): Promise<IQuotation | null> {
    return QuotationModel.findOne({ ...filter, isDeleted: false }).exec();
  }

  public static async listByVendor(
    vendorId: string,
    options: QueryOptions
  ): Promise<{ docs: IQuotation[]; total: number }> {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;
    const filter = { vendorId, isDeleted: false };
    const [docs, total] = await Promise.all([
      QuotationModel.find(filter)
        .populate('rfqId', 'title deadline status')
        .sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      QuotationModel.countDocuments(filter).exec(),
    ]);
    return { docs, total };
  }

  public static async listByRFQ(
    rfqId: string,
    options: QueryOptions
  ): Promise<{ docs: IQuotation[]; total: number }> {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;
    const filter = { rfqId, isDeleted: false };
    const [docs, total] = await Promise.all([
      QuotationModel.find(filter)
        .populate('vendorId', 'companyName vendorCode email rating')
        .sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      QuotationModel.countDocuments(filter).exec(),
    ]);
    return { docs, total };
  }

  public static async list(
    filters: { status?: string; rfqId?: string } = {},
    options: QueryOptions
  ): Promise<{ docs: IQuotation[]; total: number }> {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;
    
    const filter: Record<string, any> = { isDeleted: false };
    if (filters.status) filter.status = filters.status;
    if (filters.rfqId) filter.rfqId = filters.rfqId;
    
    const [docs, total] = await Promise.all([
      QuotationModel.find(filter)
        .populate('rfqId', 'title deadline status')
        .populate('vendorId', 'companyName vendorCode email rating')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      QuotationModel.countDocuments(filter).exec(),
    ]);
    return { docs, total };
  }

  public static async update(id: string, data: Partial<IQuotation>): Promise<IQuotation | null> {
    return QuotationModel.findByIdAndUpdate(id, data, { new: true, runValidators: true }).exec();
  }

  public static async withdraw(id: string): Promise<IQuotation | null> {
    return QuotationModel.findByIdAndUpdate(id, { status: 'Withdrawn' }, { new: true }).exec();
  }
}
