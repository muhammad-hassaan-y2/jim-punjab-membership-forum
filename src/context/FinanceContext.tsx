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
  TransactionType,
  FinancialProject
} from '../types/finance';
import { 
  defaultTransactions, 
  defaultCategories, 
  defaultOrgConfig 
} from '../utils/defaultData';
import { convertNumberToUrduWords } from '../utils/urduNumberToWords';
import { convertNumberToEnglishWords } from '../utils/englishNumberToWords';
import { api, HealthResponse } from '../services/api';

export const defaultProjects: FinancialProject[] = [
  {
    id: 'proj-2026',
    name: 'JIM Punjab Campaign',
    year: 2026,
    description: 'Jamaat Islahul Muslimeen Punjab - 2026 Membership Drive',
    targetAmount: 10000000,
    createdAt: new Date().toISOString(),
  }
];

export const rawBlankSheetTabs: SheetTab[] = [
  { id: 'sheet1', name: 'Sheet 1', nameUrdu: 'Sheet 1', typeFilter: 'all', color: '#0284c7', periodType: 'template', projectId: 'proj-2026', projectYear: 2026 },
];

export const jamiaTemplateTabs: SheetTab[] = [
  { id: 'all', name: 'Sheet 1: Membership Ledger', nameUrdu: 'Sheet 1: ممبر شپ کھاتہ', categoryFilter: 'membership', typeFilter: 'all', color: '#059669', periodType: 'template', projectId: 'proj-2026', projectYear: 2026 },
];

export const welfareTemplateTabs: SheetTab[] = [
  { id: 'all', name: 'Sheet 1: Master Membership Ledger', nameUrdu: 'Sheet 1: ممبر شپ کھاتہ', categoryFilter: 'membership', typeFilter: 'all', color: '#059669', periodType: 'template', projectId: 'proj-2026', projectYear: 2026 },
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
  projects: FinancialProject[];
  setProjects: React.Dispatch<React.SetStateAction<FinancialProject[]>>;
  activeProjectId: string;
  setActiveProjectId: (id: string) => void;
  createProject: (name: string, year: number | string, description?: string) => FinancialProject;
  targetToCollect: number;
  setTargetToCollect: (target: number) => void;
  totalPledgedTarget: number;
  totalDonorsCount: number;
  totalPaidCount: number;
  monthlyPledgedSum: number;
  quarterlyPledgedSum: number;
  annuallyPledgedSum: number;
  collectedIn2026: number;
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
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
  addSheetTab: (name: string, categoryFilter?: string, typeFilter?: TransactionType | 'all', cityName?: string) => Promise<void>;
  deleteSheetTab: (id: string) => Promise<void>;
  loadTemplate: (template: SpreadsheetTemplate) => Promise<void>;
  createRawBlankSheet: (name?: string, cityName?: string) => Promise<void>;
  createTemplateSheet: (name?: string, cityName?: string) => Promise<void>;
  createPeriodicLedger: (params: PeriodicLedgerParams) => Promise<void>;
  renameSheetTab: (id: string, name: string, cityName?: string) => Promise<void>;
  batchCreateAndSaveSheets: (count: number, cityNames?: string[], format?: 'template' | 'raw', baseName?: string) => Promise<SheetTab[]>;
  saveAllSheetsToDatabase: () => Promise<boolean>;
  addCategory: (cat: Omit<FundCategory, 'id'>) => void;
  updateCategory: (id: string, cat: Partial<FundCategory>) => void;
  deleteCategory: (id: string) => void;
  updateOrgConfig: (config: Partial<OrganizationConfig>) => void;
  generateNextReceiptNumber: () => string;
  rewriteReceiptNumbersAscending: () => Promise<void>;
  resetToDefaultData: () => void;
  importBackupData: (data: any) => boolean;
  donorsSummary: DonorSummary[];
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
      // Check URL path for /sheets/:id or /dashboard/sheets/:id
      const pathParts = window.location.pathname.split('/');
      const sheetsIdx = pathParts.lastIndexOf('sheets');
      if (sheetsIdx >= 0 && pathParts[sheetsIdx + 1]) {
        return pathParts[sheetsIdx + 1];
      }
      // Fallback: check query params
      const params = new URLSearchParams(window.location.search);
      const sheetParam = params.get('sheet');
      if (sheetParam) return sheetParam;
    } catch (e) {
      console.error(e);
    }
    return 'sheet1';
  });
  const [activeReceiptTransaction, setActiveReceiptTransaction] = useState<Transaction | null>(null);

  // Projects State & Active Project Filter
  const [projects, setProjects] = useState<FinancialProject[]>(() => {
    if (typeof window === 'undefined') return defaultProjects;
    try {
      const saved = localStorage.getItem('jamia_projects');
      return saved ? JSON.parse(saved) : defaultProjects;
    } catch {
      return defaultProjects;
    }
  });

  const [activeProjectId, setActiveProjectIdState] = useState<string>(() => {
    if (typeof window === 'undefined') return 'proj-2026';
    try {
      const saved = localStorage.getItem('jamia_active_project_id');
      return saved || 'proj-2026';
    } catch {
      return 'proj-2026';
    }
  });

  const setActiveProjectId = (id: string) => {
    setActiveProjectIdState(id);
    try {
      localStorage.setItem('jamia_active_project_id', id);
    } catch (e) {
      console.error(e);
    }
  };

  const createProject = (name: string, year: number | string = 2026, description?: string): FinancialProject => {
    const newProj: FinancialProject = {
      id: `proj-${Date.now()}`,
      name: name.trim() || `Project ${year}`,
      year: year,
      description: description || '',
      targetAmount: 10000000,
      createdAt: new Date().toISOString(),
    };
    const updated = [newProj, ...projects];
    setProjects(updated);
    setActiveProjectId(newProj.id);
    try {
      localStorage.setItem('jamia_projects', JSON.stringify(updated));
      localStorage.setItem('jamia_active_project_id', newProj.id);
    } catch (e) {
      console.error(e);
    }
    return newProj;
  };

  // Target Goal to Collect
  const [targetToCollect, setTargetToCollectState] = useState<number>(() => {
    if (typeof window === 'undefined') return 10000000;
    try {
      const saved = localStorage.getItem('jamia_target_to_collect');
      return saved ? Number(saved) : 10000000;
    } catch {
      return 10000000;
    }
  });

  const setTargetToCollect = (val: number) => {
    setTargetToCollectState(val);
    try {
      localStorage.setItem('jamia_target_to_collect', String(val));
    } catch (e) {
      console.error(e);
    }
  };

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
        const rawTxs = dbTxs.value;
        // Per-sheet receipt numbering: group by sheetId, sort within each group, 
        // and assign sequential receipt numbers per sheet
        const sheetGroups = new Map<string, typeof rawTxs>();
        rawTxs.forEach(tx => {
          const key = tx.sheetId || '__unassigned__';
          if (!sheetGroups.has(key)) sheetGroups.set(key, []);
          sheetGroups.get(key)!.push(tx);
        });

        let needsRewrite = false;
        const allRewritten: typeof rawTxs = [];
        
        sheetGroups.forEach((groupTxs) => {
          const sorted = [...groupTxs].sort((a, b) => {
            const numA = parseInt(String(a.receiptNo || '').replace(/\D/g, ''), 10);
            const numB = parseInt(String(b.receiptNo || '').replace(/\D/g, ''), 10);
            if (!isNaN(numA) && !isNaN(numB) && numA !== numB) return numA - numB;
            return new Date(a.date).getTime() - new Date(b.date).getTime();
          });
          const isSequential = sorted.every((tx, idx) => tx.receiptNo === String(idx + 1));
          if (!isSequential) needsRewrite = true;
          sorted.forEach((tx, idx) => {
            allRewritten.push({ ...tx, receiptNo: String(idx + 1) });
          });
        });

        if (needsRewrite && allRewritten.length > 0) {
          setTransactions(allRewritten);
          if (allRewritten.length > 0) setActiveReceiptTransaction(allRewritten[0]);
          api.bulkSaveTransactions(allRewritten, false).catch(console.error);
        } else {
          setTransactions(rawTxs);
          if (rawTxs.length > 0) setActiveReceiptTransaction(rawTxs[0]);
        }
      }

      if (dbSheets.status === 'fulfilled' && dbSheets.value.length > 0) {
        setSheetTabs(dbSheets.value);
        // Only set active tab to first sheet if no sheet is currently selected
        // or if the currently-selected sheet no longer exists in the DB
        const currentIsValid = activeSheetTabId && dbSheets.value.some((s: any) => s.id === activeSheetTabId);
        if (!currentIsValid) {
          setActiveSheetTabId(dbSheets.value[0].id);
        }
      }

      if (dbConfig.status === 'fulfilled' && dbConfig.value) {
        setOrgConfig({
          ...defaultOrgConfig,
          ...dbConfig.value,
          nameEnglish: 'JIM Punjab',
          subHeaderEnglish: 'Jamaat Islahul Muslimeen Punjab',
          nameUrdu: 'جماعت اصلاح المسلمین پنجاب',
          subHeaderUrdu: 'پنجاب زون (Punjab Zone)',
        });
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

  const generateNextReceiptNumber = (): string => {
    const nums = transactions.map(t => parseInt(String(t.receiptNo || '').replace(/\D/g, ''), 10)).filter(n => !isNaN(n));
    const maxNum = nums.length > 0 ? Math.max(...nums) : 0;
    return String(maxNum + 1);
  };

  const rewriteReceiptNumbersAscending = async () => {
    setDbStatus('syncing');
    try {
      setTransactions(prev => {
        const sorted = [...prev].sort((a, b) => {
          const numA = parseInt(String(a.receiptNo || '').replace(/\D/g, ''), 10);
          const numB = parseInt(String(b.receiptNo || '').replace(/\D/g, ''), 10);
          if (!isNaN(numA) && !isNaN(numB) && numA !== numB) return numA - numB;
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        });
        const rewritten = sorted.map((tx, idx) => ({
          ...tx,
          receiptNo: String(idx + 1),
        }));
        api.bulkSaveTransactions(rewritten, false).catch(console.error);
        return rewritten;
      });
      setDbStatus('connected');
    } catch (err) {
      console.error('Failed to rewrite receipt numbers:', err);
      setDbStatus('error');
    }
  };

  // Start with a 100% Raw Blank Spreadsheet (Excel / Google Sheet Grid)
  const createRawBlankSheet = async (name?: string, cityName?: string) => {
    setActiveTemplate('blank');
    const tabName = name || (cityName ? `${cityName} Worksheet` : `Sheet ${sheetTabs.length + 1}`);
    const tabId = `sheet-${Date.now()}`;
    const curProj = projects.find(p => p.id === activeProjectId) || projects[0];
    const newTab: SheetTab = {
      id: tabId,
      name: tabName,
      nameUrdu: tabName,
      typeFilter: 'all',
      color: '#0284c7',
      isCustom: true,
      periodType: 'raw',
      projectId: activeProjectId,
      projectName: curProj?.name,
      projectYear: curProj?.year || 2026,
      cityName: cityName || undefined,
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
  const createTemplateSheet = async (name?: string, cityName?: string) => {
    setActiveTemplate('blank');
    const tabName = name || (cityName ? `${cityName} Ledger` : `Sheet ${sheetTabs.length + 1}`);
    const tabId = `sheet-${Date.now()}`;
    const curProj = projects.find(p => p.id === activeProjectId) || projects[0];
    const newTab: SheetTab = {
      id: tabId,
      name: tabName,
      nameUrdu: tabName,
      typeFilter: 'all',
      color: '#0284c7',
      isCustom: true,
      periodType: 'template',
      projectId: activeProjectId,
      projectName: curProj?.name,
      projectYear: curProj?.year || 2026,
      cityName: cityName || undefined,
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

  const addBlankRow = async (count: number = 1) => {
    setDbStatus('syncing');
    const activeTab = sheetTabs.find(t => t.id === activeSheetTabId);
    const defaultBranch = activeTab?.name || 'Main Branch';
    const cleanCityFromSheet = activeTab?.cityName || (activeTab?.name ? activeTab.name.replace(/\s*\(.*?\)/, '').trim() : 'Lahore');
    const defaultZila = cleanCityFromSheet || 'Lahore';

    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;

    let createdRows: Transaction[] = [];

    setTransactions(prev => {
      // Sheet-specific receipt numbering computed from latest state snapshot
      const sheetTxs = prev.filter(t => t.sheetId === activeTab?.id || (activeTab?.cityName && t.zila === activeTab.cityName));
      const nums = sheetTxs.map(t => parseInt(String(t.receiptNo || '').replace(/\D/g, ''), 10)).filter(n => !isNaN(n));
      const startNum = nums.length > 0 ? Math.max(...nums) + 1 : 1;

      createdRows = [];
      for (let i = 0; i < count; i++) {
        const receiptNo = String(startNum + i);
        createdRows.push({
          id: `tx-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 4)}`,
          sheetId: activeTab?.id,
          receiptNo: receiptNo,
          date: todayStr,
          donorName: '',
          donorNameUrdu: '',
          branchName: defaultBranch,
          zila: defaultZila,
          phone: '',
          sarparastAla: '',
          address: '',
          city: defaultZila,
          reference: '',
          preferredPeriod: 'Monthly',
          monthlyAmount: 0,
          quarterlyAmount: 0,
          halfYearlyAmount: 0,
          annuallyAmount: 0,
          targetAmount: 0,
          monthsData: { jan: 0, feb: 0, mar: 0, apr: 0, may: 0, jun: 0, jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0 },
          amount: 0,
          amountInWordsUrdu: '',
          amountInWordsEnglish: '',
          categoryId: 'membership',
          paymentMode: 'Cash',
          bankName: '',
          chequeOrTxnNo: '',
          type: 'income',
          status: 'verified',
          notes: '',
          createdAt: new Date(Date.now() + i * 50).toISOString(),
        });
      }
      return [...prev, ...createdRows];
    });

    if (createdRows.length > 0 && !activeReceiptTransaction) {
      setActiveReceiptTransaction(createdRows[0]);
    }

    try {
      if (createdRows.length > 0) {
        await api.bulkSaveTransactions(createdRows, false);
      }
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

        // If monthsData is updated, compute total paid sum across 12 months
        if (txData.monthsData !== undefined) {
          const sumMonths = Object.values(updated.monthsData || {}).reduce(
            (sum: number, v: any) => sum + (Number(v) || 0), 
            0
          );
          if (sumMonths > 0 || txData.amount === undefined) {
            updated.amount = sumMonths;
            updated.amountInWordsUrdu = convertNumberToUrduWords(sumMonths);
            updated.amountInWordsEnglish = convertNumberToEnglishWords(sumMonths);
          }
        } else if (txData.amount !== undefined && txData.amount !== item.amount) {
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
      delete cellUpdateTimerRef.current[id];
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
    const prevTxs = [...transactions];
    const prevActive = activeReceiptTransaction;
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
      // Rollback on failure
      setTransactions(prevTxs);
      setActiveReceiptTransaction(prevActive);
      setDbStatus('error');
    }
  };

  const clearAllTransactions = async (sheetId?: string) => {
    const targetSheetId = sheetId || activeSheetTabId;
    if (targetSheetId) {
      // Only clear transactions belonging to the specified sheet
      setTransactions(prev => prev.filter(t => t.sheetId !== targetSheetId));
    } else {
      setTransactions([]);
    }
    setActiveReceiptTransaction(null);
    try {
      setDbStatus('syncing');
      await api.clearAllTransactions(targetSheetId || undefined);
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
  const addSheetTab = async (name?: string, categoryFilter?: string, typeFilter: TransactionType | 'all' = 'all', cityName?: string) => {
    const nextNumber = sheetTabs.length + 1;
    const tabName = name || (cityName ? `${cityName} Worksheet` : `Sheet ${nextNumber}`);
    const curProj = projects.find(p => p.id === activeProjectId) || projects[0];
    const newTab: SheetTab = {
      id: `sheet-${Date.now()}`,
      name: tabName,
      nameUrdu: tabName,
      categoryFilter,
      typeFilter: typeFilter || 'all',
      isCustom: true,
      color: '#0284c7',
      projectId: activeProjectId,
      projectName: curProj?.name,
      projectYear: curProj?.year || 2026,
      cityName: cityName || undefined,
    };
    const updated = [...sheetTabs, newTab];
    setSheetTabs(updated);
    setActiveSheetTabId(newTab.id);
    await api.syncSheets(updated);
  };

  const deleteSheetTab = async (id: string) => {
    const updated = sheetTabs.filter(t => t.id !== id);
    if (updated.length === 0) {
      const fallbackTab: SheetTab = {
        id: `sheet-${Date.now()}`,
        name: 'New Sheet',
        nameUrdu: 'نئی شیٹ',
        cityName: 'New Sheet',
        categoryFilter: 'membership',
        typeFilter: 'all',
        color: '#0284c7',
        periodType: 'template',
        sortOrder: 0
      };
      setSheetTabs([fallbackTab]);
      setActiveSheetTabId(fallbackTab.id);
      try {
        await api.deleteSheet(id);
      } catch (err) {
        console.warn('Delete failed, syncing fallback:', err);
      }
      await api.syncSheets([fallbackTab]).catch(console.error);
      return;
    }

    setSheetTabs(updated);
    if (activeSheetTabId === id) {
      setActiveSheetTabId(updated[0].id);
    }

    try {
      await api.deleteSheet(id);
    } catch (err) {
      console.warn('Direct delete failed, falling back to syncSheets:', err);
      await api.syncSheets(updated).catch(console.error);
    }
  };

  const renameSheetTab = async (id: string, name: string, cityName?: string) => {
    const finalName = name.trim();
    // Zila and City are identical. In sheets, city name is the sheet name.
    const finalCity = (cityName || finalName).trim();

    const updated = sheetTabs.map(t => {
      if (t.id === id) {
        return { 
          ...t, 
          name: finalName, 
          cityName: finalCity, 
          nameUrdu: t.nameUrdu || finalName 
        };
      }
      return t;
    });

    setSheetTabs(updated);

    try {
      await api.updateSheet(id, { name: finalName, cityName: finalCity });
    } catch (err) {
      console.warn('Direct update failed, syncing sheets:', err);
      await api.syncSheets(updated).catch(console.error);
    }
  };

  // Batch create multiple sheets and save directly to Neon PostgreSQL database
  const batchCreateAndSaveSheets = async (
    count: number,
    cityNames?: string[],
    format: 'template' | 'raw' = 'template',
    baseName?: string
  ): Promise<SheetTab[]> => {
    setDbStatus('syncing');
    const curProj = projects.find(p => p.id === activeProjectId) || projects[0];
    const newTabs: SheetTab[] = [];
    const startNum = sheetTabs.length + 1;

    for (let i = 0; i < count; i++) {
      const city = cityNames && cityNames[i] ? cityNames[i].trim() : undefined;
      const tabName = city ? `${city} Worksheet` : (baseName ? `${baseName} ${i + 1}` : `Sheet ${startNum + i}`);
      const tabId = `sheet-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 4)}`;
      newTabs.push({
        id: tabId,
        name: tabName,
        nameUrdu: tabName,
        typeFilter: 'all',
        color: '#0284c7',
        isCustom: true,
        periodType: format,
        projectId: activeProjectId,
        projectName: curProj?.name,
        projectYear: curProj?.year || 2026,
        cityName: city,
      });
    }

    const updated = [...sheetTabs, ...newTabs];
    setSheetTabs(updated);
    if (newTabs.length > 0) {
      setActiveSheetTabId(newTabs[0].id);
    }
    setActiveTab('sheets');

    try {
      await api.syncSheets(updated);
      setDbStatus('connected');
    } catch (err) {
      console.error('Failed to save batch sheets in Neon DB:', err);
      setDbStatus('error');
      throw err;
    }
    return newTabs;
  };

  // Explicitly commit and save all active sheets to Neon PostgreSQL database
  const saveAllSheetsToDatabase = async (): Promise<boolean> => {
    setDbStatus('syncing');
    try {
      await api.syncSheets(sheetTabs);
      setDbStatus('connected');
      return true;
    } catch (err) {
      console.error('Failed to save all sheets to Neon DB:', err);
      setDbStatus('error');
      return false;
    }
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

  // Aggregated calculations across all transactions (including 12-month ledger data and pledged targets)
  const { 
    totalIncome, 
    totalExpense, 
    totalPledgedTarget, 
    collectedIn2026, 
    totalDonorsCount, 
    totalPaidCount,
    monthlyPledgedSum,
    quarterlyPledgedSum,
    annuallyPledgedSum,
  } = React.useMemo(() => {
    let income = 0;
    let expense = 0;
    let pledged = 0;
    let in2026 = 0;
    let donors = 0;
    let paidDonors = 0;
    let monthlySum = 0;
    let quarterlySum = 0;
    let annuallySum = 0;

    transactions.forEach(t => {
      if (t.status === 'cancelled') return;

      if (t.type === 'expense') {
        expense += Number(t.amount || 0);
        return;
      }

      donors++;
      monthlySum += Number(t.monthlyAmount || 0);
      quarterlySum += Number(t.quarterlyAmount || 0);
      annuallySum += Number(t.annuallyAmount || 0);

      // 1. Calculate Pledged Target:
      const target = (t.annuallyAmount && Number(t.annuallyAmount) > 0)
        ? Number(t.annuallyAmount)
        : ((t.quarterlyAmount && Number(t.quarterlyAmount) > 0)
            ? Number(t.quarterlyAmount) * 4
            : ((t.monthlyAmount && Number(t.monthlyAmount) > 0) 
                ? Number(t.monthlyAmount) * 12 
                : Number(t.amount || 0)));
      pledged += target;

      // 2. Calculate Total Collected from this donor across 12 months & amount column:
      const months = t.monthsData || {};
      const sumMonths = Object.values(months).reduce((s: number, v: any) => s + (Number(v) || 0), 0);
      const rowPaid = sumMonths > 0 ? sumMonths : Number(t.amount || 0);
      income += rowPaid;
      if (rowPaid > 0) {
        paidDonors++;
      }

      // 3. Collected in 2026:
      // The 12 monthly columns are exclusively the 2026 accounting year contributions.
      // Also transactions with date in 2026 or without date (defaulting to 2026):
      if (sumMonths > 0) {
        in2026 += sumMonths;
      } else if (!t.date || t.date.startsWith('2026')) {
        in2026 += rowPaid;
      }
    });

    return {
      totalIncome: income,
      totalExpense: expense,
      totalPledgedTarget: pledged,
      collectedIn2026: in2026,
      totalDonorsCount: donors,
      totalPaidCount: paidDonors,
      monthlyPledgedSum: monthlySum,
      quarterlyPledgedSum: quarterlySum,
      annuallyPledgedSum: annuallySum,
    };
  }, [transactions]);

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
        projects,
        setProjects,
        activeProjectId,
        setActiveProjectId,
        createProject,
        targetToCollect,
        setTargetToCollect,
        collectedIn2026,
        activeTemplate,
        setActiveTemplate,
        loadTemplate,
        createRawBlankSheet,
        createTemplateSheet,
        createPeriodicLedger,
        addSheetTab,
        deleteSheetTab,
        renameSheetTab,
        batchCreateAndSaveSheets,
        saveAllSheetsToDatabase,
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
        rewriteReceiptNumbersAscending,
        resetToDefaultData,
        importBackupData,
        donorsSummary,
        totalIncome,
        totalExpense,
        netBalance,
        totalPledgedTarget,
        totalDonorsCount,
        totalPaidCount,
        monthlyPledgedSum,
        quarterlyPledgedSum,
        annuallyPledgedSum,
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
