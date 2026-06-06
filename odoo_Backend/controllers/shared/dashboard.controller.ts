import { Request, Response, NextFunction } from 'express';
import { RFQModel } from '../../models/rfq/rfq.model.js';
import { ApprovalModel } from '../../models/approval/approval.model.js';
import { PurchaseOrderModel } from '../../models/purchaseOrder/purchaseOrder.model.js';
import { InvoiceModel } from '../../models/invoice/invoice.model.js';
import { VendorModel } from '../../models/vendor/vendor.model.js';
import { QuotationModel } from '../../models/quotation/quotation.model.js';
import { ResponseFormatter } from '../../functions/sendRes.js';
import { HTTP_STATUS, DASHBOARD_MESSAGES } from '../../constants/json/status.js';
import { ROLES } from '../../constants/json/types.js';
import { VendorService } from '../../models/vendor/vendor.service.js';
import { DashboardService } from '../../services/dashboard.service.js';

export class DashboardController {
  public static async get(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const role = req.user!.role;
      const userId = req.user!.id;

      // ─── Query / Filter Parsing ──────────────────────────────────────────────────
      const startDateParam = req.query.startDate as string;
      const endDateParam = req.query.endDate as string;
      const intervalParam = req.query.interval as 'day' | 'month' | 'year';

      const endDate = endDateParam ? new Date(endDateParam) : new Date();
      const startDate = startDateParam
        ? new Date(startDateParam)
        : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Default interval logic based on date range duration
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const interval = intervalParam || (diffDays <= 30 ? 'day' : 'month');

      // Pagination for dashboard tables
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 5;
      const skip = (page - 1) * limit;

      // Base date match object
      const dateMatch = {
        createdAt: { $gte: startDate, $lte: endDate },
        isDeleted: false,
      };

      // Previous period matching (for growth/comparison metrics)
      const duration = endDate.getTime() - startDate.getTime();
      const prevStartDate = new Date(startDate.getTime() - duration);
      const prevEndDate = startDate;
      const prevDateMatch = {
        createdAt: { $gte: prevStartDate, $lte: prevEndDate },
        isDeleted: false,
      };

      // ─── Role-Based Dashboard Logic ───────────────────────────────────────────────
      if (role === ROLES.ADMIN || role === ROLES.SUPER_ADMIN || role === ROLES.STAFF) {
        // ─── ADMIN DASHBOARD ───
        const [
          currentSpendAgg,
          prevSpendAgg,
          currentRFQs,
          prevRFQs,
          totalVendors,
          pendingApprovals,
          poTrend,
          invoiceTrend,
          rfqStatusDistribution,
          spendByVendor,
          recentHighValuePOs,
          topVendorsList,
        ] = await Promise.all([
          PurchaseOrderModel.aggregate([
            { $match: { ...dateMatch, status: { $ne: 'Closed' } } },
            { $group: { _id: null, total: { $sum: '$total' } } },
          ]),
          PurchaseOrderModel.aggregate([
            { $match: { ...prevDateMatch, status: { $ne: 'Closed' } } },
            { $group: { _id: null, total: { $sum: '$total' } } },
          ]),
          RFQModel.countDocuments(dateMatch),
          RFQModel.countDocuments(prevDateMatch),
          VendorModel.countDocuments({ isDeleted: false, status: 'Active' }),
          ApprovalModel.countDocuments({ status: 'Pending', isDeleted: false }),
          DashboardService.getTrendData(PurchaseOrderModel, dateMatch, 'createdAt', interval, 'total'),
          DashboardService.getTrendData(InvoiceModel, dateMatch, 'createdAt', interval, 'total'),
          DashboardService.getDistribution(RFQModel, dateMatch, 'status'),
          DashboardService.getSpendByVendor(dateMatch, 5),
          PurchaseOrderModel.find({ isDeleted: false })
            .sort({ total: -1 })
            .skip(skip)
            .limit(limit)
            .populate('vendorId', 'companyName')
            .populate('rfqId', 'title')
            .exec(),
          PurchaseOrderModel.aggregate([
            { $match: { isDeleted: false } },
            { $group: { _id: '$vendorId', totalSpend: { $sum: '$total' }, poCount: { $sum: 1 } } },
            { $lookup: { from: 'vendors', localField: '_id', foreignField: '_id', as: 'vendor' } },
            { $unwind: '$vendor' },
            { $sort: { totalSpend: -1 } },
            { $skip: skip },
            { $limit: limit },
          ]),
        ]);

        const currentSpend = currentSpendAgg[0]?.total || 0;
        const prevSpend = prevSpendAgg[0]?.total || 0;

        const spendGrowth = DashboardService.calculateGrowth(currentSpend, prevSpend);
        const rfqGrowth = DashboardService.calculateGrowth(currentRFQs, prevRFQs);

        ResponseFormatter.send(res, HTTP_STATUS.OK, DASHBOARD_MESSAGES.FETCHED, {
          role,
          pendingApprovals,
          activeRFQs: currentRFQs,
          analytics: {
            totalVendors,
            totalPOs: poTrend.reduce((acc, curr) => acc + (curr.count || 0), 0),
            monthlySpend: currentSpend,
          },
          metrics: {
            totalSpend: currentSpend,
            spendGrowthPercentage: spendGrowth,
            totalRFQs: currentRFQs,
            rfqGrowthPercentage: rfqGrowth,
            activeVendors: totalVendors,
            pendingApprovals: pendingApprovals,
          },
          charts: {
            poTrend,
            invoiceTrend,
            rfqStatusDistribution,
            spendByVendor,
          },
          tables: {
            recentHighValuePOs,
            topVendors: topVendorsList.map((v) => ({
              vendorId: v._id,
              companyName: v.vendor.companyName,
              vendorCode: v.vendor.vendorCode,
              totalSpend: v.totalSpend,
              poCount: v.poCount,
            })),
          },
        });
        return;
      } else if (role === ROLES.PROCUREMENT_OFFICER) {
        // ─── PROCUREMENT OFFICER DASHBOARD ───
        const rfqFilter = { ...dateMatch, createdBy: userId };

        const [
          totalRFQs,
          activeRFQs,
          quotationsReceived,
          spendAuthorizedAgg,
          rfqStatusDistribution,
          rfqCreationTrend,
          quotationsReceivedTrend,
          recentRFQs,
        ] = await Promise.all([
          RFQModel.countDocuments(rfqFilter),
          RFQModel.countDocuments({ ...rfqFilter, status: 'Published' }),
          QuotationModel.countDocuments({
            ...dateMatch,
            rfqId: { $in: await RFQModel.find({ createdBy: userId, isDeleted: false }).distinct('_id') },
          }),
          PurchaseOrderModel.aggregate([
            {
              $match: {
                ...dateMatch,
                rfqId: { $in: await RFQModel.find({ createdBy: userId, isDeleted: false }).distinct('_id') },
              },
            },
            { $group: { _id: null, total: { $sum: '$total' } } },
          ]),
          DashboardService.getDistribution(RFQModel, rfqFilter, 'status'),
          DashboardService.getTrendData(RFQModel, rfqFilter, 'createdAt', interval),
          DashboardService.getTrendData(
            QuotationModel,
            {
              ...dateMatch,
              rfqId: { $in: await RFQModel.find({ createdBy: userId, isDeleted: false }).distinct('_id') },
            },
            'createdAt',
            interval
          ),
          RFQModel.find({ createdBy: userId, isDeleted: false })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .exec(),
        ]);

        const spendAuthorized = spendAuthorizedAgg[0]?.total || 0;

        // Fetch quotation counts for the table list
        const rfqIds = recentRFQs.map((r) => r._id);
        const qCounts = await QuotationModel.aggregate([
          { $match: { rfqId: { $in: rfqIds }, isDeleted: false } },
          { $group: { _id: '$rfqId', count: { $sum: 1 } } },
        ]);
        const countMap = new Map(qCounts.map((qc) => [qc._id.toString(), qc.count]));

        ResponseFormatter.send(res, HTTP_STATUS.OK, DASHBOARD_MESSAGES.FETCHED, {
          role,
          metrics: {
            totalRFQs,
            activeRFQs,
            quotationsReceived,
            spendAuthorized,
          },
          charts: {
            rfqStatusDistribution,
            rfqCreationTrend,
            quotationsReceivedTrend,
          },
          tables: {
            recentRFQs: recentRFQs.map((rfq) => ({
              ...rfq.toObject(),
              quotationCount: countMap.get(rfq._id.toString()) || 0,
            })),
          },
        });
        return;
      } else if (role === ROLES.VENDOR) {
        // ─── VENDOR DASHBOARD ───
        const vendorResult = await VendorService.list({ email: req.user!.email }, { page: 1, limit: 1 });
        if (vendorResult.docs.length === 0) {
          ResponseFormatter.send(res, HTTP_STATUS.OK, DASHBOARD_MESSAGES.FETCHED, {
            role,
            metrics: { assignedRFQs: 0, quotationsSubmitted: 0, purchaseOrdersReceived: 0, totalRevenue: 0 },
            charts: { quotationStatusDistribution: [], revenueTrend: [] },
            tables: { pendingRFQs: [], activePOs: [] },
          });
          return;
        }
        const vendorId = vendorResult.docs[0]._id;

        const vendorFilter = { ...dateMatch, vendorId };

        const [
          assignedRFQsCount,
          quotationsSubmittedCount,
          poReceivedCount,
          revenueAgg,
          quotationStatusDistribution,
          revenueTrend,
          pendingRFQs,
          activePOs,
        ] = await Promise.all([
          RFQModel.countDocuments({
            ...dateMatch,
            assignedVendors: vendorId,
            status: 'Published',
          }),
          QuotationModel.countDocuments({ ...dateMatch, vendorId }),
          PurchaseOrderModel.countDocuments({ ...dateMatch, vendorId }),
          PurchaseOrderModel.aggregate([
            { $match: { ...vendorFilter, status: { $in: ['Accepted', 'Closed', 'Sent'] } } },
            { $group: { _id: null, total: { $sum: '$total' } } },
          ]),
          DashboardService.getDistribution(QuotationModel, { ...dateMatch, vendorId }, 'status'),
          DashboardService.getTrendData(
            PurchaseOrderModel,
            { ...dateMatch, vendorId, status: { $in: ['Accepted', 'Closed', 'Sent'] } },
            'createdAt',
            interval,
            'total'
          ),
          RFQModel.find({
            assignedVendors: vendorId,
            status: 'Published',
            isDeleted: false,
            _id: {
              $nin: await QuotationModel.find({ vendorId, isDeleted: false }).distinct('rfqId'),
            },
          })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .exec(),
          PurchaseOrderModel.find({ vendorId, isDeleted: false })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('rfqId', 'title')
            .exec(),
        ]);

        const totalRevenue = revenueAgg[0]?.total || 0;

        ResponseFormatter.send(res, HTTP_STATUS.OK, DASHBOARD_MESSAGES.FETCHED, {
          role,
          metrics: {
            assignedRFQs: assignedRFQsCount,
            quotationsSubmitted: quotationsSubmittedCount,
            purchaseOrdersReceived: poReceivedCount,
            totalRevenue,
          },
          charts: {
            quotationStatusDistribution,
            revenueTrend,
          },
          tables: {
            pendingRFQs,
            activePOs,
          },
        });
        return;
      } else if (role === ROLES.MANAGER) {
        // ─── MANAGER DASHBOARD ───
        const managerFilter = { ...dateMatch };

        const [
          pendingApprovals,
          approvedCount,
          rejectedCount,
          approvedAmountAgg,
          approvalStatusDistribution,
          approvalTrend,
          pendingApprovalsList,
        ] = await Promise.all([
          ApprovalModel.countDocuments({ status: 'Pending', isDeleted: false }),
          ApprovalModel.countDocuments({ status: 'Approved', isDeleted: false }),
          ApprovalModel.countDocuments({ status: 'Rejected', isDeleted: false }),
          PurchaseOrderModel.aggregate([
            {
              $match: {
                ...dateMatch,
                approvalId: {
                  $in: await ApprovalModel.find({ status: 'Approved', isDeleted: false }).distinct('_id'),
                },
              },
            },
            { $group: { _id: null, total: { $sum: '$total' } } },
          ]),
          DashboardService.getDistribution(ApprovalModel, managerFilter, 'status'),
          DashboardService.getTrendData(
            ApprovalModel,
            { ...dateMatch, status: 'Approved' },
            'createdAt',
            interval
          ),
          ApprovalModel.find({ status: 'Pending', isDeleted: false })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate({
              path: 'quotationId',
              populate: { path: 'vendorId', select: 'companyName' },
            })
            .populate('rfqId', 'title')
            .populate('requestedBy', 'firstName lastName')
            .exec(),
        ]);

        const approvedAmount = approvedAmountAgg[0]?.total || 0;

        ResponseFormatter.send(res, HTTP_STATUS.OK, DASHBOARD_MESSAGES.FETCHED, {
          role,
          metrics: {
            pendingApprovals,
            approvedCount,
            rejectedCount,
            approvedAmount,
          },
          charts: {
            approvalStatusDistribution,
            approvalTrend,
          },
          tables: {
            pendingApprovalsList,
          },
        });
        return;
      } else {
        // Fallback or generic
        ResponseFormatter.send(res, HTTP_STATUS.OK, DASHBOARD_MESSAGES.FETCHED, {});
        return;
      }
    } catch (error) {
      next(error);
    }
  }
}
