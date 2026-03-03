import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProjectProvider } from './context/ProjectContext';
import Shell from './components/layout/Shell';
import ProtectedRoute from './components/common/ProtectedRoute';
import ProjectGuard from './components/common/ProjectGuard';

import ProjectSelect from './pages/ProjectSelect';
import Login from './pages/Login';
import GlobalDashboard from './pages/GlobalDashboard';
import ProjectDashboard from './pages/ProjectDashboard';
import QADetail from './pages/QADetail';
import UserSettings from './pages/UserSettings';
import UserManagement from './pages/admin/UserManagement';

import OverviewTab from './components/project/OverviewTab';
import UpdatesTab from './components/project/UpdatesTab';
import PhotosTab from './components/project/PhotosTab';
import ActionsTab from './components/project/ActionsTab';
import DocumentsTab from './components/project/DocumentsTab';
import QATab from './components/project/QATab';

function App() {
  return (
    <AuthProvider>
      <ProjectProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<ProjectSelect />} />
            <Route path="/login" element={<Login />} />

            {/* Protected routes inside Shell */}
            <Route element={<ProtectedRoute><Shell /></ProtectedRoute>}>
              <Route path="/dashboard" element={<GlobalDashboard />} />
              <Route path="/settings" element={<UserSettings />} />

              {/* Admin-only routes */}
              <Route path="/admin/users" element={<ProtectedRoute adminOnly><UserManagement /></ProtectedRoute>} />

              {/* Project routes with access guard */}
              <Route path="/project/:projectId" element={<ProjectGuard><ProjectDashboard /></ProjectGuard>}>
                <Route index element={<Navigate to="overview" replace />} />
                <Route path="overview" element={<OverviewTab />} />
                <Route path="updates" element={<UpdatesTab />} />
                <Route path="photos" element={<PhotosTab />} />
                <Route path="actions" element={<ActionsTab />} />
                <Route path="documents" element={<DocumentsTab />} />
                <Route path="qa" element={<QATab />} />
              </Route>
              <Route path="/question/:id" element={<QADetail />} />
            </Route>
          </Routes>
        </Router>
      </ProjectProvider>
    </AuthProvider>
  );
}

export default App;
