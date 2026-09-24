'use client';

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, ShieldCheck, ArrowRight, KeyRound, Sparkles, Copy, Check } from 'lucide-react';

export const DashboardAuthGate: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

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
    <div className="min-h-[75vh] flex items-center justify-center py-10 px-4">
      <div className="relative w-full max-w-lg rounded-3xl border-2 border-amber-400/80 shadow-[0_20px_50px_rgba(6,78,59,0.35)] overflow-hidden bg-gradient-to-b from-[#022c22] via-[#032e23] to-[#011c15] text-white">
        
        {/* Subtle Geometric Background */}
        <div 
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at center, #f59e0b 1.5px, transparent 1.5px),
                              radial-gradient(circle at 0% 0%, #10b981 1.5px, transparent 1.5px)`,
            backgroundSize: '24px 24px'
          }}
        />

        {/* Golden Corner Accents */}
        <div className="absolute top-2 left-2 w-7 h-7 text-amber-400 opacity-90 pointer-events-none">
          <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
            <path d="M2 38 V12 C2 6 6 2 12 2 H38" stroke="currentColor" strokeWidth="2.5" />
            <circle cx="12" cy="12" r="3" fill="currentColor" />
          </svg>
        </div>
        <div className="absolute top-2 right-2 w-7 h-7 text-amber-400 opacity-90 pointer-events-none scale-x-[-1]">
          <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
            <path d="M2 38 V12 C2 6 6 2 12 2 H38" stroke="currentColor" strokeWidth="2.5" />
            <circle cx="12" cy="12" r="3" fill="currentColor" />
          </svg>
        </div>
        <div className="absolute bottom-2 left-2 w-7 h-7 text-amber-400 opacity-90 pointer-events-none scale-y-[-1]">
          <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
            <path d="M2 38 V12 C2 6 6 2 12 2 H38" stroke="currentColor" strokeWidth="2.5" />
            <circle cx="12" cy="12" r="3" fill="currentColor" />
          </svg>
        </div>
        <div className="absolute bottom-2 right-2 w-7 h-7 text-amber-400 opacity-90 pointer-events-none scale-[-1]">
          <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
            <path d="M2 38 V12 C2 6 6 2 12 2 H38" stroke="currentColor" strokeWidth="2.5" />
            <circle cx="12" cy="12" r="3" fill="currentColor" />
          </svg>
        </div>

        {/* Header with Emblem */}
        <div className="relative z-10 px-6 pt-8 pb-5 text-center border-b border-amber-400/30">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full p-1 bg-gradient-to-br from-emerald-800 via-emerald-950 to-[#022c22] border-2 border-amber-400 shadow-xl flex items-center justify-center mb-3.5 ring-4 ring-amber-400/20">
            <img 
              src="/logo.png" 
              alt="Markaz Rooh ul Islam" 
              className="w-full h-full object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]" 
            />
          </div>

          <div className="font-arabic text-xl sm:text-2xl font-bold text-amber-300 drop-shadow-xs">
            مرکز روح الاسلام
          </div>
          <h1 className="text-base sm:text-lg font-black text-white tracking-wide uppercase mt-0.5">
            Markaz Rooh ul Islam
          </h1>
          <p className="text-xs text-emerald-200/90 font-medium mt-1">
            Financial Accounting Portal &bull; Institutional Login
          </p>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/90 border border-amber-400/30 text-[11px] text-amber-300 font-semibold mt-3">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Public Registration Disabled &bull; Authorized Personnel Only</span>
          </div>
        </div>

        {/* Official Credentials Box for Easy Access */}
        <div className="relative z-10 bg-amber-950/40 border-b border-amber-400/30 px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <span className="text-amber-200 font-bold block">Official Admin Credentials:</span>
              <span className="text-amber-100 font-mono text-[11px]">admin@markaz.com &bull; Markaz@2026</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleCopyCredentials}
              className="px-2.5 py-1 rounded-lg bg-amber-400/20 hover:bg-amber-400/30 text-amber-200 text-[11px] font-bold border border-amber-400/40 flex items-center gap-1 cursor-pointer transition-colors"
              title="Copy credentials"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              type="button"
              onClick={() => handleAutoFillAndLogin('admin@markaz.com', 'Markaz@2026')}
              className="px-3 py-1 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 text-emerald-950 text-[11px] font-black shadow-xs hover:from-amber-300 hover:to-amber-400 flex items-center gap-1 cursor-pointer transition-transform hover:scale-105"
            >
              <Sparkles className="w-3 h-3 text-emerald-950" />
              <span>1-Click Login</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="relative z-10 p-6 sm:p-7 bg-[#fdfaf3] text-slate-900">
          <form onSubmit={handleSubmit} className="space-y-4">
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
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Security Password
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
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none text-slate-900"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 inline-flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl font-black text-sm text-emerald-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer active:scale-95 disabled:opacity-50 border border-amber-300/80"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-emerald-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <KeyRound className="w-4 h-4 text-emerald-950" />
                  <span>Sign In to Financial Spreadsheets</span>
                  <ArrowRight className="w-4 h-4 text-emerald-950" />
                </>
              )}
            </button>
          </form>

          {/* Shariah Badge */}
          <div className="mt-5 pt-3.5 flex items-center justify-center gap-2 text-[11px] text-emerald-800 font-semibold border-t border-slate-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Strict Shariah fund separation & cloud encryption enabled</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardAuthGate;
