'use client';

import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  ShieldCheck, 
  Wallet, 
  Coins, 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownRight,
  Sparkles,
  Building2
} from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const { 
    transactions, 
    categories, 
    orgConfig, 
    language, 
    totalIncome, 
    totalExpense, 
    netBalance,
    donorsSummary
  } = useFinance();

  const isUrdu = language === 'ur';

  // Category breakdown calculation
  const categoryStats = categories.map(cat => {
    const catTransactions = transactions.filter(t => t.categoryId === cat.id && t.status !== 'cancelled');
    const totalAmount = catTransactions.reduce((sum, t) => sum + t.amount, 0);
    const count = catTransactions.length;
    const percentage = totalIncome > 0 ? ((totalAmount / totalIncome) * 100).toFixed(1) : '0';

    return {
      ...cat,
      totalAmount,
      count,
      percentage: Number(percentage),
    };
  }).sort((a, b) => b.totalAmount - a.totalAmount);

  // Payment Mode breakdown
  const paymentModeStats = ['Online', 'Cash', 'Cheque', 'DD'].map(mode => {
    const modeTransactions = transactions.filter(t => t.paymentMode === mode && t.status !== 'cancelled');
    const total = modeTransactions.reduce((sum, t) => sum + t.amount, 0);
    const count = modeTransactions.length;
    return {
      mode,
      total,
      count,
      percentage: totalIncome + totalExpense > 0 ? (((total) / (totalIncome + totalExpense)) * 100).toFixed(1) : '0',
    };
  });

  // Zakat Pool vs General Pool
  const zakatPool = transactions
    .filter(t => (t.categoryId === 'zakat' || t.categoryId === 'fitrana') && t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const nonZakatPool = totalIncome - zakatPool;

  return (
    <div className="space-y-8">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-800/80 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-purple-500" />
            <span>{isUrdu ? 'مالیاتی تجزیات و فنڈز رپورٹ (Analytics)' : 'Financial Analytics & Fund Reports'}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-nastaliq mt-1">
            {isUrdu ? 'شعبہ وار فنڈز، زکوٰۃ و صدقات کا توازن اور تفصیلی شماریات' : 'Detailed fund distribution, Shariah compliance pools, and collection channels.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3.5 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-800 dark:text-purple-300 text-xs font-bold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-purple-500" />
            <span>{isUrdu ? 'آڈٹ ریڈی رپورٹ' : 'Audit Ready'}</span>
          </div>
        </div>
      </div>

      {/* TOP SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        
        {/* Total Income */}
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 text-white p-5 sm:p-6 rounded-3xl shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-15">
            <ArrowUpRight className="w-20 h-20 sm:w-24 sm:h-24" />
          </div>
          <div className="relative z-10 space-y-2">
            <span className="text-xs font-bold text-emerald-100 uppercase tracking-wider">
              Total Inflow (Collections)
            </span>
            <div className="text-2xl sm:text-3xl font-mono font-black">
              {orgConfig.currencySymbol} {totalIncome.toLocaleString()}
            </div>
            <div className="text-xs text-emerald-100/90 pt-1">
              {transactions.filter(t => t.type === 'income').length} Total Inward Receipts
            </div>
          </div>
        </div>

        {/* Total Expense */}
        <div className="bg-gradient-to-br from-rose-500 to-rose-700 text-white p-5 sm:p-6 rounded-3xl shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-15">
            <ArrowDownRight className="w-20 h-20 sm:w-24 sm:h-24" />
          </div>
          <div className="relative z-10 space-y-2">
            <span className="text-xs font-bold text-rose-100 uppercase tracking-wider">
              Total Outflow (Expenditures)
            </span>
            <div className="text-2xl sm:text-3xl font-mono font-black">
              {orgConfig.currencySymbol} {totalExpense.toLocaleString()}
            </div>
            <div className="text-xs text-rose-100/90 pt-1">
              Staff Salaries, Maintenance & Operations
            </div>
          </div>
        </div>

        {/* Net Surplus */}
        <div className="bg-gradient-to-br from-amber-500 to-amber-700 text-white p-5 sm:p-6 rounded-3xl shadow-lg relative overflow-hidden sm:col-span-2 lg:col-span-1">
          <div className="absolute top-0 right-0 p-4 opacity-15">
            <Wallet className="w-20 h-20 sm:w-24 sm:h-24" />
          </div>
          <div className="relative z-10 space-y-2">
            <span className="text-xs font-bold text-amber-100 uppercase tracking-wider">
              Net Liquid Reserves
            </span>
            <div className="text-2xl sm:text-3xl font-mono font-black">
              {orgConfig.currencySymbol} {netBalance.toLocaleString()}
            </div>
            <div className="text-xs text-amber-100/90 pt-1">
              Current Liquid Available Balance
            </div>
          </div>
        </div>

      </div>

      {/* SHARIAH POOLS: ZAKAT VS GENERAL ALLOCATION */}
      <div className="bg-white dark:bg-slate-800/80 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            <span>{isUrdu ? 'شرعی فنڈز کی علیحدگی (Zakat vs Non-Zakat Pools)' : 'Shariah Fund Segregation'}</span>
          </h3>
          <span className="text-xs text-slate-500 font-nastaliq">
            {isUrdu ? 'زکوٰۃ و عام فنڈز کی علیحدہ ٹریکنگ' : 'Strict Segregation Compliance'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          
          {/* Zakat & Fitrana Pool */}
          <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-800 dark:text-emerald-300">
              <span className="font-nastaliq text-sm">{isUrdu ? 'زکوٰۃ و فطرانہ فنڈ (مخصوص مصرف)' : 'Zakat & Fitrana Pool'}</span>
              <span className="font-mono">{totalIncome > 0 ? ((zakatPool / totalIncome) * 100).toFixed(1) : 0}%</span>
            </div>
            <div className="text-2xl font-mono font-black text-emerald-700 dark:text-emerald-400">
              {orgConfig.currencySymbol} {zakatPool.toLocaleString()}
            </div>
            <div className="w-full bg-emerald-200 dark:bg-emerald-900 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-600 h-full rounded-full transition-all duration-500" 
                style={{ width: `${totalIncome > 0 ? (zakatPool / totalIncome) * 100 : 0}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500 font-nastaliq">
              {isUrdu ? 'مستحق طلباء کی کفالت اور شرعی مصارف کے لیے مختص' : 'Dedicated exclusively for eligible students and Shariah welfare.'}
            </p>
          </div>

          {/* General & Sadaqat Pool */}
          <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-800/60 bg-amber-50/50 dark:bg-amber-950/20 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-amber-800 dark:text-amber-300">
              <span className="font-nastaliq text-sm">{isUrdu ? 'صدقات، ممبرشپ و عمومی فنڈ' : 'Sadaqat, Membership & General Pool'}</span>
              <span className="font-mono">{totalIncome > 0 ? ((nonZakatPool / totalIncome) * 100).toFixed(1) : 0}%</span>
            </div>
            <div className="text-2xl font-mono font-black text-amber-700 dark:text-amber-400">
              {orgConfig.currencySymbol} {nonZakatPool.toLocaleString()}
            </div>
            <div className="w-full bg-amber-200 dark:bg-amber-900 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-amber-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${totalIncome > 0 ? (nonZakatPool / totalIncome) * 100 : 0}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500 font-nastaliq">
              {isUrdu ? 'تعمیرات، تنخواہیں، بلات اور عمومی مصارف کے لیے استعمال پذیر' : 'Available for construction, operational salaries, utilities, and general maintenance.'}
            </p>
          </div>

        </div>
      </div>

      {/* CATEGORY-WISE BREAKDOWN TABLE */}
      <div className="bg-white dark:bg-slate-800/80 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Coins className="w-5 h-5 text-amber-500" />
          <span>{isUrdu ? 'شعبہ جات وار فنڈز کی تفصیل' : 'Fund Category Distribution'}</span>
        </h3>

        <div className="space-y-4 pt-2">
          {categoryStats.map((item) => (
            <div key={item.id} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }} 
                  />
                  <span className="font-bold text-slate-800 dark:text-slate-200 font-nastaliq">
                    {isUrdu ? item.nameUrdu : item.nameEnglish}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    ({item.count} {isUrdu ? 'رسیدیں' : 'receipts'})
                  </span>
                </div>

                <div className="flex items-center gap-3 font-mono font-bold">
                  <span className="text-slate-900 dark:text-white">
                    {orgConfig.currencySymbol} {item.totalAmount.toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-400 w-12 text-right">
                    {item.percentage}%
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-500"
                  style={{ 
                    backgroundColor: item.color, 
                    width: `${Math.min(item.percentage, 100)}%` 
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PAYMENT METHOD CHANNELS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {paymentModeStats.map((mode) => (
          <div 
            key={mode.mode}
            className="bg-white dark:bg-slate-800/80 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                {mode.mode === 'Online' ? (isUrdu ? 'آن لائن اکاؤنٹ' : 'Online Transfer') :
                 mode.mode === 'Cash' ? (isUrdu ? 'نقد (Cash)' : 'Cash') :
                 mode.mode === 'Cheque' ? (isUrdu ? 'بینک چیک' : 'Cheque') : 'ڈیمانڈ ڈرافٹ'}
              </span>
              <CreditCard className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-xl font-mono font-black text-slate-900 dark:text-white">
              {orgConfig.currencySymbol} {mode.total.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              {mode.count} transactions ({mode.percentage}%)
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
