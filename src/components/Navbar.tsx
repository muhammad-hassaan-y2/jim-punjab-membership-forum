'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  LogIn, 
  LogOut, 
  Sparkles,
  ChevronDown,
  ShieldCheck,
  FileSpreadsheet,
  Bot
} from 'lucide-react';
import { AISheetModal } from './AISheetModal';

export const Navbar: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    activeSheetTabId,
    orgConfig 
  } = useFinance();

  const { 
    user, 
    isAuthenticated, 
    openLoginModal, 
    logout 
  } = useAuth();

  // Dropdown states
  const [isAiMenuOpen, setIsAiMenuOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const aiRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (aiRef.current && !aiRef.current.contains(event.target as Node)) {
        setIsAiMenuOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleBrandClick = () => {
    if (typeof window !== 'undefined' && window.location.pathname !== '/') {
      window.location.href = '/';
    } else {
      setActiveTab('landing');
    }
  };

  const handleOpenWorkingSheet = () => {
    setIsAiMenuOpen(false);
    const target = activeSheetTabId || 'sheet1';
    if (typeof window !== 'undefined') {
      window.location.href = `/dashboard/sheets/${target}`;
    } else {
      setActiveTab('sheets');
    }
  };

  const handleDashboardClick = () => {
    if (typeof window !== 'undefined' && window.location.pathname !== '/dashboard') {
      window.location.href = '/dashboard';
    } else {
      setActiveTab('dashboard');
    }
  };

  const handleLogoutClick = () => {
    setIsProfileOpen(false);
    logout();
    if (typeof window !== 'undefined' && (window.location.pathname.startsWith('/dashboard') || window.location.pathname.startsWith('/sheets'))) {
      window.location.href = '/';
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-[#011c15]/95 via-[#032e23]/95 to-[#011c15]/95 text-white shadow-2xl backdrop-blur-xl border-b border-amber-400/40">
        
        {/* Subtle Islamic Arabesque Geometric Watermark Texture */}
        <div 
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{
            backgroundImage: `
              radial-gradient(circle at center, #f59e0b 1.5px, transparent 1.5px),
              linear-gradient(45deg, transparent 46%, #10b981 48%, #10b981 52%, transparent 54%),
              linear-gradient(-45deg, transparent 46%, #10b981 48%, #10b981 52%, transparent 54%)
            `,
            backgroundSize: '28px 28px'
          }}
        />

        {/* Golden Filigree Ambient Top Glow */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-400/60 to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center justify-between h-18 sm:h-20 gap-2 sm:gap-4">
            
            {/* ================================================================
                1. BRAND / EMBLEM SECTION
                ================================================================ */}
            <div 
              className="flex items-center gap-2.5 sm:gap-3.5 cursor-pointer select-none group min-w-0"
              onClick={handleBrandClick}
              title="JIM Punjab - Home"
            >
              {/* Double Gold-Ring Medallion Logo */}
              <div className="relative w-11 h-11 sm:w-13 sm:h-13 rounded-full p-1 bg-gradient-to-br from-emerald-800 via-emerald-950 to-[#011c15] border-2 border-amber-400 shadow-[0_4px_15px_rgba(0,0,0,0.5)] flex items-center justify-center shrink-0 group-hover:border-amber-300 transition-all duration-300 group-hover:scale-105 ring-2 ring-amber-400/30">
                <div className="absolute inset-0 rounded-full bg-amber-400/15 blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
                <img 
                  src="/logo.png" 
                  alt="JIM Punjab Emblem" 
                  className="w-full h-full object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] relative z-10 transition-transform duration-300 group-hover:scale-105" 
                />
              </div>

              {/* Brand Titles */}
              <div className="min-w-0 flex flex-col justify-center">
                <div className="flex items-center gap-2 truncate">
                  <h1 className="text-xs sm:text-sm md:text-base font-black text-white tracking-wide truncate uppercase drop-shadow-xs group-hover:text-amber-100 transition-colors">
                    {orgConfig.nameEnglish || 'JIM Punjab'}
                  </h1>
                  <span className="hidden sm:inline-block text-amber-400/60 text-xs">✦</span>
                  <span className="font-arabic text-xs sm:text-sm md:text-base font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-300 to-amber-100 shrink-0 drop-shadow-xs dir-rtl">
                    جماعت اصلاح المسلمین پنجاب
                  </span>
                </div>
                
                <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-emerald-200/90 font-medium tracking-wide truncate mt-0.5">
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                  </span>
                  <span className="truncate">Jamaat Islahul Muslimeen Punjab &bull; Membership Accounts</span>
                </div>
              </div>
            </div>

            {/* ================================================================
                2. RIGHT CONTROLS:
                   - "AI" (WHITE BUTTON -> DROPDOWN WITH AI AND SHEETS NOTHING MORE)
                   - "Sheets" (DIRECT WHITE BUTTON)
                   - Dashboard icon button (JUST ICON)
                   - Profile button (DROPDOWN WITH LOGOUT)
                ================================================================ */}
            <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
              
              {/* AI BUTTON (STRICTLY WHITE) -> CLICKS TO REVEAL AI AND THEN SHEETS */}
              <div className="relative" ref={aiRef}>
                <button
                  onClick={() => setIsAiMenuOpen(!isAiMenuOpen)}
                  className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl font-extrabold text-xs sm:text-sm bg-white text-slate-900 hover:bg-slate-100 border border-slate-200 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer ring-2 ring-white/20"
                  title="AI & Sheets Menu"
                  aria-expanded={isAiMenuOpen}
                >
                  <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 animate-pulse" />
                  <span>AI</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${isAiMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* AI DROPDOWN: AI AND THEN SHEETS NOTHING MORE */}
                {isAiMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white text-slate-900 shadow-2xl border-2 border-amber-400/80 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150 p-1.5">
                    {/* OPTION 1: AI */}
                    <button
                      onClick={() => {
                        setIsAiMenuOpen(false);
                        setIsAiModalOpen(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-800 hover:bg-emerald-50 hover:text-emerald-950 transition-colors cursor-pointer text-left"
                    >
                      <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <Bot className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="block font-black text-slate-900">AI Assistant</span>
                        <span className="text-[10px] text-slate-500 block truncate">Shariah ledger copilot</span>
                      </div>
                    </button>

                    <div className="h-px bg-slate-100 my-1" />

                    {/* OPTION 2: SHEETS */}
                    <button
                      onClick={handleOpenWorkingSheet}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-800 hover:bg-amber-50 hover:text-amber-950 transition-colors cursor-pointer text-left"
                    >
                      <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                        <FileSpreadsheet className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="block font-black text-slate-900">Sheets</span>
                        <span className="text-[10px] text-slate-500 block truncate">Open working sheets</span>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              {/* DIRECT SHEETS BUTTON (WHITE BUTTON) */}
              <button
                onClick={handleOpenWorkingSheet}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl font-extrabold text-xs sm:text-sm bg-white text-slate-900 hover:bg-slate-100 border border-slate-200 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer ring-2 ring-white/20"
                title="Open Sheets Directly"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Sheets</span>
              </button>

              {!isAuthenticated ? (
                /* When Logged Out: ONLY Login button */
                <button
                  onClick={openLoginModal}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4.5 sm:py-2 rounded-xl text-xs sm:text-sm font-black text-emerald-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-[0_4px_16px_rgba(245,158,11,0.35)] transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95 border border-amber-200/90"
                  title="Institutional Sign In"
                >
                  <LogIn className="w-4 h-4 text-emerald-950 stroke-[2.5]" />
                  <span>Login</span>
                </button>
              ) : (
                /* When Logged In: Dashboard ICON JUST + Profile Button with Logout */
                <div className="flex items-center gap-2">
                  
                  {/* DASHBOARD BUTTON: ICON JUST (NO TEXT) */}
                  <button
                    onClick={handleDashboardClick}
                    className={`p-2 sm:p-2.5 rounded-xl transition-all cursor-pointer border shadow-sm ${
                      activeTab === 'dashboard'
                        ? 'bg-amber-400 text-emerald-950 border-amber-300 shadow-amber-400/30'
                        : 'bg-emerald-900/80 hover:bg-emerald-800 text-white border-emerald-700/60'
                    }`}
                    title="Dashboard Overview"
                    aria-label="Dashboard Overview"
                  >
                    <LayoutDashboard className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
                  </button>

                  {/* PROFILE BUTTON: CLICK TO OPEN DROPDOWN WITH LOGOUT OPTION */}
                  <div className="relative" ref={profileRef}>
                    <button
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className="flex items-center gap-1.5 sm:gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900/80 border border-amber-400/40 text-xs shadow-inner cursor-pointer transition-all hover:border-amber-300"
                      title="User Profile & Account"
                      aria-expanded={isProfileOpen}
                    >
                      {/* User Avatar Initial */}
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 via-amber-300 to-amber-500 text-emerald-950 font-black flex items-center justify-center text-xs shadow-sm ring-1 ring-amber-200">
                        {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                      </div>

                      {/* Name (Hidden on tiny screens) */}
                      <span className="hidden md:inline-block font-bold text-white leading-tight truncate max-w-[90px]">
                        {user?.name || 'Admin'}
                      </span>

                      <ChevronDown className={`w-3.5 h-3.5 text-amber-300 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* PROFILE DROPDOWN MENU */}
                    {isProfileOpen && (
                      <div className="absolute right-0 mt-2.5 w-64 rounded-2xl bg-white text-slate-900 shadow-2xl border-2 border-amber-400/80 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                        
                        {/* Dropdown User Header */}
                        <div className="p-4 bg-gradient-to-br from-emerald-950 via-emerald-900 to-[#022c22] text-white border-b border-amber-400/30">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 text-emerald-950 font-black flex items-center justify-center text-base shadow-md">
                              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-sm font-bold text-white truncate">
                                {user?.name || 'Institutional User'}
                              </h4>
                              <p className="text-[11px] text-emerald-200/90 truncate font-mono">
                                {user?.email || 'admin@markaz.com'}
                              </p>
                            </div>
                          </div>

                          <div className="mt-3 flex items-center gap-2 pt-2 border-t border-emerald-800/60 text-[11px] text-amber-300 font-semibold">
                            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                            <span>Authorized Institutional Clearance</span>
                          </div>
                        </div>

                        {/* Dropdown Actions: LOGOUT OPTION */}
                        <div className="p-2 bg-[#fdfaf3]">
                          <button
                            onClick={handleLogoutClick}
                            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer"
                          >
                            <div className="w-7 h-7 rounded-lg bg-rose-100 flex items-center justify-center text-rose-600">
                              <LogOut className="w-4 h-4 stroke-[2.5]" />
                            </div>
                            <span>Sign Out & Lock Portal</span>
                          </button>
                        </div>

                      </div>
                    )}
                  </div>

                </div>
              )}

            </div>

          </div>
        </div>

        {/* Ornate Bottom Accent Line (Glowing Gold Filigree Divider) */}
        <div className="h-[1.5px] w-full bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_1px_8px_rgba(245,158,11,0.6)]" />
      </header>

      {/* AI Assistant Modal */}
      <AISheetModal 
        isOpen={isAiModalOpen} 
        onClose={() => setIsAiModalOpen(false)} 
      />
    </>
  );
};

export default Navbar;
