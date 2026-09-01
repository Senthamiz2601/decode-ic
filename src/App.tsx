import React from 'react';
import { Routes, Route } from 'react-router-dom';

import AppLayout from '@/layouts/AppLayout';
import AuthLayout from '@/layouts/AuthLayout';
import ProtectedRoute from '@/components/ProtectedRoute';

import Landing from '@/pages/Landing';
import { Login, Register } from '@/pages/Auth';
import ForgotPassword from '@/pages/ForgotPassword';
import Dashboard from '@/pages/Dashboard';
import Repositories from '@/pages/Repositories';
import ConnectRepository from '@/pages/ConnectRepository';
import RepositoryOverview from '@/pages/RepositoryOverview';
import ArchitectureExplorer from '@/pages/ArchitectureExplorer';
import DependencyExplorer from '@/pages/DependencyExplorer';
import CodeExplorer from '@/pages/CodeExplorer';
import AIAssistant from '@/pages/AIAssistant';
import RiskCenter from '@/pages/RiskCenter';
import TechnicalDebt from '@/pages/TechnicalDebt';
import CodeHealth from '@/pages/CodeHealth';
import ImpactAnalysis from '@/pages/ImpactAnalysis';
import ChangeSimulation from '@/pages/ChangeSimulation';
import AIRefactoring from '@/pages/AIRefactoring';
import Reports from '@/pages/Reports';
import Settings from '@/pages/Settings';
import NotFound from '@/pages/NotFound';

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>

      {/* Authenticated app shell */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/repositories" element={<Repositories />} />
          <Route path="/repositories/new" element={<ConnectRepository />} />
          <Route path="/repositories/:id" element={<RepositoryOverview />} />
          <Route path="/repositories/:id/architecture" element={<ArchitectureExplorer />} />
          <Route path="/repositories/:id/dependencies" element={<DependencyExplorer />} />
          <Route path="/repositories/:id/code" element={<CodeExplorer />} />
          <Route path="/repositories/:id/ai" element={<AIAssistant />} />
          <Route path="/repositories/:id/risks" element={<RiskCenter />} />
          <Route path="/repositories/:id/technical-debt" element={<TechnicalDebt />} />
          <Route path="/repositories/:id/health" element={<CodeHealth />} />
          <Route path="/repositories/:id/impact" element={<ImpactAnalysis />} />
          <Route path="/repositories/:id/simulate" element={<ChangeSimulation />} />
          <Route path="/repositories/:id/refactoring" element={<AIRefactoring />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
