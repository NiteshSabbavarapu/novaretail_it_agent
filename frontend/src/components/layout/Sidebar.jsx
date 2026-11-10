import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Bot,
  MessageSquare,
  Database,
  Activity,
  Layers,
  GitFork,
  Settings,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  { to: '/', label: 'AI Assistant', icon: Bot, end: true },
  { to: '/conversations', label: 'Conversations', icon: MessageSquare },
  { to: '/knowledge-base', label: 'Knowledge Base', icon: Database },
  { to: '/traces', label: 'Execution Traces', icon: Activity },
  { to: '/retrieval', label: 'Retrieval Explorer', icon: Layers },
  { to: '/workflow', label: 'Agent Workflow', icon: GitFork },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const { username } = useAuth();

  return (
    <aside className="w-60 border-r border-dark-700 bg-dark-950 flex flex-col h-screen select-none shrink-0 sticky top-0">
      {/* Brand Header */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-dark-700">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-brand-purple to-brand-blue flex items-center justify-center shadow-glow-purple">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <div className="text-xs font-semibold tracking-wide text-dark-100 flex items-center gap-1.5 font-mono">
              <span>NovaRetail</span>
              <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-brand-purple/20 text-brand-purple border border-brand-purple/30">
                Copilot
              </span>
            </div>
            <p className="text-[10px] font-mono text-dark-400">Enterprise IT Support</p>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 p-2.5 space-y-1 overflow-y-auto">
        <div className="px-3 pt-2 pb-1 text-[10px] font-mono uppercase tracking-wider text-dark-500 font-semibold">
          Platform
        </div>

        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-dark-800 text-dark-100 border border-dark-600 shadow-inner-dark'
                    : 'text-dark-400 hover:text-dark-200 hover:bg-dark-900'
                }`
              }
            >
              <div className="flex items-center gap-2.5">
                <Icon className="w-4 h-4 text-dark-400 group-hover:text-dark-200 transition-colors" />
                <span>{item.label}</span>
              </div>
            </NavLink>
          );
        })}
      </nav>

      {/* User & Security Footer */}
      <div className="p-3 border-t border-dark-700 bg-dark-900/40">
        <div className="p-2 rounded border border-dark-750 bg-dark-850/80 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-full bg-brand-purple/20 border border-brand-purple/30 text-brand-purple flex items-center justify-center font-mono font-semibold text-[10px] shrink-0">
              {username ? username.slice(0, 2).toUpperCase() : 'U'}
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-medium text-dark-200 truncate">{username || 'User'}</div>
              <div className="text-[9px] font-mono text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Authenticated
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
