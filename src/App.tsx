'use client';

import React from 'react';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { AuthProvider, useAuth } from './context/AuthContext';
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
import { AuthModal } from './components/AuthModal';
import { DashboardAuthGate } from './components/DashboardAuthGate';

interface AppProps {
  initialTab?: 'dashboard' | 'landing' | 'sheets' | 'receipt' | 'analytics' | 'donors';
  isDashboardRoute?: boolean;
  targetSheetId?: string;
}

const AppContent: React.FC<AppProps> = ({ initialTab, isDashboardRoute = false, targetSheetId }) => {
  const { activeTab, setActiveTab, activeSheetTabId, setActiveSheetTabId, orgConfig } = useFinance();
  const { isAuthenticated } = useAuth();

  React.useEffect(() => {
    if (initialTab && initialTab !== activeTab) {
      setActiveTab(initialTab);
    }
    if (targetSheetId && targetSheetId !== activeSheetTabId) {
      setActiveSheetTabId(targetSheetId);
    }
  }, [initialTab, targetSheetId, activeTab, activeSheetTabId, setActiveTab, setActiveSheetTabId]);

  // Is this view protected by authentication?
  const isProtectedTab = isDashboardRoute || activeTab === 'dashboard' || activeTab === 'sheets' || activeTab === 'receipt' || activeTab === 'analytics' || activeTab === 'donors';
  const shouldShowAuthGate = isProtectedTab && !isAuthenticated && activeTab !== 'landing';

  return (
    <div className="min-h-screen flex flex-col bg-[#fdfaf3] text-slate-900 transition-colors duration-200">
      
      {/* Top Navbar: Always accessible */}
      <Navbar />

      {/* Main Content Area: Responsive spacing with pt-20 to clear fixed navbar */}
      <main className={`flex-1 w-full mx-auto ${
        activeTab === 'sheets' && isAuthenticated
          ? 'max-w-[99%] px-1 sm:px-3 pt-20 sm:pt-24 pb-8' 
          : 'max-w-7xl px-3 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-8'
      }`}>
        {shouldShowAuthGate ? (
          <DashboardAuthGate />
        ) : (
          <>
            {activeTab === 'landing' && <LandingPage />}
            {activeTab === 'sheets' && <FinancialSheets />}
            {activeTab === 'dashboard' && <DashboardView />}
            {activeTab === 'receipt' && <ReceiptStudio />}
            {activeTab === 'analytics' && <AnalyticsView />}
            {activeTab === 'donors' && <DonorDirectory />}
          </>
        )}
      </main>

      {/* Global Modals */}
      <AuthModal />
      <SettingsModal />
      <PeriodicLedgerModal />
      <SheetHistoryModal />

      {/* Bottom Bar / Footer */}
      {(activeTab === 'landing' || (!isAuthenticated && isProtectedTab)) && (
        <footer className="border-t border-amber-300/40 bg-[#f9f5ec] py-4 sm:py-5 text-xs text-emerald-950/70 no-print transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div className="flex items-center gap-2">
              <span className="font-bold text-emerald-950">
                {orgConfig.nameEnglish || 'Markaz Rooh ul Islam'}
              </span>
              <span>—</span>
              <span className="text-emerald-800 font-medium">Fund and Accounts Management</span>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <span className="text-emerald-900/80">{orgConfig.locationEnglish || 'Institutional Office'}</span>
              <span>•</span>
              <span className="font-arabic font-bold text-amber-700 text-sm">مرکز روح الاسلام</span>
            </div>
          </div>
        </footer>
      )}

    </div>
  );
};

export function App({ initialTab, isDashboardRoute, targetSheetId }: AppProps = {}) {
  return (
    <AuthProvider>
      <FinanceProvider>
        <AppContent initialTab={initialTab} isDashboardRoute={isDashboardRoute} targetSheetId={targetSheetId} />
      </FinanceProvider>
    </AuthProvider>
  );
}

export default App;
