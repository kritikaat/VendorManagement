export type ActivityEventType = 'rfq' | 'approval' | 'invoice' | 'vendor' | 'quotation';

export interface ActivityLog {
  id: string;
  type: ActivityEventType;
  title: string;
  description: string;
  timestamp: string;
}
