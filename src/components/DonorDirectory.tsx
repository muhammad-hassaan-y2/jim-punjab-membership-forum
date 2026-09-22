'use client';

import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Users, Search, PlusCircle, Phone, MapPin, Award, Calendar, Receipt } from 'lucide-react';
import { DonorSummary } from '../types/finance';

export const DonorDirectory: React.FC = () => {
  const { 
    donorsSummary, 
    orgConfig, 
    language, 
    setActiveTab, 
    setActiveReceiptTransaction, 
    transactions,
    categories
  } = useFinance();

  const isUrdu = language === 'ur';
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDonors = donorsSummary.filter(d => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (d.name || '').toLowerCase().includes(q) ||
      (d.nameUrdu || '').includes(q) ||
      (d.phone || '').includes(q) ||
      (d.address || '').toLowerCase().includes(q) ||
      (d.reference || '').toLowerCase().includes(q)
    );
  });

  const handleIssueReceiptForDonor = (donor: DonorSummary) => {
    const existingTx = transactions.find(t => 
      (t.donorNameUrdu && t.donorNameUrdu === donor.nameUrdu) || 
      (t.donorName && t.donorName === donor.name)
    );

    if (existingTx) {
      setActiveReceiptTransaction({
        ...existingTx,
        id: 'new-donor-tx',
        receiptNo: `${orgConfig.receiptPrefix}${orgConfig.receiptCounter}`,
        date: new Date().toISOString().slice(0, 10),
      });
    }
    setActiveTab('receipt');
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-800/80 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-rose-500" />
            <span>{isUrdu ? 'عطیہ دہندگان و معزز ممبران (Donors Directory)' : 'Donors & Members Directory'}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-nastaliq mt-1">
            {isUrdu ? 'جامعہ کے مستقل معاونین اور عطیہ دہندگان کی فہرست اور ہسٹری' : 'Directory of regular contributors, family pledges, and historical records.'}
          </p>
        </div>

        {/* Search */}
        <div className="relative min-w-[280px]">
          <Search className={`w-4 h-4 text-slate-400 absolute top-3.5 ${isUrdu ? 'right-3' : 'left-3'}`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isUrdu ? 'نام، فون یا پتہ تلاش کریں...' : 'Search donor, phone, city...'}
            className={`w-full py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none ${
              isUrdu ? 'pr-9 pl-3 font-nastaliq' : 'pl-9 pr-3'
            }`}
          />
        </div>
      </div>

      {/* DONORS CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDonors.length === 0 ? (
          <div className="col-span-full bg-white dark:bg-slate-800 p-12 rounded-2xl border text-center text-slate-400 font-nastaliq text-base">
            {isUrdu ? 'کوئی عطیہ دہندہ نہیں ملا' : 'No donors matched your search.'}
          </div>
        ) : (
          filteredDonors.map((donor, idx) => (
            <div 
              key={donor.id}
              className="bg-white dark:bg-slate-800/80 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg transition-all space-y-3.5 flex flex-col justify-between"
            >
              <div>
                {/* Top Row: Badge / Serial */}
                <div className="flex items-center justify-between">
                  <span className="w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 flex items-center justify-center text-xs font-bold font-mono">
                    #{idx + 1}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-mono">
                    {donor.totalReceipts} {isUrdu ? 'رسیدیں' : 'receipts'}
                  </span>
                </div>

                {/* Donor Name */}
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-nastaliq mt-2" dir="rtl">
                  {donor.nameUrdu || donor.name}
                </h3>
                {donor.name && donor.nameUrdu && (
                  <p className="text-xs text-slate-400 font-sans">
                    {donor.name}
                  </p>
                )}

                {/* Info Fields */}
                <div className="space-y-1.5 pt-3 text-xs text-slate-600 dark:text-slate-300 font-nastaliq" dir="rtl">
                  {donor.address && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span>{donor.address}</span>
                    </div>
                  )}
                  {donor.phone && (
                    <div className="flex items-center gap-1.5 font-sans" dir="ltr">
                      <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span>{donor.phone}</span>
                    </div>
                  )}
                  {donor.reference && (
                    <div className="text-slate-500">
                      بتوسط: <strong className="text-slate-700 dark:text-slate-200">{donor.reference}</strong>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom: Total Donated & Issue Button */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    {isUrdu ? 'کل تعاون' : 'Total Contributed'}
                  </div>
                  <div className="text-base sm:text-lg font-black font-mono text-emerald-600 dark:text-emerald-400">
                    {orgConfig.currencySymbol} {donor.totalDonated.toLocaleString()}
                  </div>
                </div>

                <button
                  onClick={() => handleIssueReceiptForDonor(donor)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-600 hover:text-white border border-blue-200 dark:border-blue-800 text-xs font-bold transition-colors"
                >
                  <Receipt className="w-3.5 h-3.5" />
                  <span>{isUrdu ? 'نئی رسید' : 'New Receipt'}</span>
                </button>
              </div>

            </div>
          ))
        )}
      </div>

    </div>
  );
};
