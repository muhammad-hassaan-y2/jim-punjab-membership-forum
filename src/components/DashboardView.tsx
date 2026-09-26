'use client';

import React, { useState, useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { 
  Coins, 
  TrendingDown, 
  Wallet, 
  ShieldCheck, 
  Layers, 
  FileSpreadsheet, 
  Plus, 
  ExternalLink, 
  Download, 
  Printer, 
  Share2, 
  Check, 
  Trash2, 
  Search, 
  ArrowUpRight, 
  ArrowDownRight, 
  Sparkles, 
  Clock, 
  Building2, 
  Lock,
  CheckCircle2,
  Calendar,
  Filter,
  Target,
  Database,
  X
} from 'lucide-react';
import { exportTransactionsToExcel, printSheetAsPDF } from '../utils/exportUtils';

export const DashboardView: React.FC = () => {
  const { 
    sheetTabs, 
    activeSheetTabId, 
    setActiveSheetTabId, 
    createRawBlankSheet, 
    createTemplateSheet, 
    saveAllSheetsToDatabase,
    batchCreateAndSaveSheets,
    setActiveTab,
    transactions,
    categories,
    totalIncome,
    totalExpense,
    netBalance,
    targetToCollect,
    setTargetToCollect,
    totalPledgedTarget,
    totalDonorsCount,
    totalPaidCount,
    monthlyPledgedSum,
    quarterlyPledgedSum,
    annuallyPledgedSum,
    collectedIn2026,
    projects,
    activeProjectId,
    orgConfig,
    deleteSheetTab,
    addTransaction,
    dbStatus,
    dbLatency
  } = useFinance();

  const [copiedSheetId, setCopiedSheetId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<'all' | 'income' | 'expense'>('all');
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [tempTarget, setTempTarget] = useState(targetToCollect.toString());
  const [isSavingDb, setIsSavingDb] = useState(false);
  const [dbSuccessToast, setDbSuccessToast] = useState<string | null>(null);

  // Handle direct navigation to dynamic sheet route
  const handleOpenSheet = (tabId: string) => {
    setActiveSheetTabId(tabId);
    if (typeof window !== 'undefined') {
      window.location.href = `/dashboard/sheets/${tabId}`;
    }
  };

  const handleCopyShareLink = (sheetId: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const shareUrl = `${origin}/share?sheet=${sheetId}`;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(shareUrl);
      setCopiedSheetId(sheetId);
      setTimeout(() => setCopiedSheetId(null), 2500);
    }
  };

  // Filtered recent transactions for the live ledger feed
  const recentTransactions = useMemo(() => {
    return transactions
      .filter((t) => {
        if (selectedType !== 'all' && t.type !== selectedType) return false;
        if (selectedCategory !== 'all' && t.categoryId !== selectedCategory) return false;
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const matchName = t.donorName?.toLowerCase().includes(q);
          const matchRef = t.reference?.toLowerCase().includes(q);
          const matchReceipt = t.receiptNo?.toLowerCase().includes(q);
          const matchNotes = t.notes?.toLowerCase().includes(q);
          const matchCity = t.city?.toLowerCase().includes(q);
          if (!matchName && !matchRef && !matchReceipt && !matchNotes && !matchCity) return false;
        }
        return true;
      })
      .slice(0, 10);
  }, [transactions, selectedType, selectedCategory, searchTerm]);

  // Effective target to collect: dynamically sum all member commitments from the sheets
  const effectiveTarget = totalPledgedTarget > 0 ? totalPledgedTarget : targetToCollect;

  // Target collection progress
  const targetProgress = useMemo(() => {
    if (!effectiveTarget || effectiveTarget <= 0) return 0;
    return Math.min(100, Math.round((totalIncome / effectiveTarget) * 100));
  }, [totalIncome, effectiveTarget]);

  const remainingToCollect = Math.max(0, effectiveTarget - totalIncome);

  const handleSaveTarget = () => {
    const num = Number(tempTarget.replace(/,/g, ''));
    if (!isNaN(num) && num > 0) {
      setTargetToCollect(num);
    }
    setIsEditingTarget(false);
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-20 max-w-7xl mx-auto px-2 sm:px-4">
      
      {/* ====================================================================
          1. REGAL ISLAMIC EXECUTIVE BANNER - JIM PUNJAB
          ==================================================================== */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-[#022c22] to-[#011c15] border-2 border-amber-400/80 shadow-[0_15px_40px_rgba(6,78,59,0.25)] text-white p-6 sm:p-8">
        
        {/* Subtle Geometric Background */}
        <div 
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at center, #f59e0b 1.5px, transparent 1.5px),
                              radial-gradient(circle at 0% 0%, #10b981 1.5px, transparent 1.5px)`,
            backgroundSize: '24px 24px'
          }}
        />

        {/* Ornate Golden Filigree Corners */}
        <div className="absolute top-2 left-2 w-7 h-7 text-amber-400/90 pointer-events-none">
          <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
            <path d="M2 38 V12 C2 6 6 2 12 2 H38" stroke="currentColor" strokeWidth="2" />
            <circle cx="12" cy="12" r="3" fill="currentColor" />
          </svg>
        </div>
        <div className="absolute top-2 right-2 w-7 h-7 text-amber-400/90 pointer-events-none scale-x-[-1]">
          <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
            <path d="M2 38 V12 C2 6 6 2 12 2 H38" stroke="currentColor" strokeWidth="2" />
            <circle cx="12" cy="12" r="3" fill="currentColor" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-arabic text-xl sm:text-2xl text-amber-300 font-bold drop-shadow-xs">
                جماعت اصلاح المسلمین پنجاب
              </span>
              <span className="text-amber-400/70 text-sm">✦</span>
              <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-300">
                JIM Punjab Portal
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-snug">
              Jamaat Islahul Muslimeen Punjab
            </h1>

            <p className="text-xs sm:text-sm text-emerald-200/90 max-w-2xl font-medium leading-relaxed">
              Institutional Financial Control Center • Membership Fund Management & Punjab District Spreadsheets • Campaign Year 2026.
            </p>

          </div>
        </div>

      </div>

      {/* ====================================================================
          2. CORE EXECUTIVE FINANCIAL METRICS
          1) How much money to collect (Target Goal & Remaining)
          2) How much is collected (Total Inflows across 12 months)
          ==================================================================== */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        
        {/* 1. HOW MUCH MONEY TO COLLECT */}
        <div className="bg-white rounded-3xl p-6 border-2 border-amber-400/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                How Much to Collect
              </span>
              <span className="text-[11px] text-amber-700 font-bold">معینہ ہدف (Pledged Target)</span>
            </div>
            <div className="flex items-center gap-1">
              {isEditingTarget ? (
                <button
                  onClick={handleSaveTarget}
                  className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-600 text-white hover:bg-amber-700 cursor-pointer"
                >
                  Save
                </button>
              ) : (
                <button
                  onClick={() => {
                    setTempTarget(effectiveTarget.toString());
                    setIsEditingTarget(true);
                  }}
                  className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 flex items-center justify-center font-bold text-xs cursor-pointer"
                  title="Edit Target Goal"
                >
                  ✏️
                </button>
              )}
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center font-bold">
                <Target className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </div>

          {isEditingTarget ? (
            <div className="my-1">
              <input
                type="number"
                value={tempTarget}
                onChange={(e) => setTempTarget(e.target.value)}
                className="w-full text-xl font-bold font-mono border border-amber-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-amber-500"
                autoFocus
              />
              <span className="text-[10px] text-slate-400">Target collection amount</span>
            </div>
          ) : (
            <div>
              <div className="text-3xl sm:text-4xl font-black text-amber-700 font-mono tracking-tight">
                {orgConfig.currencySymbol} {effectiveTarget.toLocaleString()}
              </div>
              <span className="text-xs font-semibold text-slate-500 block mt-1">
                {totalPledgedTarget > 0 ? '✓ Live Calculated from Member Commitments' : 'Campaign Target Goal'}
              </span>
            </div>
          )}

          {/* Progress Bar & Remaining */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs font-bold mb-1.5">
              <span className="text-slate-500">Progress</span>
              <span className="text-amber-700 font-mono">{targetProgress}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-amber-500 to-emerald-600 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${targetProgress}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-2.5 text-xs font-semibold text-slate-600">
              <span>Remaining to Collect:</span>
              <span className="font-mono font-bold text-rose-600 text-sm">
                {orgConfig.currencySymbol} {remainingToCollect.toLocaleString()}
              </span>
            </div>
          </div>

          {(monthlyPledgedSum > 0 || quarterlyPledgedSum > 0 || annuallyPledgedSum > 0) && (
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-mono">
              <span className="font-sans font-medium text-slate-400">Pledges:</span>
              <span className="font-bold text-amber-800">
                {monthlyPledgedSum > 0 && `₨${monthlyPledgedSum.toLocaleString()}/mo `}
                {quarterlyPledgedSum > 0 && `₨${quarterlyPledgedSum.toLocaleString()}/qtr `}
                {annuallyPledgedSum > 0 && `₨${annuallyPledgedSum.toLocaleString()}/yr`}
              </span>
            </div>
          )}
        </div>

        {/* 2. HOW MUCH IS COLLECTED */}
        <div className="bg-white rounded-3xl p-6 border-2 border-emerald-400/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                How Much is Collected
              </span>
              <span className="text-[11px] text-emerald-700 font-bold">کل وصولی (Total Realized)</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold">
              <Coins className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-emerald-700 font-mono tracking-tight">
            {orgConfig.currencySymbol} {totalIncome.toLocaleString()}
          </div>
          <div className="flex items-center gap-1.5 mt-2.5 text-xs font-semibold text-emerald-800">
            <ArrowUpRight className="w-4 h-4 text-emerald-600" />
            <span>{totalPaidCount > 0 ? `${totalPaidCount} members contributing` : '0 payments recorded'} ({transactions.filter(t => t.type === 'income').length} sheet rows)</span>
          </div>
          <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Membership collections</span>
            <span className="font-bold text-emerald-700">Live Sheet Calculation</span>
          </div>
        </div>

      </section>

      {/* ====================================================================
          3. MEMBERSHIP FUND SPECIFICATION SECTION
          Only Membership Funds allowed (Zakat, Fitrat, etc. removed)
          ==================================================================== */}
      <section className="bg-white rounded-3xl border border-amber-300/70 p-5 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-700" />
              <h2 className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-wide">
                Dedicated Membership Fund • ممبر شپ فنڈ
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Jamaat Islahul Muslimeen Punjab membership subscription contributions and records
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-800 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-200 self-start sm:self-auto">
            Primary Fund: Membership Only
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-5">
          <div className="p-4 rounded-2xl bg-[#fdfaf3] border border-amber-200/80 shadow-2xs">
            <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider block">
              Membership Collections (Inflows)
            </span>
            <span className="text-xl sm:text-2xl font-black font-mono text-emerald-800 block mt-1">
              {orgConfig.currencySymbol} {totalIncome.toLocaleString()}
            </span>
            <span className="text-xs text-emerald-700 font-medium mt-1 block">
              Direct member contributions
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#fdfaf3] border border-amber-200/80 shadow-2xs">
            <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider block">
              Membership Disbursements (Sent)
            </span>
            <span className="text-xl sm:text-2xl font-black font-mono text-rose-700 block mt-1">
              {orgConfig.currencySymbol} {totalExpense.toLocaleString()}
            </span>
            <span className="text-xs text-rose-700 font-medium mt-1 block">
              Organizational operational expenditures
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-950 text-white border border-amber-400/80 shadow-2xs">
            <span className="text-[11px] text-emerald-300 font-bold uppercase tracking-wider block">
              Membership Net Reserve
            </span>
            <span className="text-xl sm:text-2xl font-black font-mono text-amber-300 block mt-1">
              {orgConfig.currencySymbol} {netBalance.toLocaleString()}
            </span>
            <span className="text-xs text-emerald-200 font-medium mt-1 block">
              Available liquid balance
            </span>
          </div>
        </div>
      </section>

      {/* ====================================================================
          4. ACTIVE SPREADSHEETS HUB (CLEAN SPREADSHEET ACCESS CARDS)
          ==================================================================== */}
      <section className="bg-white rounded-3xl border border-amber-300/70 p-5 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-700" />
              <h2 className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-wide">
                Institutional Working Sheets
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Individual working spreadsheets backed by cloud database with dedicated URLs
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.location.href = `/dashboard/sheets/${activeSheetTabId || 'sheet1'}`;
                } else {
                  setActiveTab('sheets');
                }
              }}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-sm transition-all hover:scale-105 active:scale-95 border border-amber-200 cursor-pointer"
              title="Select how many sheets you need and save directly to Neon PostgreSQL database"
            >
              <span>⚡ Multi-Sheet Creator</span>
            </button>

            <button
              onClick={async () => {
                setIsSavingDb(true);
                const success = await saveAllSheetsToDatabase();
                setIsSavingDb(false);
                if (success) {
                  setDbSuccessToast(`All ${sheetTabs.length} sheets successfully saved to Neon PostgreSQL Database!`);
                  setTimeout(() => setDbSuccessToast(null), 4000);
                } else {
                  alert('Error saving sheets to database.');
                }
              }}
              disabled={isSavingDb}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all hover:scale-105 active:scale-95 border border-blue-400/80 cursor-pointer disabled:opacity-50"
              title="Save all active sheets to Neon PostgreSQL Database"
            >
              <Database className="w-3.5 h-3.5 text-blue-200" />
              <span>{isSavingDb ? 'Saving...' : '💾 Save to DB'}</span>
            </button>

            <button 
              onClick={() => createTemplateSheet()}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-800 to-emerald-900 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>+ New Sheet</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-5">
          {sheetTabs.map((sheet, index) => {
            const sheetNumber = index + 1;
            const isCurrentlyActive = activeSheetTabId === sheet.id;

            return (
              <div 
                key={sheet.id}
                className="p-4 sm:p-5 rounded-2xl bg-[#fdfaf3] border border-amber-200/90 hover:border-amber-400 transition-all flex flex-col justify-between shadow-2xs hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                      <FileSpreadsheet className="w-4 h-4" />
                    </div>
                    {isCurrentlyActive && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                        Active
                      </span>
                    )}
                  </div>

                  <h3 className="font-black text-slate-900 text-sm sm:text-base">
                    {sheet.name || `Sheet ${sheetNumber}`}
                  </h3>
                  <div className="flex flex-wrap items-center gap-1.5 mt-1">
                    {sheet.cityName && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                        📍 {sheet.cityName}
                      </span>
                    )}
                    {sheet.projectYear && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                        {sheet.projectYear}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 font-mono mt-1">
                    URL: /dashboard/sheets/{sheet.id}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-amber-200/60 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleOpenSheet(sheet.id)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-emerald-950 font-bold text-xs shadow-2xs transition-colors cursor-pointer"
                  >
                    <span>Open Sheet</span>
                    <ExternalLink className="w-3.5 h-3.5 text-emerald-700" />
                  </button>

                  <button
                    onClick={() => handleCopyShareLink(sheet.id)}
                    className="p-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-600 hover:text-emerald-700 transition-colors cursor-pointer"
                    title="Copy direct shareable link"
                  >
                    {copiedSheetId === sheet.id ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Share2 className="w-4 h-4" />
                    )}
                  </button>

                  {sheetTabs.length > 1 && (
                    <button
                      onClick={() => deleteSheetTab(sheet.id)}
                      className="p-2 rounded-xl border border-slate-300 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Delete Sheet"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ====================================================================
          5. VERIFIED RECENT LEDGER FEED
          ==================================================================== */}
      <section className="bg-white rounded-3xl border border-amber-300/70 p-5 sm:p-7 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-700" />
              <h2 className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-wide">
                Verified Transactions Feed
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Live chronological view of verified contributions and disbursements
            </p>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search donor, receipt, notes..."
                className="pl-8 pr-3 py-1.5 text-xs bg-[#fdfaf3] border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-700 w-44 sm:w-56"
              />
            </div>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as any)}
              className="py-1.5 px-2.5 text-xs bg-[#fdfaf3] border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-700 font-semibold text-slate-700"
            >
              <option value="all">All Types</option>
              <option value="income">Inflows Only</option>
              <option value="expense">Outflows Only</option>
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="py-1.5 px-2.5 text-xs bg-[#fdfaf3] border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-700 font-semibold text-slate-700"
            >
              <option value="all">All Funds</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.nameEnglish}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto pt-4">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Receipt #</th>
                <th className="py-2.5 px-3">Donor / Payee</th>
                <th className="py-2.5 px-3">Fund Category</th>
                <th className="py-2.5 px-3">Mode</th>
                <th className="py-2.5 px-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                    No transactions match the selected filter.
                  </td>
                </tr>
              ) : (
                recentTransactions.map((tx) => {
                  const isIncome = tx.type === 'income';
                  const cat = categories.find((c) => c.id === tx.categoryId);

                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-mono text-slate-600 whitespace-nowrap">
                        {tx.date}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-800 whitespace-nowrap">
                        {tx.receiptNo || '---'}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{tx.donorName || '---'}</div>
                        {tx.reference && (
                          <div className="text-[10px] text-slate-400">Ref: {tx.reference}</div>
                        )}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
                          {cat?.nameEnglish || tx.categoryName || 'General'}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-600 whitespace-nowrap">
                        {tx.paymentMode || 'Cash'}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold whitespace-nowrap">
                        <span className={isIncome ? 'text-emerald-700' : 'text-rose-600'}>
                          {isIncome ? '+' : '-'} {orgConfig.currencySymbol} {Number(tx.amount || 0).toLocaleString()}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Database Save Success Notification Toast */}
      {dbSuccessToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-emerald-950 via-[#022c22] to-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border-2 border-emerald-400 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-400/40">
            <Check className="w-5 h-5 stroke-[3]" />
          </div>
          <div>
            <div className="font-black text-white text-sm">Neon PostgreSQL Database Synced!</div>
            <div className="text-emerald-200 text-xs mt-0.5">
              {dbSuccessToast}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default DashboardView;
