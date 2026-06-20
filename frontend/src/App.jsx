import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './routes/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import LeadListPage from './pages/LeadListPage';
import CreateLeadPage from './pages/CreateLeadPage';
import EditLeadPage from './pages/EditLeadPage';
import LeadDetailsPage from './pages/LeadDetailsPage';
import UserManagement from './pages/UserManagement';
import LogsPage from './pages/LogsPage';
import SettingsPage from './pages/SettingsPage';
import Unauthorized from './pages/Unauthorized';
import ErrorBoundary from './components/ErrorBoundary';

const App = () => {
  return (
    <ErrorBoundary>
      <Routes>
        {/* Public auth portal */}
        <Route path="/login" element={<LoginPage />} />

        {/* Access Fallbacks */}
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Guarded Dashboard Application Routes */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          {/* Index reroute */}
          <Route index element={<Navigate to="/dashboard" replace />} />
          
          <Route path="dashboard" element={<DashboardPage />} />
          
          <Route path="leads" element={<LeadListPage />} />
          
          <Route path="leads/:id" element={<LeadDetailsPage />} />
          
          {/* Manager & Admin lead creation/modifications */}
          <Route 
            path="leads/create" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
                <CreateLeadPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="leads/:id/edit" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
                <EditLeadPage />
              </ProtectedRoute>
            } 
          />

          {/* Admin Directory & Logs */}
          <Route 
            path="users" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <UserManagement />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="logs" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <LogsPage />
              </ProtectedRoute>
            } 
          />

          {/* General Account Settings */}
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Global Fallback Route */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </ErrorBoundary>
  );
};

export default App;
