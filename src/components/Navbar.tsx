'use client';

import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { 
  FileSpreadsheet, 
  LayoutDashboard,
  Plus
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    sheetTabs, 
    activeSheetTabId, 
    setActiveSheetTabId,
    createTemplateSheet,
    orgConfig
  } = useFinance();

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-white/95 dark:bg-slate-900/95 border-b border-slate-200 dark:border-slate-800 shadow-xs transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* BRAND / LOGO (English Only, No Urdu) */}
          <div 
            className="flex items-center gap-3 cursor-pointer group select-none"
            onClick={() => setActiveTab('landing')}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-md bg-emerald-600 text-white font-black group-hover:scale-105 transition-transform flex-shrink-0">
              📊
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight">
                {orgConfig.nameEnglish || 'Financial Record Keeper'}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Institutional Accounts & Spreadsheet System
              </p>
            </div>
          </div>

          {/* NAVBAR CONTROLS: ONLY DASHBOARD BUTTON */}
          <div className="flex items-center gap-2">
            
            {/* Dashboard Button */}
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-xs shrink-0 cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
              title="Open Dashboard"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};

export default Navbar;
