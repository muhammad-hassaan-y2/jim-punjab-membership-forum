'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { 
  Transaction, 
  FundCategory, 
  OrganizationConfig, 
  AppTheme, 
  AppLanguage,
  DonorSummary,
  SheetTab,
  TransactionType
} from '../types/finance';
import { 
  defaultTransactions, 
  defaultCategories, 
  defaultOrgConfig 
} from '../utils/defaultData';
import { convertNumberToUrduWords } from '../utils/urduNumberToWords';
import { convertNumberToEnglishWords } from '../utils/englishNumberToWords';
import { api, HealthResponse } from '../services/api';

export const rawBlankSheetTabs: SheetTab[] = [
  { id: 'sheet1', name: 'Sheet 1', nameUrdu: 'Sheet 1', typeFilter: 'all', color: '#0284c7', periodType: 'raw' },
];

export const jamiaTemplateTabs: SheetTab[] = [
  { id: 'all', name: 'Sheet 1: All Records', nameUrdu: 'Sheet 1: All Records', typeFilter: 'all', color: '#0284c7', periodType: 'template' },
  { id: 'zakat', name: 'Sheet 2: Zakat & Fitrana', nameUrdu: 'Sheet 2: Zakat & Fitrana', categoryFilter: 'zakat', typeFilter: 'income', color: '#059669', periodType: 'template' },
  { id: 'membership', name: 'Sheet 3: Membership Dues', nameUrdu: 'Sheet 3: Membership Dues', categoryFilter: 'membership', typeFilter: 'income', color: '#2563eb', periodType: 'template' },
  { id: 'construction', name: 'Sheet 4: Construction Fund', nameUrdu: 'Sheet 4: Construction Fund', categoryFilter: 'construction', typeFilter: 'income', color: '#ca8a04', periodType: 'template' },
  { id: 'madrasa', name: 'Sheet 5: Madrasa & Education', nameUrdu: 'Sheet 5: Madrasa & Education', categoryFilter: 'madrasa', typeFilter: 'income', color: '#0d9488', periodType: 'template' },
  { id: 'expenses', name: 'Sheet 6: Expenditures', nameUrdu: 'Sheet 6: Expenditures', typeFilter: 'expense', color: '#e11d48', periodType: 'template' },
];

export const welfareTemplateTabs: SheetTab[] = [
  { id: 'all', name: 'Sheet 1: Master Ledger', nameUrdu: 'Sheet 1: Master Ledger', typeFilter: 'all', color: '#0284c7', periodType: 'template' },
  { id: 'donations', name: 'Sheet 2: General Donations', nameUrdu: 'Sheet 2: General Donations', categoryFilter: 'sadaqat', typeFilter: 'income', color: '#059669', periodType: 'template' },
  { id: 'zakat_aid', name: 'Sheet 3: Zakat & Relief', nameUrdu: 'Sheet 3: Zakat & Relief', categoryFilter: 'zakat', typeFilter: 'income', color: '#ca8a04', periodType: 'template' },
  { id: 'operations', name: 'Sheet 4: Operational Expenses', nameUrdu: 'Sheet 4: Operational Expenses', typeFilter: 'expense', color: '#e11d48', periodType: 'template' },
];

export type SpreadsheetTemplate = 'blank' | 'jamia' | 'welfare' | 'periodic';

export interface PeriodicLedgerParams {
  frequency: 'monthly' | 'weekly' | 'annual' | 'custom';
  periodName: string;
  categoryFilter?: string;
  typeFilter?: TransactionType | 'all';
  startDate?: string;
  endDate?: string;
  openingBalance?: number;
}

interface FinanceContextType {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  categories: FundCategory[];
  orgConfig: OrganizationConfig;
  setOrgConfig: React.Dispatch<React.SetStateAction<OrganizationConfig>>;
  sheetTabs: SheetTab[];
  setSheetTabs: React.Dispatch<React.SetStateAction<SheetTab[]>>;
  activeSheetTabId: string;
  setActiveSheetTabId: (id: string) => void;
  activeReceiptTransaction: Transaction | null;
  setActiveReceiptTransaction: (tx: Transaction | null) => void;
  activeTab: 'dashboard' | 'landing' | 'sheets' | 'receipt' | 'analytics' | 'donors';
  setActiveTab: (tab: 'dashboard' | 'landing' | 'sheets' | 'receipt' | 'analytics' | 'donors') => void;
  activeTemplate: SpreadsheetTemplate;
  setActiveTemplate: (template: SpreadsheetTemplate) => void;
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => Promise<Transaction>;
  addBlankRow: (count?: number) => Promise<void>;
  updateCell: (rowId: string, field: keyof Transaction, value: any) => void;
  updateTransaction: (id: string, tx: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => Promise<void>;
  duplicateTransaction: (id: string) => Promise<void>;
  clearAllTransactions: () => Promise<void>;
  addSheetTab: (name: string, categoryFilter?: string, typeFilter?: TransactionType | 'all') => Promise<void>;
  deleteSheetTab: (id: string) => Promise<void>;
  loadTemplate: (template: SpreadsheetTemplate) => Promise<void>;
  createRawBlankSheet: () => Promise<void>;
  createTemplateSheet: (name?: string) => Promise<void>;
  createPeriodicLedger: (params: PeriodicLedgerParams) => Promise<void>;
  renameSheetTab: (id: string, name: string) => void;
  addCategory: (cat: Omit<FundCategory, 'id'>) => void;
  updateCategory: (id: string, cat: Partial<FundCategory>) => void;
  deleteCategory: (id: string) => void;
  updateOrgConfig: (config: Partial<OrganizationConfig>) => void;
  generateNextReceiptNumber: () => string;
  resetToDefaultData: () => void;
  importBackupData: (data: any) => boolean;
  donorsSummary: DonorSummary[];
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
  isPeriodicModalOpen: boolean;
  setIsPeriodicModalOpen: (open: boolean) => void;
  isHistoryModalOpen: boolean;
  setIsHistoryModalOpen: (open: boolean) => void;
  dbStatus: 'connected' | 'syncing' | 'error' | 'connecting';
  dbLatency: number;
  refreshFromDatabase: () => Promise<void>;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const STORAGE_KEYS = {
  THEME: 'jamia_finance_theme',
  LANG: 'jamia_finance_lang',
  TEMPLATE: 'jamia_finance_active_template',
};

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme & Language
  const [theme, setThemeState] = useState<AppTheme>(() => {
    if (typeof window === 'undefined') return 'blue';
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.THEME);
      return (saved === 'green' || saved === 'blue' || saved === 'black-gold') ? saved : 'blue';
    } catch {
      return 'blue';
    }
  });

  const [language, setLanguageState] = useState<AppLanguage>(() => {
    if (typeof window === 'undefined') return 'en';
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LANG);
      return (saved === 'en' || saved === 'ur') ? saved : 'en';
    } catch {
      return 'en';
    }
  });

  // Navigation tab (supports shareable links ?tab=sheets&sheet=...)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'landing' | 'sheets' | 'receipt' | 'analytics' | 'donors'>(() => {
    if (typeof window === 'undefined') return 'landing';
    try {
      const params = new URLSearchParams(window.location.search);
      const sheetParam = params.get('sheet');
      const tabParam = params.get('tab');
      if (sheetParam || tabParam === 'sheets') return 'sheets';
      if (tabParam === 'dashboard') return 'dashboard';
    } catch (e) {
      console.error(e);
    }
    return 'landing';
  });

  // Active Template
  const [activeTemplate, setActiveTemplate] = useState<SpreadsheetTemplate>(() => {
    if (typeof window === 'undefined') return 'blank';
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TEMPLATE) as SpreadsheetTemplate;
      return saved || 'blank';
    } catch {
      return 'blank';
    }
  });

  // Database Connection Status
  const [dbStatus, setDbStatus] = useState<'connected' | 'syncing' | 'error' | 'connecting'>('connecting');
  const [dbLatency, setDbLatency] = useState<number>(0);

  // Core Data States (Initialized empty or with default structure; populated from Neon DB)
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<FundCategory[]>(defaultCategories);
  const [orgConfig, setOrgConfig] = useState<OrganizationConfig>(defaultOrgConfig);
  const [sheetTabs, setSheetTabs] = useState<SheetTab[]>(rawBlankSheetTabs);
  const [activeSheetTabId, setActiveSheetTabId] = useState<string>(() => {
    if (typeof window === 'undefined') return 'sheet1';
    try {
      const params = new URLSearchParams(window.location.search);
      const sheetParam = params.get('sheet');
      if (sheetParam) return sheetParam;
    } catch (e) {
      console.error(e);
    }
    return 'sheet1';
  });
  const [activeReceiptTransaction, setActiveReceiptTransaction] = useState<Transaction | null>(null);

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPeriodicModalOpen, setIsPeriodicModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  // Debounce refs for cell updates
  const cellUpdateTimerRef = useRef<{ [id: string]: any }>({});

  // Fetch initial data from Neon DB
  const refreshFromDatabase = useCallback(async () => {
    try {
      setDbStatus('syncing');
      const health = await api.checkHealth();
      if (health.status === 'online') {
        setDbStatus('connected');
        setDbLatency(health.latencyMs);
      } else {
        setDbStatus('error');
      }

      // Load DB records
      const [dbTxs, dbSheets, dbConfig] = await Promise.allSettled([
        api.getTransactions(),
        api.getSheets(),
        api.getConfig(),
      ]);

      if (dbTxs.status === 'fulfilled') {
        setTransactions(dbTxs.value);
        if (dbTxs.value.length > 0) {
          setActiveReceiptTransaction(dbTxs.value[0]);
        }
      }

      if (dbSheets.status === 'fulfilled' && dbSheets.value.length > 0) {
        setSheetTabs(dbSheets.value);
        setActiveSheetTabId(dbSheets.value[0].id);
      }

      if (dbConfig.status === 'fulfilled' && dbConfig.value) {
        setOrgConfig(dbConfig.value);
      }
    } catch (err) {
      console.error('Failed to load from Neon DB:', err);
      setDbStatus('error');
    }
  }, []);

  useEffect(() => {
    refreshFromDatabase();
  }, [refreshFromDatabase]);

  // Sync theme
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
    document.documentElement.classList.remove('theme-green', 'theme-blue', 'theme-black-gold', 'dark');
    document.documentElement.classList.add(`theme-${theme}`);
    if (theme === 'black-gold') {
      document.documentElement.classList.add('dark');
    }
  }, [theme]);

  // Sync language
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LANG, language);
    document.documentElement.setAttribute('dir', language === 'ur' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', language);
  }, [language]);

  const setTheme = (newTheme: AppTheme) => {
    setThemeState(newTheme);
  };

  const setLanguage = (newLang: AppLanguage) => {
    setLanguageState(newLang);
  };

  const generateNextReceiptNumber = (targetDate?: string): string => {
    const d = targetDate ? new Date(targetDate) : new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const dateCode = `${yyyy}${mm}${dd}`;
    const counter = orgConfig.receiptCounter || 1;
    return `REC-${dateCode}-${String(counter).padStart(3, '0')}`;
  };

  // Start with a 100% Raw Blank Spreadsheet (Excel / Google Sheet Grid)
  const createRawBlankSheet = async () => {
    setActiveTemplate('blank');
    const tabName = `Sheet ${sheetTabs.length + 1}`;
    const tabId = `sheet-${Date.now()}`;
    const newTab: SheetTab = {
      id: tabId,
      name: tabName,
      nameUrdu: tabName,
      typeFilter: 'all',
      color: '#0284c7',
      isCustom: true,
      periodType: 'raw',
    };
    const updated = [...sheetTabs, newTab];
    setSheetTabs(updated);
    setActiveSheetTabId(tabId);
    setActiveTab('sheets');
    try {
      setDbStatus('syncing');
      await api.syncSheets(updated);
      setDbStatus('connected');
    } catch (err) {
      console.error(err);
      setDbStatus('error');
    }
  };

  // Create an Excel Sheet Template with standard 9 columns & fund options pre-populated
  const createTemplateSheet = async (name?: string) => {
    setActiveTemplate('blank');
    const tabName = name || `Sheet ${sheetTabs.length + 1}`;
    const tabId = `sheet-${Date.now()}`;
    const newTab: SheetTab = {
      id: tabId,
      name: tabName,
      nameUrdu: tabName,
      typeFilter: 'all',
      color: '#0284c7',
      isCustom: true,
      periodType: 'template',
    };
    const updated = [...sheetTabs, newTab];
    setSheetTabs(updated);
    setActiveSheetTabId(tabId);
    setActiveTab('sheets');
    try {
      setDbStatus('syncing');
      await api.syncSheets(updated);
      await addBlankRow(25);
      setDbStatus('connected');
    } catch (err) {
      console.error(err);
      setDbStatus('error');
    }
  };

  // Create a Periodic Ledger (Monthly / Weekly / Custom)
  const createPeriodicLedger = async (params: PeriodicLedgerParams) => {
    setActiveTemplate('periodic');
    const tabId = `period-${Date.now()}`;
    const newTab: SheetTab = {
      id: tabId,
      name: params.periodName,
      nameUrdu: params.periodName,
      categoryFilter: params.categoryFilter,
      typeFilter: params.typeFilter || 'all',
      periodType: params.frequency,
      periodValue: params.periodName,
      startDate: params.startDate,
      endDate: params.endDate,
      openingBalance: params.openingBalance || 0,
      color: params.frequency === 'weekly' ? '#0d9488' : '#2563eb',
      isCustom: true,
    };

    const updatedTabs = [...sheetTabs, newTab];
    setSheetTabs(updatedTabs);
    setActiveSheetTabId(tabId);
    setActiveTab('sheets');

    try {
      setDbStatus('syncing');
      await api.syncSheets(updatedTabs);

      // If opening balance > 0, insert an opening balance entry
      if (params.openingBalance && params.openingBalance > 0) {
        const receiptNo = generateNextReceiptNumber();
        const openingTx: Omit<Transaction, 'id' | 'createdAt'> = {
          receiptNo,
          date: params.startDate || new Date().toISOString().slice(0, 10),
          donorName: `Opening Balance (${params.periodName})`,
          donorNameUrdu: `ابتدائی بیلنس (${params.periodName})`,
          phone: '',
          address: 'Office Ledger',
          reference: 'Ledger Carry Forward',
          amount: params.openingBalance,
          amountInWordsEnglish: convertNumberToEnglishWords(params.openingBalance),
          amountInWordsUrdu: convertNumberToUrduWords(params.openingBalance),
          categoryId: params.categoryFilter || 'general',
          paymentMode: 'Online',
          bankName: 'Main Cash / Bank',
          chequeOrTxnNo: 'OPEN-BAL',
          type: 'income',
          status: 'verified',
          notes: `Opening Balance configured for ${params.periodName}`,
        };
        const created = await api.createTransaction(openingTx);
        setTransactions(prev => [created, ...prev]);
        setOrgConfig(prev => ({ ...prev, receiptCounter: prev.receiptCounter + 1 }));
      }
      setDbStatus('connected');
    } catch (err) {
      console.error('Error creating periodic ledger in Neon DB:', err);
      setDbStatus('error');
    }
  };

  // Load a specific template
  const loadTemplate = async (template: SpreadsheetTemplate) => {
    setActiveTemplate(template);
    if (template === 'blank') {
      createRawBlankSheet();
    } else if (template === 'jamia') {
      setSheetTabs(jamiaTemplateTabs);
      setActiveSheetTabId('all');
      await api.syncSheets(jamiaTemplateTabs);
    } else if (template === 'welfare') {
      setSheetTabs(welfareTemplateTabs);
      setActiveSheetTabId('all');
      await api.syncSheets(welfareTemplateTabs);
    }
  };

  // Add transaction directly with Neon DB persistence
  const addTransaction = async (txData: Omit<Transaction, 'id' | 'createdAt'>): Promise<Transaction> => {
    const urduWords = convertNumberToUrduWords(txData.amount);
    const englishWords = convertNumberToEnglishWords(txData.amount);

    const tempTx: Omit<Transaction, 'id' | 'createdAt'> = {
      ...txData,
      amountInWordsUrdu: txData.amountInWordsUrdu || urduWords,
      amountInWordsEnglish: txData.amountInWordsEnglish || englishWords,
    };

    setDbStatus('syncing');
    try {
      const created = await api.createTransaction(tempTx);
      setTransactions(prev => [created, ...prev]);
      setOrgConfig(prev => ({
        ...prev,
        receiptCounter: prev.receiptCounter + 1,
      }));
      setActiveReceiptTransaction(created);
      setDbStatus('connected');
      return created;
    } catch (err) {
      console.error('Failed to create transaction in Neon DB:', err);
      setDbStatus('error');
      throw err;
    }
  };

  // Google Sheets: Add blank row directly with real-date receipt numbering
  const addBlankRow = async (count: number = 1) => {
    setDbStatus('syncing');
    const newRows: Transaction[] = [];
    const counter = orgConfig.receiptCounter || 1;
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;
    const dateCode = `${yyyy}${mm}${dd}`;

    for (let i = 0; i < count; i++) {
      const receiptNo = `REC-${dateCode}-${String(counter + i).padStart(3, '0')}`;
      newRows.push({
        id: `tx-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 4)}`,
        receiptNo: receiptNo,
        date: todayStr,
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
        bankName: '',
        chequeOrTxnNo: '',
        type: 'income',
        status: 'verified',
        notes: '',
        createdAt: new Date(Date.now() + i * 50).toISOString(),
      });
    }

    setTransactions(prev => [...prev, ...newRows]);
    setOrgConfig(prev => ({ ...prev, receiptCounter: (prev.receiptCounter || 1) + count }));
    if (newRows.length > 0 && !activeReceiptTransaction) {
      setActiveReceiptTransaction(newRows[0]);
    }

    try {
      await api.bulkSaveTransactions(newRows, false);
      setDbStatus('connected');
    } catch (err) {
      console.error('Failed to save blank rows in Neon DB:', err);
      setDbStatus('error');
    }
  };

  const updateTransaction = (id: string, txData: Partial<Transaction>) => {
    setTransactions(prev => prev.map(item => {
      if (item.id === id) {
        const updated = { ...item, ...txData };
        if (txData.amount !== undefined && txData.amount !== item.amount) {
          const num = Number(txData.amount) || 0;
          updated.amount = num;
          updated.amountInWordsUrdu = convertNumberToUrduWords(num);
          updated.amountInWordsEnglish = convertNumberToEnglishWords(num);
        }
        if (activeReceiptTransaction?.id === id) {
          setActiveReceiptTransaction(updated);
        }
        return updated;
      }
      return item;
    }));

    // Debounced sync to Neon DB
    if (cellUpdateTimerRef.current[id]) {
      clearTimeout(cellUpdateTimerRef.current[id]);
    }

    cellUpdateTimerRef.current[id] = setTimeout(async () => {
      try {
        setDbStatus('syncing');
        await api.updateTransaction(id, txData);
        setDbStatus('connected');
      } catch (err) {
        console.error('Failed to update transaction in Neon DB:', err);
        setDbStatus('error');
      }
    }, 600);
  };

  // Google Sheets Direct Cell Update
  const updateCell = (rowId: string, field: keyof Transaction, value: any) => {
    updateTransaction(rowId, { [field]: value });
  };

  const deleteTransaction = async (id: string) => {
    setTransactions(prev => prev.filter(item => item.id !== id));
    if (activeReceiptTransaction?.id === id) {
      const remaining = transactions.filter(t => t.id !== id);
      setActiveReceiptTransaction(remaining.length > 0 ? remaining[0] : null);
    }
    try {
      setDbStatus('syncing');
      await api.deleteTransaction(id);
      setDbStatus('connected');
    } catch (err) {
      console.error('Failed to delete transaction from Neon DB:', err);
      setDbStatus('error');
    }
  };

  const clearAllTransactions = async () => {
    setTransactions([]);
    setActiveReceiptTransaction(null);
    try {
      setDbStatus('syncing');
      await api.clearAllTransactions();
      setDbStatus('connected');
    } catch (err) {
      console.error('Failed to clear transactions from Neon DB:', err);
      setDbStatus('error');
    }
  };

  const duplicateTransaction = async (id: string) => {
    const original = transactions.find(t => t.id === id);
    if (!original) return;

    const nextReceiptNo = generateNextReceiptNumber();
    const duplicatedData: Omit<Transaction, 'id' | 'createdAt'> = {
      ...original,
      receiptNo: nextReceiptNo,
      date: new Date().toISOString().slice(0, 10),
    };

    await addTransaction(duplicatedData);
  };

  // Sheet Tabs Management
  const addSheetTab = async (name?: string, categoryFilter?: string) => {
    const nextNumber = sheetTabs.length + 1;
    const tabName = name || `Sheet ${nextNumber}`;
    const newTab: SheetTab = {
      id: `sheet-${Date.now()}`,
      name: tabName,
      nameUrdu: tabName,
      categoryFilter,
      typeFilter: 'all',
      isCustom: true,
      color: '#0284c7',
    };
    const updated = [...sheetTabs, newTab];
    setSheetTabs(updated);
    setActiveSheetTabId(newTab.id);
    await api.syncSheets(updated);
  };

  const deleteSheetTab = async (id: string) => {
    if (sheetTabs.length <= 1) return;
    const updated = sheetTabs.filter(t => t.id !== id);
    setSheetTabs(updated);
    if (activeSheetTabId === id) {
      setActiveSheetTabId(updated[0].id);
    }
    await api.syncSheets(updated);
  };

  const renameSheetTab = async (id: string, name: string) => {
    const updated = sheetTabs.map(t => t.id === id ? { ...t, name, nameUrdu: name } : t);
    setSheetTabs(updated);
    await api.syncSheets(updated);
  };

  const addCategory = async (catData: Omit<FundCategory, 'id'>) => {
    const newId = catData.nameEnglish.toLowerCase().replace(/[^a-z0-9]/g, '_') || `cat_${Date.now()}`;
    const newCat: FundCategory = { ...catData, id: newId };
    const updated = [...categories, newCat];
    setCategories(updated);
    await api.syncCategories(updated);
  };

  const updateCategory = async (id: string, catData: Partial<FundCategory>) => {
    const updated = categories.map(c => c.id === id ? { ...c, ...catData } : c);
    setCategories(updated);
    await api.syncCategories(updated);
  };

  const deleteCategory = async (id: string) => {
    const updated = categories.filter(c => c.id !== id);
    setCategories(updated);
    await api.syncCategories(updated);
  };

  const updateOrgConfig = async (configData: Partial<OrganizationConfig>) => {
    const updated = { ...orgConfig, ...configData };
    setOrgConfig(updated);
    await api.saveConfig(updated);
  };

  const resetToDefaultData = () => {
    clearAllTransactions();
  };

  const importBackupData = (data: any): boolean => {
    try {
      if (data.transactions && Array.isArray(data.transactions)) {
        setTransactions(data.transactions);
        api.bulkSaveTransactions(data.transactions, true);
      }
      if (data.categories && Array.isArray(data.categories)) {
        setCategories(data.categories);
        api.syncCategories(data.categories);
      }
      if (data.orgConfig && typeof data.orgConfig === 'object') {
        setOrgConfig(data.orgConfig);
        api.saveConfig(data.orgConfig);
      }
      if (data.sheetTabs && Array.isArray(data.sheetTabs)) {
        setSheetTabs(data.sheetTabs);
        api.syncSheets(data.sheetTabs);
      }
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  // Aggregated calculations
  const totalIncome = transactions
    .filter(t => t.type === 'income' && t.status !== 'cancelled')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense' && t.status !== 'cancelled')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const netBalance = totalIncome - totalExpense;

  // Donor directory aggregation from real transactions
  const donorsSummary: DonorSummary[] = React.useMemo(() => {
    const map = new Map<string, DonorSummary>();

    transactions
      .filter(t => t.type === 'income' && t.status !== 'cancelled')
      .forEach(t => {
        const key = (t.donorName || t.donorNameUrdu || '').trim();
        if (!key) return;

        const existing = map.get(key);

        if (existing) {
          existing.totalDonated += Number(t.amount || 0);
          existing.totalReceipts += 1;
          if (new Date(t.date) > new Date(existing.lastDonationDate)) {
            existing.lastDonationDate = t.date;
            existing.preferredCategory = t.categoryId;
          }
          if (t.phone && !existing.phone) existing.phone = t.phone;
          if (t.address && !existing.address) existing.address = t.address;
        } else {
          map.set(key, {
            id: `donor-${key}`,
            name: t.donorName,
            nameUrdu: t.donorNameUrdu,
            phone: t.phone || '',
            address: t.address || '',
            totalDonated: Number(t.amount || 0),
            totalReceipts: 1,
            lastDonationDate: t.date,
            preferredCategory: t.categoryId,
            reference: t.reference || '',
          });
        }
      });

    return Array.from(map.values()).sort((a, b) => b.totalDonated - a.totalDonated);
  }, [transactions]);

  return (
    <FinanceContext.Provider
      value={{
        theme,
        setTheme,
        language,
        setLanguage,
        transactions,
        setTransactions,
        categories,
        orgConfig,
        setOrgConfig,
        sheetTabs,
        setSheetTabs,
        activeSheetTabId,
        setActiveSheetTabId,
        activeTemplate,
        setActiveTemplate,
        loadTemplate,
        createRawBlankSheet,
        createTemplateSheet,
        createPeriodicLedger,
        addSheetTab,
        deleteSheetTab,
        renameSheetTab,
        activeTab,
        setActiveTab,
        activeReceiptTransaction,
        setActiveReceiptTransaction,
        addTransaction,
        addBlankRow,
        updateTransaction,
        updateCell,
        deleteTransaction,
        duplicateTransaction,
        clearAllTransactions,
        addCategory,
        updateCategory,
        deleteCategory,
        updateOrgConfig,
        generateNextReceiptNumber,
        resetToDefaultData,
        importBackupData,
        donorsSummary,
        totalIncome,
        totalExpense,
        netBalance,
        isSettingsOpen,
        setIsSettingsOpen,
        isPeriodicModalOpen,
        setIsPeriodicModalOpen,
        isHistoryModalOpen,
        setIsHistoryModalOpen,
        dbStatus,
        dbLatency,
        refreshFromDatabase,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
