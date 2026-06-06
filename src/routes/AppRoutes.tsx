import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthenticatedLayout, RoleRoute } from '@/routes/RoleRoute';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { VendorsPage } from '@/pages/VendorsPage';
import { RfqListPage } from '@/pages/RfqListPage';
import { CreateRfqPage } from '@/pages/CreateRfqPage';
import { QuotationListPage } from '@/pages/QuotationListPage';
import { SubmitQuotationPage } from '@/pages/SubmitQuotationPage';
import { CompareQuotationsPage } from '@/pages/CompareQuotationsPage';
import { ApprovalListPage } from '@/pages/ApprovalListPage';
import { ApprovalDetailPage } from '@/pages/ApprovalDetailPage';
import { PurchaseOrderListPage } from '@/pages/PurchaseOrderListPage';
import { InvoiceListPage, InvoiceDetailPage } from '@/pages/InvoicePages';
import { ReportsPage } from '@/pages/ReportsPage';
import { ActivityPage } from '@/pages/ActivityPage';
import { useAuth } from '@/hooks/useAuth';
import { USER_ROLES } from '@/types/auth.types';

function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

const PROCUREMENT_ROLES = [USER_ROLES.ADMIN, USER_ROLES.PROCUREMENT_OFFICER];
const APPROVAL_ROLES = [
  USER_ROLES.ADMIN,
  USER_ROLES.PROCUREMENT_OFFICER,
  USER_ROLES.APPROVER,
];
const REPORT_ROLES = [
  USER_ROLES.ADMIN,
  USER_ROLES.PROCUREMENT_OFFICER,
  USER_ROLES.APPROVER,
];

export function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicOnlyRoute>
            <RegisterPage />
          </PublicOnlyRoute>
        }
      />

      <Route element={<AuthenticatedLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />

        <Route
          path="/vendors"
          element={
            <RoleRoute roles={PROCUREMENT_ROLES}>
              <VendorsPage />
            </RoleRoute>
          }
        />

        <Route
          path="/rfqs"
          element={
            <RoleRoute roles={PROCUREMENT_ROLES}>
              <RfqListPage />
            </RoleRoute>
          }
        />
        <Route
          path="/rfqs/new"
          element={
            <RoleRoute roles={PROCUREMENT_ROLES}>
              <CreateRfqPage />
            </RoleRoute>
          }
        />

        <Route path="/quotations" element={<QuotationListPage />} />
        <Route path="/quotations/submit/:rfqId" element={<SubmitQuotationPage />} />
        <Route
          path="/quotations/compare/:rfqId"
          element={
            <RoleRoute roles={PROCUREMENT_ROLES}>
              <CompareQuotationsPage />
            </RoleRoute>
          }
        />

        <Route
          path="/approvals"
          element={
            <RoleRoute roles={APPROVAL_ROLES}>
              <ApprovalListPage />
            </RoleRoute>
          }
        />
        <Route
          path="/approvals/:id"
          element={
            <RoleRoute roles={APPROVAL_ROLES}>
              <ApprovalDetailPage />
            </RoleRoute>
          }
        />

        <Route path="/purchase-orders" element={<PurchaseOrderListPage />} />

        <Route path="/invoices" element={<InvoiceListPage />} />
        <Route path="/invoices/:id" element={<InvoiceDetailPage />} />

        <Route
          path="/reports"
          element={
            <RoleRoute roles={REPORT_ROLES}>
              <ReportsPage />
            </RoleRoute>
          }
        />

        <Route path="/activity" element={<ActivityPage />} />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
