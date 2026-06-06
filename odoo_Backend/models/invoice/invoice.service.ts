import { InvoiceModel } from './invoice.model.js';
import { IInvoice } from './invoice.type.js';
import { QueryOptions } from '../../types/common.type.js';

async function generateInvoiceNumber(): Promise<string> {
  const date = new Date();
  const datePart = date.toISOString().slice(0, 10).replace(/-/g, '');
  const prefix = `INV-${datePart}-`;
  const count = await InvoiceModel.countDocuments({
    invoiceNumber: { $regex: `^${prefix}` },
  });
  const seq = String(count + 1).padStart(4, '0');
  return `${prefix}${seq}`;
}

export class InvoiceService {
  public static async create(data: Partial<IInvoice>): Promise<IInvoice> {
    const invoiceNumber = await generateInvoiceNumber();
    const invoice = new InvoiceModel({ ...data, invoiceNumber });
    return invoice.save();
  }

  public static async findById(id: string): Promise<any | null> {
    const invoice = await InvoiceModel.findById(id)
      .populate('poId', 'poNumber status items subtotal tax total createdAt')
      .populate('vendorId', 'companyName vendorCode email phone address city state country GSTNumber')
      .exec();
    
    if (!invoice) return null;
    
    // Enrich invoice with additional details for frontend
    const invoiceObj = invoice.toObject();
    const vendor = invoiceObj.vendorId as any;
    const po = invoiceObj.poId as any;
    
    // Add vendor details
    invoiceObj.vendorDetails = {
      name: vendor?.companyName || '—',
      email: vendor?.email || '',
      address: `${vendor?.address || ''}, ${vendor?.city || ''}, ${vendor?.state || ''}, ${vendor?.country || ''}`.trim(),
      gstin: vendor?.GSTNumber || '',
    };
    
    // Add bill to (company/organization details - you can customize this)
    invoiceObj.billTo = {
      name: 'Your Company Name',
      address: 'Your Company Address',
      gstin: 'Your GSTIN',
    };
    
    // Add line items (map from items)
    invoiceObj.lineItems = invoiceObj.items;
    
    // Calculate CGST and SGST (split tax equally)
    const halfTax = invoiceObj.tax / 2;
    invoiceObj.cgst = parseFloat(halfTax.toFixed(2));
    invoiceObj.sgst = parseFloat(halfTax.toFixed(2));
    
    // Add missing fields
    invoiceObj.grandTotal = invoiceObj.total;
    invoiceObj.poNumber = po?.poNumber || '—';
    invoiceObj.poDate = po?.createdAt || invoiceObj.createdAt;
    invoiceObj.invoiceDate = invoiceObj.createdAt;
    
    return invoiceObj;
  }

  public static async findRaw(id: string): Promise<IInvoice | null> {
    return InvoiceModel.findOne({ _id: id, isDeleted: false }).exec();
  }

  public static async list(
    filter: Record<string, any>,
    options: QueryOptions
  ): Promise<{ docs: IInvoice[]; total: number }> {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;
    const baseFilter = { ...filter, isDeleted: false };
    const [docs, total] = await Promise.all([
      InvoiceModel.find(baseFilter)
        .populate('vendorId', 'companyName vendorCode')
        .populate('poId', 'poNumber')
        .sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      InvoiceModel.countDocuments(baseFilter).exec(),
    ]);
    return { docs, total };
  }

  public static async updateStatus(id: string, status: string): Promise<IInvoice | null> {
    return InvoiceModel.findByIdAndUpdate(id, { status }, { new: true }).exec();
  }
}
