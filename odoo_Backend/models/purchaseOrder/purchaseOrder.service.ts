import { PurchaseOrderModel } from './purchaseOrder.model.js';
import { IPurchaseOrder } from './purchaseOrder.type.js';
import { QueryOptions } from '../../types/common.type.js';

async function generatePONumber(): Promise<string> {
  const date = new Date();
  const datePart = date.toISOString().slice(0, 10).replace(/-/g, '');
  const prefix = `PO-${datePart}-`;
  // Count existing POs for today
  const count = await PurchaseOrderModel.countDocuments({
    poNumber: { $regex: `^${prefix}` },
  });
  const seq = String(count + 1).padStart(4, '0');
  return `${prefix}${seq}`;
}

export class PurchaseOrderService {
  public static async create(data: Partial<IPurchaseOrder>): Promise<IPurchaseOrder> {
    const poNumber = await generatePONumber();
    const po = new PurchaseOrderModel({ ...data, poNumber });
    return po.save();
  }

  public static async findById(id: string): Promise<IPurchaseOrder | null> {
    return PurchaseOrderModel.findById(id)
      .populate('vendorId', 'companyName vendorCode email phone address city state country GSTNumber')
      .populate('rfqId', 'title description products')
      .populate('quotationId', 'pricing deliveryTimeline notes')
      .populate('approvalId', 'status remarks approvedAt')
      .exec();
  }

  public static async findRaw(id: string): Promise<IPurchaseOrder | null> {
    return PurchaseOrderModel.findOne({ _id: id, isDeleted: false }).exec();
  }

  public static async list(
    filter: Record<string, any>,
    options: QueryOptions
  ): Promise<{ docs: IPurchaseOrder[]; total: number }> {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;
    const baseFilter = { ...filter, isDeleted: false };
    const [docs, total] = await Promise.all([
      PurchaseOrderModel.find(baseFilter)
        .populate('vendorId', 'companyName vendorCode')
        .populate('rfqId', 'title')
        .sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      PurchaseOrderModel.countDocuments(baseFilter).exec(),
    ]);
    return { docs, total };
  }

  public static async updateStatus(id: string, status: string): Promise<IPurchaseOrder | null> {
    return PurchaseOrderModel.findByIdAndUpdate(id, { status }, { new: true }).exec();
  }
}
