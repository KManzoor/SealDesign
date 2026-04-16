import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AppLayout from '../components/AppLayout';
import ConfigurationsPage from '../pages/ConfigurationsPage';
import ConstructionMasterPage from '../pages/ConstructionMasterPage';
import DashboardPage from '../pages/DashboardPage';
import GpClassificationPage from '../pages/GpClassificationPage';
import LoginPage from '../pages/LoginPage';
import MasterHomePage from '../pages/MasterHomePage';
import MocMasterPage from '../pages/MocMasterPage';
import PrototypePage from '../pages/PrototypePage';
import PumpMasterPage from '../pages/PumpMasterPage';
import SealTypeMasterPage from '../pages/SealTypeMasterPage';
import StationaryMasterPage from '../pages/StationaryMasterPage';
import UserGuidePage from '../pages/UserGuidePage';

function LoadingScreen() {
  return (
    <div style={{ padding: '24px' }}>
      <div className="page-card">
        <h2>Loading session...</h2>
        <p className="muted">Refreshing access and authentication details.</p>
      </div>
    </div>
  );
}

function PrivateRoute({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  return user ? children : <Navigate to="/login" replace />;
}

function ScreenRoute({ screenName, children }: { screenName: string; children: JSX.Element }) {
  const { canAccess, isAdmin, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (isAdmin() || canAccess(screenName)) {
    return children;
  }
  return screenName === 'prototype' ? <Navigate to="/" replace /> : <Navigate to="/prototype" replace />;
}

function HomeRedirect() {
  const { canAccess, isAdmin } = useAuth();
  if (isAdmin() || canAccess('dashboard')) {
    return <DashboardPage />;
  }
  return <Navigate to="/prototype" replace />;
}

export default function AppRouter() {
  const { user } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <AppLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<HomeRedirect />} />
          <Route path="masters" element={<ScreenRoute screenName="masters"><MasterHomePage /></ScreenRoute>} />
          <Route path="masters/gp" element={<ScreenRoute screenName="gp-master"><GpClassificationPage /></ScreenRoute>} />
          <Route path="masters/construction" element={<ScreenRoute screenName="construction-master"><ConstructionMasterPage /></ScreenRoute>} />
          <Route path="masters/seal-types" element={<ScreenRoute screenName="seal-types"><SealTypeMasterPage /></ScreenRoute>} />
          <Route path="masters/moc" element={<ScreenRoute screenName="moc-master"><MocMasterPage /></ScreenRoute>} />
          <Route path="masters/pumps" element={<ScreenRoute screenName="pump-master"><PumpMasterPage /></ScreenRoute>} />
          <Route path="masters/stationary" element={<ScreenRoute screenName="stationary-master"><StationaryMasterPage /></ScreenRoute>} />
          <Route path="configurations" element={<ScreenRoute screenName="configurations"><ConfigurationsPage /></ScreenRoute>} />
          <Route path="guide" element={<ScreenRoute screenName="guide"><UserGuidePage /></ScreenRoute>} />
          <Route path="prototype" element={<ScreenRoute screenName="prototype"><PrototypePage /></ScreenRoute>} />
        </Route>
        <Route path="*" element={<Navigate to={user ? '/' : '/login'} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
