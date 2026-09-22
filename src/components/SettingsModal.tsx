'use client';

import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { 
  Settings, 
  X, 
  Building2, 
  Layers, 
  CreditCard, 
  Download, 
  Upload, 
  RotateCcw, 
  Plus, 
  Trash2, 
  Check, 
  FileJson,
  CheckCircle2
} from 'lucide-react';
import { exportBackupJSON } from '../utils/exportUtils';
import { FundCategory, BankAccount } from '../types/finance';

export const SettingsModal: React.FC = () => {
  const { 
    isSettingsOpen, 
    setIsSettingsOpen, 
    orgConfig, 
    updateOrgConfig, 
    categories, 
    addCategory, 
    deleteCategory, 
    transactions,
    resetToDefaultData,
    importBackupData,
    language 
  } = useFinance();

  const isUrdu = language === 'ur';
  const [activeTab, setActiveTab] = useState<'general' | 'categories' | 'banks' | 'backup'>('general');
  const [saveToast, setSaveToast] = useState(false);

  // New Category form state
  const [newCatUrdu, setNewCatUrdu] = useState('');
  const [newCatEnglish, setNewCatEnglish] = useState('');
  const [newCatColor, setNewCatColor] = useState('#0284c7');

  // New Bank form state
  const [newBankName, setNewBankName] = useState('');
  const [newBankUrdu, setNewBankUrdu] = useState('');
  const [newAccountTitle, setNewAccountTitle] = useState('');
  const [newAccountNumber, setNewAccountNumber] = useState('');

  if (!isSettingsOpen) return null;

  const handleOrgChange = (field: string, val: any) => {
    updateOrgConfig({ [field]: val });
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2000);
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatEnglish && !newCatUrdu) return;
    addCategory({
      nameEnglish: newCatEnglish || newCatUrdu,
      nameUrdu: newCatUrdu || newCatEnglish,
      color: newCatColor,
      type: 'income',
    });
    setNewCatEnglish('');
    setNewCatUrdu('');
  };

  const handleAddBank = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBankName) return;
    const newBank: BankAccount = {
      id: `bank-${Date.now()}`,
      bankName: newBankName,
      bankNameUrdu: newBankUrdu || newBankName,
      accountTitle: newAccountTitle,
      accountNumber: newAccountNumber,
      branch: 'Main Branch',
    };
    updateOrgConfig({
      bankAccounts: [...(orgConfig.bankAccounts || []), newBank]
    });
    setNewBankName('');
    setNewBankUrdu('');
    setNewAccountTitle('');
    setNewAccountNumber('');
  };

  const handleRemoveBank = (id: string) => {
    updateOrgConfig({
      bankAccounts: (orgConfig.bankAccounts || []).filter(b => b.id !== id)
    });
  };

  const handleExportBackup = () => {
    exportBackupJSON({
      transactions,
      categories,
      orgConfig,
      exportDate: new Date().toISOString(),
      version: '1.0.0'
    }, 'jamia_financial_portal_backup');
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const success = importBackupData(json);
        if (success) {
          alert(isUrdu ? 'بیک اپ کامیابی سے بحال ہو گیا!' : 'Backup restored successfully!');
        } else {
          alert(isUrdu ? 'فائل کی ساخت درست نہیں ہے' : 'Invalid backup file format.');
        }
      } catch (err) {
        alert(isUrdu ? 'فائل پڑھنے میں خرابی' : 'Error parsing backup file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 my-8 max-h-[90vh] flex flex-col">
        
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                {isUrdu ? 'جامعہ سیٹنگز و کنفیگریشن' : 'Organization Settings & Configuration'}
              </h3>
              <p className="text-xs text-slate-500 font-nastaliq">
                {isUrdu ? 'نام، پتہ، کرنسی، کیٹیگریز اور بیک اپ کنٹرول' : 'Fully dynamic: Customize organization headers, funds, stamps, and backup.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsSettingsOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* TABS */}
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2 text-xs sm:text-sm font-semibold">
          <button
            onClick={() => setActiveTab('general')}
            className={`px-3 py-2 rounded-xl transition-all ${
              activeTab === 'general' 
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {isUrdu ? 'بنیادی معلومات' : 'Organization Profile'}
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`px-3 py-2 rounded-xl transition-all ${
              activeTab === 'categories' 
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {isUrdu ? 'فنڈ کیٹیگریز' : 'Fund Categories'}
          </button>

          <button
            onClick={() => setActiveTab('banks')}
            className={`px-3 py-2 rounded-xl transition-all ${
              activeTab === 'banks' 
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {isUrdu ? 'بینک اکاؤنٹس' : 'Bank Accounts'}
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`px-3 py-2 rounded-xl transition-all ${
              activeTab === 'backup' 
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {isUrdu ? 'بیک اپ و ری سیٹ' : 'Backup & Reset'}
          </button>
        </div>

        {/* TAB BODY */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4">
          
          {/* TAB 1: GENERAL PROFILE */}
          {activeTab === 'general' && (
            <div className="space-y-4 text-xs sm:text-sm">
              
              {/* Org Name in Urdu & English */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 font-nastaliq" dir="rtl">
                    ادارے کا نام (اردو میں)
                  </label>
                  <input
                    type="text"
                    value={orgConfig.nameUrdu}
                    onChange={(e) => handleOrgChange('nameUrdu', e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-arabic-title text-base"
                    dir="rtl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Organization Name (English)
                  </label>
                  <input
                    type="text"
                    value={orgConfig.nameEnglish}
                    onChange={(e) => handleOrgChange('nameEnglish', e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                  />
                </div>
              </div>

              {/* Subheader Banner in Urdu & English */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 font-nastaliq" dir="rtl">
                    سب ہیڈنگ / درگاہ شریف کا پتہ (اردو)
                  </label>
                  <input
                    type="text"
                    value={orgConfig.subHeaderUrdu}
                    onChange={(e) => handleOrgChange('subHeaderUrdu', e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-nastaliq"
                    dir="rtl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Sub Header / Location (English)
                  </label>
                  <input
                    type="text"
                    value={orgConfig.subHeaderEnglish}
                    onChange={(e) => handleOrgChange('subHeaderEnglish', e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Receipt Prefix & Counter */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isUrdu ? 'رسید نمبر کا سابقہ (Prefix)' : 'Receipt Number Prefix'}
                  </label>
                  <input
                    type="text"
                    value={orgConfig.receiptPrefix}
                    onChange={(e) => handleOrgChange('receiptPrefix', e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isUrdu ? 'موجودہ کاؤنٹر نمبر (Serial Counter)' : 'Current Serial Counter'}
                  </label>
                  <input
                    type="number"
                    value={orgConfig.receiptCounter}
                    onChange={(e) => handleOrgChange('receiptCounter', parseInt(e.target.value) || 1)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold"
                  />
                </div>
              </div>

              {/* Signatory & Dua */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isUrdu ? 'دستخط کنندہ / مہر کا متن' : 'Signatory Name on Stamp'}
                  </label>
                  <input
                    type="text"
                    value={orgConfig.signatoryName}
                    onChange={(e) => handleOrgChange('signatoryName', e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white uppercase font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 font-nastaliq" dir="rtl">
                    دعائیہ کلمات (Dua on Voucher)
                  </label>
                  <input
                    type="text"
                    value={orgConfig.duaUrdu}
                    onChange={(e) => handleOrgChange('duaUrdu', e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-arabic-title"
                    dir="rtl"
                  />
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: FUND CATEGORIES */}
          {activeTab === 'categories' && (
            <div className="space-y-4 text-xs sm:text-sm">
              <form onSubmit={handleAddCategory} className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-emerald-500" />
                  <span>{isUrdu ? 'نیا شعبہ فنڈ شامل کریں' : 'Add Custom Fund Category'}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="اردو نام (مثلاً: ایمبولینس فنڈ)"
                    value={newCatUrdu}
                    onChange={(e) => setNewCatUrdu(e.target.value)}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-nastaliq"
                    dir="rtl"
                  />
                  <input
                    type="text"
                    required
                    placeholder="English Name (e.g. Ambulance Fund)"
                    value={newCatEnglish}
                    onChange={(e) => setNewCatEnglish(e.target.value)}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={newCatColor}
                      onChange={(e) => setNewCatColor(e.target.value)}
                      className="w-10 h-10 rounded-xl border p-0 cursor-pointer"
                    />
                    <button
                      type="submit"
                      className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                    >
                      {isUrdu ? 'شامل کریں' : 'Add'}
                    </button>
                  </div>
                </div>
              </form>

              {/* Categories List */}
              <div className="space-y-2">
                {categories.map((c) => (
                  <div key={c.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: c.color }} />
                      <span className="font-bold text-slate-900 dark:text-white font-nastaliq text-sm">{c.nameUrdu}</span>
                      <span className="text-slate-400 text-xs">({c.nameEnglish})</span>
                    </div>

                    {!c.isDefault && (
                      <button
                        onClick={() => deleteCategory(c.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: BANK ACCOUNTS */}
          {activeTab === 'banks' && (
            <div className="space-y-4 text-xs sm:text-sm">
              <form onSubmit={handleAddBank} className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-emerald-500" />
                  <span>{isUrdu ? 'نیا بینک اکاؤنٹ شامل کریں' : 'Add Institutional Bank Account'}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Bank Name (e.g. Allied Bank Kandiaro)"
                    value={newBankName}
                    onChange={(e) => setNewBankName(e.target.value)}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                  <input
                    type="text"
                    placeholder="بینک کا اردو نام (مثلاً: الائیڈ بینک کنڈیارو)"
                    value={newBankUrdu}
                    onChange={(e) => setNewBankUrdu(e.target.value)}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-nastaliq"
                    dir="rtl"
                  />
                  <input
                    type="text"
                    placeholder="Account Title (e.g. Al-Jamia Al-Ghafaria)"
                    value={newAccountTitle}
                    onChange={(e) => setNewAccountTitle(e.target.value)}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                  <input
                    type="text"
                    placeholder="Account Number / IBAN"
                    value={newAccountNumber}
                    onChange={(e) => setNewAccountNumber(e.target.value)}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  {isUrdu ? 'بینک اکاؤنٹ محفوظ کریں' : 'Save Bank Account'}
                </button>
              </form>

              {/* List */}
              <div className="space-y-2">
                {(orgConfig.bankAccounts || []).map((b) => (
                  <div key={b.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white font-nastaliq" dir="rtl">{b.bankNameUrdu || b.bankName}</div>
                      <div className="text-xs text-slate-500 font-mono">{b.accountNumber} • {b.accountTitle}</div>
                    </div>
                    <button
                      onClick={() => handleRemoveBank(b.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: BACKUP & RESTORE */}
          {activeTab === 'backup' && (
            <div className="space-y-5 text-xs sm:text-sm">
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3 bg-slate-50 dark:bg-slate-800/40">
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileJson className="w-4 h-4 text-emerald-500" />
                  <span>{isUrdu ? 'ڈیٹا بیک اپ ڈاؤنلوڈ کریں' : 'Export Full JSON Database Backup'}</span>
                </h4>
                <p className="text-xs text-slate-500 font-nastaliq">
                  {isUrdu ? 'اپنے تمام مالی ریکارڈز، واؤچرز اور سیٹنگز کو محفوظ فائل میں ڈاؤنلوڈ کریں۔' : 'Save all transactions, categories, and organization profiles as a portable JSON file.'}
                </p>
                <button
                  onClick={handleExportBackup}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  <Download className="w-4 h-4" />
                  <span>{isUrdu ? 'بیک اپ فائل ڈاؤنلوڈ کریں' : 'Download Backup (.json)'}</span>
                </button>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3 bg-slate-50 dark:bg-slate-800/40">
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Upload className="w-4 h-4 text-blue-500" />
                  <span>{isUrdu ? 'بیک اپ فائل بحال کریں' : 'Restore from Backup File'}</span>
                </h4>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportFile}
                  className="text-xs file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              <div className="p-4 rounded-2xl border border-rose-200 dark:border-rose-900/60 space-y-3 bg-rose-50/50 dark:bg-rose-950/20">
                <h4 className="font-bold text-rose-800 dark:text-rose-300 flex items-center gap-2">
                  <RotateCcw className="w-4 h-4" />
                  <span>{isUrdu ? 'ڈیفالٹ ڈیٹا پر ری سیٹ کریں' : 'Reset to Default Institutional Data'}</span>
                </h4>
                <p className="text-xs text-rose-700/80 font-nastaliq">
                  {isUrdu ? 'تمام ریکارڈز کو اصلی نمونہ ڈیٹا پر واپس لے جائیں۔' : 'Reverts all records and settings back to default demonstration values.'}
                </p>
                <button
                  onClick={() => {
                    if (window.confirm(isUrdu ? 'کیا آپ واقعی تمام ڈیٹا کو ڈیفالٹ پر ری سیٹ کرنا چاہتے ہیں؟' : 'Are you sure you want to reset all data?')) {
                      resetToDefaultData();
                      setIsSettingsOpen(false);
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold"
                >
                  {isUrdu ? 'ری سیٹ کریں' : 'Reset Everything'}
                </button>
              </div>
            </div>
          )}

        </div>

        {/* FOOTER */}
        <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-4">
          <div className="text-xs text-slate-400">
            {saveToast && (
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {isUrdu ? 'تبدیلیاں خودکار محفوظ ہو گئیں!' : 'Auto-saved!'}
              </span>
            )}
          </div>

          <button
            onClick={() => setIsSettingsOpen(false)}
            className="px-6 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs sm:text-sm hover:opacity-90"
          >
            {isUrdu ? 'مکمل / بند کریں' : 'Done'}
          </button>
        </div>

      </div>
    </div>
  );
};
