import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import { ChatProvider } from './context/ChatContext';

import Layout from './components/layout/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';
import Playground from './pages/Playground';
import Conversations from './pages/Conversations';
import KnowledgeBase from './pages/KnowledgeBase';
import ExecutionTraces from './pages/ExecutionTraces';
import RetrievalExplorer from './pages/RetrievalExplorer';
import AgentWorkflow from './pages/AgentWorkflow';
import Settings from './pages/Settings';
import Overview from './pages/Overview';
import Login from './pages/Login';
import Register from './pages/Register';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SettingsProvider>
          <ChatProvider>
            <Routes>
              {/* Public Authentication Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Enterprise Routes */}
              <Route element={<ProtectedRoute />}>
                <Route element={<Layout />}>
                  {/* Default landing page is AI Assistant */}
                  <Route index element={<Playground />} />
                  <Route path="conversations" element={<Conversations />} />
                  <Route path="knowledge-base" element={<KnowledgeBase />} />
                  <Route path="traces" element={<ExecutionTraces />} />
                  <Route path="retrieval" element={<RetrievalExplorer />} />
                  <Route path="workflow" element={<AgentWorkflow />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="overview" element={<Overview />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
              </Route>
            </Routes>
          </ChatProvider>
        </SettingsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
