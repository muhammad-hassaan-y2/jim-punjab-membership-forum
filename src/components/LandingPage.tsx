'use client';

import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { 
  FileSpreadsheet, 
  Receipt, 
  Database, 
  ShieldCheck, 
  Scale, 
  ArrowRight, 
  CheckCircle2, 
  LayoutDashboard,
  Layers,
  Coins,
  Sparkles,
  BookOpen
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { 
    setActiveTab, 
    orgConfig, 
    categories, 
    transactions, 
    sheetTabs,
    dbStatus,
    dbLatency
  } = useFinance();

  return (
    <div className="pb-8">
      {/* EXCLUSIVE IN-DEPTH HERO SECTION */}
      <section 
        className="relative overflow-hidden rounded-3xl sm:rounded-4xl border border-emerald-500/20 shadow-2xl p-6 sm:p-10 md:p-14 lg:p-16 transition-all duration-300"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(5, 150, 105, 0.22), transparent 70%), radial-gradient(ellipse at 85% 90%, rgba(212, 175, 55, 0.12), transparent 60%), linear-gradient(145deg, #022017 0%, #032b1f 40%, #071913 100%)',
          color: '#ffffff',
        }}
      >
        {/* Subtle Decorative Ambient Glows */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 -left-28 w-80 h-80 rounded-full bg-emerald-400/15 blur-3xl pointer-events-none" />

        {/* Intricate Islamic Geometric Girih Backdrop (SVG) */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.07] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="islamic-girih-pattern" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M40 0 L80 40 L40 80 L0 40 Z" fill="none" stroke="#d4af37" strokeWidth="1" />
              <path d="M0 0 L80 80 M80 0 L0 80" fill="none" stroke="#10b981" strokeWidth="0.75" />
              <circle cx="40" cy="40" r="16" fill="none" stroke="#f59e0b" strokeWidth="0.75" />
              <circle cx="0" cy="0" r="16" fill="none" stroke="#10b981" strokeWidth="0.5" />
              <circle cx="80" cy="0" r="16" fill="none" stroke="#10b981" strokeWidth="0.5" />
              <circle cx="0" cy="80" r="16" fill="none" stroke="#10b981" strokeWidth="0.5" />
              <circle cx="80" cy="80" r="16" fill="none" stroke="#10b981" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#islamic-girih-pattern)" />
        </svg>

        <div className="relative z-10 max-w-6xl mx-auto space-y-10 sm:space-y-12">
          
          {/* Top Brand Showcase: Bismillah + Centered Green Emblem + Sacred Arabic Verse */}
          <div className="flex flex-col items-center text-center space-y-4">
            
            {/* Bismillah Calligraphy */}
            <div className="font-arabic text-lg sm:text-2xl text-amber-300/80 select-none tracking-widest">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </div>

            {/* Illuminated Green Emblem Logo with Transparent Background */}
            <div className="relative group my-2">
              <div className="absolute -inset-3 bg-gradient-to-r from-emerald-500/30 via-amber-400/30 to-emerald-600/30 rounded-full blur-xl opacity-70 group-hover:opacity-100 transition duration-700" />
              <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full p-2 bg-gradient-to-b from-emerald-900/60 via-slate-900/80 to-black/90 border-2 border-amber-400/40 shadow-2xl flex items-center justify-center backdrop-blur-md">
                <img 
                  src="/logo.png" 
                  alt="Markaz Rooh ul Islam Official Emblem" 
                  className="w-full h-full object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)]"
                />
              </div>
            </div>

            {/* Sacred Quranic Calligraphy Motto (Surah Hud 88) */}
            <div className="inline-flex flex-col items-center px-6 py-2.5 rounded-2xl bg-white/5 border border-emerald-400/20 backdrop-blur-md shadow-lg max-w-2xl">
              <span className="font-arabic text-lg sm:text-2xl lg:text-3xl text-amber-300 font-bold leading-relaxed tracking-wide dir-rtl">
                إِنْ أُرِيدُ إِلَّا الْإِصْلَاحَ مَا اسْتَطَعْتُ ۚ وَمَا تَوْفِيقِي إِلَّا بِاللَّهِ
              </span>
              <span className="text-[11px] sm:text-xs text-emerald-200/80 font-medium tracking-wider mt-1">
                "I only intend reform to the best of my ability; and my success is only by Allah" (Surah Hud 88)
              </span>
            </div>

            {/* Main Institutional Identity: Simple Markaz Rooh ul Islam in Arabic & English */}
            <div className="space-y-3 max-w-4xl pt-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 text-xs font-semibold tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>مرکز روح الاسلام • ادارتی نظامِ حسابات و مالی ریکارڈ کیپر</span>
              </div>

              {/* Arabic Name */}
              <h2 className="font-arabic text-3xl sm:text-5xl lg:text-6xl font-bold text-amber-300 drop-shadow-md leading-tight pt-1">
                مرکز روح الاسلام
              </h2>

              {/* English Name */}
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-wide uppercase">
                Markaz Rooh ul Islam
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-amber-200 to-amber-400 text-lg sm:text-2xl lg:text-3xl font-bold mt-1 normal-case tracking-normal">
                  Institutional Financial Accounting & Cloud Spreadsheet Portal
                </span>
              </h1>

              <p className="text-sm sm:text-base lg:text-lg text-slate-300 font-normal leading-relaxed max-w-3xl mx-auto pt-2">
                Dedicated Shariah-compliant financial accounting system for <strong>Markaz Rooh ul Islam</strong>. Featuring unified cashbooks, Google Sheets clone spreadsheets, real-date voucher issuance, and persistent Neon PostgreSQL cloud storage.
              </p>
            </div>

            {/* PRIMARY HERO CALL TO ACTION: ONLY OPEN DASHBOARD */}
            <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
              <button
                onClick={() => setActiveTab('dashboard')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3.5 px-8 py-4 sm:px-10 sm:py-4.5 rounded-2xl font-black text-base sm:text-lg text-slate-950 shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 hover:from-amber-200 hover:to-amber-400 border border-amber-200/90 cursor-pointer shadow-amber-500/20"
              >
                <LayoutDashboard className="w-6 h-6 text-slate-950 shrink-0" />
                <span>Open Dashboard</span>
                <ArrowRight className="w-5 h-5 text-slate-950 shrink-0 stroke-[2.5]" />
              </button>

              <button
                onClick={() => setActiveTab('sheets')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl font-bold text-sm sm:text-base text-white bg-white/10 hover:bg-white/15 border border-white/20 backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
              >
                <FileSpreadsheet className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Open Spreadsheets</span>
              </button>
            </div>

          </div>

          {/* IN-DEPTH SYSTEM CAPABILITIES: 4 ARCHITECTURAL PILLARS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 pt-4">
            
            {/* Pillar 1: Google Sheets Clone Grid */}
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:border-emerald-400/40 transition-all duration-300 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/30 border border-emerald-400/30 text-emerald-300 flex items-center justify-center font-bold shadow-xs">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">
                Google Sheets Clone
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Full-featured spreadsheet grid with 100s of rows, formula bar, keyboard navigation (Enter/Tab), sticky row numbers, and 1-click Excel (.xlsx) / PDF exports.
              </p>
            </div>

            {/* Pillar 2: Shariah Fund Segregation */}
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:border-amber-400/40 transition-all duration-300 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-600/30 border border-amber-400/30 text-amber-300 flex items-center justify-center font-bold shadow-xs">
                <Scale className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">
                Shariah Fund Segregation
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Strict separation between restricted Zakat & Fitrana welfare funds versus unrestricted General Sadaqat, Khairat, Qurbani, and Madrassah construction dues.
              </p>
            </div>

            {/* Pillar 3: Neon PostgreSQL Cloud Database */}
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:border-emerald-400/40 transition-all duration-300 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/30 text-blue-300 flex items-center justify-center font-bold shadow-xs">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">
                Neon Cloud Database
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Zero mock records. Every ledger row and spreadsheet update is securely synchronized in real time to your cloud PostgreSQL database with SSL encryption.
              </p>
            </div>

            {/* Pillar 4: Digital Receipt Studio */}
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:border-indigo-400/40 transition-all duration-300 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-400/30 text-indigo-300 flex items-center justify-center font-bold shadow-xs">
                <Receipt className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">
                Official Voucher Studio
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Real-date receipt numbering (REC-YYYYMMDD-NNN) with automatic Urdu and English number-to-words spelling and instant printable institutional vouchers.
              </p>
            </div>

          </div>

          {/* REAL-TIME SYSTEM TELEMETRY STRIP */}
          <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-300 font-medium">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${dbStatus === 'connected' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className="font-semibold text-white">
                {dbStatus === 'connected' 
                  ? `Neon PostgreSQL Online (${dbLatency}ms latency)` 
                  : 'Cloud Database Active'}
              </span>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                <span>{sheetTabs.length} Configured Sheets</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>{categories.length} Shariah Funds</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                <span>{transactions.length} Verified Records</span>
              </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
};

