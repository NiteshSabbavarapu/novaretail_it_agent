import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sparkles, Lock, User, Mail, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!username.trim() || !email.trim() || !password) {
      setErrorMsg('Please complete all fields.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    const res = await register(username.trim(), email.trim(), password);
    setIsLoading(false);

    if (res.success) {
      navigate('/', { replace: true });
    } else {
      setErrorMsg(res.error);
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col items-center justify-center p-6 text-dark-200">
      <div className="max-w-sm w-full space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-purple to-brand-blue flex items-center justify-center mx-auto shadow-glow-purple">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-lg font-semibold font-mono text-dark-100 tracking-tight">
            Register for NovaRetail
          </h1>
          <p className="text-xs font-mono text-dark-400">
            Create an enterprise account for the Agentic RAG Copilot
          </p>
        </div>

        {/* Register Card */}
        <div className="p-6 rounded-xl border border-dark-700 bg-dark-900/95 shadow-2xl space-y-4">
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-dark-400 uppercase mb-1">
                Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. jdoe"
                  autoComplete="username"
                  required
                  className="w-full bg-dark-950 border border-dark-700 rounded-lg pl-9 pr-3 py-2 text-xs font-mono text-dark-100 focus:outline-none focus:border-brand-purple transition-colors"
                />
                <User className="w-4 h-4 text-dark-500 absolute left-3 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-dark-400 uppercase mb-1">
                Corporate Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. jdoe@novaretail.internal"
                  autoComplete="email"
                  required
                  className="w-full bg-dark-950 border border-dark-700 rounded-lg pl-9 pr-3 py-2 text-xs font-mono text-dark-100 focus:outline-none focus:border-brand-purple transition-colors"
                />
                <Mail className="w-4 h-4 text-dark-500 absolute left-3 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-dark-400 uppercase mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="new-password"
                  required
                  className="w-full bg-dark-950 border border-dark-700 rounded-lg pl-9 pr-3 py-2 text-xs font-mono text-dark-100 focus:outline-none focus:border-brand-purple transition-colors"
                />
                <Lock className="w-4 h-4 text-dark-500 absolute left-3 top-2.5" />
              </div>
            </div>

            {errorMsg && (
              <div className="p-2.5 rounded bg-rose-500/10 border border-rose-500/20 text-xs font-mono text-rose-400 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-lg bg-gradient-to-r from-brand-purple to-brand-blue text-white font-mono text-xs font-medium hover:opacity-95 transition-all shadow-glow-purple disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <span>{isLoading ? 'Creating account...' : 'Create Account'}</span>
              {!isLoading && <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          </form>

          <div className="pt-2 border-t border-dark-800 text-center">
            <p className="text-[11px] font-mono text-dark-400">
              Already have an account?{' '}
              <Link to="/login" className="text-brand-purple hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <div className="text-center text-[11px] font-mono text-dark-500 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500/70" />
          <span>New users default to Department 1 (IT / AI Systems)</span>
        </div>
      </div>
    </div>
  );
}

