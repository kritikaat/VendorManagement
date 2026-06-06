import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthenticatedLayout, PermissionRoute } from '@/routes/RoleRoute';
import { LandingPage } from '@/pages/LandingPage';
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

function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

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
            <PermissionRoute permission="vendor:read">
              <VendorsPage />
            </PermissionRoute>
          }
        />

        <Route
          path="/rfqs"
          element={
            <PermissionRoute permission="rfq:create">
              <RfqListPage />
            </PermissionRoute>
          }
        />
        <Route
          path="/rfqs/new"
          element={
            <PermissionRoute permission="rfq:create">
              <CreateRfqPage />
            </PermissionRoute>
          }
        />

        <Route path="/quotations" element={<QuotationListPage />} />
        <Route
          path="/quotations/submit/:rfqId"
          element={
            <PermissionRoute permission="quotation:submit">
              <SubmitQuotationPage />
            </PermissionRoute>
          }
        />
        <Route
          path="/quotations/compare/:rfqId"
          element={
            <PermissionRoute permission="quotation:compare">
              <CompareQuotationsPage />
            </PermissionRoute>
          }
        />

        <Route
          path="/approvals"
          element={
            <PermissionRoute permission="approval:view">
              <ApprovalListPage />
            </PermissionRoute>
          }
        />
        <Route
          path="/approvals/:id"
          element={
            <PermissionRoute permission="approval:view">
              <ApprovalDetailPage />
            </PermissionRoute>
          }
        />

        <Route
          path="/purchase-orders"
          element={
            <PermissionRoute permission="po:read">
              <PurchaseOrderListPage />
            </PermissionRoute>
          }
        />

        <Route
          path="/invoices"
          element={
            <PermissionRoute permission="invoice:read">
              <InvoiceListPage />
            </PermissionRoute>
          }
        />
        <Route
          path="/invoices/:id"
          element={
            <PermissionRoute permission="invoice:read">
              <InvoiceDetailPage />
            </PermissionRoute>
          }
        />

        <Route
          path="/reports"
          element={
            <PermissionRoute permission="reports:view">
              <ReportsPage />
            </PermissionRoute>
          }
        />

        <Route
          path="/activity"
          element={
            <PermissionRoute permission="activity:read">
              <ActivityPage />
            </PermissionRoute>
          }
        />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>

      <Route path="/" element={<LandingPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
