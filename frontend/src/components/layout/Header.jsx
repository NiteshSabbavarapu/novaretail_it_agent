import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  LogOut,
  Server,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { username, logout } = useAuth();

  const getPageTitle = (path) => {
    switch (path) {
      case '/': return 'AI Assistant';
      case '/conversations': return 'Conversations';
      case '/knowledge-base': return 'Knowledge Base';
      case '/traces': return 'Execution Traces';
      case '/retrieval': return 'Retrieval Explorer';
      case '/workflow': return 'Agent Workflow';
      case '/settings': return 'Settings';
      default: return 'Copilot';
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-14 border-b border-dark-700 bg-dark-900/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Breadcrumb Title */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-mono text-dark-500 uppercase">NovaRetail</span>
        <ChevronRight className="w-3.5 h-3.5 text-dark-600" />
        <h1 className="text-xs font-semibold text-dark-100 font-mono tracking-tight">
          {getPageTitle(location.pathname)}
        </h1>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Backend Connectivity Status */}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded border border-dark-700 bg-dark-850 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span className="text-dark-300">Django API :8000</span>
        </div>

        {/* User Pill & Logout */}
        <div className="flex items-center gap-3 pl-3 border-l border-dark-700 text-xs font-mono">
          <span className="text-dark-200">{username}</span>
          <button
            onClick={handleLogout}
            className="p-1 rounded hover:bg-dark-800 text-dark-400 hover:text-rose-400 transition-colors"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
