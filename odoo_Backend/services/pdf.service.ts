import PDFDocument from 'pdfkit';
import { IPurchaseOrder } from '../models/purchaseOrder/purchaseOrder.type.js';
import { IInvoice } from '../models/invoice/invoice.type.js';

export class PDFService {
  /**
   * Generate a Purchase Order PDF and return as Buffer
   */
  public static generatePO(po: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const buffers: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // Header
      doc.fontSize(22).font('Helvetica-Bold').text('PURCHASE ORDER', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(10).font('Helvetica').text(`PO Number: ${po.poNumber}`, { align: 'center' });
      doc.text(`Date: ${new Date(po.createdAt).toLocaleDateString()}`, { align: 'center' });
      doc.moveDown();

      // Divider
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown();

      // Vendor info
      const vendor = po.vendorId;
      doc.fontSize(12).font('Helvetica-Bold').text('Vendor Details');
      doc.fontSize(10).font('Helvetica');
      if (vendor && typeof vendor === 'object') {
        doc.text(`Company: ${vendor.companyName || '-'}`);
        doc.text(`Email: ${vendor.email || '-'}`);
        doc.text(`Phone: ${vendor.phone || '-'}`);
        doc.text(`GST: ${vendor.GSTNumber || '-'}`);
        doc.text(`Address: ${vendor.address || ''}, ${vendor.city || ''}, ${vendor.state || ''}`);
      }
      doc.moveDown();

      // RFQ info
      const rfq = po.rfqId;
      doc.fontSize(12).font('Helvetica-Bold').text('RFQ Details');
      doc.fontSize(10).font('Helvetica');
      if (rfq && typeof rfq === 'object') {
        doc.text(`RFQ Title: ${rfq.title || '-'}`);
      }
      doc.moveDown();

      // Items table header
      doc.fontSize(12).font('Helvetica-Bold').text('Line Items');
      doc.moveDown(0.3);

      const tableTop = doc.y;
      doc.fontSize(9).font('Helvetica-Bold');
      doc.text('Product', 50, tableTop, { width: 200 });
      doc.text('Qty', 250, tableTop, { width: 60 });
      doc.text('Unit Price', 310, tableTop, { width: 90 });
      doc.text('Total', 400, tableTop, { width: 100 });
      doc.moveDown(0.5);

      doc.font('Helvetica');
      let y = doc.y;
      (po.items || []).forEach((item: any) => {
        doc.text(item.productName, 50, y, { width: 200 });
        doc.text(String(item.quantity), 250, y, { width: 60 });
        doc.text(`₹${item.unitPrice.toFixed(2)}`, 310, y, { width: 90 });
        doc.text(`₹${item.totalPrice.toFixed(2)}`, 400, y, { width: 100 });
        y += 18;
        doc.moveDown(0.2);
      });

      doc.moveTo(50, y).lineTo(550, y).stroke();
      y += 10;

      // Totals
      doc.fontSize(10).font('Helvetica-Bold');
      doc.text(`Subtotal: ₹${po.subtotal.toFixed(2)}`, 350, y);
      y += 18;
      doc.text(`Tax (${po.taxRate}%): ₹${po.tax.toFixed(2)}`, 350, y);
      y += 18;
      doc.fontSize(12).text(`TOTAL: ₹${po.total.toFixed(2)}`, 350, y);

      doc.moveDown(3);
      doc.fontSize(9).font('Helvetica').fillColor('grey').text('This is a system-generated document.', { align: 'center' });

      doc.end();
    });
  }

  /**
   * Generate an Invoice PDF and return as Buffer
   */
  public static generateInvoice(invoice: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const buffers: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // Header
      doc.fontSize(22).font('Helvetica-Bold').text('INVOICE', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(10).font('Helvetica').text(`Invoice Number: ${invoice.invoiceNumber}`, { align: 'center' });
      doc.text(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`, { align: 'center' });
      doc.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, { align: 'center' });
      doc.moveDown();

      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown();

      // Vendor info
      const vendor = invoice.vendorId;
      doc.fontSize(12).font('Helvetica-Bold').text('Bill To');
      doc.fontSize(10).font('Helvetica');
      if (vendor && typeof vendor === 'object') {
        doc.text(`Company: ${vendor.companyName || '-'}`);
        doc.text(`Email: ${vendor.email || '-'}`);
        doc.text(`GST: ${vendor.GSTNumber || '-'}`);
      }
      doc.moveDown();

      // PO info
      const po = invoice.poId;
      if (po && typeof po === 'object') {
        doc.fontSize(10).font('Helvetica-Bold').text(`Related PO: ${po.poNumber}`);
        doc.font('Helvetica');
      }
      doc.moveDown();

      // Items table
      doc.fontSize(12).font('Helvetica-Bold').text('Line Items');
      doc.moveDown(0.3);

      const tableTop = doc.y;
      doc.fontSize(9).font('Helvetica-Bold');
      doc.text('Product', 50, tableTop, { width: 200 });
      doc.text('Qty', 250, tableTop, { width: 60 });
      doc.text('Unit Price', 310, tableTop, { width: 90 });
      doc.text('Total', 400, tableTop, { width: 100 });
      doc.moveDown(0.5);

      doc.font('Helvetica');
      let y = doc.y;
      (invoice.items || []).forEach((item: any) => {
        doc.text(item.productName, 50, y, { width: 200 });
        doc.text(String(item.quantity), 250, y, { width: 60 });
        doc.text(`₹${item.unitPrice.toFixed(2)}`, 310, y, { width: 90 });
        doc.text(`₹${item.totalPrice.toFixed(2)}`, 400, y, { width: 100 });
        y += 18;
        doc.moveDown(0.2);
      });

      doc.moveTo(50, y).lineTo(550, y).stroke();
      y += 10;

      doc.fontSize(10).font('Helvetica-Bold');
      doc.text(`Subtotal: ₹${invoice.subtotal.toFixed(2)}`, 350, y);
      y += 18;
      doc.text(`Tax (${invoice.taxRate}%): ₹${invoice.tax.toFixed(2)}`, 350, y);
      y += 18;
      doc.fontSize(12).text(`TOTAL: ₹${invoice.total.toFixed(2)}`, 350, y);

      doc.moveDown(3);
      doc.fontSize(9).font('Helvetica').fillColor('grey').text('This is a system-generated invoice.', { align: 'center' });

      doc.end();
    });
  }
}
