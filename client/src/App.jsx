import React from 'react';
import { Routes, Route, Outlet, Navigate } from 'react-router-dom';


import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';

import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Onboarding from './pages/Onboarding/Onboarding';
import Dashboard from './pages/Dashboard/Dashboard';
import Analytics from './pages/Dashboard/Analytics';
import SolveTask from './pages/Tasks/SolveTask';
import TasksList from './pages/Tasks/TasksList';
import Mistakes from './pages/Mistakes/Mistakes';
import DSA from './pages/Practice/DSA';
import Aptitude from './pages/Practice/Aptitude';
import CoreSubjects from './pages/Practice/CoreSubjects';
import SolveQuestion from './pages/Practice/SolveQuestion';
import MockTestDashboard from './pages/Tests/MockTestDashboard';
import TakeTest from './pages/Tests/TakeTest';
import Revision from './pages/Revision/Revision';
import Interview from './pages/Interview/Interview';
import ResumeAnalyzer from './pages/Resume/ResumeAnalyzer';
const App = () => {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-dark-900 text-slate-200">
        <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes inside MainLayout */}
            <Route element={<ProtectedRoute />}>
              <Route path="/onboarding" element={<Onboarding />} />
              <Route element={<MainLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/tasks/:id/solve" element={<SolveTask />} />
                <Route path="/tasks" element={<TasksList />} />
                <Route path="/dsa" element={<DSA />} />
                <Route path="/aptitude" element={<Aptitude />} />
                <Route path="/core-subjects" element={<CoreSubjects />} />
                <Route path="/questions/:id/solve" element={<SolveQuestion />} />
                <Route path="/mock-test" element={<MockTestDashboard />} />
                <Route path="/mock-test/take" element={<TakeTest />} />
                <Route path="/interview" element={<Interview />} />
                <Route path="/revision" element={<Revision />} />
                <Route path="/mistakes" element={<Mistakes />} />
                <Route path="/resume" element={<ResumeAnalyzer />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster position="top-right" toastOptions={{
          style: { background: '#1e293b', color: '#f1f5f9', border: '1px solid #334155' }
        }} />
      </div>
    </AuthProvider>
  );
};

export default App;
