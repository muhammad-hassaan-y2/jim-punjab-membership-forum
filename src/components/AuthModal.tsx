'use client';

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Lock, Mail, ShieldCheck, ArrowRight, KeyRound, Sparkles, Copy, Check } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { 
    isAuthModalOpen, 
    setIsAuthModalOpen, 
    login 
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email) {
      setError('Please provide your institutional email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      setIsLoading(false);
      if (typeof window !== 'undefined' && window.location.pathname !== '/dashboard') {
        window.location.href = '/dashboard';
      }
    } catch (err: any) {
      setIsLoading(false);
      setError(err?.message || 'Authentication failed. Please verify your credentials.');
    }
  };

  const handleAutoFillAndLogin = async (fillEmail: string, fillPass: string) => {
    setEmail(fillEmail);
    setPassword(fillPass);
    setIsLoading(true);
    setError(null);
    try {
      await login(fillEmail, fillPass);
      setIsLoading(false);
      if (typeof window !== 'undefined' && window.location.pathname !== '/dashboard') {
        window.location.href = '/dashboard';
      }
    } catch (err: any) {
      setIsLoading(false);
      setError(err?.message || 'Login failed');
    }
  };

  const handleCopyCredentials = () => {
    navigator.clipboard.writeText('Email: admin@markaz.com\nPassword: Markaz@2026');
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-white rounded-3xl border-2 border-amber-400/90 shadow-2xl overflow-hidden transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Badge */}
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 px-6 py-6 text-white text-center relative border-b border-amber-400/30">
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-full text-emerald-300 hover:text-white hover:bg-emerald-800/50 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 p-0.5 mx-auto mb-3 flex items-center justify-center shadow-lg shadow-black/30">
            <div className="w-full h-full bg-emerald-950 rounded-[14px] flex items-center justify-center text-amber-300">
              <Lock className="w-5 h-5" />
            </div>
          </div>

          <div className="font-arabic text-lg font-bold text-amber-300">
            مرکز روح الاسلام
          </div>
          <h2 className="text-xl font-black tracking-tight text-white mt-0.5">
            Institutional Sign In
          </h2>
          <p className="text-xs text-emerald-200/90 font-medium mt-1">
            Markaz Rooh ul Islam &bull; Financial Portal Security
          </p>
        </div>

        {/* Official Credentials Quick Panel */}
        <div className="bg-amber-950/20 border-b border-amber-300/40 px-5 py-3 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 min-w-0">
            <KeyRound className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <div className="truncate">
              <span className="text-emerald-950 font-bold block text-[11px]">Credentials:</span>
              <span className="text-slate-600 font-mono text-[10px]">admin@markaz.com &bull; Markaz@2026</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleCopyCredentials}
              className="px-2 py-1 rounded-md bg-amber-100 hover:bg-amber-200 text-amber-900 text-[10px] font-bold border border-amber-300/80 flex items-center gap-1 cursor-pointer transition-colors"
              title="Copy credentials"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-700" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              type="button"
              onClick={() => handleAutoFillAndLogin('admin@markaz.com', 'Markaz@2026')}
              className="px-2.5 py-1 rounded-md bg-gradient-to-r from-amber-400 to-amber-500 text-emerald-950 text-[10px] font-black shadow-xs hover:from-amber-300 hover:to-amber-400 flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3 h-3 text-emerald-950" />
              <span>1-Click</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-[#fdfaf3]">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Institutional Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@markaz.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-amber-300/80 bg-white text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-transparent transition-all shadow-2xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Markaz@2026"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-amber-300/80 bg-white text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-transparent transition-all shadow-2xs"
              />
            </div>
          </div>

          {/* Institutional Access Badge */}
          <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200/80 flex items-center gap-2.5 text-xs text-emerald-950 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>Public registration disabled. Authenticated session grants full access to Shariah ledgers & spreadsheets.</span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-base text-white bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-950 hover:from-emerald-800 hover:to-emerald-900 shadow-lg shadow-emerald-950/25 transition-all cursor-pointer hover:scale-[1.02] active:scale-95 border-2 border-amber-400/80 disabled:opacity-50"
          >
            <span>{isLoading ? 'Authenticating...' : 'Sign In to Portal'}</span>
            <ArrowRight className="w-4 h-4 text-amber-300" />
          </button>
        </form>

      </div>
    </div>
  );
};

export default AuthModal;
