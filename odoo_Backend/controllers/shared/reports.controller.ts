import { Request, Response, NextFunction } from 'express';
import { QuotationModel } from '../../models/quotation/quotation.model.js';
import { PurchaseOrderModel } from '../../models/purchaseOrder/purchaseOrder.model.js';
import { InvoiceModel } from '../../models/invoice/invoice.model.js';
import { RFQModel } from '../../models/rfq/rfq.model.js';
import { VendorModel } from '../../models/vendor/vendor.model.js';
import { ApprovalModel } from '../../models/approval/approval.model.js';
import { ResponseFormatter } from '../../functions/sendRes.js';
import { HTTP_STATUS } from '../../constants/json/status.js';

export class ReportsController {
  public static async vendorPerformance(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await QuotationModel.aggregate([
        { $match: { isDeleted: false } },
        {
          $group: {
            _id: '$vendorId',
            totalQuotations: { $sum: 1 },
            avgDelivery: { $avg: '$deliveryTimeline' },
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
          $lookup: {
            from: 'purchaseorders',
            localField: '_id',
            foreignField: 'vendorId',
            as: 'pos',
          },
        },
        {
          $project: {
            vendor: { companyName: 1, vendorCode: 1, rating: 1, category: 1 },
            totalQuotations: 1,
            wonPOs: { $size: '$pos' },
            avgDelivery: { $round: ['$avgDelivery', 1] },
          },
        },
        {
          $addFields: {
            winRate: {
              $cond: [
                { $gt: ['$totalQuotations', 0] },
                { $multiply: [{ $divide: ['$wonPOs', '$totalQuotations'] }, 100] },
                0,
              ],
            },
          },
        },
      ]);

      ResponseFormatter.send(res, HTTP_STATUS.OK, 'Vendor performance report.', data);
    } catch (error) {
      next(error);
    }
  }

  public static async procurementSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const [totalRFQs, totalPOs, totalInvoices, totalVendors, pendingApprovals, spendAgg] = await Promise.all([
        RFQModel.countDocuments({ isDeleted: false }),
        PurchaseOrderModel.countDocuments({ isDeleted: false }),
        InvoiceModel.countDocuments({ isDeleted: false }),
        VendorModel.countDocuments({ isDeleted: false }),
        ApprovalModel.countDocuments({ status: 'Pending', isDeleted: false }),
        PurchaseOrderModel.aggregate([
          { $match: { isDeleted: false } },
          { $group: { _id: null, totalSpend: { $sum: '$total' } } },
        ]),
      ]);

      ResponseFormatter.send(res, HTTP_STATUS.OK, 'Procurement summary.', {
        totalRFQs,
        totalPOs,
        totalInvoices,
        totalVendors,
        pendingApprovals,
        totalSpend: spendAgg[0]?.totalSpend || 0,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async monthlyTrends(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const twelveMonthsAgo = new Date();
      twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
      twelveMonthsAgo.setDate(1);
      twelveMonthsAgo.setHours(0, 0, 0, 0);

      const [rfqTrends, poTrends, invoiceTrends] = await Promise.all([
        RFQModel.aggregate([
          { $match: { createdAt: { $gte: twelveMonthsAgo }, isDeleted: false } },
          { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, count: { $sum: 1 } } },
          { $sort: { '_id.year': 1, '_id.month': 1 } },
        ]),
        PurchaseOrderModel.aggregate([
          { $match: { createdAt: { $gte: twelveMonthsAgo }, isDeleted: false } },
          { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, count: { $sum: 1 }, spend: { $sum: '$total' } } },
          { $sort: { '_id.year': 1, '_id.month': 1 } },
        ]),
        InvoiceModel.aggregate([
          { $match: { createdAt: { $gte: twelveMonthsAgo }, isDeleted: false } },
          { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, count: { $sum: 1 } } },
          { $sort: { '_id.year': 1, '_id.month': 1 } },
        ]),
      ]);

      ResponseFormatter.send(res, HTTP_STATUS.OK, 'Monthly trends.', { rfqTrends, poTrends, invoiceTrends });
    } catch (error) {
      next(error);
    }
  }

  public static async spendAnalysis(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const byVendor = await PurchaseOrderModel.aggregate([
        { $match: { isDeleted: false } },
        { $group: { _id: '$vendorId', totalSpend: { $sum: '$total' }, count: { $sum: 1 } } },
        { $lookup: { from: 'vendors', localField: '_id', foreignField: '_id', as: 'vendor' } },
        { $unwind: '$vendor' },
        { $project: { vendor: { companyName: 1, category: 1 }, totalSpend: 1, count: 1 } },
        { $sort: { totalSpend: -1 } },
      ]);

      const byCategory = await PurchaseOrderModel.aggregate([
        { $match: { isDeleted: false } },
        { $lookup: { from: 'vendors', localField: 'vendorId', foreignField: '_id', as: 'vendor' } },
        { $unwind: '$vendor' },
        { $group: { _id: '$vendor.category', totalSpend: { $sum: '$total' }, count: { $sum: 1 } } },
        { $sort: { totalSpend: -1 } },
      ]);

      ResponseFormatter.send(res, HTTP_STATUS.OK, 'Spend analysis.', { byVendor, byCategory });
    } catch (error) {
      next(error);
    }
  }

  public static async exportReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { format = 'json', type = 'summary' } = req.query;

      // Get summary data
      const [totalRFQs, totalPOs, totalInvoices, spendAgg] = await Promise.all([
        RFQModel.countDocuments({ isDeleted: false }),
        PurchaseOrderModel.countDocuments({ isDeleted: false }),
        InvoiceModel.countDocuments({ isDeleted: false }),
        PurchaseOrderModel.aggregate([
          { $match: { isDeleted: false } },
          { $group: { _id: null, totalSpend: { $sum: '$total' } } },
        ]),
      ]);

      const reportData = {
        generatedAt: new Date().toISOString(),
        totalRFQs,
        totalPOs,
        totalInvoices,
        totalSpend: spendAgg[0]?.totalSpend || 0,
      };

      if (format === 'csv') {
        const csv = [
          'Metric,Value',
          `Generated At,${reportData.generatedAt}`,
          `Total RFQs,${reportData.totalRFQs}`,
          `Total Purchase Orders,${reportData.totalPOs}`,
          `Total Invoices,${reportData.totalInvoices}`,
          `Total Spend,${reportData.totalSpend}`,
        ].join('\n');

        res.set({
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="procurement-report.csv"',
        });
        return res.send(csv) as any;
      }

      ResponseFormatter.send(res, HTTP_STATUS.OK, 'Export data.', reportData);
    } catch (error) {
      next(error);
    }
  }
}
