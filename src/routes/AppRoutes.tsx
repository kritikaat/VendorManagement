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
import { useAuth } from '@/hooks/useAuth';
import { USER_ROLES } from '@/types/auth.types';

function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
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
      </Route>

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
