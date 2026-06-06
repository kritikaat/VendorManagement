import { ApprovalModel } from './approval.model.js';
import { IApproval } from './approval.type.js';
import { QueryOptions } from '../../types/common.type.js';

export class ApprovalService {
  public static async create(data: Partial<IApproval>): Promise<IApproval> {
    const approval = new ApprovalModel(data);
    return approval.save();
  }

  public static async findById(id: string): Promise<IApproval | null> {
    return ApprovalModel.findById(id)
      .populate('rfqId', 'title description')
      .populate({
        path: 'quotationId',
        select: 'pricing deliveryTimeline status',
        populate: {
          path: 'vendorId',
          select: 'companyName vendorCode email'
        }
      })
      .populate('approverId', 'firstName lastName email')
      .populate('requestedBy', 'firstName lastName email')
      .exec();
  }

  public static async findRaw(id: string): Promise<IApproval | null> {
    return ApprovalModel.findOne({ _id: id, isDeleted: false }).exec();
  }

  public static async findByQuotation(quotationId: string): Promise<IApproval | null> {
    return ApprovalModel.findOne({ quotationId, isDeleted: false }).exec();
  }

  public static async list(
    filter: Record<string, any>,
    options: QueryOptions
  ): Promise<{ docs: any[]; total: number }> {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;
    const baseFilter = { ...filter, isDeleted: false };
    const [docs, total] = await Promise.all([
      ApprovalModel.find(baseFilter)
        .populate('rfqId', 'title')
        .populate({
          path: 'quotationId',
          select: 'pricing deliveryTimeline status',
          populate: {
            path: 'vendorId',
            select: 'companyName vendorCode email'
          }
        })
        .populate('approverId', 'firstName lastName')
        .populate('requestedBy', 'firstName lastName')
        .sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      ApprovalModel.countDocuments(baseFilter).exec(),
    ]);
    
    // Calculate totalCost for each approval
    const docsWithTotal = docs.map((doc: any) => {
      const approval = doc.toObject();
      if (approval.quotationId && approval.quotationId.pricing) {
        const totalCost = approval.quotationId.pricing.reduce((sum: number, item: any) => sum + (item.totalPrice || 0), 0);
        approval.quotationId.totalCost = totalCost;
        approval.quotationId.grandTotal = totalCost;
      }
      return approval;
    });
    
    return { docs: docsWithTotal, total };
  }

  public static async approve(id: string, approverId: string, remarks?: string): Promise<IApproval | null> {
    return ApprovalModel.findByIdAndUpdate(
      id,
      { status: 'Approved', approverId, remarks: remarks || '', approvedAt: new Date() },
      { new: true }
    ).exec();
  }

  public static async reject(id: string, approverId: string, remarks: string): Promise<IApproval | null> {
    return ApprovalModel.findByIdAndUpdate(
      id,
      { status: 'Rejected', approverId, remarks, approvedAt: new Date() },
      { new: true }
    ).exec();
  }
}
