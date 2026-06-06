import { Request, Response, NextFunction } from 'express';
import { QuotationModel } from '../../models/quotation/quotation.model.js';
import { RFQService } from '../../models/rfq/rfq.service.js';
import { ResponseFormatter } from '../../functions/sendRes.js';
import { HTTP_STATUS } from '../../constants/json/status.js';
import { AppError } from '../../utils/appError.js';

export class ComparisonController {
  public static async compare(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { rfqId } = req.params;
      const { sortBy = 'price', vendorId } = req.query;

      const rfq = await RFQService.findById(rfqId);
      if (!rfq) return next(new AppError('RFQ not found.', HTTP_STATUS.NOT_FOUND));

      const filter: Record<string, any> = { rfqId, status: 'Submitted', isDeleted: false };
      if (vendorId) filter.vendorId = vendorId;

      const quotations = await QuotationModel.find(filter)
        .populate('vendorId', 'companyName vendorCode email rating')
        .exec();

      if (quotations.length === 0) {
        ResponseFormatter.send(res, HTTP_STATUS.OK, 'No submitted quotations for this RFQ.', { quotations: [], summary: null });
        return;
      }

      // Calculate totals for each quotation
      const comparisonData = quotations.map((q) => {
        const totalPrice = q.pricing.reduce((sum, item) => sum + item.totalPrice, 0);
        const vendor = q.vendorId as any;
        return {
          quotationId: q._id,
          _id: q._id,
          vendor: {
            id: vendor._id,
            companyName: vendor.companyName,
            vendorCode: vendor.vendorCode,
            email: vendor.email,
            rating: vendor.rating,
          },
          vendorId: vendor,
          pricing: q.pricing,
          totalPrice,
          totalCost: totalPrice,  // Add this for frontend compatibility
          grandTotal: totalPrice,  // Add this for frontend compatibility
          deliveryTimeline: q.deliveryTimeline,
          notes: q.notes,
          submittedAt: q.submittedAt,
        };
      });

      // Sort
      if (sortBy === 'price') {
        comparisonData.sort((a, b) => a.totalPrice - b.totalPrice);
      } else if (sortBy === 'delivery') {
        comparisonData.sort((a, b) => a.deliveryTimeline - b.deliveryTimeline);
      } else if (sortBy === 'rating') {
        comparisonData.sort((a, b) => (b.vendor.rating || 0) - (a.vendor.rating || 0));
      }

      // Annotate best options
      const lowestPrice = Math.min(...comparisonData.map((q) => q.totalPrice));
      const fastestDelivery = Math.min(...comparisonData.map((q) => q.deliveryTimeline));
      const highestRating = Math.max(...comparisonData.map((q) => q.vendor.rating || 0));

      const annotated = comparisonData.map((q) => ({
        ...q,
        isLowestPrice: q.totalPrice === lowestPrice,
        isFastestDelivery: q.deliveryTimeline === fastestDelivery,
        isHighestRated: q.vendor.rating === highestRating,
      }));

      const summary = {
        totalQuotations: annotated.length,
        lowestPrice,
        fastestDelivery,
        highestRating,
      };

      ResponseFormatter.send(res, HTTP_STATUS.OK, 'Comparison data fetched.', {
        rfq: { id: rfq._id, title: rfq.title, deadline: rfq.deadline },
        quotations: annotated,
        summary,
      });
    } catch (error) {
      next(error);
    }
  }
}
