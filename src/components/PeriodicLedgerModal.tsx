'use client';

import React, { useState } from 'react';
import { useFinance, PeriodicLedgerParams } from '../context/FinanceContext';
import { 
  Calendar, 
  Clock, 
  FileSpreadsheet, 
  PlusCircle, 
  Sparkles, 
  X, 
  CheckCircle2, 
  Wallet, 
  Layers,
  ArrowRight,
  BookmarkCheck,
  ShieldCheck,
  Building,
  Coins
} from 'lucide-react';

export const PeriodicLedgerModal: React.FC = () => {
  const { 
    isPeriodicModalOpen, 
    setIsPeriodicModalOpen, 
    createRawBlankSheet, 
    createPeriodicLedger, 
    categories, 
    language,
    setActiveTab
  } = useFinance();

  const isUrdu = language === 'ur';

  // Mode: 'periodic' | 'raw'
  const [activeMode, setActiveMode] = useState<'periodic' | 'raw'>('periodic');

  // Periodic settings
  const [frequency, setFrequency] = useState<'monthly' | 'weekly' | 'annual' | 'custom'>('monthly');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [ledgerPurpose, setLedgerPurpose] = useState<string>('all');
  const [openingBalance, setOpeningBalance] = useState<string>('');
  const [customTitle, setCustomTitle] = useState<string>('');

  if (!isPeriodicModalOpen) return null;

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const monthNamesUrdu = [
    'جنوری', 'فروری', 'مارچ', 'اپریل', 'مئی', 'جون',
    'جولائی', 'اگست', 'ستمبر', 'اکتوبر', 'نومبر', 'دسمبر'
  ];

  const handleCreateRaw = () => {
    createRawBlankSheet();
    setActiveTab('sheets');
    setIsPeriodicModalOpen(false);
  };

  const handleCreatePeriodic = () => {
    let name = '';
    let start = startDate;
    let end = endDate;

    if (frequency === 'monthly') {
      const monthStr = monthNames[selectedMonth];
      const monthNum = String(selectedMonth + 1).padStart(2, '0');
      name = `${monthStr} ${selectedYear} Ledger`;
      start = `${selectedYear}-${monthNum}-01`;
      // calculate last day of month
      const lastDay = new Date(selectedYear, selectedMonth + 1, 0).getDate();
      end = `${selectedYear}-${monthNum}-${String(lastDay).padStart(2, '0')}`;
    } else if (frequency === 'weekly') {
      name = `Week ${selectedWeek} (${monthNames[selectedMonth]} ${selectedYear})`;
      // Approximate start date based on week
      const dayStart = Math.min((selectedWeek - 1) * 7 + 1, 28);
      const dayEnd = Math.min(dayStart + 6, 28);
      const monthNum = String(selectedMonth + 1).padStart(2, '0');
      start = `${selectedYear}-${monthNum}-${String(dayStart).padStart(2, '0')}`;
      end = `${selectedYear}-${monthNum}-${String(dayEnd).padStart(2, '0')}`;
    } else if (frequency === 'annual') {
      name = `Fiscal Year ${selectedYear} Ledger`;
      start = `${selectedYear}-01-01`;
      end = `${selectedYear}-12-31`;
    } else {
      name = customTitle || 'Custom Period Ledger';
    }

    if (customTitle.trim()) {
      name = customTitle.trim();
    }

    const categoryFilter = ledgerPurpose !== 'all' && ledgerPurpose !== 'expense' ? ledgerPurpose : undefined;
    const typeFilter = ledgerPurpose === 'expense' ? 'expense' : 'all';

    const params: PeriodicLedgerParams = {
      frequency,
      periodName: name,
      categoryFilter,
      typeFilter,
      startDate: start,
      endDate: end,
      openingBalance: parseFloat(openingBalance) || 0,
    };

    createPeriodicLedger(params);
    setIsPeriodicModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-linear-to-r from-slate-900 via-slate-800 to-indigo-950 text-white relative">
          <button
            onClick={() => setIsPeriodicModalOpen(false)}
            className="absolute top-5 right-5 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-500/20 rounded-2xl border border-indigo-400/30">
              <Calendar className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold tracking-tight">
                {isUrdu ? 'نیا کھاتہ و شیٹ بنائیں (Create Record Sheet)' : 'Create Record Sheet / Periodic Ledger'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 font-normal mt-0.5">
                {isUrdu ? 'ماہانہ یا ہفتہ وار ریکارڈ کیپنگ یا بالکل نیا سادہ کھاتہ منتخب کریں' : 'Choose a structured periodic template (Monthly/Weekly) or open a raw blank sheet.'}
              </p>
            </div>
          </div>

          {/* Mode Selector Tabs */}
          <div className="flex p-1 bg-black/30 rounded-xl mt-5 max-w-md border border-white/10">
            <button
              onClick={() => setActiveMode('periodic')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                activeMode === 'periodic'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>{isUrdu ? 'ماہانہ / ہفتہ وار ریکارڈ' : 'Periodic Ledger (Month/Week)'}</span>
            </button>
            <button
              onClick={() => setActiveMode('raw')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                activeMode === 'raw'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>{isUrdu ? 'خالی سادہ شیٹ (Raw)' : 'Raw Blank Sheet'}</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {activeMode === 'raw' ? (
            <div className="space-y-4 py-2">
              <div className="p-5 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-center">
                <FileSpreadsheet className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  {isUrdu ? 'مکمل طور پر خالی سادہ شیٹ' : 'Completely Raw Blank Sheet'}
                </h4>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
                  {isUrdu 
                    ? 'کوئی پیشگی فلٹر یا پابندی نہیں۔ اپنی مرضی کے مطابق ریکارڈ درج کریں اور نئے کالمز و فارمولے استعمال کریں۔'
                    : 'Starts clean with Sheet 1. No presets, no constraints. Perfect for custom bookkeeping and free-form entries.'}
                </p>
                <div className="mt-5 flex justify-center">
                  <button
                    onClick={handleCreateRaw}
                    className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white text-white font-bold text-sm flex items-center gap-2 shadow-lg transition-all"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>{isUrdu ? 'خالی شیٹ کھولیں' : 'Open Raw Blank Sheet'}</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              
              {/* Step 1: Cadence / Frequency */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 block">
                  {isUrdu ? '1. مدت اور دورانیہ منتخب کریں (Select Frequency)' : '1. Select Record Cadence'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { id: 'monthly', title: 'Monthly', titleUr: 'ماہانہ', icon: Calendar, desc: 'Month by Month' },
                    { id: 'weekly', title: 'Weekly', titleUr: 'ہفتہ وار', icon: Clock, desc: 'Week 1, 2, 3...' },
                    { id: 'annual', title: 'Annual', titleUr: 'سالانہ', icon: BookmarkCheck, desc: 'Full Fiscal Year' },
                    { id: 'custom', title: 'Custom', titleUr: 'کسٹم', icon: Layers, desc: 'Date Range' },
                  ].map(item => (
                    <button
                      key={item.id}
                      onClick={() => setFrequency(item.id as any)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        frequency === item.id
                          ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200 ring-2 ring-indigo-500/20'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                      }`}
                    >
                      <item.icon className={`w-4 h-4 mb-1.5 ${frequency === item.id ? 'text-indigo-600' : 'text-slate-400'}`} />
                      <div className="font-bold text-xs sm:text-sm">{isUrdu ? item.titleUr : item.title}</div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500">{item.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Time Details */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-3">
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {frequency === 'monthly' && (isUrdu ? 'ماہ اور سال کا انتخاب' : 'Select Month & Year')}
                  {frequency === 'weekly' && (isUrdu ? 'ہفتہ اور ماہ کا انتخاب' : 'Select Week & Month')}
                  {frequency === 'annual' && (isUrdu ? 'مالی سال کا انتخاب' : 'Select Fiscal Year')}
                  {frequency === 'custom' && (isUrdu ? 'تاریخ کی حد' : 'Select Date Range')}
                </div>

                {frequency === 'monthly' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-slate-500 mb-1 block">Month</label>
                      <select
                        value={selectedMonth}
                        onChange={e => setSelectedMonth(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:ring-2 focus:ring-indigo-500"
                      >
                        {monthNames.map((name, idx) => (
                          <option key={name} value={idx}>
                            {name} ({monthNamesUrdu[idx]})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-500 mb-1 block">Year</label>
                      <select
                        value={selectedYear}
                        onChange={e => setSelectedYear(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:ring-2 focus:ring-indigo-500"
                      >
                        {[2024, 2025, 2026, 2027, 2028].map(yr => (
                          <option key={yr} value={yr}>{yr}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {frequency === 'weekly' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] text-slate-500 mb-1 block">Week Number</label>
                      <select
                        value={selectedWeek}
                        onChange={e => setSelectedWeek(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value={1}>Week 1 (Days 1 - 7)</option>
                        <option value={2}>Week 2 (Days 8 - 14)</option>
                        <option value={3}>Week 3 (Days 15 - 21)</option>
                        <option value={4}>Week 4 (Days 22 - End)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-500 mb-1 block">Month</label>
                      <select
                        value={selectedMonth}
                        onChange={e => setSelectedMonth(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:ring-2 focus:ring-indigo-500"
                      >
                        {monthNames.map((name, idx) => (
                          <option key={name} value={idx}>{name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-500 mb-1 block">Year</label>
                      <select
                        value={selectedYear}
                        onChange={e => setSelectedYear(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:ring-2 focus:ring-indigo-500"
                      >
                        {[2024, 2025, 2026, 2027].map(yr => (
                          <option key={yr} value={yr}>{yr}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {frequency === 'custom' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-slate-500 mb-1 block">Start Date</label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={e => setStartDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-500 mb-1 block">End Date</label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={e => setEndDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Step 3: Account Purpose */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 block">
                  {isUrdu ? '2. کھاتہ کی نوعیت / مقصد (Account Purpose)' : '2. Record / Account Purpose'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    { id: 'all', title: 'Master Cashbook & Ledger', titleUr: 'مرکزی کیش بک و تمام کھاتہ', desc: 'All Incomes & Outflows' },
                    { id: 'zakat', title: 'Zakat & Fitrana Fund', titleUr: 'زکوٰۃ و فطرانہ فنڈ (شرعی)', desc: 'Strict Shariah segregation' },
                    { id: 'membership', title: 'Monthly Membership Dues', titleUr: 'ماہانہ ممبرشپ و چندہ', desc: 'Recurring member dues' },
                    { id: 'construction', title: 'Masjid & Construction', titleUr: 'تعمیراتی فنڈ برائے مسجد', desc: 'Building works & materials' },
                    { id: 'madrasa', title: 'Madrasa & Student Welfare', titleUr: 'مدرسہ و طلباء فنڈ', desc: 'Books, stipends & food' },
                    { id: 'expense', title: 'Operational Expenses & Bills', titleUr: 'اخراجات و بلات', desc: 'Salaries, electricity & maintenance' },
                  ].map(p => (
                    <button
                      key={p.id}
                      onClick={() => setLedgerPurpose(p.id)}
                      className={`p-3 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
                        ledgerPurpose === p.id
                          ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/30 ring-2 ring-indigo-500/20'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center ${ledgerPurpose === p.id ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'}`}>
                        {ledgerPurpose === p.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <div>
                        <div className="font-semibold text-xs text-slate-900 dark:text-white">
                          {isUrdu ? p.titleUr : p.title}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{p.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 4: Optional Opening Balance & Custom Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                    {isUrdu ? 'ابتدائی بیلنس (Opening Balance)' : 'Opening Balance (Optional)'}
                  </label>
                  <div className="relative">
                    <Wallet className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="number"
                      placeholder="e.g. 50000"
                      value={openingBalance}
                      onChange={e => setOpeningBalance(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                    {isUrdu ? 'شیٹ کا کسٹم نام (Optional Custom Name)' : 'Custom Sheet Name (Optional)'}
                  </label>
                  <input
                    type="text"
                    placeholder={frequency === 'monthly' ? `${monthNames[selectedMonth]} ${selectedYear}` : 'e.g. Cashbook Oct 2026'}
                    value={customTitle}
                    onChange={e => setCustomTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <button
            onClick={() => setIsPeriodicModalOpen(false)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            {isUrdu ? 'منسوخ کریں' : 'Cancel'}
          </button>

          {activeMode === 'periodic' ? (
            <button
              onClick={handleCreatePeriodic}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all"
            >
              <span>{isUrdu ? 'کھاتہ تیار کریں اور شروع کریں' : 'Create Ledger & Open Sheet'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleCreateRaw}
              className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-all"
            >
              <span>{isUrdu ? 'خالی شیٹ بنائیں' : 'Create Raw Sheet'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
