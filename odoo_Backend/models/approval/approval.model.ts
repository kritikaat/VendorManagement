import { Schema, model } from 'mongoose';
import { IApproval } from './approval.type.js';
import { baseSchemaDefinition, softDeletePlugin } from '../shared/schema.js';

const approvalSchema = new Schema<IApproval>(
  {
    rfqId: { type: Schema.Types.ObjectId, ref: 'RFQ', required: true, index: true },
    quotationId: { type: Schema.Types.ObjectId, ref: 'Quotation', required: true, index: true },
    approverId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    requestedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    remarks: { type: String, default: '' },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
      index: true,
    },
    approvedAt: { type: Date },
    ...baseSchemaDefinition,
  },
  { timestamps: true }
);

approvalSchema.plugin(softDeletePlugin);

export const ApprovalModel = model<IApproval>('Approval', approvalSchema);
export default ApprovalModel;
