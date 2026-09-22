'use client';

import React from 'react';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { LandingPage } from './components/LandingPage';
import { FinancialSheets } from './components/FinancialSheets';
import { ReceiptStudio } from './components/ReceiptStudio';
import { AnalyticsView } from './components/AnalyticsView';
import { DonorDirectory } from './components/DonorDirectory';
import { SettingsModal } from './components/SettingsModal';
import { PeriodicLedgerModal } from './components/PeriodicLedgerModal';
import { SheetHistoryModal } from './components/SheetHistoryModal';

const AppContent: React.FC = () => {
  const { activeTab, language, orgConfig, theme } = useFinance();
  const isUrdu = language === 'ur';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      
      {/* Top Navbar: Hidden on sheet view for maximum workspace like Excel / Google Sheets */}
      {activeTab !== 'sheets' && <Navbar />}

      {/* Main Content Area */}
      <main className={`flex-1 w-full mx-auto ${
        activeTab === 'sheets' 
          ? 'max-w-[99%] px-2 sm:px-3 py-2' 
          : 'max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8'
      }`}>
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'landing' && <LandingPage />}
        {activeTab === 'sheets' && <FinancialSheets />}
        {activeTab === 'receipt' && <ReceiptStudio />}
        {activeTab === 'analytics' && <AnalyticsView />}
        {activeTab === 'donors' && <DonorDirectory />}
      </main>

      {/* Global Modals */}
      <SettingsModal />
      <PeriodicLedgerModal />
      <SheetHistoryModal />

      {/* Footer: Hidden on sheet view */}
      {activeTab !== 'sheets' && (
        <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 py-6 text-xs text-slate-500 dark:text-slate-400 no-print transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-emerald-500 font-bold">📊</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {orgConfig.nameEnglish || 'Financial Record Keeper'}
              </span>
              <span>—</span>
              <span>{orgConfig.locationEnglish || 'Institutional Office'}</span>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <span>Phone: {orgConfig.phone}</span>
              <span>•</span>
              <span className="font-sans">Status: <strong className="text-emerald-600">Active</strong></span>
            </div>
          </div>
        </footer>
      )}

    </div>
  );
};

export const App: React.FC = () => {
  return (
    <FinanceProvider>
      <AppContent />
    </FinanceProvider>
  );
};

export default App;
