'use client';

import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { 
  History, 
  FileSpreadsheet, 
  Plus, 
  X, 
  Trash2, 
  ArrowRight, 
  Calendar, 
  Layers, 
  CheckCircle2, 
  Coins, 
  FileCheck,
  Sparkles,
  Download,
  Printer,
  Share2
} from 'lucide-react';
import { exportTransactionsToExcel, printSheetAsPDF } from '../utils/exportUtils';

export const SheetHistoryModal: React.FC = () => {
  const { 
    isHistoryModalOpen, 
    setIsHistoryModalOpen, 
    sheetTabs, 
    activeSheetTabId, 
    setActiveSheetTabId, 
    setActiveTab, 
    deleteSheetTab, 
    transactions, 
    categories,
    createRawBlankSheet, 
    createTemplateSheet, 
    language,
    orgConfig
  } = useFinance();

  const isUrdu = language === 'ur';

  if (!isHistoryModalOpen) return null;

  const handleOpenSheet = (tabId: string) => {
    setActiveSheetTabId(tabId);
    setActiveTab('sheets');
    setIsHistoryModalOpen(false);
  };

  const handleCreateNewBlank = () => {
    createRawBlankSheet();
    setIsHistoryModalOpen(false);
  };

  const handleCreateTemplate = () => {
    createTemplateSheet();
    setIsHistoryModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white relative">
          <button
            onClick={() => setIsHistoryModalOpen(false)}
            className="absolute top-5 right-5 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-500/20 rounded-2xl border border-indigo-400/30">
              <History className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold tracking-tight flex items-center gap-2">
                <span>{isUrdu ? 'شیٹس کی تاریخ و ہسٹری' : 'History of Sheets'}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-300 font-mono">
                  {sheetTabs.length} {sheetTabs.length === 1 ? 'Sheet' : 'Sheets'}
                </span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 font-normal mt-0.5">
                {isUrdu ? 'تمام تیار کردہ شیٹس، کھاتہ جات اور سابقہ ریکارڈ دیکھیں اور سوئچ کریں' : 'All saved sheets, periodic ledgers, and past record sheets in your database.'}
              </p>
            </div>
          </div>

          {/* Quick Actions in Header */}
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/10">
            <button
              onClick={handleCreateNewBlank}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isUrdu ? 'نئی خالی شیٹ' : '+ New Sheet'}</span>
            </button>
            <button
              onClick={handleCreateTemplate}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>{isUrdu ? 'شیٹ ٹیمپلیٹ' : '+ Sheet Template'}</span>
            </button>
          </div>
        </div>

        {/* Sheets List Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-3 flex-1">
          {sheetTabs.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-3">
              <FileSpreadsheet className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold">No sheets found in database.</p>
              <div className="flex justify-center gap-2">
                <button
                  onClick={handleCreateNewBlank}
                  className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs"
                >
                  Create First Sheet
                </button>
              </div>
            </div>
          ) : (
            sheetTabs.map((tab, idx) => {
              const isCurrent = tab.id === activeSheetTabId;

              // Calculate metrics for this specific tab
              const tabTransactions = transactions.filter(t => {
                if (tab.categoryFilter && t.categoryId !== tab.categoryFilter) return false;
                if (tab.typeFilter && tab.typeFilter !== 'all' && t.type !== tab.typeFilter) return false;
                return true;
              });

              const tabTotalMoney = tabTransactions
                .filter(t => t.type === 'income' && t.status !== 'cancelled')
                .reduce((sum, t) => sum + Number(t.amount || 0), 0);

              return (
                <div
                  key={tab.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                    isCurrent 
                      ? 'border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/30 ring-2 ring-indigo-500/20 shadow-sm' 
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 shadow-xs text-white"
                      style={{ backgroundColor: tab.color || '#0284c7' }}
                    >
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                          {tab.name}
                        </h4>
                        {isCurrent && (
                          <span className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold">
                            Active
                          </span>
                        )}
                        {tab.periodType && (
                          <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-medium uppercase">
                            {tab.periodType}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400 mt-1">
                        <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                          {tabTransactions.length} {tabTransactions.length === 1 ? 'record' : 'records'}
                        </span>
                        <span>•</span>
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {orgConfig.currencySymbol} {tabTotalMoney.toLocaleString()}
                        </span>
                        {tab.startDate && tab.endDate && (
                          <>
                            <span>•</span>
                            <span className="text-[11px] text-slate-400">
                              {tab.startDate} to {tab.endDate}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200 dark:border-slate-800">
                    {/* Open Sheet */}
                    <button
                      onClick={() => handleOpenSheet(tab.id)}
                      className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                        isCurrent
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span>{isCurrent ? 'Viewing' : 'Open Sheet'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    {/* Download Sheet (Excel) */}
                    <button
                      onClick={() => exportTransactionsToExcel(tabTransactions, categories, orgConfig, `${tab.name}_Ledger`)}
                      className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-emerald-600 hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors shadow-2xs"
                      title="Download Sheet (Excel .xlsx)"
                    >
                      <Download className="w-4 h-4 text-emerald-600" />
                    </button>

                    {/* Print in PDF */}
                    <button
                      onClick={() => printSheetAsPDF(tab.name, tabTransactions, categories, orgConfig)}
                      className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors shadow-2xs"
                      title="Print in PDF"
                    >
                      <Printer className="w-4 h-4 text-blue-600" />
                    </button>

                    {/* Shareable Link */}
                    <button
                      onClick={() => {
                        const shareUrl = `${window.location.origin}/share?sheet=${tab.id}`;
                        navigator.clipboard.writeText(shareUrl);
                        alert(`Shareable link to "${tab.name}" copied!\n(Only this sheet is accessible via this link)`);
                      }}
                      className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors shadow-2xs"
                      title="Copy Shareable Link"
                    >
                      <Share2 className="w-4 h-4 text-indigo-600" />
                    </button>

                    {sheetTabs.length > 1 && (
                      <button
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to delete sheet "${tab.name}"?`)) {
                            deleteSheetTab(tab.id);
                          }
                        }}
                        className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                        title="Delete Sheet"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>{sheetTabs.length} sheet ledgers saved in Neon PostgreSQL</span>
          <button
            onClick={() => setIsHistoryModalOpen(false)}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-100"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
