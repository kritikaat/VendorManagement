import { api, unwrap, unwrapPaginated } from '@/api/axios';
import { ENDPOINTS } from '@/api/endpoints';
import { normalizeStatus, resolveId, toApiStatus } from '@/api/mappers';
import type { Approval, ApprovalStatus } from '@/types/approval.types';

interface ApiApproval {
  _id?: string;
  id?: string;
  rfqId?: { title?: string } | string;
  quotationId?: {
    totalCost?: number;
    grandTotal?: number;
    vendorId?: { companyName?: string; name?: string };
  };
  currentStage?: string;
  status: string;
  createdAt?: string;
}

function mapApproval(a: ApiApproval): Approval {
  const rfqTitle =
    typeof a.rfqId === 'object' && a.rfqId?.title ? a.rfqId.title : 'RFQ';
  const vendor =
    typeof a.quotationId === 'object' && a.quotationId?.vendorId
      ? (a.quotationId.vendorId.companyName ?? a.quotationId.vendorId.name ?? 'Vendor')
      : 'Vendor';
  const amount =
    typeof a.quotationId === 'object'
      ? (a.quotationId.totalCost ?? a.quotationId.grandTotal ?? 0)
      : 0;

  return {
    id: resolveId(a),
    rfqTitle,
    vendor,
    amount,
    status: normalizeStatus(a.status) as ApprovalStatus,
    currentStep: a.currentStage?.replace(/_/g, ' ') ?? 'Review',
    submittedAt: a.createdAt ? new Date(a.createdAt).toLocaleDateString() : '—',
  };
}

export const approvalsApi = {
  list: async (params: { page?: number; limit?: number; status?: string } = {}) => {
    const apiStatus = params.status ? toApiStatus(params.status) : 'Pending';
    const result = await unwrapPaginated<ApiApproval>(
      api.get(ENDPOINTS.approvals, {
        params: {
          page: params.page ?? 1,
          limit: params.limit ?? 50,
          status: apiStatus,
        },
      }),
    );
    return { ...result, items: result.items.map(mapApproval) };
  },

  create: (payload: { rfqId: string; quotationId: string }) =>
    unwrap(api.post(ENDPOINTS.approvals, payload)),

  getTimeline: (id: string) => unwrap(api.get(ENDPOINTS.approvalTimeline(id))),

  approve: (id: string, remarks?: string) =>
    unwrap(api.put(ENDPOINTS.approvalApprove(id), { remarks })),

  reject: (id: string, remarks: string) =>
    unwrap(api.put(ENDPOINTS.approvalReject(id), { remarks })),
};
