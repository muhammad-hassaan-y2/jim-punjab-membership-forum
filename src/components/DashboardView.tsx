'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import { 
  Coins, 
  FileSpreadsheet, 
  Plus, 
  ExternalLink, 
  Share2, 
  Check, 
  ArrowUpRight, 
  Target, 
  Database,
  X,
  CheckCircle2
} from 'lucide-react';

const PUNJAB_DISTRICTS = [
  'Lahore', 'Faisalabad', 'Rawalpindi', 'Multan', 'Gujranwala', 
  'Sialkot', 'Sargodha', 'Bahawalpur', 'Gujarat', 'Sahiwal',
  'Sheikhupura', 'Jhang', 'Kasur', 'Rahim Yar Khan', 'Okara', 'Dera Ghazi Khan'
];

export const DashboardView: React.FC = () => {
  const { 
    sheetTabs, 
    activeSheetTabId, 
    setActiveSheetTabId, 
    batchCreateAndSaveSheets,
    setActiveTab,
    transactions,
    totalIncome,
    targetToCollect,
    setTargetToCollect,
    totalPledgedTarget,
    totalPaidCount,
    monthlyPledgedSum,
    quarterlyPledgedSum,
    annuallyPledgedSum,
    orgConfig
  } = useFinance();

  const [copiedSheetId, setCopiedSheetId] = useState<string | null>(null);
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [tempTarget, setTempTarget] = useState(targetToCollect.toString());
  const [dbSuccessToast, setDbSuccessToast] = useState<string | null>(null);

  // Sheet Project Dialog state
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);
  const [projectSheetCount, setProjectSheetCount] = useState(5);
  const [projectName, setProjectName] = useState('JIM Punjab Membership Campaign 2026');
  const [sheetNames, setSheetNames] = useState<string[]>([
    'Lahore', 'Faisalabad', 'Rawalpindi', 'Multan', 'Gujranwala'
  ]);
  const [isCreatingProject, setIsCreatingProject] = useState(false);

  // Prevent background scrolling and enable Escape key to close
  useEffect(() => {
    if (isCreateProjectModalOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setIsCreateProjectModalOpen(false);
        }
      };
      window.addEventListener('keydown', handleKeyDown);

      return () => {
        document.body.style.overflow = originalOverflow;
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isCreateProjectModalOpen]);

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

  const handleUpdateSheetCount = (count: number) => {
    setProjectSheetCount(count);
    setSheetNames(prev => {
      const next = [...prev];
      while (next.length < count) {
        const i = next.length;
        next.push(PUNJAB_DISTRICTS[i] || `Sheet ${i + 1}`);
      }
      return next;
    });
  };

  const handleResetToDistricts = () => {
    const next = Array.from({ length: projectSheetCount }).map((_, i) => PUNJAB_DISTRICTS[i] || `Sheet ${i + 1}`);
    setSheetNames(next);
  };

  const handleSheetNameChange = (index: number, val: string) => {
    setSheetNames(prev => {
      const copy = [...prev];
      copy[index] = val;
      return copy;
    });
  };

  const handleCreateSheetProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingProject(true);
    try {
      const validNames = sheetNames.slice(0, projectSheetCount).map((name, i) => name?.trim() || `Sheet ${i + 1}`);
      const createdTabs = await batchCreateAndSaveSheets(
        projectSheetCount,
        validNames,
        'template',
        projectName.trim() || 'JIM Punjab Membership Campaign'
      );
      setIsCreateProjectModalOpen(false);
      setDbSuccessToast(`Created ${createdTabs.length} sheets for "${projectName}" and saved directly to Neon DB!`);
      setTimeout(() => setDbSuccessToast(null), 4000);
      if (createdTabs.length > 0 && typeof window !== 'undefined') {
        window.location.href = `/dashboard/sheets/${createdTabs[0].id}`;
      }
    } catch (err: any) {
      alert('Error creating sheet project: ' + (err?.message || 'Unknown error'));
    } finally {
      setIsCreatingProject(false);
    }
  };

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
          3. JIM PUNJAB SHEETS PROJECT
          Clean project manager: Create 5-10 sheets with standard Shariah format
          ==================================================================== */}
      <section className="bg-white rounded-3xl border border-amber-300/70 p-5 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-700" />
              <h2 className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-wide">
                JIM Punjab Sheets Project • ممبر شپ شیٹس پروجیکٹ
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Official 26-column accounting spreadsheets backed by Neon PostgreSQL cloud database
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsCreateProjectModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-900 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all hover:scale-105 active:scale-95 border border-amber-400/80 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-amber-300" />
              <span>+ Create Sheet Project</span>
            </button>

            <button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.location.href = `/dashboard/sheets/${activeSheetTabId || (sheetTabs[0]?.id ?? 'sheet1')}`;
                } else {
                  setActiveTab('sheets');
                }
              }}
              className="px-4 py-2 rounded-xl bg-[#fdfaf3] hover:bg-amber-50 text-emerald-950 font-bold text-xs flex items-center gap-1.5 border border-amber-300/80 cursor-pointer transition-colors shadow-2xs"
            >
              <ExternalLink className="w-3.5 h-3.5 text-emerald-700" />
              <span>Open Sheets Workspace</span>
            </button>
          </div>
        </div>

        {/* Existing Sheets Overview in Project */}
        <div className="pt-5">
          {sheetTabs.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-2xl bg-[#fdfaf3] border border-dashed border-amber-300">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto mb-3">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">No Sheets Created Yet</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
                Initialize your project by creating 5 to 10 sheets with the official 26-column accounting layout.
              </p>
              <button
                onClick={() => setIsCreateProjectModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs inline-flex items-center gap-2 shadow-md cursor-pointer border border-amber-400"
              >
                <Plus className="w-4 h-4 text-amber-300" />
                <span>Create Sheet Project (5-10 Sheets)</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold text-slate-700">
                  {sheetTabs.length} Active Working {sheetTabs.length === 1 ? 'Sheet' : 'Sheets'} in Project
                </span>
                <span className="text-[11px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                  ✓ Standard 26-Column Shariah Accounting Format
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {sheetTabs.map((sheet, index) => {
                  const sheetNumber = index + 1;
                  const isCurrentlyActive = activeSheetTabId === sheet.id;

                  return (
                    <div 
                      key={sheet.id}
                      className="p-4 rounded-2xl bg-[#fdfaf3] border border-amber-200/90 hover:border-amber-400 transition-all flex flex-col justify-between shadow-2xs hover:shadow-sm"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                            {sheetNumber}
                          </div>
                          {isCurrentlyActive && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                              Active
                            </span>
                          )}
                        </div>

                        <h3 className="font-black text-slate-900 text-sm truncate">
                          {sheet.name || `Sheet ${sheetNumber}`}
                        </h3>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                          {sheet.cityName && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                              📍 {sheet.cityName}
                            </span>
                          )}
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-900 border border-emerald-200">
                            26 Cols (A-Z)
                          </span>
                        </div>
                      </div>

                      <div className="mt-3.5 pt-2.5 border-t border-amber-200/60 flex items-center justify-between gap-2">
                        <button
                          onClick={() => handleOpenSheet(sheet.id)}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-emerald-950 font-bold text-xs shadow-2xs transition-colors cursor-pointer"
                        >
                          <span>Open Sheet</span>
                          <ExternalLink className="w-3.5 h-3.5 text-emerald-700" />
                        </button>

                        <button
                          onClick={() => handleCopyShareLink(sheet.id)}
                          className="p-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-600 hover:text-emerald-700 transition-colors cursor-pointer"
                          title="Copy direct shareable link"
                        >
                          {copiedSheetId === sheet.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Share2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ====================================================================
          CREATE SHEET PROJECT - FULL SCREEN DEDICATED WORKSPACE
          - 100% full screen (fixed inset-0 w-screen h-screen)
          - Zero gap on top, zero gap on sides
          - Clean scrollable content area
          - Full keyboard ESC support & Close button
          ==================================================================== */}
      {isCreateProjectModalOpen && (
        <div 
          className="fixed inset-0 z-[100] w-screen h-screen bg-[#fdfaf3] flex flex-col overflow-hidden animate-in fade-in duration-200"
        >
          {/* Top Bar - Full Width, zero gap at top */}
          <header className="w-full bg-gradient-to-r from-emerald-950 via-[#022c22] to-slate-950 text-white px-4 sm:px-8 py-3.5 sm:py-4 border-b-2 border-amber-400 shadow-xl flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full p-0.5 bg-gradient-to-br from-emerald-800 via-emerald-950 to-[#011c15] border-2 border-amber-400 shadow-md flex items-center justify-center shrink-0">
                <img src="/logo.png" alt="JIM Punjab" className="w-full h-full object-contain filter drop-shadow-sm" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-arabic text-amber-300 font-bold text-sm sm:text-base">
                    جماعت اصلاح المسلمین پنجاب
                  </span>
                  <span className="text-amber-400/60 text-xs hidden sm:inline">✦</span>
                  <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-300 hidden sm:inline">
                    Sheet Project Creator
                  </span>
                </div>
                <h1 className="text-base sm:text-lg font-black text-white leading-tight">
                  Create Sheet Project &bull; ورکنگ شیٹس پروجیکٹ بنائیں
                </h1>
              </div>
            </div>

            <button
              onClick={() => setIsCreateProjectModalOpen(false)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all cursor-pointer hover:scale-105 active:scale-95"
              title="Close and return to Dashboard"
            >
              <X className="w-4 h-4 text-amber-300" />
              <span>Close</span>
            </button>
          </header>

          {/* Main Content Area - Full screen scrollable body */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 sm:py-8">
            <div className="max-w-4xl mx-auto space-y-6">
              
              {/* Info banner */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-amber-300/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm sm:text-base font-black text-slate-900">
                    Institutional Working Sheets Project Setup
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Select how many sheets you need (e.g. 5–10) and customize their names. All sheets will automatically follow the official 26-column Shariah accounting format and sync directly with Neon PostgreSQL DB.
                  </p>
                </div>
                <div className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Neon DB Connected</span>
                </div>
              </div>

              {/* Form Card */}
              <form onSubmit={handleCreateSheetProject} className="bg-white rounded-3xl border border-amber-300/80 p-6 sm:p-8 shadow-sm space-y-6">
                
                {/* 1. Project / Campaign Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    1. Campaign / Project Title
                  </label>
                  <input
                    type="text"
                    required
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="JIM Punjab Membership Campaign 2026"
                    className="w-full px-4 py-2.5 text-sm sm:text-base bg-[#fdfaf3] border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700 font-bold text-slate-900"
                  />
                </div>

                {/* 2. Sheet Count Selector */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      2. How Many Sheets? (Select 5–10)
                    </label>
                    <span className="text-xs text-emerald-800 font-bold">
                      Currently Selected: {projectSheetCount} Sheets
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5">
                    {[3, 5, 8, 10, 12, 15].map((count) => {
                      const isSelected = projectSheetCount === count;
                      return (
                        <button
                          key={count}
                          type="button"
                          onClick={() => handleUpdateSheetCount(count)}
                          className={`p-3 rounded-2xl text-center font-black transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                            isSelected
                              ? 'bg-gradient-to-br from-emerald-800 to-emerald-950 text-white border-2 border-amber-400 shadow-md scale-102 ring-2 ring-amber-400/30'
                              : 'bg-[#fdfaf3] text-slate-700 border border-slate-300 hover:border-amber-400 hover:bg-amber-50/50'
                          }`}
                        >
                          <span className="text-lg font-mono font-black">{count}</span>
                          <span className="text-[11px] font-sans font-bold">Sheets</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-100">
                    <span className="text-xs font-bold text-slate-600">Or custom count (1–30):</span>
                    <input
                      type="number"
                      min={1}
                      max={30}
                      value={projectSheetCount}
                      onChange={(e) => handleUpdateSheetCount(Math.max(1, Math.min(30, parseInt(e.target.value, 10) || 1)))}
                      className="w-20 px-3 py-1.5 text-xs text-center font-bold bg-[#fdfaf3] border border-amber-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
                    />
                    <span className="text-[11px] text-slate-400">sheets total</span>
                  </div>
                </div>

                {/* 3. Sheet Naming Grid */}
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2.5 gap-1.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                        3. Name Each Sheet ({projectSheetCount} Working Sheets)
                      </label>
                      <span className="text-[11px] text-slate-500">
                        Customize names for each division, district, or unit
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleResetToDistricts}
                      className="text-xs font-bold text-emerald-800 hover:text-emerald-900 underline cursor-pointer self-start sm:self-auto"
                    >
                      Reset to Punjab Districts (Lahore, Faisalabad...)
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 p-3 sm:p-4 bg-[#fdfaf3] rounded-2xl border border-amber-200/90 max-h-72 overflow-y-auto">
                    {Array.from({ length: projectSheetCount }).map((_, idx) => (
                      <div key={idx} className="bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-900 font-bold font-mono text-xs flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          value={sheetNames[idx] || ''}
                          onChange={(e) => handleSheetNameChange(idx, e.target.value)}
                          placeholder={`Sheet ${idx + 1}`}
                          className="flex-1 min-w-0 px-2.5 py-1 text-xs font-bold text-slate-800 bg-transparent border-0 focus:outline-none focus:ring-1 focus:ring-emerald-700 rounded"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. Shariah Format Confirmation */}
                <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-950 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-sm">
                      ✓ Standard 26-Column Shariah Accounting Format Guaranteed:
                    </span>
                    <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                      Every sheet in this project will automatically include the full 26-column ledger structure:
                      <strong> Receipt # (A), Date (B), Donor Name (C), Branch Name (D), Zila (E), Phone (F), Monthly Commitment (G), Quarterly (H), Annual (I), 12 Monthly Payment Columns Jan–Dec (J–U), Total Paid (V), Payment Mode (W), Bank Name (X), Status (Y), Notes (Z)</strong>.
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsCreateProjectModalOpen(false)}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isCreatingProject}
                    className="w-full sm:w-auto px-7 py-3 rounded-xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-900 hover:from-emerald-700 hover:to-emerald-800 text-white font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-950/25 border-2 border-amber-400 cursor-pointer disabled:opacity-50 transition-all hover:scale-102 active:scale-98"
                  >
                    {isCreatingProject ? (
                      <span>Saving to Neon Cloud Database...</span>
                    ) : (
                      <>
                        <Database className="w-4 h-4 text-amber-300" />
                        <span>Create Project & Save to DB</span>
                      </>
                    )}
                  </button>
                </div>

              </form>

            </div>
          </div>
        </div>
      )}

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
