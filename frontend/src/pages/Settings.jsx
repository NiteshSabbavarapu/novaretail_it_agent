import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Server,
  ShieldCheck,
  Cpu,
  Layers,
  LogOut,
  Check,
  User,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
import Badge from '../components/common/Badge';

export default function Settings() {
  const {
    apiUrl,
    setApiUrl,
    rrfK,
    topK,
    modelName,
    rerankerModel,
    embeddingModel,
    pineconeIndex,
  } = useSettings();

  const { username, logout } = useAuth();
  const navigate = useNavigate();

  const [localApiUrl, setLocalApiUrl] = useState(apiUrl);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveApiUrl = (e) => {
    e.preventDefault();
    setApiUrl(localApiUrl);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto font-mono text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-dark-800">
        <div>
          <h2 className="text-base font-semibold text-dark-100 flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-brand-purple" />
            <span>Platform Configuration</span>
          </h2>
          <p className="text-xs text-dark-400 font-mono mt-0.5">
            Active environment variables, authenticated persona, and backend service specifications.
          </p>
        </div>

        {savedSuccess && (
          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded border border-emerald-500/30">
            <Check className="w-3.5 h-3.5" />
            API URL Saved
          </span>
        )}
      </div>

      <div className="space-y-6">
        {/* Section 1: Authenticated User Information */}
        <div className="p-5 rounded-xl border border-dark-700 bg-dark-900/90 shadow-xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-dark-800">
            <h3 className="text-xs font-semibold text-dark-100 uppercase tracking-wide flex items-center gap-2">
              <User className="w-4 h-4 text-brand-purple" />
              <span>Authenticated User Session</span>
            </h3>
            <Badge variant="emerald">JWT Active</Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded bg-dark-950 border border-dark-800 space-y-1">
              <span className="text-[10px] text-dark-500 uppercase">Username</span>
              <div className="text-dark-100 font-semibold">{username || 'Unknown'}</div>
            </div>

            <div className="p-3 rounded bg-dark-950 border border-dark-800 space-y-1">
              <span className="text-[10px] text-dark-500 uppercase">Department Partition</span>
              <div className="text-dark-100 font-semibold">IT (Department #1)</div>
            </div>

            <div className="p-3 rounded bg-dark-950 border border-dark-800 space-y-1">
              <span className="text-[10px] text-dark-500 uppercase">Role</span>
              <div className="text-dark-100 font-semibold">EMPLOYEE</div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={handleLogout}
              className="px-3.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out of Session</span>
            </button>
          </div>
        </div>

        {/* Section 2: Backend API Configuration */}
        <div className="p-5 rounded-xl border border-dark-700 bg-dark-900/90 shadow-xl space-y-3">
          <h3 className="text-xs font-semibold text-dark-100 uppercase tracking-wide flex items-center gap-2">
            <Server className="w-4 h-4 text-brand-blue" />
            <span>Backend API Endpoint</span>
          </h3>

          <form onSubmit={handleSaveApiUrl} className="space-y-3">
            <div>
              <label className="block text-[11px] text-dark-400 uppercase mb-1">
                API Base URL
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={localApiUrl}
                  onChange={(e) => setLocalApiUrl(e.target.value)}
                  placeholder="/api"
                  className="flex-1 bg-dark-950 border border-dark-700 rounded-lg px-3 py-2 text-xs text-dark-100 focus:outline-none focus:border-brand-purple"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-dark-800 hover:bg-dark-750 border border-dark-700 text-xs text-dark-200 hover:text-white transition-colors"
                >
                  Save URL
                </button>
              </div>
              <p className="text-[10px] text-dark-500 mt-1">
                Vite dev proxy forwards <code className="text-dark-300">/api/*</code> to Django on port 8000.
              </p>
            </div>
          </form>
        </div>

        {/* Section 3: Verified Backend Service Specifications */}
        <div className="p-5 rounded-xl border border-dark-700 bg-dark-900/90 shadow-xl space-y-3">
          <h3 className="text-xs font-semibold text-dark-100 uppercase tracking-wide flex items-center gap-2">
            <Cpu className="w-4 h-4 text-emerald-400" />
            <span>Configured RAG Models (Fixed Backend Implementation)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded bg-dark-950 border border-dark-800 space-y-1">
              <span className="text-[10px] text-dark-500 uppercase">LLM Synthesis Engine</span>
              <div className="text-dark-200 font-semibold">{modelName}</div>
              <div className="text-[10px] text-dark-500">Configured in core/llm_utils.py</div>
            </div>

            <div className="p-3 rounded bg-dark-950 border border-dark-800 space-y-1">
              <span className="text-[10px] text-dark-500 uppercase">Cross-Encoder Reranker</span>
              <div className="text-dark-200 font-semibold">{rerankerModel}</div>
              <div className="text-[10px] text-dark-500">Loaded in core/vector_utils.py</div>
            </div>

            <div className="p-3 rounded bg-dark-950 border border-dark-800 space-y-1">
              <span className="text-[10px] text-dark-500 uppercase">Embedding Generation</span>
              <div className="text-dark-200 font-semibold">{embeddingModel}</div>
              <div className="text-[10px] text-dark-500">384-dimensional dense vectors</div>
            </div>

            <div className="p-3 rounded bg-dark-950 border border-dark-800 space-y-1">
              <span className="text-[10px] text-dark-500 uppercase">RRF Smoothing Constant (k)</span>
              <div className="text-dark-200 font-semibold">k = {rrfK} (Fixed)</div>
              <div className="text-[10px] text-dark-500">core/vector_utils.py:reciprocal_rank_fusion</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
