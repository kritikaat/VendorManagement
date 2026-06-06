export const queryKeys = {
  dashboard: ['dashboard'] as const,
  vendors: {
    list: (filters: { keyword?: string; category?: string; status?: string }) =>
      ['vendors', 'list', filters] as const,
    detail: (id: string) => ['vendors', id] as const,
  },
  rfqs: {
    list: (status?: string) => ['rfqs', 'list', status] as const,
    detail: (id: string) => ['rfqs', id] as const,
  },
  quotations: {
    list: (filters?: { rfqId?: string; status?: string }) =>
      ['quotations', 'list', filters] as const,
    byRfq: (rfqId: string) => ['quotations', 'rfq', rfqId] as const,
    vendor: ['quotations', 'vendor'] as const,
  },
  comparisons: {
    detail: (rfqId: string, sortBy?: string) => ['comparisons', rfqId, sortBy] as const,
  },
  approvals: {
    list: (status?: string) => ['approvals', 'list', status] as const,
    timeline: (id: string) => ['approvals', 'timeline', id] as const,
  },
  purchaseOrders: {
    list: (status?: string) => ['purchaseOrders', 'list', status] as const,
    detail: (id: string) => ['purchaseOrders', id] as const,
  },
  invoices: {
    list: (status?: string) => ['invoices', 'list', status] as const,
    detail: (id: string) => ['invoices', id] as const,
  },
  logs: {
    list: (action?: string) => ['logs', action] as const,
  },
  reports: {
    summary: ['reports', 'summary'] as const,
    trends: ['reports', 'trends'] as const,
    spend: ['reports', 'spend'] as const,
  },
};
