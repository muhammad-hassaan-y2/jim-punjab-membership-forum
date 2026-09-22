'use client';

import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { 
  FileSpreadsheet, 
  Receipt, 
  BarChart3, 
  Users, 
  Download, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  Coins, 
  CheckCircle2, 
  Printer, 
  Languages, 
  Palette,
  TrendingUp,
  WalletCards,
  Calendar,
  Clock,
  Database,
  BookOpen,
  Scale,
  Building,
  CheckCircle,
  PlusCircle,
  Layers,
  FileText,
  History,
  FileCheck,
  LayoutDashboard
} from 'lucide-react';
import { PrintableVoucher } from './PrintableVoucher';
import { exportTransactionsToExcel } from '../utils/exportUtils';

export const LandingPage: React.FC = () => {
  const { 
    theme, 
    language, 
    setActiveTab, 
    orgConfig, 
    categories, 
    transactions, 
    sheetTabs,
    totalIncome, 
    totalExpense, 
    netBalance, 
    activeReceiptTransaction,
    donorsSummary,
    createRawBlankSheet,
    createTemplateSheet,
    setIsPeriodicModalOpen,
    setIsHistoryModalOpen,
    dbStatus,
    dbLatency
  } = useFinance();

  const isUrdu = language === 'ur';

  // Quick stats
  const zakatTotal = transactions
    .filter(t => t.categoryId === 'zakat' && t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const handleOpenRawSheet = () => {
    createRawBlankSheet();
    setActiveTab('sheets');
  };

  return (
    <div className="space-y-12 pb-16">
      
      {/* HERO SECTION: ACCOUNTING & RECORD KEEPING FOCUS */}
      <section className="relative overflow-hidden rounded-3xl p-5 sm:p-8 md:p-12 lg:p-16 border shadow-2xl transition-all duration-300"
        style={{
          background: theme === 'black-gold' 
            ? 'radial-gradient(ellipse at 80% 20%, rgba(212, 175, 55, 0.15), transparent 60%), linear-gradient(135deg, #0d1117 0%, #161b26 100%)' 
            : theme === 'green'
            ? 'radial-gradient(ellipse at 80% 20%, rgba(16, 185, 129, 0.2), transparent 60%), linear-gradient(135deg, #064e3b 0%, #047857 50%, #065f46 100%)'
            : 'radial-gradient(ellipse at 80% 20%, rgba(59, 130, 246, 0.25), transparent 60%), linear-gradient(135deg, #0f2744 0%, #006699 60%, #0088cc 100%)',
          borderColor: theme === 'black-gold' ? '#d4af37' : 'rgba(255, 255, 255, 0.15)',
          color: '#ffffff',
        }}
      >
        {/* Subtle decorative glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-amber-400/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-blue-400/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
          
          {/* Hero Left Content */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6 text-center lg:text-left">
            
            {/* Top Pill with DB status */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs sm:text-sm font-semibold text-amber-300 shadow-sm">
              <Database className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>
                {dbStatus === 'connected' ? `Neon PostgreSQL Connected (${dbLatency}ms)` : 'Cloud Accounting Engine'}
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              Institutional Accounting & <span className="text-amber-300">Financial Record Keeping</span>
            </h1>

            {/* Description */}
            <p className="text-sm sm:text-base lg:text-lg text-slate-200 font-normal leading-relaxed max-w-2xl">
              Professional double-entry ledger portal and spreadsheet management tailored for religious institutions, madaris, and welfare trusts. Setup monthly or weekly cashbooks, segregate Shariah funds (Zakat vs General), and issue official print-ready vouchers.
            </p>

            {/* Primary Action Button: ONLY Open Dashboard */}
            <div className="pt-2">
              <button
                onClick={() => setActiveTab('dashboard')}
                className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-black text-base sm:text-lg text-slate-900 shadow-2xl transition-all hover:scale-105 active:scale-95 bg-linear-to-r from-amber-300 via-amber-400 to-amber-500 hover:from-amber-200 hover:to-amber-400 border border-amber-200/80 cursor-pointer"
              >
                <LayoutDashboard className="w-6 h-6 text-slate-900 shrink-0" />
                <span>Open Dashboard</span>
                <ArrowRight className="w-5 h-5 text-slate-900 shrink-0" />
              </button>
            </div>

            {/* Highlights checklist */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-white/10 text-xs sm:text-sm text-slate-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Neon PostgreSQL Cloud DB</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Zero Demo / Clean Slate</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Shariah Fund Segregation</span>
              </div>
            </div>

          </div>

          {/* Hero Right: Live Interactive Voucher Preview Snapshot */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-[480px] bg-slate-900/40 p-3 rounded-2xl border border-white/20 backdrop-blur-md shadow-2xl group hover:scale-[1.02] transition-transform duration-300">
              <div className="flex items-center justify-between px-3 py-1.5 mb-2 bg-black/30 rounded-lg text-xs font-semibold text-amber-300">
                <span className="flex items-center gap-1.5">
                  <Printer className="w-3.5 h-3.5" />
                  <span>{isUrdu ? 'آفیشل رسید کا نمونہ' : 'Official Jamia Voucher'}</span>
                </span>
                <button 
                  onClick={() => setActiveTab('receipt')}
                  className="text-white hover:underline flex items-center gap-1 text-[11px]"
                >
                  <span>{isUrdu ? 'کھولیں' : 'Open Studio'}</span> <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {/* Scaled preview of voucher */}
              <div className="overflow-x-auto rounded-lg shadow-inner bg-white max-h-[380px] p-1 sm:p-2">
                {activeReceiptTransaction ? (
                  <PrintableVoucher 
                    transaction={activeReceiptTransaction}
                    orgConfig={orgConfig}
                    categories={categories}
                    theme={theme}
                    isCompact={true}
                  />
                ) : (
                  <div className="p-8 text-center text-slate-500">
                    <Receipt className="w-10 h-10 text-blue-500 mx-auto mb-2 opacity-50" />
                    <p className="text-xs font-semibold text-slate-700">Digital Voucher Template Active</p>
                    <p className="text-[11px] text-slate-400 mt-1">Ready for real receipt issuance. Spells Urdu and English numbers automatically.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </section>


      {/* LIVE ACCOUNTING KPI STATS CARDS */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Collections */}
        <div className="bg-white dark:bg-slate-800/80 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Collections (Inflows)
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              💰
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            {orgConfig.currencySymbol} {totalIncome.toLocaleString()}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            {transactions.filter(t => t.type === 'income').length} verified ledger entries
          </p>
        </div>

        {/* Total Expenditures */}
        <div className="bg-white dark:bg-slate-800/80 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Expenditures (Outflows)
            </span>
            <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
              📉
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400 font-mono">
            {orgConfig.currencySymbol} {totalExpense.toLocaleString()}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Salaries, utilities, operational costs
          </p>
        </div>

        {/* Net Available Balance */}
        <div className="bg-white dark:bg-slate-800/80 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Net Available Balance
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              🏛️
            </div>
          </div>
          <div className={`text-2xl sm:text-3xl font-black font-mono ${netBalance >= 0 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600'}`}>
            {orgConfig.currencySymbol} {netBalance.toLocaleString()}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Current liquid bank & cash balance
          </p>
        </div>

        {/* Active Sheet Ledgers */}
        <div className="bg-white dark:bg-slate-800/80 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Active Ledger Sheets
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              📑
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400 font-mono">
            {sheetTabs.length}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Configured spreadsheet sheets
          </p>
        </div>

      </section>

      {/* HOW ACCOUNTING & RECORD KEEPING WORKS: 4-STEP CADENCE */}
      <section className="bg-white dark:bg-slate-800/80 rounded-3xl p-6 sm:p-8 md:p-10 border border-slate-200 dark:border-slate-700 shadow-sm space-y-8">
        
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider border border-blue-200 dark:border-blue-800">
            <Clock className="w-3.5 h-3.5" />
            <span>Workflow & Guide</span>
          </div>
          <h2 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            How Financial Record Keeping Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Choose whether to track your finances by Month, by Week, or in a completely free-form Raw Sheet.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Step 1 */}
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-900/40 space-y-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-md">
              1
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Choose Record Cadence
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Click <strong>Create Periodic Ledger</strong> to select a specific <strong>Month</strong> (e.g. October 2026) or <strong>Week</strong>, or click <strong>Raw Blank Sheet</strong> if you prefer unconstrained custom columns.
            </p>
            <div className="pt-2">
              <button 
                onClick={() => setIsPeriodicModalOpen(true)}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                <span>Select Period</span> <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-900/40 space-y-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shadow-md">
              2
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Enter Incomes & Expenditures
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Enter donor contributions, membership dues, or institutional expenses in the Google Sheets grid. Double-click any cell to edit inline or type into the formula bar.
            </p>
            <div className="pt-2">
              <button 
                onClick={() => setActiveTab('sheets')}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <span>Open Spreadsheet Grid</span> <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-900/40 space-y-3">
            <div className="w-9 h-9 rounded-xl bg-amber-600 text-white font-bold flex items-center justify-center text-sm shadow-md">
              3
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Issue Official Printed Vouchers
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Click the receipt icon on any row to open the authentic voucher with Urdu and English amount-to-words, institutional seal, and 1-click PDF / PNG download.
            </p>
            <div className="pt-2">
              <button 
                onClick={() => setActiveTab('receipt')}
                className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
              >
                <span>Go to Voucher Studio</span> <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

        </div>

      </section>

      {/* CORE ACCOUNTING PILLARS */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Shariah Fund Accounting */}
        <div className="p-6 sm:p-8 rounded-3xl bg-linear-to-br from-emerald-50 via-white to-emerald-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
            <Scale className="w-6 h-6" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
            Shariah-Compliant Fund Segregation
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Strict accounting barrier between <strong>Zakat & Fitrana (Restricted Welfare Pool)</strong> and <strong>General Sadaqat / Construction / Operational Funds (Unrestricted)</strong>. Ensures zero mixing of funds and strict Shariah audit compliance.
          </p>
          <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Dedicated Zakat & Fitrana Ledger Tabs</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Independent balance tracking for each fund category</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Tamleek compliance for eligible beneficiaries</span>
            </li>
          </ul>
        </div>

        {/* Audit Trail & Cloud Security */}
        <div className="p-6 sm:p-8 rounded-3xl bg-linear-to-br from-blue-50 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-blue-950/20 border border-blue-200 dark:border-blue-800/60 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
            Audit-Ready Ledger & Cloud Persistence
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Directly connected to a high-performance <strong>Neon PostgreSQL</strong> database. Zero reliance on ephemeral local browser caches. Every record has unique serial numbers, verification flags, and audit timestamps.
          </p>
          <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Sequential receipt numbering & anti-tamper tracking</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-blue-600 shrink-0" />
              <span>1-click JSON backup and Excel (.xlsx) exports</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Instant cloud synchronization across multiple operators</span>
            </li>
          </ul>
        </div>

      </section>

      {/* QUICK LAUNCH CALL TO ACTION */}
      <section className="rounded-3xl p-8 sm:p-12 text-center bg-slate-900 text-white border border-slate-800 shadow-xl space-y-6">
        <h2 className="text-2xl sm:text-3xl font-black">
          Ready to start recording your financial transactions?
        </h2>
        <p className="text-sm text-slate-400 max-w-xl mx-auto">
          Start with a clean raw spreadsheet or choose your specific month/week to begin data entry. All entries are instantly saved to your Neon database.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => setIsPeriodicModalOpen(true)}
            className="px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg flex items-center gap-2 transition-all"
          >
            <Calendar className="w-4 h-4" />
            <span>Setup Monthly / Weekly Ledger</span>
          </button>
          <button
            onClick={handleOpenRawSheet}
            className="px-6 py-3.5 rounded-2xl bg-white text-slate-900 hover:bg-slate-100 font-bold text-sm shadow-lg flex items-center gap-2 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Open Raw Blank Sheet</span>
          </button>
        </div>
      </section>

    </div>
  );
};
