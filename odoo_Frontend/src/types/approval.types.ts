export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface Approval {
  id: string;
  rfqTitle: string;
  vendor: string;
  amount: number;
  status: ApprovalStatus;
  currentStep: string;
  submittedAt: string;
}

export interface ApprovalStep {
  name: string;
  role: string;
  status: 'completed' | 'current' | 'upcoming';
  note?: string;
  date?: string;
}
