'use client';

import React, { useState, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import { 
  Printer, 
  Download, 
  Image as ImageIcon, 
  Save, 
  Sparkles, 
  Palette, 
  RefreshCw, 
  PlusCircle, 
  Check, 
  FileText,
  Building,
  CreditCard,
  UserCheck,
  Receipt
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PrintableVoucher } from './PrintableVoucher';
import { downloadReceiptAsPDF, downloadReceiptAsImage } from '../utils/exportUtils';
import { convertNumberToUrduWords } from '../utils/urduNumberToWords';
import { convertNumberToEnglishWords } from '../utils/englishNumberToWords';
import { Transaction, PaymentMethod, AppTheme } from '../types/finance';

export const ReceiptStudio: React.FC = () => {
  const { 
    theme, 
    setTheme, 
    language, 
    orgConfig, 
    categories, 
    transactions, 
    activeReceiptTransaction, 
    setActiveReceiptTransaction, 
    addTransaction, 
    updateTransaction, 
    generateNextReceiptNumber 
  } = useFinance();

  const isUrdu = language === 'ur';

  const [activeForm, setActiveForm] = useState<Omit<Transaction, 'id' | 'createdAt'>>({
    receiptNo: generateNextReceiptNumber(),
    date: new Date().toISOString().slice(0, 10),
    donorName: '',
    donorNameUrdu: '',
    phone: '',
    address: '',
    reference: '',
    amount: 0,
    amountInWordsUrdu: '',
    amountInWordsEnglish: '',
    categoryId: categories[0]?.id || 'general',
    paymentMode: 'Cash',
    bankName: orgConfig.bankAccounts?.[0]?.bankNameUrdu || orgConfig.bankAccounts?.[0]?.bankName || '',
    chequeOrTxnNo: '',
    type: 'income',
    status: 'verified',
    notes: '',
  });

  const [voucherTheme, setVoucherTheme] = useState<AppTheme>(theme);
  const [isExporting, setIsExporting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync if an active receipt is selected from elsewhere
  useEffect(() => {
    if (activeReceiptTransaction) {
      setActiveForm({
        receiptNo: activeReceiptTransaction.receiptNo,
        date: activeReceiptTransaction.date,
        donorName: activeReceiptTransaction.donorName,
        donorNameUrdu: activeReceiptTransaction.donorNameUrdu || '',
        phone: activeReceiptTransaction.phone || '',
        address: activeReceiptTransaction.address || '',
        reference: activeReceiptTransaction.reference || '',
        amount: activeReceiptTransaction.amount,
        amountInWordsUrdu: activeReceiptTransaction.amountInWordsUrdu || convertNumberToUrduWords(activeReceiptTransaction.amount),
        amountInWordsEnglish: activeReceiptTransaction.amountInWordsEnglish || convertNumberToEnglishWords(activeReceiptTransaction.amount),
        categoryId: activeReceiptTransaction.categoryId,
        paymentMode: activeReceiptTransaction.paymentMode,
        bankName: activeReceiptTransaction.bankName || '',
        chequeOrTxnNo: activeReceiptTransaction.chequeOrTxnNo || '',
        type: activeReceiptTransaction.type,
        status: activeReceiptTransaction.status,
        notes: activeReceiptTransaction.notes || '',
      });
    }
  }, [activeReceiptTransaction]);

  // Handle amount change with auto-number to words conversion
  const handleAmountChange = (val: string) => {
    const num = parseFloat(val) || 0;
    const urduWords = convertNumberToUrduWords(num);
    const englishWords = convertNumberToEnglishWords(num);

    setActiveForm(prev => ({
      ...prev,
      amount: num,
      amountInWordsUrdu: urduWords,
      amountInWordsEnglish: englishWords,
    }));
  };

  // Construct temporary transaction for live preview
  const previewTransaction: Transaction = {
    ...activeForm,
    id: activeReceiptTransaction?.id || 'preview-tx',
    createdAt: new Date().toISOString(),
  };

  // Save or Update
  const handleSaveVoucher = async () => {
    if (activeForm.amount <= 0) {
      alert(isUrdu ? 'براہ کرم درست رقم درج کریں' : 'Please enter a valid amount');
      return;
    }

    if (activeReceiptTransaction && activeReceiptTransaction.id !== 'preview-tx') {
      updateTransaction(activeReceiptTransaction.id, activeForm);
    } else {
      const newTx = await addTransaction(activeForm);
      setActiveReceiptTransaction(newTx);
    }

    // Trigger confetti
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.7 }
      });
    } catch (e) {
      console.log(e);
    }

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Reset to brand new receipt
  const handleNewReceipt = () => {
    const nextReceiptNo = generateNextReceiptNumber();
    setActiveReceiptTransaction(null);
    setActiveForm({
      receiptNo: nextReceiptNo,
      date: new Date().toISOString().slice(0, 10),
      donorName: '',
      donorNameUrdu: '',
      phone: '',
      address: '',
      reference: '',
      amount: 1000,
      amountInWordsUrdu: 'ایک ہزار روپے فقط',
      amountInWordsEnglish: 'One Thousand Rupees Only',
      categoryId: 'membership',
      paymentMode: 'Online',
      bankName: 'الائیڈ بینک کنڈیارو',
      chequeOrTxnNo: '',
      type: 'income',
      status: 'verified',
      notes: '',
    });
  };

  // Print Handler
  const handlePrint = () => {
    window.print();
  };

  // PDF Export
  const handleDownloadPDF = async () => {
    setIsExporting(true);
    await downloadReceiptAsPDF('printable-voucher-element', activeForm.receiptNo);
    setIsExporting(false);
  };

  // Image Export
  const handleDownloadImage = async () => {
    setIsExporting(true);
    await downloadReceiptAsImage('printable-voucher-element', activeForm.receiptNo);
    setIsExporting(false);
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER CONTROLS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-800/80 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Receipt className="w-6 h-6 text-blue-500" />
            <span>{isUrdu ? 'رسید و واؤچر اسٹوڈیو (Receipt Studio)' : 'Voucher & Receipt Studio'}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-nastaliq mt-1">
            {isUrdu ? 'جامعہ الغفاریہ کا آفیشل ڈیجیٹل واؤچر بنائیں، محفوظ کریں اور پرنٹ کریں' : 'Generate, preview, customize and print official high-resolution vouchers.'}
          </p>
        </div>

        {/* Top Actions */}
        <div className="flex flex-wrap items-center gap-2">
          
          <button
            onClick={handleNewReceipt}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs sm:text-sm font-semibold shadow-xs"
          >
            <PlusCircle className="w-4 h-4 text-emerald-500" />
            <span>New Blank</span>
          </button>

          <button
            onClick={handleSaveVoucher}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white shadow-md transition-all hover:scale-105 active:scale-95 bg-emerald-600 hover:bg-emerald-700"
          >
            {saveSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            <span>{saveSuccess ? 'Saved!' : 'Save to Ledger'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white shadow-md transition-all hover:scale-105 active:scale-95 bg-blue-600 hover:bg-blue-700"
          >
            <Printer className="w-4 h-4" />
            <span>Print Voucher</span>
          </button>

          <button
            disabled={isExporting}
            onClick={handleDownloadPDF}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 text-xs sm:text-sm font-semibold shadow-xs"
          >
            <Download className="w-4 h-4 text-red-500" />
            <span>PDF</span>
          </button>

          <button
            disabled={isExporting}
            onClick={handleDownloadImage}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 text-xs sm:text-sm font-semibold shadow-xs"
          >
            <ImageIcon className="w-4 h-4 text-amber-500" />
            <span>PNG</span>
          </button>

        </div>
      </div>

      {/* 2-COLUMN STUDIO LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: LIVE CUSTOMIZATION FORM */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-800/80 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-500" />
              <span>{isUrdu ? 'رسید کی تفصیلات' : 'Voucher Parameters'}</span>
            </h3>

            {/* Quick Theme Toggle for Voucher */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-lg">
              <button
                onClick={() => setVoucherTheme('blue')}
                className={`w-6 h-6 rounded-md flex items-center justify-center text-xs transition-all ${voucherTheme === 'blue' ? 'bg-[#0088cc] text-white shadow-sm' : 'text-slate-500'}`}
                title="Royal Blue Theme"
              >
                🔷
              </button>
              <button
                onClick={() => setVoucherTheme('green')}
                className={`w-6 h-6 rounded-md flex items-center justify-center text-xs transition-all ${voucherTheme === 'green' ? 'bg-[#059669] text-white shadow-sm' : 'text-slate-500'}`}
                title="Emerald Green Theme"
              >
                🌿
              </button>
              <button
                onClick={() => setVoucherTheme('black-gold')}
                className={`w-6 h-6 rounded-md flex items-center justify-center text-xs transition-all ${voucherTheme === 'black-gold' ? 'bg-[#d4af37] text-black shadow-sm' : 'text-slate-500'}`}
                title="Obsidian Gold Theme"
              >
                👑
              </button>
            </div>
          </div>

          <div className="space-y-3.5 text-xs sm:text-sm">
            
            {/* Receipt No & Date */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isUrdu ? 'رسید نمبر (Receipt No)' : 'Receipt No'}
                </label>
                <input
                  type="text"
                  value={activeForm.receiptNo}
                  onChange={(e) => setActiveForm({ ...activeForm, receiptNo: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono font-bold text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isUrdu ? 'تاریخ (Date)' : 'Date'}
                </label>
                <input
                  type="date"
                  value={activeForm.date}
                  onChange={(e) => setActiveForm({ ...activeForm, date: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs"
                />
              </div>
            </div>

            {/* Received With Thanks From (اسم گرامی محترم جناب) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 font-nastaliq" dir="rtl">
                اسم گرامی محترم جناب (Received with thanks from)
              </label>
              <input
                type="text"
                value={activeForm.donorNameUrdu}
                onChange={(e) => setActiveForm({ ...activeForm, donorNameUrdu: e.target.value, donorName: e.target.value })}
                placeholder="وقاص اسلم صاحب اینڈ فیملی"
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-nastaliq text-sm"
                dir="rtl"
              />
            </div>

            {/* Address (مکمل پتہ) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 font-nastaliq" dir="rtl">
                مکمل پتہ (Address)
              </label>
              <input
                type="text"
                value={activeForm.address}
                onChange={(e) => setActiveForm({ ...activeForm, address: e.target.value })}
                placeholder="کینٹ ویولا لاہور زون 2"
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-nastaliq text-xs"
                dir="rtl"
              />
            </div>

            {/* Reference (بتوسط) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 font-nastaliq" dir="rtl">
                بتوسط (Reference)
              </label>
              <input
                type="text"
                value={activeForm.reference}
                onChange={(e) => setActiveForm({ ...activeForm, reference: e.target.value })}
                placeholder="جناب خلیفہ مولانا حبیب الرحمن صاحب"
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-nastaliq text-xs"
                dir="rtl"
              />
            </div>

            {/* Amount in Numbers */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isUrdu ? 'رقم ہندسوں میں (Amount)' : 'Amount in Numbers (PKR)'}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 font-bold text-slate-400">Rs.</span>
                <input
                  type="number"
                  value={activeForm.amount || ''}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  placeholder="2000"
                  className="w-full p-2.5 pl-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono font-black text-lg text-emerald-600"
                />
              </div>
            </div>

            {/* Sum of Rupees (Auto Words) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 font-nastaliq" dir="rtl">
                رقم لفظوں میں (Sum of Rupees in Words)
              </label>
              <input
                type="text"
                value={activeForm.amountInWordsUrdu}
                onChange={(e) => setActiveForm({ ...activeForm, amountInWordsUrdu: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-nastaliq font-bold text-sm text-emerald-700 dark:text-emerald-400"
                dir="rtl"
              />
            </div>

            {/* Fund Category Picker */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 font-nastaliq" dir="rtl">
                شعبہ فنڈ / کیٹیگری (Fund Category)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {categories.map((c) => {
                  const isSelected = activeForm.categoryId === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setActiveForm({ ...activeForm, categoryId: c.id })}
                      className={`p-1.5 rounded-lg text-xs font-nastaliq font-bold border transition-all text-center truncate ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-300'
                      }`}
                      dir="rtl"
                    >
                      {c.nameUrdu}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Payment Mode & Bank Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isUrdu ? 'ذریعہ ادائیگی' : 'Payment Mode'}
                </label>
                <select
                  value={activeForm.paymentMode}
                  onChange={(e) => setActiveForm({ ...activeForm, paymentMode: e.target.value as any })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs"
                >
                  <option value="Online">آن لائن اکاؤنٹ (Online Account)</option>
                  <option value="Cash">نقد (Cash)</option>
                  <option value="Cheque">چیک (Cheque)</option>
                  <option value="DD">ڈیمانڈ ڈرافٹ (DD)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 font-nastaliq" dir="rtl">
                  بینک کا نام (Bank Name)
                </label>
                <input
                  type="text"
                  value={activeForm.bankName}
                  onChange={(e) => setActiveForm({ ...activeForm, bankName: e.target.value })}
                  placeholder="الائیڈ بینک کنڈیارو"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-nastaliq text-xs"
                  dir="rtl"
                />
              </div>
            </div>

            {/* Mobile No */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isUrdu ? 'موبائل نمبر (Mobile No)' : 'Mobile No'}
              </label>
              <input
                type="text"
                value={activeForm.phone}
                onChange={(e) => setActiveForm({ ...activeForm, phone: e.target.value })}
                placeholder="0242-449297"
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-xs"
              />
            </div>

          </div>

        </div>

        {/* RIGHT COLUMN: INTERACTIVE VOUCHER PREVIEW */}
        <div className="lg:col-span-7 space-y-4">
          
          <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold">
            <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
              <Sparkles className="w-4 h-4 text-amber-500" />
              {isUrdu ? 'لائیو پریویو (Live Voucher Preview)' : 'Live Interactive Slip'}
            </span>
            <span className="text-slate-400">A5 / Standard Institutional Format</span>
          </div>

          {/* Printable Voucher Component Container */}
          <div className="bg-slate-200/60 dark:bg-slate-900/60 p-2 sm:p-4 md:p-6 rounded-2xl border border-slate-300 dark:border-slate-800 overflow-x-auto shadow-inner flex justify-center">
            <div className="w-full max-w-[840px] voucher-print-container">
              <PrintableVoucher
                transaction={previewTransaction}
                orgConfig={orgConfig}
                categories={categories}
                theme={voucherTheme}
                id="printable-voucher-element"
              />
            </div>
          </div>

          {/* Tips Box */}
          <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-2xl text-xs text-amber-900 dark:text-amber-300 space-y-1 font-nastaliq">
            <div className="font-bold flex items-center gap-1.5">
              <span>💡 رہنمائی برائے پرنٹنگ:</span>
            </div>
            <p>
              پرنٹ کرتے وقت براؤزر سیٹنگز میں <strong className="font-sans">Background Graphics</strong> کو آن رکھیں تاکہ بارڈرز اور مہر شفاف پرنٹ ہوں۔
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
