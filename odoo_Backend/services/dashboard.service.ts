import { RFQModel } from '../models/rfq/rfq.model.js';
import { ApprovalModel } from '../models/approval/approval.model.js';
import { PurchaseOrderModel } from '../models/purchaseOrder/purchaseOrder.model.js';
import { InvoiceModel } from '../models/invoice/invoice.model.js';
import { VendorModel } from '../models/vendor/vendor.model.js';
import { QuotationModel } from '../models/quotation/quotation.model.js';

export interface DashboardCoordinate {
  x: string;
  y: number;
  count?: number;
}

export class DashboardService {
  /**
   * Helper to aggregate coordinates for trend lines/bars
   */
  public static async getTrendData(
    model: any,
    filter: Record<string, any>,
    dateField: string,
    interval: 'day' | 'month' | 'year',
    sumField?: string
  ): Promise<DashboardCoordinate[]> {
    const formatMap = {
      day: '%Y-%m-%d',
      month: '%Y-%m',
      year: '%Y',
    };
    const format = formatMap[interval] || '%Y-%m';

    const pipeline: any[] = [
      { $match: { ...filter, isDeleted: false } },
      {
        $group: {
          _id: {
            $dateToString: { format: format, date: `$${dateField}` },
          },
          y: sumField ? { $sum: `$${sumField}` } : { $sum: 1 },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          x: '$_id',
          y: 1,
          count: 1,
        },
      },
    ];

    return model.aggregate(pipeline).exec();
  }

  /**
   * Helper to aggregate distribution pie chart data
   */
  public static async getDistribution(
    model: any,
    filter: Record<string, any>,
    groupField: string
  ): Promise<DashboardCoordinate[]> {
    const pipeline: any[] = [
      { $match: { ...filter, isDeleted: false } },
      {
        $group: {
          _id: `$${groupField}`,
          y: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          x: { $ifNull: ['$_id', 'Unknown'] },
          y: 1,
        },
      },
      { $sort: { x: 1 } },
    ];
    return model.aggregate(pipeline).exec();
  }

  /**
   * Admin: Get spend distribution by vendor (Pie/Donut chart coordinates)
   */
  public static async getSpendByVendor(filter: Record<string, any>, limitCount = 5): Promise<DashboardCoordinate[]> {
    const pipeline: any[] = [
      { $match: { ...filter, isDeleted: false } },
      {
        $group: {
          _id: '$vendorId',
          y: { $sum: '$total' },
        },
      },
      {
        $lookup: {
          from: 'vendors',
          localField: '_id',
          foreignField: '_id',
          as: 'vendor',
        },
      },
      { $unwind: '$vendor' },
      {
        $project: {
          _id: 0,
          x: '$vendor.companyName',
          y: 1,
        },
      },
      { $sort: { y: -1 } },
      { $limit: limitCount },
    ];
    return PurchaseOrderModel.aggregate(pipeline).exec();
  }

  /**
   * Calculates comparative percentage increase/decrease between two periods
   */
  public static calculateGrowth(current: number, previous: number): number {
    if (previous === 0) {
      return current > 0 ? 100 : 0;
    }
    return Math.round(((current - previous) / previous) * 100);
  }
}
