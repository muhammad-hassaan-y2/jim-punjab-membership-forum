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
  Filter
} from 'lucide-react';
import { exportTransactionsToExcel, printSheetAsPDF } from '../utils/exportUtils';

export const DashboardView: React.FC = () => {
  const { 
    sheetTabs, 
    activeSheetTabId, 
    setActiveSheetTabId, 
    createRawBlankSheet, 
    createTemplateSheet, 
    transactions,
    categories,
    totalIncome,
    totalExpense,
    netBalance,
    orgConfig,
    deleteSheetTab,
    dbStatus,
    dbLatency
  } = useFinance();

  const [copiedSheetId, setCopiedSheetId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<'all' | 'income' | 'expense'>('all');

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
          if (!matchName && !matchRef && !matchReceipt && !matchNotes) return false;
        }
        return true;
      })
      .slice(0, 10);
  }, [transactions, selectedType, selectedCategory, searchTerm]);

  // Restricted Zakat and Fitrana calculations
  const zakatInflow = useMemo(() => {
    return transactions
      .filter((t) => t.categoryId === 'zakat' && t.type === 'income')
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  }, [transactions]);

  const zakatExpense = useMemo(() => {
    return transactions
      .filter((t) => t.categoryId === 'zakat' && t.type === 'expense')
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  }, [transactions]);

  const zakatNet = zakatInflow - zakatExpense;

  return (
    <div className="space-y-6 sm:space-y-8 pb-20 max-w-7xl mx-auto px-2 sm:px-4">
      
      {/* ====================================================================
          1. REGAL ISLAMIC EXECUTIVE BANNER
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
                مرکز روح الاسلام
              </span>
              <span className="text-amber-400/70 text-sm">✦</span>
              <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-300">
                Executive Portal
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-snug">
              Institutional Financial Dashboard
            </h1>

            <p className="text-xs sm:text-sm text-emerald-200/90 max-w-2xl font-medium leading-relaxed">
              Centralized accounts intelligence, strict mathematical Shariah fund isolation, and real-time cloud ledger synchronization for {orgConfig.nameEnglish || 'Markaz Rooh ul Islam'}.
            </p>

          </div>
        </div>

      </div>

      {/* ====================================================================
          2. EXECUTIVE FINANCIAL METRIC CARDS (4-CARD GRID)
          ==================================================================== */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* Total Inflows */}
        <div className="bg-white rounded-3xl p-5 border border-amber-300/60 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Inflows
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold">
              <Coins className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-700 font-mono tracking-tight">
            {orgConfig.currencySymbol} {totalIncome.toLocaleString()}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-emerald-800">
            <ArrowUpRight className="w-4 h-4 text-emerald-600" />
            <span>{transactions.filter(t => t.type === 'income').length} collections</span>
          </div>
        </div>

        {/* Total Outflows */}
        <div className="bg-white rounded-3xl p-5 border border-amber-300/60 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Outflows
            </span>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 flex items-center justify-center font-bold">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-700 font-mono tracking-tight">
            {orgConfig.currencySymbol} {totalExpense.toLocaleString()}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-rose-800">
            <ArrowDownRight className="w-4 h-4 text-rose-600" />
            <span>{transactions.filter(t => t.type === 'expense').length} expenditures</span>
          </div>
        </div>

        {/* Net Available Balance */}
        <div className="bg-white rounded-3xl p-5 border-2 border-amber-400/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Net Balance
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center font-bold">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className={`text-2xl sm:text-3xl font-black font-mono tracking-tight ${netBalance >= 0 ? 'text-slate-900' : 'text-rose-600'}`}>
            {orgConfig.currencySymbol} {netBalance.toLocaleString()}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-amber-800">
            <Building2 className="w-4 h-4 text-amber-600" />
            <span>Liquid cash & bank reserve</span>
          </div>
        </div>

        {/* Restricted Zakat & Relief Fund */}
        <div className="bg-white rounded-3xl p-5 border border-amber-300/60 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Restricted Zakat
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center font-bold">
              <Lock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-blue-900 font-mono tracking-tight">
            {orgConfig.currencySymbol} {zakatNet.toLocaleString()}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-blue-800">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>Dedicated welfare pool</span>
          </div>
        </div>

      </section>

      {/* ====================================================================
          3. SHARIAH FUND SEGREGATION MATRIX
          ==================================================================== */}
      <section className="bg-white rounded-3xl border border-amber-300/70 p-5 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-700" />
              <h2 className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-wide">
                Shariah Funds Allocation Matrix
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Strict mathematical isolation between restricted welfare versus general endowment funds
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-800 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-200 self-start sm:self-auto">
            {categories.length} Dedicated Shariah Accounts
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-5">
          {categories.map((cat) => {
            const catIncome = transactions
              .filter((t) => t.categoryId === cat.id && t.type === 'income')
              .reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
            const catExpense = transactions
              .filter((t) => t.categoryId === cat.id && t.type === 'expense')
              .reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
            const catBalance = catIncome - catExpense;

            return (
              <div 
                key={cat.id} 
                className="p-3.5 rounded-2xl bg-[#fdfaf3] border border-amber-200/80 hover:border-amber-400 transition-all flex flex-col justify-between shadow-2xs hover:shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-black text-slate-900 truncate">
                      {cat.nameEnglish}
                    </span>
                  </div>
                  <span className="font-arabic text-xs font-bold text-amber-700 block dir-rtl truncate mt-0.5">
                    {cat.nameUrdu}
                  </span>
                </div>
                <div className="mt-3 pt-2 border-t border-amber-200/60">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
                    Balance
                  </span>
                  <span className="text-xs sm:text-sm font-black font-mono text-emerald-900 block truncate">
                    {orgConfig.currencySymbol} {catBalance.toLocaleString()}
                  </span>
                </div>
              </div>
            );
          })}
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

          <div className="flex items-center gap-2">
            <button 
              onClick={() => createTemplateSheet()}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-800 to-emerald-900 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Sheet</span>
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
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
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

    </div>
  );
};

export default DashboardView;
