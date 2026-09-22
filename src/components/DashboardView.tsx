'use client';

import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { 
  FileSpreadsheet, 
  Plus, 
  History, 
  FileCheck, 
  ArrowRight, 
  Database, 
  Layers,
  Trash2,
  ExternalLink,
  Coins,
  TrendingDown,
  Wallet,
  Calendar,
  Download,
  Printer
} from 'lucide-react';
import { exportTransactionsToExcel, printSheetAsPDF } from '../utils/exportUtils';

export const DashboardView: React.FC = () => {
  const { 
    sheetTabs, 
    activeSheetTabId, 
    setActiveSheetTabId, 
    setActiveTab, 
    createRawBlankSheet, 
    createTemplateSheet, 
    setIsHistoryModalOpen,
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

  const handleOpenSheet = (tabId: string) => {
    setActiveSheetTabId(tabId);
    setActiveTab('sheets');
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* TOP HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Start a new spreadsheet from a template or continue working on your saved ledgers.
          </p>
        </div>

        {/* Database Status Badge */}
        <div className="flex items-center gap-2 self-start sm:self-auto px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300">
          <Database className="w-3.5 h-3.5 text-indigo-500" />
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Neon DB: {dbStatus === 'connected' ? `Connected (${dbLatency}ms)` : 'Syncing'}</span>
        </div>
      </div>

      {/* TEMPLATE GALLERY SECTION WITH VISUAL THUMBNAIL PICTURES */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm sm:text-base font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
            Start a New Spreadsheet
          </h2>
          <button 
            onClick={() => setIsHistoryModalOpen(true)}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <span>History ({sheetTabs.length} sheets)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* TEMPLATE 1: NEW SHEET (BLANK SPREADSHEET) */}
          <div 
            onClick={() => createRawBlankSheet()}
            className="group cursor-pointer bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col"
          >
            {/* Visual Spreadsheet Thumbnail Picture */}
            <div className="h-44 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-800 dark:to-slate-850 p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col justify-between relative group-hover:scale-[1.01] transition-transform">
              
              {/* Mini Spreadsheet Mockup Header */}
              <div className="w-full bg-emerald-600 text-white rounded-t-lg p-2 flex items-center justify-between shadow-xs text-[10px] font-mono font-bold">
                <div className="flex items-center gap-1.5">
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Blank Sheet</span>
                </div>
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/60" />
                  <span className="w-1.5 h-1.5 rounded-full bg-white/60" />
                </div>
              </div>

              {/* Mini Spreadsheet Grid Preview */}
              <div className="w-full bg-white dark:bg-slate-900 rounded-b-lg border border-slate-200 dark:border-slate-700 shadow-xs p-1.5 space-y-1">
                {/* Column letters */}
                <div className="grid grid-cols-4 gap-1 text-[9px] font-mono text-center text-slate-400 font-bold border-b pb-0.5">
                  <span>A</span>
                  <span>B</span>
                  <span>C</span>
                  <span>D</span>
                </div>
                {/* Mock rows */}
                <div className="grid grid-cols-4 gap-1 text-[8px] font-mono text-slate-300 py-0.5">
                  <span className="bg-slate-100 dark:bg-slate-800 rounded px-1">&nbsp;</span>
                  <span className="bg-slate-100 dark:bg-slate-800 rounded px-1">&nbsp;</span>
                  <span className="bg-slate-100 dark:bg-slate-800 rounded px-1">&nbsp;</span>
                  <span className="bg-slate-100 dark:bg-slate-800 rounded px-1">&nbsp;</span>
                </div>
                <div className="grid grid-cols-4 gap-1 text-[8px] font-mono text-slate-300 py-0.5">
                  <span className="bg-slate-100 dark:bg-slate-800 rounded px-1">&nbsp;</span>
                  <span className="bg-slate-100 dark:bg-slate-800 rounded px-1">&nbsp;</span>
                  <span className="bg-slate-100 dark:bg-slate-800 rounded px-1">&nbsp;</span>
                  <span className="bg-slate-100 dark:bg-slate-800 rounded px-1">&nbsp;</span>
                </div>
              </div>

              {/* Center Floating Plus Badge */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Plus className="w-6 h-6 stroke-[2.5]" />
                </div>
              </div>
            </div>

            {/* Template Card Details */}
            <div className="p-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base group-hover:text-emerald-600 transition-colors">
                  New Sheet (Blank)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Clean unformatted spreadsheet for freeform accounting
                </p>
              </div>
              <span className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </div>

          {/* TEMPLATE 2: SHEET TEMPLATE (9 COLUMNS + 7 FUND CATEGORIES) */}
          <div 
            onClick={() => createTemplateSheet()}
            className="group cursor-pointer bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col"
          >
            {/* Visual Spreadsheet Thumbnail Picture */}
            <div className="h-44 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-850 p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col justify-between relative group-hover:scale-[1.01] transition-transform">
              
              {/* Mini Template Mockup Header */}
              <div className="w-full bg-blue-600 text-white rounded-t-lg p-2 flex items-center justify-between shadow-xs text-[10px] font-mono font-bold">
                <div className="flex items-center gap-1.5">
                  <FileCheck className="w-3.5 h-3.5" />
                  <span>9-Column Template</span>
                </div>
                <span className="text-[8px] bg-amber-400 text-slate-900 px-1 rounded uppercase font-black">
                  Pre-configured
                </span>
              </div>

              {/* Mini Template Columns Preview */}
              <div className="w-full bg-white dark:bg-slate-900 rounded-b-lg border border-slate-200 dark:border-slate-700 shadow-xs p-1.5 space-y-1">
                {/* Column Headers */}
                <div className="grid grid-cols-4 gap-1 text-[8px] font-bold text-slate-600 dark:text-slate-300 border-b pb-0.5 truncate">
                  <span className="truncate">Receipt#</span>
                  <span className="truncate">Date</span>
                  <span className="truncate">Donor</span>
                  <span className="truncate">Money</span>
                </div>
                {/* Sample row with Fund tag */}
                <div className="grid grid-cols-4 gap-1 text-[8px] font-mono text-slate-500 items-center py-0.5">
                  <span className="text-blue-600 font-bold">#101</span>
                  <span>2026-09</span>
                  <span className="truncate">Haji Ahmad</span>
                  <span className="text-emerald-600 font-bold text-right">50,000</span>
                </div>
                {/* 7 Fund Tags preview */}
                <div className="flex items-center gap-1 overflow-hidden pt-0.5">
                  <span className="text-[7px] px-1 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold">Zakat</span>
                  <span className="text-[7px] px-1 py-0.2 rounded bg-sky-100 text-sky-800 font-bold">Fitrat</span>
                  <span className="text-[7px] px-1 py-0.2 rounded bg-amber-100 text-amber-800 font-bold">Sadqat</span>
                  <span className="text-[7px] px-1 py-0.2 rounded bg-purple-100 text-purple-800 font-bold">Khirat</span>
                </div>
              </div>

              {/* Center Floating Icon Badge */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <FileCheck className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Template Card Details */}
            <div className="p-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base group-hover:text-blue-600 transition-colors">
                  Sheet Template
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Standard 9 columns with Zakat, Fitrat, Sadqat & other funds
                </p>
              </div>
              <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </div>

          {/* TEMPLATE 3: HISTORY OF SHEETS */}
          <div 
            onClick={() => setIsHistoryModalOpen(true)}
            className="group cursor-pointer bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col"
          >
            {/* Visual History Thumbnail Picture */}
            <div className="h-44 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-slate-800 dark:to-slate-850 p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col justify-between relative group-hover:scale-[1.01] transition-transform">
              
              {/* Mini History Mockup Header */}
              <div className="w-full bg-indigo-600 text-white rounded-t-lg p-2 flex items-center justify-between shadow-xs text-[10px] font-mono font-bold">
                <div className="flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5" />
                  <span>Saved Ledgers</span>
                </div>
                <span className="text-[9px] bg-white/20 px-1.5 py-0.5 rounded font-bold">
                  {sheetTabs.length} Sheets
                </span>
              </div>

              {/* Mini Stack of Sheets Preview */}
              <div className="w-full bg-white dark:bg-slate-900 rounded-b-lg border border-slate-200 dark:border-slate-700 shadow-xs p-2 space-y-1.5">
                {sheetTabs.slice(0, 2).map((sheet, i) => (
                  <div key={sheet.id} className="flex items-center justify-between text-[9px] font-mono border-b pb-1 last:border-b-0">
                    <span className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1">
                      <FileSpreadsheet className="w-2.5 h-2.5 text-indigo-500" />
                      Sheet {i + 1}
                    </span>
                    <span className="text-slate-400">Database Record</span>
                  </div>
                ))}
              </div>

              {/* Center Floating Icon Badge */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <History className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Template Card Details */}
            <div className="p-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base group-hover:text-indigo-600 transition-colors">
                  History of Sheets
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Manage and switch between your {sheetTabs.length} saved sheets
                </p>
              </div>
              <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* RECENT SPREADSHEETS LIST */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
              Active Sheets in Database
            </h3>
          </div>
          <button 
            onClick={() => createTemplateSheet()}
            className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 hover:bg-blue-100 font-bold text-xs flex items-center gap-1 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Sheet</span>
          </button>
        </div>

        <div className="divide-y divide-slate-200 dark:divide-slate-800">
          {sheetTabs.map((sheet, index) => {
            const sheetNumber = index + 1;
            const isCurrentlyActive = activeSheetTabId === sheet.id;

            return (
              <div 
                key={sheet.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300 flex items-center justify-center font-bold">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                        Sheet {sheetNumber}
                      </span>
                      {isCurrentlyActive && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                          Selected
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 font-mono">
                      Database ID: {sheet.id} • All records synced
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => handleOpenSheet(sheet.id)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all"
                  >
                    <span>Open Sheet {sheetNumber}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>

                  {/* Download Sheet (Excel) */}
                  <button
                    onClick={() => {
                      const sheetTransactions = transactions.filter(t => {
                        if (sheet.categoryFilter && t.categoryId !== sheet.categoryFilter) return false;
                        if (sheet.typeFilter && sheet.typeFilter !== 'all' && t.type !== sheet.typeFilter) return false;
                        return true;
                      });
                      exportTransactionsToExcel(sheetTransactions, categories, orgConfig, `Sheet_${sheetNumber}_Ledger`);
                    }}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-emerald-600 hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors shadow-2xs"
                    title="Download Sheet (Excel .xlsx)"
                  >
                    <Download className="w-4 h-4 text-emerald-600" />
                  </button>

                  {/* Print in PDF */}
                  <button
                    onClick={() => {
                      const sheetTransactions = transactions.filter(t => {
                        if (sheet.categoryFilter && t.categoryId !== sheet.categoryFilter) return false;
                        if (sheet.typeFilter && sheet.typeFilter !== 'all' && t.type !== sheet.typeFilter) return false;
                        return true;
                      });
                      printSheetAsPDF(`Sheet ${sheetNumber}`, sheetTransactions, categories, orgConfig);
                    }}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors shadow-2xs"
                    title="Print in PDF"
                  >
                    <Printer className="w-4 h-4 text-blue-600" />
                  </button>

                  {sheetTabs.length > 1 && (
                    <button
                      onClick={() => deleteSheetTab(sheet.id)}
                      className="p-2 rounded-xl hover:bg-rose-100 dark:hover:bg-rose-950/50 text-slate-400 hover:text-rose-600 transition-colors"
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

      {/* ACCOUNTING FINANCIAL SUMMARY */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        
        {/* Total Inflows */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Inflows
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            {orgConfig.currencySymbol} {totalIncome.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {transactions.filter(t => t.type === 'income').length} verified ledger collections
          </p>
        </div>

        {/* Total Outflows */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Outflows
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 font-mono">
            {orgConfig.currencySymbol} {totalExpense.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Salaries, utilities, development costs
          </p>
        </div>

        {/* Net Available Liquid Balance */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Net Balance
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-xl sm:text-2xl font-black font-mono ${netBalance >= 0 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600'}`}>
            {orgConfig.currencySymbol} {netBalance.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Current liquid cash & bank reserve
          </p>
        </div>

      </section>

    </div>
  );
};

export default DashboardView;
