'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { FinanceProvider, useFinance } from '@/context/FinanceContext';
import { FinancialSheets } from '@/components/FinancialSheets';
import { FileSpreadsheet, Lock } from 'lucide-react';

function StandaloneShareContent() {
  const searchParams = useSearchParams();
  const sheetParam = searchParams.get('sheet') || 'sheet1';
  const { setActiveSheetTabId } = useFinance();

  React.useEffect(() => {
    if (sheetParam) {
      setActiveSheetTabId(sheetParam);
    }
  }, [sheetParam, setActiveSheetTabId]);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 p-2 sm:p-4 md:p-6">
      {/* Top Banner indicating Restricted / Shared Sheet Only */}
      <div className="max-w-[1920px] mx-auto mb-3 flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
            <FileSpreadsheet className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
              Shared Financial Spreadsheet
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Direct access mode &bull; Only this sheet is shared
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 bg-slate-50 dark:bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
          <Lock className="w-3.5 h-3.5 text-amber-500" />
          <span>Restricted to Sheet View</span>
        </div>
      </div>

      <div className="max-w-[1920px] mx-auto">
        <FinancialSheets isStandaloneShareView={true} />
      </div>
    </div>
  );
}

export default function SharePage() {
  return (
    <FinanceProvider>
      <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading shared sheet...</div>}>
        <StandaloneShareContent />
      </Suspense>
    </FinanceProvider>
  );
}
