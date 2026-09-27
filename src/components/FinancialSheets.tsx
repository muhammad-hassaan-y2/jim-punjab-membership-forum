'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import { 
  Plus, 
  Search, 
  Download, 
  Upload, 
  Printer, 
  Trash2, 
  Copy, 
  Receipt, 
  Eye, 
  FileSpreadsheet, 
  X, 
  ChevronDown, 
  LayoutTemplate,
  Calendar,
  History,
  FileCheck,
  ArrowLeft,
  Grid3X3,
  TableProperties,
  Share2,
  Check,
  Pencil,
  Hash,
  Sparkles,
  Camera,
  FolderPlus,
  MapPin,
  Building,
  Briefcase,
  Database,
  Save,
  Layers,
  Users,
  Target,
  CheckCircle2,
  MoreHorizontal
} from 'lucide-react';
import { Transaction, SheetTab, FinancialProject, MONTH_KEYS, MONTH_LABELS, MonthKey } from '../types/finance';

export type AccountingColKey = 
  | 'receiptNo' 
  | 'date' 
  | 'donorName' 
  | 'branchName' 
  | 'zila' 
  | 'phone' 
  | 'monthlyAmount' 
  | 'quarterlyAmount' 
  | 'annuallyAmount' 
  | 'jan' | 'feb' | 'mar' | 'apr' | 'may' | 'jun' | 'jul' | 'aug' | 'sep' | 'oct' | 'nov' | 'dec' 
  | 'amount' 
  | 'balance' 
  | 'paymentMode' 
  | 'bankName' 
  | 'notes';
import { GeminiReceiptScannerModal } from './GeminiReceiptScannerModal';
import { 
  exportTransactionsToExcel, 
  exportTransactionsToCSV, 
  parseExcelOrCSVFile, 
  printSheetAsPDF,
  exportRawGridToExcel,
  printRawGridAsPDF
} from '../utils/exportUtils';

const PUNJAB_CITIES_PRESET = [
  'Lahore', 'Faisalabad', 'Rawalpindi', 'Gujranwala', 'Multan',
  'Bahawalpur', 'Sargodha', 'Sialkot', 'Sheikhupura', 'Rahim Yar Khan',
  'Jhang', 'Dera Ghazi Khan', 'Gujrat', 'Sahiwal', 'Wah Cantt',
  'Kasur', 'Okara', 'Mianwali', 'Chiniot', 'Kamoke',
  'Hafizabad', 'Sadiqabad', 'Burewala', 'Khanewal', 'Muzaffargarh'
];

export interface FinancialSheetsProps {
  isStandaloneShareView?: boolean;
}

export const FinancialSheets: React.FC<FinancialSheetsProps> = ({ isStandaloneShareView = false }) => {
  const { 
    transactions, 
    setTransactions,
    categories, 
    orgConfig, 
    sheetTabs,
    activeSheetTabId,
    setActiveSheetTabId,
    projects,
    setProjects,
    activeProjectId,
    setActiveProjectId,
    createProject,
    activeTemplate,
    loadTemplate,
    createRawBlankSheet,
    createTemplateSheet,
    addSheetTab,
    deleteSheetTab,
    batchCreateAndSaveSheets,
    saveAllSheetsToDatabase,
    dbStatus,
    dbLatency,
    setActiveTab, 
    setActiveReceiptTransaction, 
    addBlankRow,
    updateCell,
    updateTransaction,
    deleteTransaction, 
    duplicateTransaction,
    clearAllTransactions,
    setIsPeriodicModalOpen,
    setIsHistoryModalOpen,
    renameSheetTab,
    rewriteReceiptNumbersAscending,
  } = useFinance();

  // Active Sheet Tab filter & Sheet Number
  const currentSheetIndex = sheetTabs.findIndex(t => t.id === activeSheetTabId);
  const currentSheetNumber = currentSheetIndex >= 0 ? currentSheetIndex + 1 : 1;
  const currentSheetTab = sheetTabs.find(t => t.id === activeSheetTabId);

  // Sheet Renaming State & Handlers
  const [isEditingSheetName, setIsEditingSheetName] = useState(false);
  const [sheetNameInput, setSheetNameInput] = useState('');
  const currentSheetTitle = currentSheetTab?.name || `Sheet ${currentSheetNumber}`;

  const handleStartRename = () => {
    setSheetNameInput(currentSheetTitle);
    setIsEditingSheetName(true);
  };

  const handleSaveRename = async () => {
    const trimmed = sheetNameInput.trim();
    if (trimmed && trimmed !== currentSheetTitle) {
      // Zila and City are identical: updating sheet name also updates cityName
      await renameSheetTab(activeSheetTabId, trimmed, trimmed);
      try {
        localStorage.setItem(`jamia_sheet_name_${activeSheetTabId}`, trimmed);
        await fetch(`/api/shared/${activeSheetTabId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: trimmed,
            data: rawGridData,
            rowCount: rawRowCount
          })
        });
      } catch (err) {
        console.error('Error saving renamed sheet to DB:', err);
      }
    }
    setIsEditingSheetName(false);
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveRename();
    } else if (e.key === 'Escape') {
      setIsEditingSheetName(false);
    }
  };

  // Dual View Mode: Raw Google Sheet / Excel (A-Z) vs 9-Column Template
  const [viewModeOverride, setViewModeOverride] = useState<'raw' | 'template' | null>(null);
  const isRawMode = viewModeOverride !== null 
    ? viewModeOverride === 'raw' 
    : (currentSheetTab?.periodType === 'raw');

  // ==========================================
  // RAW EXCEL / GOOGLE SHEET GRID STATE (A-Z)
  // ==========================================
  const RAW_COLUMNS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
  const DEFAULT_RAW_ROWS = 100;

  const [rawRowCount, setRawRowCount] = useState<number>(() => {
    if (typeof window === 'undefined') return DEFAULT_RAW_ROWS;
    try {
      const saved = localStorage.getItem(`jamia_raw_rows_${activeSheetTabId}`);
      return saved ? Math.max(parseInt(saved, 10), DEFAULT_RAW_ROWS) : DEFAULT_RAW_ROWS;
    } catch {
      return DEFAULT_RAW_ROWS;
    }
  });

  const [rawAddInput, setRawAddInput] = useState<number>(100);
  const [rawDisplayLimit, setRawDisplayLimit] = useState<'50' | '100' | '250' | '500' | 'all'>('all');

  const [rawGridData, setRawGridData] = useState<Record<number, Record<string, string>>>(() => {
    if (typeof window === 'undefined') return {};
    try {
      const saved = localStorage.getItem(`jamia_raw_grid_${activeSheetTabId}`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [selectedRawCell, setSelectedRawCell] = useState<{ row: number; col: string } | null>({ row: 1, col: 'A' });
  const [editingRawCell, setEditingRawCell] = useState<{ row: number; col: string } | null>(null);
  const [rawCellEditValue, setRawCellEditValue] = useState<string>('');

  // Shareable Link state & handler
  const [isLinkCopied, setIsLinkCopied] = useState(false);
  const [isMoreActionsOpen, setIsMoreActionsOpen] = useState(false);

  const handleShareSheet = async () => {
    // If in raw mode, sync grid to Neon DB so recipient on another device can view it
    if (isRawMode) {
      try {
        await fetch(`/api/shared/${activeSheetTabId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: `Sheet ${currentSheetNumber}`,
            data: rawGridData,
            rowCount: rawRowCount
          })
        });
      } catch (err) {
        console.error('Error syncing shared sheet to Neon DB:', err);
      }
    }

    // Direct standalone sheet URL - only the sheet is accessible
    const shareUrl = `${window.location.origin}/share?sheet=${activeSheetTabId}`;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        setIsLinkCopied(true);
        setTimeout(() => setIsLinkCopied(false), 3500);
      }).catch(() => {
        prompt('Copy this shareable sheet link (Only this sheet is accessible):', shareUrl);
      });
    } else {
      prompt('Copy this shareable sheet link (Only this sheet is accessible):', shareUrl);
    }
  };

  // Switch tabs -> sync state
  useEffect(() => {
    setViewModeOverride(null);
    try {
      const savedGrid = localStorage.getItem(`jamia_raw_grid_${activeSheetTabId}`);
      if (savedGrid) {
        setRawGridData(JSON.parse(savedGrid));
      }
      const savedRows = localStorage.getItem(`jamia_raw_rows_${activeSheetTabId}`);
      if (savedRows) {
        setRawRowCount(Math.max(parseInt(savedRows, 10), DEFAULT_RAW_ROWS));
      }
    } catch {
      setRawGridData({});
    }

    // Pull from Neon DB shared storage for remote viewers
    fetch(`/api/shared/${activeSheetTabId}`)
      .then(res => res.ok ? res.json() : null)
      .then(resData => {
        if (resData && resData.data && Object.keys(resData.data).length > 0) {
          setRawGridData(prev => ({ ...resData.data, ...prev }));
          if (resData.rowCount) {
            setRawRowCount(prev => Math.max(prev, resData.rowCount));
          }
        }
      })
      .catch(() => {});

    setSelectedRawCell({ row: 1, col: 'A' });
    setEditingRawCell(null);
    setSelectedCell(null);
    setEditingCell(null);

    // Dynamically synchronize browser URL to /dashboard/sheets/[id] or /sheets/[id]
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname;
      if (pathname.startsWith('/dashboard/sheets') || pathname.startsWith('/sheets')) {
        const isSheetsRoot = pathname.startsWith('/sheets');
        const expectedPath = isSheetsRoot ? `/sheets/${activeSheetTabId}` : `/dashboard/sheets/${activeSheetTabId}`;
        if (pathname !== expectedPath) {
          window.history.replaceState({}, '', expectedPath);
        }
      }
    }
  }, [activeSheetTabId]);

  const handleRawCellChange = (row: number, col: string, val: string) => {
    setRawGridData(prev => {
      const updated = {
        ...prev,
        [row]: {
          ...(prev[row] || {}),
          [col]: val
        }
      };
      try {
        localStorage.setItem(`jamia_raw_grid_${activeSheetTabId}`, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const handleAddRawRows = (count: number = 20) => {
    setRawRowCount(prev => {
      const next = prev + count;
      try {
        localStorage.setItem(`jamia_raw_rows_${activeSheetTabId}`, String(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  // ==========================================
  // TEMPLATE MODE STATE (9-COLUMN LEDGER)
  // ==========================================
  // Active Selected Cell for Template Navigation
  // Active Selected Cell for Template Navigation
  const [selectedCell, setSelectedCell] = useState<{ rowId: string; rowIndex: number; colKey: AccountingColKey; colLetter: string } | null>(null);
  const [editingCell, setEditingCell] = useState<{ rowId: string; colKey: AccountingColKey } | null>(null);
  const [cellEditValue, setCellEditValue] = useState<string>('');
  const [formulaBarValue, setFormulaBarValue] = useState<string>('');

  // Template gallery bar toggle
  const [showTemplateBar, setShowTemplateBar] = useState(false);

  // Accounting Slicers & Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'income' | 'expense'>('all');
  const [selectedZila, setSelectedZila] = useState<string>('all');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [selectedAccountingStatus, setSelectedAccountingStatus] = useState<'all' | 'paid' | 'due' | 'unpaid'>('all');
  const [selectedPaymentMode, setSelectedPaymentMode] = useState<string>('all');
  const [focusedMonth, setFocusedMonth] = useState<MonthKey | null>(null);
  const [monthViewMode, setMonthViewMode] = useState<'all' | 'compact'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'receiptNo'>('receiptNo');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Pagination & Row Limiting State (Template Mode)
  const [rowLimit, setRowLimit] = useState<'25' | '50' | '100' | '250' | '500' | 'all'>('100');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [templateAddCount, setTemplateAddCount] = useState<number>(50);

  // New Sheet Tab Modal
  const [isNewSheetModalOpen, setIsNewSheetModalOpen] = useState(false);
  const [newSheetName, setNewSheetName] = useState('');
  const [newSheetCity, setNewSheetCity] = useState('');
  const [newSheetCategory, setNewSheetCategory] = useState('');
  const [newSheetFormat, setNewSheetFormat] = useState<'template' | 'raw'>('template');

  // New Project & Year Modal
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectYear, setNewProjectYear] = useState<string>('2026');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  // Batch Multi-Sheet Creator Modal (Select count & save directly to database)
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [batchCount, setBatchCount] = useState<number>(5);
  const [batchFormat, setBatchFormat] = useState<'template' | 'raw'>('template');
  const [batchAutoCities, setBatchAutoCities] = useState<boolean>(true);
  const [batchCustomCities, setBatchCustomCities] = useState<string>('');
  const [isSavingToDb, setIsSavingToDb] = useState(false);
  const [dbSaveSuccessMsg, setDbSaveSuccessMsg] = useState<string | null>(null);

  // Gemini AI Receipt Scanner Modal
  const [isGeminiScannerOpen, setIsGeminiScannerOpen] = useState(false);

  // File import ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 26 Complete Accounting Columns (A-Z) matching exact requested format
  const columns: { letter: string; key: AccountingColKey; titleEn: string; titleUr: string; width: string; align?: 'left' | 'center' | 'right' }[] = [
    { letter: 'A', key: 'receiptNo', titleEn: 'Receipt No', titleUr: 'رسید نمبر', width: 'w-24' },
    { letter: 'B', key: 'date', titleEn: 'Date', titleUr: 'تاریخ', width: 'w-24', align: 'center' },
    { letter: 'C', key: 'donorName', titleEn: 'Donor Name', titleUr: 'نام دہندہ', width: 'w-48' },
    { letter: 'D', key: 'branchName', titleEn: 'Branch', titleUr: 'شاخ / برانچ', width: 'w-32' },
    { letter: 'E', key: 'zila', titleEn: 'Zila / City', titleUr: 'ضلع / شہر', width: 'w-28' },
    { letter: 'F', key: 'phone', titleEn: 'Phone', titleUr: 'فون نمبر', width: 'w-28' },
    { letter: 'G', key: 'monthlyAmount', titleEn: 'Monthly', titleUr: 'ماہانہ رقم', width: 'w-24', align: 'right' },
    { letter: 'H', key: 'quarterlyAmount', titleEn: 'Quarterly', titleUr: 'سہ ماہی', width: 'w-24', align: 'right' },
    { letter: 'I', key: 'annuallyAmount', titleEn: 'Annually', titleUr: 'سالانہ', width: 'w-24', align: 'right' },
    { letter: 'J', key: 'jan', titleEn: 'Jan', titleUr: 'جنوری', width: 'w-20', align: 'right' },
    { letter: 'K', key: 'feb', titleEn: 'Feb', titleUr: 'فروری', width: 'w-20', align: 'right' },
    { letter: 'L', key: 'mar', titleEn: 'Mar', titleUr: 'مارچ', width: 'w-20', align: 'right' },
    { letter: 'M', key: 'apr', titleEn: 'Apr', titleUr: 'اپریل', width: 'w-20', align: 'right' },
    { letter: 'N', key: 'may', titleEn: 'May', titleUr: 'مئی', width: 'w-20', align: 'right' },
    { letter: 'O', key: 'jun', titleEn: 'Jun', titleUr: 'جون', width: 'w-20', align: 'right' },
    { letter: 'P', key: 'jul', titleEn: 'Jul', titleUr: 'جولائی', width: 'w-20', align: 'right' },
    { letter: 'Q', key: 'aug', titleEn: 'Aug', titleUr: 'اگست', width: 'w-20', align: 'right' },
    { letter: 'R', key: 'sep', titleEn: 'Sep', titleUr: 'ستمبر', width: 'w-20', align: 'right' },
    { letter: 'S', key: 'oct', titleEn: 'Oct', titleUr: 'اکتوبر', width: 'w-20', align: 'right' },
    { letter: 'T', key: 'nov', titleEn: 'Nov', titleUr: 'نومبر', width: 'w-20', align: 'right' },
    { letter: 'U', key: 'dec', titleEn: 'Dec', titleUr: 'دسمبر', width: 'w-20', align: 'right' },
    { letter: 'V', key: 'amount', titleEn: 'Total Paid', titleUr: 'کل وصولی', width: 'w-28', align: 'right' },
    { letter: 'W', key: 'balance', titleEn: 'Balance Due', titleUr: 'واجب الادا', width: 'w-28', align: 'right' },
    { letter: 'X', key: 'paymentMode', titleEn: 'Payment Mode', titleUr: 'طریقہ', width: 'w-28', align: 'center' },
    { letter: 'Y', key: 'bankName', titleEn: 'Bank Name', titleUr: 'بینک کا نام', width: 'w-32' },
    { letter: 'Z', key: 'notes', titleEn: 'Remarks', titleUr: 'کیفیات', width: 'w-36' },
  ];

  // Helper to extract or compute cell values
  const getCellValue = (tx: Transaction, colKey: AccountingColKey): any => {
    if (MONTH_KEYS.includes(colKey as any)) {
      return tx.monthsData?.[colKey as MonthKey] || 0;
    }
    if (colKey === 'balance') {
      const tgt = (tx.annuallyAmount && tx.annuallyAmount > 0)
        ? tx.annuallyAmount
        : ((tx.quarterlyAmount && tx.quarterlyAmount > 0)
            ? tx.quarterlyAmount * 4
            : ((tx.monthlyAmount && tx.monthlyAmount > 0) ? tx.monthlyAmount * 12 : tx.amount));
      const paid = tx.monthsData && Object.values(tx.monthsData).length > 0
        ? Object.values(tx.monthsData).reduce((s: number, v: any) => s + (Number(v) || 0), 0)
        : Number(tx.amount || 0);
      return Math.max(0, (tgt || 0) - paid);
    }
    return (tx as any)[colKey];
  };

  // Filtered & Sorted Transactions with Accounting Slicers
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      // Sheet tab filter
      if (currentSheetTab) {
        if (t.sheetId) {
          if (t.sheetId !== currentSheetTab.id) return false;
        } else {
          // Fallback matching for legacy database records:
          const targetCity = (currentSheetTab.cityName || currentSheetTab.name || '')
            .toLowerCase()
            .replace(/\s*\(.*?\)/, '')
            .trim();
          const txZila = (t.zila || t.city || '').toLowerCase().trim();
          if (targetCity) {
            const isMatch = txZila.includes(targetCity) || targetCity.includes(txZila);
            if (!isMatch) return false;
          }
        }

        if (currentSheetTab.typeFilter && currentSheetTab.typeFilter !== 'all' && t.type !== currentSheetTab.typeFilter) return false;
      }

      // Slicers: Type, Branch, Payment Mode, Status
      if (selectedType !== 'all' && t.type !== selectedType) return false;
      if (selectedZila !== 'all' && (t.zila || t.city || '').toLowerCase() !== selectedZila.toLowerCase()) return false;
      if (selectedBranch !== 'all' && (t.branchName || '').toLowerCase() !== selectedBranch.toLowerCase()) return false;
      if (selectedPaymentMode !== 'all' && t.paymentMode !== selectedPaymentMode) return false;

      // Status filter: Paid, Due/Arrears, Unpaid
      if (selectedAccountingStatus !== 'all') {
        const target = (t.annuallyAmount && t.annuallyAmount > 0)
          ? t.annuallyAmount
          : ((t.quarterlyAmount && t.quarterlyAmount > 0)
              ? t.quarterlyAmount * 4
              : ((t.monthlyAmount && t.monthlyAmount > 0) ? t.monthlyAmount * 12 : t.amount));
        const months = t.monthsData || {};
        const paid = Object.values(months).length > 0
          ? Object.values(months).reduce((s: number, v: any) => s + (Number(v) || 0), 0)
          : Number(t.amount || 0);

        if (selectedAccountingStatus === 'paid' && (paid < target || target === 0)) return false;
        if (selectedAccountingStatus === 'due' && (paid >= target || paid === 0)) return false;
        if (selectedAccountingStatus === 'unpaid' && paid > 0) return false;
      }

      // Multi-Field Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesReceipt = (t.receiptNo || '').toLowerCase().includes(query);
        const matchesName = (t.donorName || '').toLowerCase().includes(query);
        const matchesNameUrdu = (t.donorNameUrdu || '').includes(query);
        const matchesBranch = (t.branchName || '').toLowerCase().includes(query);
        const matchesZila = (t.zila || t.city || '').toLowerCase().includes(query);
        const matchesPhone = (t.phone || '').toLowerCase().includes(query);
        const matchesNotes = (t.notes || '').toLowerCase().includes(query);
        const matchesBank = (t.bankName || '').toLowerCase().includes(query);

        if (!matchesReceipt && !matchesName && !matchesNameUrdu && !matchesBranch && !matchesZila && !matchesPhone && !matchesNotes && !matchesBank) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'amount') {
        return sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount;
      }
      if (sortBy === 'receiptNo') {
        const numA = parseInt(String(a.receiptNo || '').replace(/\D/g, ''), 10);
        const numB = parseInt(String(b.receiptNo || '').replace(/\D/g, ''), 10);
        if (!isNaN(numA) && !isNaN(numB) && numA !== numB) {
          return sortOrder === 'asc' ? numA - numB : numB - numA;
        }
        return sortOrder === 'asc' ? String(a.receiptNo || '').localeCompare(String(b.receiptNo || '')) : String(b.receiptNo || '').localeCompare(String(a.receiptNo || ''));
      }
      return sortOrder === 'asc' ? new Date(a.date).getTime() - new Date(b.date).getTime() : new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [transactions, currentSheetTab, selectedType, selectedZila, selectedBranch, selectedAccountingStatus, selectedPaymentMode, searchQuery, sortBy, sortOrder]);

  // Dynamic Punjab Zila & Branch collections for slicers
  const availableZilas = useMemo(() => {
    const set = new Set<string>();
    PUNJAB_CITIES_PRESET.forEach(c => set.add(c));
    transactions.forEach(t => {
      if (t.zila && t.zila.trim()) set.add(t.zila.trim());
      if (t.city && t.city.trim()) set.add(t.city.trim());
    });
    return Array.from(set).sort();
  }, [transactions]);

  const availableBranches = useMemo(() => {
    const set = new Set<string>();
    transactions.forEach(t => {
      if (t.branchName && t.branchName.trim()) set.add(t.branchName.trim());
    });
    return Array.from(set).sort();
  }, [transactions]);

  // Derived pagination for Template Mode
  const totalTemplateRows = filteredTransactions.length;
  const limitNum = rowLimit === 'all' ? totalTemplateRows : parseInt(rowLimit, 10);
  const totalPages = limitNum > 0 ? Math.max(1, Math.ceil(totalTemplateRows / limitNum)) : 1;
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = rowLimit === 'all' ? 0 : (safePage - 1) * limitNum;
  const endIndex = rowLimit === 'all' ? totalTemplateRows : Math.min(startIndex + limitNum, totalTemplateRows);
  const displayedTransactions = useMemo(() => {
    return filteredTransactions.slice(startIndex, endIndex);
  }, [filteredTransactions, startIndex, endIndex]);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const displayedRawRowCount = rawDisplayLimit === 'all' 
    ? rawRowCount 
    : Math.min(parseInt(rawDisplayLimit, 10), rawRowCount);

  // Accounting Summary Performance Statistics (Pledged Target, Realized Collection, Outstanding Arrears, Monthly Totals)
  const summaryStats = useMemo(() => {
    let totalPledged = 0;
    let totalPaid = 0;
    let cashTotal = 0;
    let bankTotal = 0;
    let monthlyCommitmentsSum = 0;
    let quarterlyCommitmentsSum = 0;
    let annuallyCommitmentsSum = 0;

    const monthSums: Record<MonthKey, number> = {
      jan: 0, feb: 0, mar: 0, apr: 0, may: 0, jun: 0,
      jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0
    };

    filteredTransactions.forEach(t => {
      monthlyCommitmentsSum += Number(t.monthlyAmount || 0);
      quarterlyCommitmentsSum += Number(t.quarterlyAmount || 0);
      annuallyCommitmentsSum += Number(t.annuallyAmount || 0);

      const target = (t.annuallyAmount && t.annuallyAmount > 0)
        ? t.annuallyAmount
        : ((t.quarterlyAmount && t.quarterlyAmount > 0)
            ? t.quarterlyAmount * 4
            : ((t.monthlyAmount && t.monthlyAmount > 0) ? t.monthlyAmount * 12 : t.amount));
      totalPledged += Number(target || 0);

      const months = t.monthsData || {};
      let rowPaid = 0;
      if (Object.values(months).length > 0) {
        MONTH_KEYS.forEach(m => {
          const v = Number(months[m]) || 0;
          monthSums[m] += v;
          rowPaid += v;
        });
      } else {
        rowPaid = Number(t.amount || 0);
      }
      totalPaid += rowPaid;

      if (t.paymentMode === 'Cash') {
        cashTotal += rowPaid;
      } else {
        bankTotal += rowPaid;
      }
    });

    const totalBalance = Math.max(0, totalPledged - totalPaid);
    const collectionRate = totalPledged > 0 
      ? Math.min(100, Math.round((totalPaid / totalPledged) * 100)) 
      : (totalPaid > 0 ? 100 : 0);

    return {
      totalDonors: filteredTransactions.length,
      totalPledged,
      totalPaid,
      totalBalance,
      collectionRate,
      cashTotal,
      bankTotal,
      monthlyCommitmentsSum,
      quarterlyCommitmentsSum,
      annuallyCommitmentsSum,
      monthSums,
      count: filteredTransactions.length,
      sum: totalPaid,
      totalExp: 0,
      avg: filteredTransactions.length > 0 ? totalPaid / filteredTransactions.length : 0,
      net: totalPaid,
    };
  }, [filteredTransactions]);

  // Handle cell click selection
  const handleCellClick = (rowId: string, rowIndex: number, colKey: AccountingColKey, colLetter: string) => {
    const tx = transactions.find(t => t.id === rowId);
    if (!tx) return;
    setSelectedCell({ rowId, rowIndex, colKey, colLetter });
    setFormulaBarValue(String(getCellValue(tx, colKey)));
  };

  // Handle cell double click for inline editing
  const handleCellDoubleClick = (rowId: string, colKey: AccountingColKey) => {
    if (colKey === 'balance' || colKey === 'amount') return; // Read-only calculated totals
    const tx = transactions.find(t => t.id === rowId);
    if (!tx) return;
    setEditingCell({ rowId, colKey });
    setCellEditValue(String(getCellValue(tx, colKey)));
  };

  // Commit inline edit
  const handleCommitEdit = (rowId: string, colKey: AccountingColKey, value: string) => {
    if (MONTH_KEYS.includes(colKey as any)) {
      const mKey = colKey as MonthKey;
      const numVal = parseFloat(value) || 0;
      const tx = transactions.find(t => t.id === rowId);
      const currentMonths = tx?.monthsData || {};
      const updatedMonths = { ...currentMonths, [mKey]: numVal };
      const totalSum = Object.values(updatedMonths).reduce((acc: number, v: any) => acc + (Number(v) || 0), 0);
      updateTransaction(rowId, {
        monthsData: updatedMonths,
        amount: totalSum,
      });
      setEditingCell(null);
      setFormulaBarValue(String(numVal));
      return;
    }

    let finalVal: any = value;
    if (['monthlyAmount', 'quarterlyAmount', 'halfYearlyAmount', 'annuallyAmount'].includes(colKey as string)) {
      finalVal = parseFloat(value) || 0;
    }

    updateCell(rowId, colKey as keyof Transaction, finalVal);

    if (colKey === 'monthlyAmount') {
      const num = parseFloat(value) || 0;
      const tx = transactions.find(t => t.id === rowId);
      updateTransaction(rowId, {
        monthlyAmount: num,
        quarterlyAmount: tx?.quarterlyAmount || (num > 0 ? num * 3 : 0),
        annuallyAmount: tx?.annuallyAmount || (num > 0 ? num * 12 : 0),
        preferredPeriod: 'Monthly',
      });
    } else if (colKey === 'quarterlyAmount') {
      const num = parseFloat(value) || 0;
      const tx = transactions.find(t => t.id === rowId);
      updateTransaction(rowId, {
        quarterlyAmount: num,
        monthlyAmount: tx?.monthlyAmount || (num > 0 ? Math.round(num / 3) : 0),
        annuallyAmount: tx?.annuallyAmount || (num > 0 ? num * 4 : 0),
        preferredPeriod: 'Quarterly',
      });
    } else if (colKey === 'annuallyAmount') {
      const num = parseFloat(value) || 0;
      const tx = transactions.find(t => t.id === rowId);
      updateTransaction(rowId, {
        annuallyAmount: num,
        monthlyAmount: tx?.monthlyAmount || (num > 0 ? Math.round(num / 12) : 0),
        quarterlyAmount: tx?.quarterlyAmount || (num > 0 ? Math.round(num / 4) : 0),
        preferredPeriod: 'Annually',
      });
    }

    setEditingCell(null);
    setFormulaBarValue(String(finalVal));
  };

  // Quick-Pay action: Record donor's monthly pledge for active or current month
  const handleQuickPayMonth = (tx: Transaction, monthKey?: MonthKey) => {
    const curMonthIndex = new Date().getMonth();
    const targetMonth: MonthKey = monthKey || (MONTH_KEYS[curMonthIndex] || 'jan');
    const amt = tx.monthlyAmount && tx.monthlyAmount > 0 
      ? tx.monthlyAmount 
      : (tx.quarterlyAmount && tx.quarterlyAmount > 0 ? Math.round(tx.quarterlyAmount / 3) : 500);
    const updatedMonths = { ...(tx.monthsData || {}), [targetMonth]: amt };
    const totalSum = Object.values(updatedMonths).reduce((acc: number, v: any) => acc + (Number(v) || 0), 0);
    updateTransaction(tx.id, {
      monthsData: updatedMonths,
      amount: totalSum,
    });
  };

  // Helper to scroll active cell into view smoothly like Excel
  const scrollToCell = (elementId: string) => {
    setTimeout(() => {
      const el = document.getElementById(elementId);
      if (el) {
        el.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
      }
    }, 15);
  };

  // Auto-select first cell on load if none selected
  useEffect(() => {
    if (!isRawMode && !selectedCell && displayedTransactions.length > 0) {
      const first = displayedTransactions[0];
      setSelectedCell({
        rowId: first.id,
        rowIndex: 0,
        colKey: 'receiptNo',
        colLetter: 'A'
      });
      setFormulaBarValue(String(first.receiptNo || ''));
    }
  }, [isRawMode, displayedTransactions, selectedCell]);

  // Excel keyboard navigation when INSIDE active cell input
  const handleTemplateCellKeyDown = (
    e: React.KeyboardEvent,
    rowId: string,
    colKey: AccountingColKey,
    currentIdx: number,
    value: string
  ) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCommitEdit(rowId, colKey, value);
      if (e.shiftKey) {
        if (currentIdx > 0) {
          const prevTx = displayedTransactions[currentIdx - 1];
          const colDef = columns.find(c => c.key === colKey);
          setSelectedCell({
            rowId: prevTx.id,
            rowIndex: startIndex + currentIdx - 1,
            colKey,
            colLetter: colDef?.letter || 'A'
          });
          setFormulaBarValue(String(getCellValue(prevTx, colKey)));
          scrollToCell(`cell-${prevTx.id}-${colKey}`);
        }
      } else {
        if (currentIdx + 1 < displayedTransactions.length) {
          const nextTx = displayedTransactions[currentIdx + 1];
          const colDef = columns.find(c => c.key === colKey);
          setSelectedCell({
            rowId: nextTx.id,
            rowIndex: startIndex + currentIdx + 1,
            colKey,
            colLetter: colDef?.letter || 'A'
          });
          setFormulaBarValue(String(getCellValue(nextTx, colKey)));
          scrollToCell(`cell-${nextTx.id}-${colKey}`);
        }
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      handleCommitEdit(rowId, colKey, value);
      const colIdx = columns.findIndex(c => c.key === colKey);
      if (e.shiftKey) {
        if (colIdx > 0) {
          const nextCol = columns[colIdx - 1];
          const curTx = displayedTransactions[currentIdx];
          setSelectedCell({
            rowId: curTx.id,
            rowIndex: startIndex + currentIdx,
            colKey: nextCol.key,
            colLetter: nextCol.letter
          });
          setFormulaBarValue(String(getCellValue(curTx, nextCol.key)));
          scrollToCell(`cell-${curTx.id}-${nextCol.key}`);
        }
      } else {
        if (colIdx + 1 < columns.length) {
          const nextCol = columns[colIdx + 1];
          const curTx = displayedTransactions[currentIdx];
          setSelectedCell({
            rowId: curTx.id,
            rowIndex: startIndex + currentIdx,
            colKey: nextCol.key,
            colLetter: nextCol.letter
          });
          setFormulaBarValue(String(getCellValue(curTx, nextCol.key)));
          scrollToCell(`cell-${curTx.id}-${nextCol.key}`);
        }
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      handleCommitEdit(rowId, colKey, value);
      if (currentIdx > 0) {
        const prevTx = displayedTransactions[currentIdx - 1];
        const colDef = columns.find(c => c.key === colKey);
        setSelectedCell({
          rowId: prevTx.id,
          rowIndex: startIndex + currentIdx - 1,
          colKey,
          colLetter: colDef?.letter || 'A'
        });
        setFormulaBarValue(String(getCellValue(prevTx, colKey)));
        scrollToCell(`cell-${prevTx.id}-${colKey}`);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      handleCommitEdit(rowId, colKey, value);
      if (currentIdx + 1 < displayedTransactions.length) {
        const nextTx = displayedTransactions[currentIdx + 1];
        const colDef = columns.find(c => c.key === colKey);
        setSelectedCell({
          rowId: nextTx.id,
          rowIndex: startIndex + currentIdx + 1,
          colKey,
          colLetter: colDef?.letter || 'A'
        });
        setFormulaBarValue(String(getCellValue(nextTx, colKey)));
        scrollToCell(`cell-${nextTx.id}-${colKey}`);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setEditingCell(null);
    }
  };

  // Comprehensive Excel Grid Arrow Key Navigation (Up, Down, Left, Right, Tab, Enter, F2, Delete)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput = activeEl?.tagName === 'INPUT' || activeEl?.tagName === 'TEXTAREA' || activeEl?.tagName === 'SELECT';

      // Don't intercept if currently editing cell or if user is in search bar, formula bar, or dialog
      if (editingCell || editingRawCell || isGeminiScannerOpen || isNewSheetModalOpen) {
        return;
      }

      if (isInput && activeEl?.id !== 'formula-bar-input') {
        return;
      }

      // 1. Raw Grid Mode
      if (isRawMode && selectedRawCell) {
        const { row, col } = selectedRawCell;
        const colIdx = RAW_COLUMNS.indexOf(col);

        if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (row > 1) {
            const nextRow = row - 1;
            setSelectedRawCell({ row: nextRow, col });
            setFormulaBarValue(rawGridData[nextRow]?.[col] || '');
            scrollToCell(`raw-cell-${nextRow}-${col}`);
          }
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          if (row < displayedRawRowCount) {
            const nextRow = row + 1;
            setSelectedRawCell({ row: nextRow, col });
            setFormulaBarValue(rawGridData[nextRow]?.[col] || '');
            scrollToCell(`raw-cell-${nextRow}-${col}`);
          }
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          if (colIdx > 0) {
            const nextCol = RAW_COLUMNS[colIdx - 1];
            setSelectedRawCell({ row, col: nextCol });
            setFormulaBarValue(rawGridData[row]?.[nextCol] || '');
            scrollToCell(`raw-cell-${row}-${nextCol}`);
          }
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          if (colIdx < RAW_COLUMNS.length - 1) {
            const nextCol = RAW_COLUMNS[colIdx + 1];
            setSelectedRawCell({ row, col: nextCol });
            setFormulaBarValue(rawGridData[row]?.[nextCol] || '');
            scrollToCell(`raw-cell-${row}-${nextCol}`);
          }
        } else if (e.key === 'Tab') {
          e.preventDefault();
          if (e.shiftKey) {
            if (colIdx > 0) {
              const nextCol = RAW_COLUMNS[colIdx - 1];
              setSelectedRawCell({ row, col: nextCol });
              setFormulaBarValue(rawGridData[row]?.[nextCol] || '');
              scrollToCell(`raw-cell-${row}-${nextCol}`);
            } else if (row > 1) {
              const nextCol = RAW_COLUMNS[RAW_COLUMNS.length - 1];
              setSelectedRawCell({ row: row - 1, col: nextCol });
              setFormulaBarValue(rawGridData[row - 1]?.[nextCol] || '');
              scrollToCell(`raw-cell-${row - 1}-${nextCol}`);
            }
          } else {
            if (colIdx < RAW_COLUMNS.length - 1) {
              const nextCol = RAW_COLUMNS[colIdx + 1];
              setSelectedRawCell({ row, col: nextCol });
              setFormulaBarValue(rawGridData[row]?.[nextCol] || '');
              scrollToCell(`raw-cell-${row}-${nextCol}`);
            } else if (row < displayedRawRowCount) {
              const nextCol = RAW_COLUMNS[0];
              setSelectedRawCell({ row: row + 1, col: nextCol });
              setFormulaBarValue(rawGridData[row + 1]?.[nextCol] || '');
              scrollToCell(`raw-cell-${row + 1}-${nextCol}`);
            }
          }
        } else if (e.key === 'Enter') {
          e.preventDefault();
          if (e.shiftKey) {
            if (row > 1) {
              const nextRow = row - 1;
              setSelectedRawCell({ row: nextRow, col });
              setFormulaBarValue(rawGridData[nextRow]?.[col] || '');
              scrollToCell(`raw-cell-${nextRow}-${col}`);
            }
          } else {
            if (row < displayedRawRowCount) {
              const nextRow = row + 1;
              setSelectedRawCell({ row: nextRow, col });
              setFormulaBarValue(rawGridData[nextRow]?.[col] || '');
              scrollToCell(`raw-cell-${nextRow}-${col}`);
            }
          }
        } else if (e.key === 'Home') {
          e.preventDefault();
          setSelectedRawCell({ row, col: RAW_COLUMNS[0] });
          setFormulaBarValue(rawGridData[row]?.[RAW_COLUMNS[0]] || '');
          scrollToCell(`raw-cell-${row}-${RAW_COLUMNS[0]}`);
        } else if (e.key === 'End') {
          e.preventDefault();
          const lastCol = RAW_COLUMNS[RAW_COLUMNS.length - 1];
          setSelectedRawCell({ row, col: lastCol });
          setFormulaBarValue(rawGridData[row]?.[lastCol] || '');
          scrollToCell(`raw-cell-${row}-${lastCol}`);
        } else if (e.key === 'F2') {
          e.preventDefault();
          setEditingRawCell({ row, col });
          setRawCellEditValue(rawGridData[row]?.[col] || '');
        } else if (e.key === 'Delete' || e.key === 'Backspace') {
          e.preventDefault();
          handleRawCellChange(row, col, '');
          setFormulaBarValue('');
        } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
          e.preventDefault();
          setEditingRawCell({ row, col });
          setRawCellEditValue(e.key);
        }
        return;
      }

      // 2. 15-Column Institutional Sheet Mode
      if (!isRawMode && selectedCell) {
        const { rowId, colKey } = selectedCell;
        const currentIdx = displayedTransactions.findIndex(t => t.id === rowId);
        if (currentIdx === -1) return;
        const colIdx = columns.findIndex(c => c.key === colKey);
        if (colIdx === -1) return;

        if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (currentIdx > 0) {
            const nextTx = displayedTransactions[currentIdx - 1];
            const colDef = columns[colIdx];
            setSelectedCell({
              rowId: nextTx.id,
              rowIndex: startIndex + currentIdx - 1,
              colKey,
              colLetter: colDef.letter,
            });
            setFormulaBarValue(String(getCellValue(nextTx, colKey)));
            scrollToCell(`cell-${nextTx.id}-${colKey}`);
          }
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          if (currentIdx < displayedTransactions.length - 1) {
            const nextTx = displayedTransactions[currentIdx + 1];
            const colDef = columns[colIdx];
            setSelectedCell({
              rowId: nextTx.id,
              rowIndex: startIndex + currentIdx + 1,
              colKey,
              colLetter: colDef.letter,
            });
            setFormulaBarValue(String(getCellValue(nextTx, colKey)));
            scrollToCell(`cell-${nextTx.id}-${colKey}`);
          }
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          if (colIdx > 0) {
            const nextCol = columns[colIdx - 1];
            const curTx = displayedTransactions[currentIdx];
            setSelectedCell({
              rowId: curTx.id,
              rowIndex: startIndex + currentIdx,
              colKey: nextCol.key,
              colLetter: nextCol.letter,
            });
            setFormulaBarValue(String(getCellValue(curTx, nextCol.key)));
            scrollToCell(`cell-${curTx.id}-${nextCol.key}`);
          }
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          if (colIdx < columns.length - 1) {
            const nextCol = columns[colIdx + 1];
            const curTx = displayedTransactions[currentIdx];
            setSelectedCell({
              rowId: curTx.id,
              rowIndex: startIndex + currentIdx,
              colKey: nextCol.key,
              colLetter: nextCol.letter,
            });
            setFormulaBarValue(String(getCellValue(curTx, nextCol.key)));
            scrollToCell(`cell-${curTx.id}-${nextCol.key}`);
          }
        } else if (e.key === 'Tab') {
          e.preventDefault();
          if (e.shiftKey) {
            if (colIdx > 0) {
              const nextCol = columns[colIdx - 1];
              const curTx = displayedTransactions[currentIdx];
              setSelectedCell({
                rowId: curTx.id,
                rowIndex: startIndex + currentIdx,
                colKey: nextCol.key,
                colLetter: nextCol.letter,
              });
              setFormulaBarValue(String(getCellValue(curTx, nextCol.key)));
              scrollToCell(`cell-${curTx.id}-${nextCol.key}`);
            } else if (currentIdx > 0) {
              const nextCol = columns[columns.length - 1];
              const prevTx = displayedTransactions[currentIdx - 1];
              setSelectedCell({
                rowId: prevTx.id,
                rowIndex: startIndex + currentIdx - 1,
                colKey: nextCol.key,
                colLetter: nextCol.letter,
              });
              setFormulaBarValue(String(getCellValue(prevTx, nextCol.key)));
              scrollToCell(`cell-${prevTx.id}-${nextCol.key}`);
            }
          } else {
            if (colIdx < columns.length - 1) {
              const nextCol = columns[colIdx + 1];
              const curTx = displayedTransactions[currentIdx];
              setSelectedCell({
                rowId: curTx.id,
                rowIndex: startIndex + currentIdx,
                colKey: nextCol.key,
                colLetter: nextCol.letter,
              });
              setFormulaBarValue(String(getCellValue(curTx, nextCol.key)));
              scrollToCell(`cell-${curTx.id}-${nextCol.key}`);
            } else if (currentIdx < displayedTransactions.length - 1) {
              const nextCol = columns[0];
              const nextTx = displayedTransactions[currentIdx + 1];
              setSelectedCell({
                rowId: nextTx.id,
                rowIndex: startIndex + currentIdx + 1,
                colKey: nextCol.key,
                colLetter: nextCol.letter,
              });
              setFormulaBarValue(String(getCellValue(nextTx, nextCol.key)));
              scrollToCell(`cell-${nextTx.id}-${nextCol.key}`);
            }
          }
        } else if (e.key === 'Enter') {
          e.preventDefault();
          if (e.shiftKey) {
            if (currentIdx > 0) {
              const prevTx = displayedTransactions[currentIdx - 1];
              const colDef = columns[colIdx];
              setSelectedCell({
                rowId: prevTx.id,
                rowIndex: startIndex + currentIdx - 1,
                colKey,
                colLetter: colDef.letter,
              });
              setFormulaBarValue(String(getCellValue(prevTx, colKey)));
              scrollToCell(`cell-${prevTx.id}-${colKey}`);
            }
          } else {
            if (currentIdx < displayedTransactions.length - 1) {
              const nextTx = displayedTransactions[currentIdx + 1];
              const colDef = columns[colIdx];
              setSelectedCell({
                rowId: nextTx.id,
                rowIndex: startIndex + currentIdx + 1,
                colKey,
                colLetter: colDef.letter,
              });
              setFormulaBarValue(String(getCellValue(nextTx, colKey)));
              scrollToCell(`cell-${nextTx.id}-${colKey}`);
            }
          }
        } else if (e.key === 'Home') {
          e.preventDefault();
          const firstCol = columns[0];
          const curTx = displayedTransactions[currentIdx];
          setSelectedCell({
            rowId: curTx.id,
            rowIndex: startIndex + currentIdx,
            colKey: firstCol.key,
            colLetter: firstCol.letter,
          });
          setFormulaBarValue(String(getCellValue(curTx, firstCol.key)));
          scrollToCell(`cell-${curTx.id}-${firstCol.key}`);
        } else if (e.key === 'End') {
          e.preventDefault();
          const lastCol = columns[columns.length - 1];
          const curTx = displayedTransactions[currentIdx];
          setSelectedCell({
            rowId: curTx.id,
            rowIndex: startIndex + currentIdx,
            colKey: lastCol.key,
            colLetter: lastCol.letter,
          });
          setFormulaBarValue(String(getCellValue(curTx, lastCol.key)));
          scrollToCell(`cell-${curTx.id}-${lastCol.key}`);
        } else if (e.key === 'F2') {
          if (colKey !== 'balance' && colKey !== 'amount') {
            e.preventDefault();
            const curTx = displayedTransactions[currentIdx];
            setEditingCell({ rowId, colKey });
            setCellEditValue(String(getCellValue(curTx, colKey)));
          }
        } else if (e.key === 'Delete' || e.key === 'Backspace') {
          if (colKey !== 'balance' && colKey !== 'amount') {
            e.preventDefault();
            if (MONTH_KEYS.includes(colKey as any)) {
              handleCommitEdit(rowId, colKey, '0');
            } else {
              const emptyVal = ['monthlyAmount', 'quarterlyAmount', 'annuallyAmount'].includes(colKey as string) ? 0 : '';
              updateCell(rowId, colKey as keyof Transaction, emptyVal);
              setFormulaBarValue('');
            }
          }
        } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
          if (colKey !== 'balance' && colKey !== 'amount') {
            e.preventDefault();
            setEditingCell({ rowId, colKey });
            setCellEditValue(e.key);
          }
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [
    selectedCell, 
    selectedRawCell, 
    editingCell, 
    editingRawCell, 
    isRawMode, 
    displayedTransactions, 
    rawGridData, 
    columns, 
    displayedRawRowCount, 
    startIndex, 
    isGeminiScannerOpen, 
    isNewSheetModalOpen
  ]);

  // Auto-seed starter rows for template sheets so user has ready rows by default
  useEffect(() => {
    if (!isRawMode && transactions.length === 0) {
      addBlankRow(25);
    }
  }, [isRawMode, transactions.length]);

  // Commit from formula bar
  const handleFormulaBarSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isRawMode) {
      if (!selectedRawCell) return;
      handleRawCellChange(selectedRawCell.row, selectedRawCell.col, formulaBarValue);
    } else {
      if (!selectedCell) return;
      handleCommitEdit(selectedCell.rowId, selectedCell.colKey, formulaBarValue);
    }
  };

  // Handle Excel / CSV File Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const imported = await parseExcelOrCSVFile(file);
      if (imported && imported.length > 0) {
        setTransactions(prev => [...imported, ...prev]);
        alert(`Successfully imported ${imported.length} rows from spreadsheet!`);
      } else {
        alert('No valid data rows found in file.');
      }
    } catch (err) {
      console.error(err);
      alert('Error importing spreadsheet file.');
    }
  };

  // View voucher in studio
  const handleOpenVoucher = (tx: Transaction) => {
    setActiveReceiptTransaction(tx);
    setActiveTab('receipt');
  };

  // Create new sheet tab
  const handleCreateSheetTab = (e: React.FormEvent) => {
    e.preventDefault();
    const city = newSheetCity.trim();
    const tabName = newSheetName.trim() || (city ? `${city} Worksheet` : `Sheet ${sheetTabs.length + 1}`);
    if (newSheetFormat === 'raw') {
      createRawBlankSheet(tabName, city || undefined);
    } else {
      createTemplateSheet(tabName, city || undefined);
    }
    setIsNewSheetModalOpen(false);
    setNewSheetName('');
    setNewSheetCity('');
    setNewSheetCategory('');
  };

  // Create new project
  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newProjectName.trim() || `JIM Punjab Campaign ${newProjectYear}`;
    createProject(name, newProjectYear || '2026', newProjectDesc);
    setIsNewProjectModalOpen(false);
    setNewProjectName('');
    setNewProjectYear('2026');
    setNewProjectDesc('');
  };

  // Batch create and save sheets directly to Neon PostgreSQL database
  const handleBatchSaveToDatabase = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingToDb(true);
    setDbSaveSuccessMsg(null);

    let citiesToUse: string[] = [];
    if (batchAutoCities) {
      citiesToUse = PUNJAB_CITIES_PRESET.slice(0, batchCount);
    } else if (batchCustomCities.trim()) {
      citiesToUse = batchCustomCities
        .split(/[,\n]/)
        .map(c => c.trim())
        .filter(Boolean);
    }

    try {
      const created = await batchCreateAndSaveSheets(
        batchCount,
        citiesToUse,
        batchFormat
      );
      setIsBatchModalOpen(false);
      setDbSaveSuccessMsg(`Successfully created ${created.length} sheets and saved directly to Neon PostgreSQL database!`);
      setTimeout(() => setDbSaveSuccessMsg(null), 5000);
    } catch (err: any) {
      console.error(err);
      alert('Failed to save sheets to database: ' + (err.message || 'Unknown error'));
    } finally {
      setIsSavingToDb(false);
    }
  };

  // Explicitly sync all active sheets to Neon PostgreSQL database
  const handleManualSaveAllToDb = async () => {
    setIsSavingToDb(true);
    const success = await saveAllSheetsToDatabase();
    setIsSavingToDb(false);
    if (success) {
      setDbSaveSuccessMsg(`All ${sheetTabs.length} sheets and configurations saved to Neon PostgreSQL Database!`);
      setTimeout(() => setDbSaveSuccessMsg(null), 4000);
    } else {
      alert('Error saving sheets to database.');
    }
  };

  const currentProject = projects?.find(p => p.id === activeProjectId) || projects?.[0];

  const activeCellCoord = isRawMode
    ? (selectedRawCell ? `${selectedRawCell.col}${selectedRawCell.row}` : 'A1')
    : (selectedCell ? `${selectedCell.colLetter}${selectedCell.rowIndex + 1}` : 'A1');

  return (
    <div className="space-y-4 pb-12">

      {/* SPREADSHEET CARD */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        
        {/* Hidden file input for import */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept=".xlsx,.xls,.csv"
          className="hidden"
        />

        {/* ====================================================================
            CLEAN HEADER: Dashboard Return, Sheet / City Name & Streamlined Actions
            ==================================================================== */}
        <div className="flex flex-wrap items-center justify-between p-3.5 sm:p-4 border-b border-slate-200 dark:border-slate-800 gap-3 bg-slate-50/50 dark:bg-slate-900/50">
          
          {/* Left: Back button + Sheet Title & Inline Rename & Delete */}
          <div className="flex items-center gap-3">
            {!isStandaloneShareView ? (
              <>
                <button
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      window.location.href = '/dashboard';
                    } else {
                      setActiveTab('dashboard');
                    }
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-black text-white dark:bg-slate-100 dark:hover:bg-white dark:text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-xs hover:shadow active:scale-95 cursor-pointer"
                  title="Return to Main Dashboard"
                >
                  <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
                  <span>Dashboard</span>
                </button>
                <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />
              </>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Shared Sheet</span>
              </div>
            )}

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              
              {isEditingSheetName ? (
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    autoFocus
                    value={sheetNameInput}
                    onChange={(e) => setSheetNameInput(e.target.value)}
                    onKeyDown={handleRenameKeyDown}
                    onBlur={handleSaveRename}
                    className="px-2.5 py-1 text-sm font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-800 border-2 border-emerald-500 rounded-lg outline-none shadow-xs w-44 sm:w-56"
                    placeholder="Sheet / City name..."
                  />
                  <button
                    onMouseDown={(e) => { e.preventDefault(); handleSaveRename(); }}
                    className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs"
                    title="Save sheet name"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onMouseDown={(e) => { e.preventDefault(); setIsEditingSheetName(false); }}
                    className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 transition-colors"
                    title="Cancel"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h2 
                    onClick={handleStartRename}
                    className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight cursor-pointer hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1.5 py-0.5 px-1.5 -mx-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 group"
                    title="Click to rename Sheet & City"
                  >
                    <span>{currentSheetTitle}</span>
                    <Pencil className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 text-slate-400 group-hover:text-emerald-600 transition-opacity" />
                  </h2>

                  <button
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to delete sheet "${currentSheetTitle}"?`)) {
                        deleteSheetTab(activeSheetTabId);
                      }
                    }}
                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-md transition-colors"
                    title="Delete this sheet"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full hidden sm:inline-block">
                    {isRawMode ? `${rawRowCount} rows` : `${filteredTransactions.length} records`}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right: Streamlined Action Buttons */}
          <div className="flex items-center gap-2">
            
            {/* + Add Row */}
            <button
              onClick={() => isRawMode ? handleAddRawRows(50) : addBlankRow(1)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs hover:shadow active:scale-95 transition-all cursor-pointer"
              title="Add new row"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add Row</span>
            </button>

            {/* AI Scan Document */}
            <button
              onClick={() => setIsGeminiScannerOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-amber-950 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-400 shadow-xs hover:shadow active:scale-95 transition-all border border-amber-300/80 cursor-pointer"
              title="Scan document or receipt photo with Gemini AI"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-900" />
              <span className="hidden sm:inline">AI Scan</span>
            </button>

            {/* Download Excel */}
            <button
              onClick={() => {
                if (isRawMode) {
                  exportRawGridToExcel(currentSheetTab?.name || `Sheet_${currentSheetNumber}`, rawGridData, rawRowCount, RAW_COLUMNS);
                } else {
                  exportTransactionsToExcel(filteredTransactions, categories, orgConfig, currentSheetTab?.name || `Sheet_${currentSheetNumber}`);
                }
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-emerald-500 hover:text-emerald-600 text-xs font-bold shadow-2xs transition-colors cursor-pointer"
              title="Download as Excel (.xlsx)"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden md:inline">Excel</span>
            </button>

            {/* Print PDF */}
            <button
              onClick={() => {
                if (isRawMode) {
                  printRawGridAsPDF(currentSheetTab?.name || `Sheet ${currentSheetNumber}`, rawGridData, rawRowCount, RAW_COLUMNS, orgConfig);
                } else {
                  printSheetAsPDF(currentSheetTab?.name || `Sheet ${currentSheetNumber}`, filteredTransactions, categories, orgConfig);
                }
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-blue-500 hover:text-blue-600 text-xs font-bold shadow-2xs transition-colors cursor-pointer"
              title="Print PDF"
            >
              <Printer className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden md:inline">Print</span>
            </button>

            {/* Share Sheet */}
            <button
              onClick={handleShareSheet}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all shadow-2xs cursor-pointer ${
                isLinkCopied
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                  : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-indigo-700 dark:text-indigo-300 hover:border-indigo-400'
              }`}
              title="Copy shareable link"
            >
              {isLinkCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span className="hidden sm:inline">Share</span>
                </>
              )}
            </button>

            {/* Overflow '••• More' Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsMoreActionsOpen(!isMoreActionsOpen)}
                className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors shadow-2xs cursor-pointer"
                title="More actions"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>

              {isMoreActionsOpen && (
                <div 
                  className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl py-1.5 z-50 text-xs font-semibold"
                  onMouseLeave={() => setIsMoreActionsOpen(false)}
                >
                  {!isRawMode && (
                    <button
                      onClick={() => {
                        rewriteReceiptNumbersAscending();
                        setIsMoreActionsOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                    >
                      <Hash className="w-4 h-4 text-amber-500" />
                      <span>Renumber Receipts (1, 2, 3...)</span>
                    </button>
                  )}

                    <button
                      onClick={() => {
                        fileInputRef.current?.click();
                        setIsMoreActionsOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                    >
                      <Upload className="w-4 h-4 text-indigo-500" />
                      <span>Import Excel / CSV</span>
                    </button>

                    <div className="my-1 border-t border-slate-100 dark:border-slate-700" />

                    <button
                      onClick={() => {
                        setIsMoreActionsOpen(false);
                        if (window.confirm('Clear all data on this sheet and reset?')) {
                          if (isRawMode) {
                            setRawGridData({});
                            localStorage.removeItem(`jamia_raw_grid_${activeSheetTabId}`);
                          } else {
                            clearAllTransactions();
                          }
                        }
                      }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-left text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Clear Sheet Data</span>
                    </button>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* TEMPLATE FILTER BAR (When in Template Mode) */}
        {!isRawMode && (
          <div className="flex flex-wrap items-center justify-between p-2.5 sm:px-4 bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 gap-2.5 text-xs">
            
            {/* Search Box on Left */}
            <div className="relative flex-1 min-w-[220px] max-w-sm">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute top-2.5 left-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search donor, receipt, remarks..."
                className="w-full py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 pl-8 pr-7"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute top-2 right-2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Slicers on Right */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Type filter */}
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as any)}
                className="py-1.5 px-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold focus:outline-none"
              >
                <option value="all">All Types</option>
                <option value="income">Income Only</option>
                <option value="expense">Expense Only</option>
              </select>

              {/* Accounting Contribution Status */}
              <select
                value={selectedAccountingStatus}
                onChange={(e) => setSelectedAccountingStatus(e.target.value as any)}
                className="py-1.5 px-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="paid">✓ Fully Paid</option>
                <option value="due">⚠️ Balance Due</option>
                <option value="unpaid">✗ Unpaid</option>
              </select>

              {/* Payment Mode */}
              <select
                value={selectedPaymentMode}
                onChange={(e) => setSelectedPaymentMode(e.target.value)}
                className="py-1.5 px-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold focus:outline-none"
              >
                <option value="all">All Modes</option>
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cheque">Cheque</option>
                <option value="Online">Online</option>
              </select>

              {/* Limit & Pagination */}
              <div className="flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1">
                <select
                  value={rowLimit}
                  onChange={(e) => {
                    setRowLimit(e.target.value as any);
                    setCurrentPage(1);
                  }}
                  className="bg-transparent text-slate-700 dark:text-slate-200 text-xs font-bold focus:outline-none cursor-pointer"
                >
                  <option value="25">25 rows</option>
                  <option value="50">50 rows</option>
                  <option value="100">100 rows</option>
                  <option value="250">250 rows</option>
                  <option value="500">500 rows</option>
                  <option value="all">All ({totalTemplateRows})</option>
                </select>

                {rowLimit !== 'all' && totalPages > 1 && (
                  <div className="flex items-center gap-1 pl-1 border-l border-slate-200 dark:border-slate-700">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={safePage <= 1}
                      className="text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:text-emerald-600 font-bold px-0.5 cursor-pointer"
                    >
                      ◀
                    </button>
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      {safePage}/{totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={safePage >= totalPages}
                      className="text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:text-emerald-600 font-bold px-0.5 cursor-pointer"
                    >
                      ▶
                    </button>
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* FORMULA BAR */}
        <div className="flex items-center gap-2 p-2 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-xs font-mono">
          
          {/* Active Cell Name Box (e.g. B4) */}
          <div className="w-16 py-1 px-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-center font-bold text-slate-700 dark:text-slate-300">
            {activeCellCoord}
          </div>

          {/* fx Function Symbol */}
          <div className="text-slate-400 font-bold italic px-1 select-none">
            fx
          </div>

          {/* Live Formula / Value Input */}
          <form onSubmit={handleFormulaBarSubmit} className="flex-1">
            <input
              type="text"
              value={formulaBarValue}
              onChange={(e) => {
                const val = e.target.value;
                setFormulaBarValue(val);
                if (isRawMode && selectedRawCell) {
                  handleRawCellChange(selectedRawCell.row, selectedRawCell.col, val);
                } else if (!isRawMode && selectedCell) {
                  handleCommitEdit(selectedCell.rowId, selectedCell.colKey, val);
                }
              }}
              placeholder={isRawMode ? "Type text, numbers, or formula (=SUM(A1:A10)) into active cell..." : "Type text or value into active cell (live update)..."}
              className="w-full py-1 px-2.5 rounded bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs font-mono"
            />
          </form>

          <span className="text-[11px] text-slate-400 hidden md:inline font-sans font-semibold">
            Double-click any cell to edit inline (Enter moves down, Tab moves right)
          </span>
        </div>

        {/* ========================================================================= */}
        {/* MODE A: RAW GOOGLE SHEET & EXCEL SPREADSHEET GRID (COLUMNS A TO Z, ROWS 1-30+) */}
        {/* ========================================================================= */}
        {isRawMode ? (
          <div className="overflow-x-auto max-h-[620px] bg-white dark:bg-slate-950 select-none">
            <table className="w-full text-left border-collapse font-sans text-xs">
              
              {/* Header: Columns A through Z */}
              <thead className="sticky top-0 z-20 bg-slate-100 dark:bg-slate-800 border-b-2 border-slate-300 dark:border-slate-700">
                <tr>
                  {/* Corner Header */}
                  <th className="w-12 p-2 text-center border-r border-slate-300 dark:border-slate-700 text-slate-500 font-mono text-[11px] bg-slate-200/80 dark:bg-slate-900 sticky left-0 z-30">
                    #
                  </th>

                  {RAW_COLUMNS.map((col) => (
                    <th
                      key={col}
                      className="min-w-[110px] w-28 p-2 text-center border-r border-slate-300 dark:border-slate-700 font-mono font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-700/60 transition-colors"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>

              {/* Rows: 1 through displayedRawRowCount */}
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-mono text-xs">
                {Array.from({ length: displayedRawRowCount }).map((_, rIdx) => {
                  const rowNum = rIdx + 1;
                  return (
                    <tr key={rowNum} className="hover:bg-slate-50 dark:hover:bg-slate-850/50">
                      
                      {/* Sticky Row Number Index */}
                      <td className={`w-12 p-2 text-center font-mono font-bold border-r border-slate-300 dark:border-slate-700 sticky left-0 z-10 transition-colors select-none ${
                        selectedRawCell?.row === rowNum 
                          ? 'bg-emerald-600 text-white font-black shadow-xs' 
                          : 'bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400'
                      }`}>
                        {rowNum}
                      </td>

                      {/* Columns A to Z Cells */}
                      {RAW_COLUMNS.map((col) => {
                        const cellVal = rawGridData[rowNum]?.[col] || '';
                        const isSelected = selectedRawCell?.row === rowNum && selectedRawCell?.col === col;
                        const isEditing = editingRawCell?.row === rowNum && editingRawCell?.col === col;

                        return (
                          <td
                            key={col}
                            id={`raw-cell-${rowNum}-${col}`}
                            onClick={() => {
                              setSelectedRawCell({ row: rowNum, col });
                              setFormulaBarValue(cellVal);
                              setEditingRawCell(null);
                            }}
                            onDoubleClick={() => {
                              setSelectedRawCell({ row: rowNum, col });
                              setEditingRawCell({ row: rowNum, col });
                              setRawCellEditValue(cellVal);
                              setFormulaBarValue(cellVal);
                            }}
                            className={`p-1.5 border-r border-b border-slate-200 dark:border-slate-800 cursor-cell relative min-h-[28px] overflow-hidden truncate max-w-[180px] select-none ${
                              isSelected 
                                ? 'ring-2 ring-emerald-600 dark:ring-emerald-400 bg-emerald-100/50 dark:bg-emerald-950/40 z-10' 
                                : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                            }`}
                          >
                            {isEditing ? (
                              <input
                                type="text"
                                autoFocus
                                value={rawCellEditValue}
                                onChange={(e) => {
                                  setRawCellEditValue(e.target.value);
                                  setFormulaBarValue(e.target.value);
                                }}
                                onBlur={() => {
                                  handleRawCellChange(rowNum, col, rawCellEditValue);
                                  setEditingRawCell(null);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleRawCellChange(rowNum, col, rawCellEditValue);
                                    setEditingRawCell(null);
                                    if (e.shiftKey) {
                                      if (rowNum > 1) {
                                        setSelectedRawCell({ row: rowNum - 1, col });
                                        setFormulaBarValue(rawGridData[rowNum - 1]?.[col] || '');
                                        scrollToCell(`raw-cell-${rowNum - 1}-${col}`);
                                      }
                                    } else {
                                      if (rowNum < displayedRawRowCount) {
                                        setSelectedRawCell({ row: rowNum + 1, col });
                                        setFormulaBarValue(rawGridData[rowNum + 1]?.[col] || '');
                                        scrollToCell(`raw-cell-${rowNum + 1}-${col}`);
                                      }
                                    }
                                  } else if (e.key === 'ArrowUp') {
                                    e.preventDefault();
                                    handleRawCellChange(rowNum, col, rawCellEditValue);
                                    setEditingRawCell(null);
                                    if (rowNum > 1) {
                                      setSelectedRawCell({ row: rowNum - 1, col });
                                      setFormulaBarValue(rawGridData[rowNum - 1]?.[col] || '');
                                      scrollToCell(`raw-cell-${rowNum - 1}-${col}`);
                                    }
                                  } else if (e.key === 'ArrowDown') {
                                    e.preventDefault();
                                    handleRawCellChange(rowNum, col, rawCellEditValue);
                                    setEditingRawCell(null);
                                    if (rowNum < displayedRawRowCount) {
                                      setSelectedRawCell({ row: rowNum + 1, col });
                                      setFormulaBarValue(rawGridData[rowNum + 1]?.[col] || '');
                                      scrollToCell(`raw-cell-${rowNum + 1}-${col}`);
                                    }
                                  } else if (e.key === 'Escape') {
                                    setEditingRawCell(null);
                                  } else if (e.key === 'Tab') {
                                    e.preventDefault();
                                    handleRawCellChange(rowNum, col, rawCellEditValue);
                                    setEditingRawCell(null);
                                    const nextColIdx = RAW_COLUMNS.indexOf(col) + (e.shiftKey ? -1 : 1);
                                    if (nextColIdx >= 0 && nextColIdx < RAW_COLUMNS.length) {
                                      const nextCol = RAW_COLUMNS[nextColIdx];
                                      setSelectedRawCell({ row: rowNum, col: nextCol });
                                      setFormulaBarValue(rawGridData[rowNum]?.[nextCol] || '');
                                      scrollToCell(`raw-cell-${rowNum}-${nextCol}`);
                                    }
                                  }
                                }}
                                className="w-full h-full p-1 bg-white dark:bg-slate-900 border border-emerald-500 rounded text-xs outline-none shadow-xs"
                              />
                            ) : (
                              <span className="block truncate select-text">
                                {cellVal || <span className="text-transparent select-none">-</span>}
                              </span>
                            )}

                            {isSelected && !isEditing && (
                              <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-emerald-600 dark:bg-emerald-400 border border-white dark:border-slate-900 pointer-events-none z-20" />
                            )}
                          </td>
                        );
                      })}

                    </tr>
                  );
                })}
              </tbody>

            </table>

            {/* Google Sheets Clone Style Bottom Row Controls (Raw Mode) */}
            <div className="p-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
              
              {/* Left: Add rows input + presets */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-slate-600 dark:text-slate-300 font-bold">Add rows at bottom:</span>
                <div className="flex items-center border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-800 shadow-2xs">
                  <input
                    type="number"
                    min="1"
                    max="5000"
                    value={rawAddInput}
                    onChange={(e) => setRawAddInput(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-16 p-1.5 text-center font-bold text-slate-900 dark:text-white bg-transparent border-0 focus:outline-none"
                  />
                  <button
                    onClick={() => handleAddRawRows(rawAddInput)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  {[50, 100, 250, 500].map(cnt => (
                    <button
                      key={cnt}
                      onClick={() => handleAddRawRows(cnt)}
                      className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-200 font-bold hover:border-emerald-500 hover:text-emerald-600 transition-colors"
                      title={`Add ${cnt} rows`}
                    >
                      +{cnt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Right: Display Limit Selector & Indicator */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Display Limit:</span>
                  <select
                    value={rawDisplayLimit}
                    onChange={(e) => setRawDisplayLimit(e.target.value as any)}
                    className="py-1 px-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold focus:outline-none"
                  >
                    <option value="50">First 50 rows</option>
                    <option value="100">First 100 rows</option>
                    <option value="250">First 250 rows</option>
                    <option value="500">First 500 rows</option>
                    <option value="all">All ({rawRowCount} rows)</option>
                  </select>
                </div>

                <span className="text-slate-400 font-mono">
                  Showing rows 1 to {displayedRawRowCount} of {rawRowCount} × 26 columns (A-Z)
                </span>
              </div>

            </div>

          </div>
        ) : (
          /* ========================================================================= */
          /* MODE B: 26-COLUMN COMPLETE ACCOUNTING LEDGER (JIM PUNJAB MEMBERSHIP FUND)  */
          /* ========================================================================= */
          <div className="flex flex-col bg-white dark:bg-slate-950">
            {/* Scrollable 26-Column Table */}
            <div className="overflow-x-auto max-h-[680px]">
              <table className="w-full text-left border-collapse font-sans text-xs">
              
              {/* Column Letter & Title Headers */}
              <thead className="sticky top-0 z-20 bg-slate-100 dark:bg-slate-800 border-b-2 border-slate-300 dark:border-slate-700 select-none shadow-xs">
                <tr>
                  {/* Row Number Corner Box (Sticky Left) */}
                  <th rowSpan={2} className="w-12 p-2 text-center border-r border-b border-slate-300 dark:border-slate-700 text-slate-500 font-mono text-[11px] bg-slate-200/90 dark:bg-slate-900 sticky left-0 z-30 align-middle">
                    #
                  </th>

                  {/* Col A: Receipt No */}
                  <th rowSpan={2} className="p-2 border-r border-b border-slate-300 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-200 w-24 hover:bg-slate-200/70 dark:hover:bg-slate-700/60 transition-colors text-center align-middle">
                    <div className="flex flex-col items-center justify-center gap-0.5">
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 font-black text-xs">A</span>
                      <span className="text-[11px] font-sans font-bold text-slate-700 dark:text-slate-200 truncate">Receipt No</span>
                      <span className="text-[9px] text-slate-400">رسید نمبر</span>
                    </div>
                  </th>

                  {/* Col B: Date */}
                  <th rowSpan={2} className="p-2 border-r border-b border-slate-300 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-200 w-24 hover:bg-slate-200/70 dark:hover:bg-slate-700/60 transition-colors text-center align-middle">
                    <div className="flex flex-col items-center justify-center gap-0.5">
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 font-black text-xs">B</span>
                      <span className="text-[11px] font-sans font-bold text-slate-700 dark:text-slate-200 truncate">Date</span>
                      <span className="text-[9px] text-slate-400">تاریخ</span>
                    </div>
                  </th>

                  {/* Col C: Donor Name */}
                  <th rowSpan={2} className="p-2 border-r border-b border-slate-300 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-200 w-44 hover:bg-slate-200/70 dark:hover:bg-slate-700/60 transition-colors text-center align-middle">
                    <div className="flex flex-col items-center justify-center gap-0.5">
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 font-black text-xs">C</span>
                      <span className="text-[11px] font-sans font-bold text-slate-700 dark:text-slate-200 truncate">Donor Name</span>
                      <span className="text-[9px] text-slate-400">نام دہندہ / ممبر</span>
                    </div>
                  </th>

                  {/* Col D: Branch Name */}
                  <th rowSpan={2} className="p-2 border-r border-b border-slate-300 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-200 w-28 hover:bg-slate-200/70 dark:hover:bg-slate-700/60 transition-colors text-center align-middle">
                    <div className="flex flex-col items-center justify-center gap-0.5">
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 font-black text-xs">D</span>
                      <span className="text-[11px] font-sans font-bold text-slate-700 dark:text-slate-200 truncate">Branch</span>
                      <span className="text-[9px] text-slate-400">شاخ / برانچ</span>
                    </div>
                  </th>

                  {/* Col E: Zila */}
                  <th rowSpan={2} className="p-2 border-r border-b border-slate-300 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-200 w-28 hover:bg-slate-200/70 dark:hover:bg-slate-700/60 transition-colors text-center align-middle">
                    <div className="flex flex-col items-center justify-center gap-0.5">
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 font-black text-xs">E</span>
                      <span className="text-[11px] font-sans font-bold text-slate-700 dark:text-slate-200 truncate">Zila</span>
                      <span className="text-[9px] text-slate-400">ضلع</span>
                    </div>
                  </th>

                  {/* Col F: Phone */}
                  <th rowSpan={2} className="p-2 border-r border-b border-slate-300 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-200 w-28 hover:bg-slate-200/70 dark:hover:bg-slate-700/60 transition-colors text-center align-middle">
                    <div className="flex flex-col items-center justify-center gap-0.5">
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 font-black text-xs">F</span>
                      <span className="text-[11px] font-sans font-bold text-slate-700 dark:text-slate-200 truncate">Phone</span>
                      <span className="text-[9px] text-slate-400">فون نمبر</span>
                    </div>
                  </th>

                  {/* Multi-Tier Group Header: Pledged Commitments (Spans 3 cols: G, H, I) */}
                  <th colSpan={3} className="p-1.5 border-r border-b border-slate-300 dark:border-slate-700 font-extrabold text-center bg-gradient-to-r from-blue-100/90 via-indigo-100/90 to-blue-100/90 dark:from-blue-950/80 dark:via-indigo-950/80 dark:to-blue-950/80 text-blue-900 dark:text-blue-200">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-[11px] uppercase tracking-wider font-black">Pledged Target</span>
                      <span className="text-[9px] px-2 py-0.2 rounded-full bg-blue-600 text-white font-bold">معینہ ہدف</span>
                    </div>
                  </th>

                  {/* Multi-Tier Group Header: 2026 Monthly Breakdown (Spans 12 cols: J through U) */}
                  <th colSpan={12} className="p-1.5 border-r border-b border-slate-300 dark:border-slate-700 font-extrabold text-center bg-gradient-to-r from-emerald-100/90 via-teal-100/90 to-emerald-100/90 dark:from-emerald-950/80 dark:via-teal-950/80 dark:to-emerald-950/80 text-emerald-900 dark:text-emerald-200">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-[11px] uppercase tracking-wider font-black">2026 Monthly Contributions</span>
                      <span className="text-[9px] px-2 py-0.2 rounded-full bg-emerald-600 text-white font-bold">ماہانہ وصولیاں برائے 2026</span>
                    </div>
                  </th>

                  {/* Col V: Total Paid */}
                  <th rowSpan={2} className="p-2 border-r border-b border-slate-300 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-200 w-28 hover:bg-slate-200/70 dark:hover:bg-slate-700/60 transition-colors text-center align-middle">
                    <div className="flex flex-col items-center justify-center gap-0.5">
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 font-black text-xs">V</span>
                      <span className="text-[11px] font-sans font-bold text-slate-700 dark:text-slate-200 truncate">Total Paid</span>
                      <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold">کل وصولی</span>
                    </div>
                  </th>

                  {/* Col W: Balance Due */}
                  <th rowSpan={2} className="p-2 border-r border-b border-slate-300 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-200 w-28 hover:bg-slate-200/70 dark:hover:bg-slate-700/60 transition-colors text-center align-middle">
                    <div className="flex flex-col items-center justify-center gap-0.5">
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 font-black text-xs">W</span>
                      <span className="text-[11px] font-sans font-bold text-slate-700 dark:text-slate-200 truncate">Balance Due</span>
                      <span className="text-[9px] text-amber-600 dark:text-amber-400 font-bold">واجب الادا</span>
                    </div>
                  </th>

                  {/* Col X: Payment Mode */}
                  <th rowSpan={2} className="p-2 border-r border-b border-slate-300 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-200 w-24 hover:bg-slate-200/70 dark:hover:bg-slate-700/60 transition-colors text-center align-middle">
                    <div className="flex flex-col items-center justify-center gap-0.5">
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 font-black text-xs">X</span>
                      <span className="text-[11px] font-sans font-bold text-slate-700 dark:text-slate-200 truncate">Mode</span>
                      <span className="text-[9px] text-slate-400">ادائیگی</span>
                    </div>
                  </th>

                  {/* Col Y: Bank Name */}
                  <th rowSpan={2} className="p-2 border-r border-b border-slate-300 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-200 w-32 hover:bg-slate-200/70 dark:hover:bg-slate-700/60 transition-colors text-center align-middle">
                    <div className="flex flex-col items-center justify-center gap-0.5">
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 font-black text-xs">Y</span>
                      <span className="text-[11px] font-sans font-bold text-slate-700 dark:text-slate-200 truncate">Bank Name</span>
                      <span className="text-[9px] text-slate-400">بینک کا نام</span>
                    </div>
                  </th>

                  {/* Col Z: Remarks */}
                  <th rowSpan={2} className="p-2 border-r border-b border-slate-300 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-200 w-36 hover:bg-slate-200/70 dark:hover:bg-slate-700/60 transition-colors text-center align-middle">
                    <div className="flex flex-col items-center justify-center gap-0.5">
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 font-black text-xs">Z</span>
                      <span className="text-[11px] font-sans font-bold text-slate-700 dark:text-slate-200 truncate">Remarks</span>
                      <span className="text-[9px] text-slate-400">کیفیات</span>
                    </div>
                  </th>

                  {/* Actions Header */}
                  <th rowSpan={2} className="w-28 p-2 text-center font-bold text-slate-700 dark:text-slate-200 text-xs border-b border-slate-300 dark:border-slate-700 align-middle">
                    Actions
                  </th>
                </tr>

                {/* Subheaders Row: G, H, I (Targets) and J to U (12 Months) */}
                <tr className="bg-slate-50 dark:bg-slate-850">
                  {/* Col G: Monthly */}
                  <th className="p-1 border-r border-b border-slate-300 dark:border-slate-700 text-center w-24 bg-blue-50/50 dark:bg-blue-950/30">
                    <div className="flex flex-col items-center justify-center">
                      <span className="font-mono text-blue-700 dark:text-blue-400 font-black text-[10px]">G</span>
                      <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200">Monthly</span>
                      <span className="text-[8px] text-slate-500">ماہانہ</span>
                    </div>
                  </th>

                  {/* Col H: Quarterly */}
                  <th className="p-1 border-r border-b border-slate-300 dark:border-slate-700 text-center w-24 bg-blue-50/50 dark:bg-blue-950/30">
                    <div className="flex flex-col items-center justify-center">
                      <span className="font-mono text-blue-700 dark:text-blue-400 font-black text-[10px]">H</span>
                      <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200">Quarterly</span>
                      <span className="text-[8px] text-slate-500">سہ ماہی</span>
                    </div>
                  </th>

                  {/* Col I: Annually */}
                  <th className="p-1 border-r border-b border-slate-300 dark:border-slate-700 text-center w-24 bg-blue-50/50 dark:bg-blue-950/30">
                    <div className="flex flex-col items-center justify-center">
                      <span className="font-mono text-blue-700 dark:text-blue-400 font-black text-[10px]">I</span>
                      <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200">Annually</span>
                      <span className="text-[8px] text-slate-500">سالانہ</span>
                    </div>
                  </th>

                  {/* Cols J through U: 12 Months */}
                  {MONTH_KEYS.map((mKey, mIdx) => {
                    const letter = String.fromCharCode(74 + mIdx); // 74 is 'J'
                    const mLabel = MONTH_LABELS[mKey];
                    const isFocused = focusedMonth === mKey;
                    return (
                      <th
                        key={mKey}
                        className={`p-1 border-r border-b border-slate-300 dark:border-slate-700 text-center w-20 transition-colors ${
                          isFocused 
                            ? 'bg-emerald-200 dark:bg-emerald-900/60 font-black text-emerald-900 dark:text-white' 
                            : 'bg-emerald-50/40 dark:bg-emerald-950/20 hover:bg-emerald-100/50'
                        }`}
                      >
                        <div className="flex flex-col items-center justify-center">
                          <span className="font-mono text-emerald-700 dark:text-emerald-400 font-black text-[10px]">{letter}</span>
                          <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200">{mLabel.en}</span>
                          <span className="text-[8px] text-slate-500">{mLabel.ur}</span>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>

              {/* Spreadsheet Rows */}
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {displayedTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={28} className="py-16 px-4 text-center">
                      <div className="max-w-md mx-auto space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
                          <FileSpreadsheet className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-700 dark:text-slate-200 text-sm">
                            {currentSheetTab?.name || 'Sheet'} is currently empty
                          </h4>
                          <p className="text-xs text-slate-400 mt-1">
                            No member records found matching the active filters. Add blank rows or import donor records.
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                          <button
                            onClick={() => addBlankRow(25)}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>+ Add 25 Blank Rows</span>
                          </button>
                          <button
                            onClick={() => addBlankRow(100)}
                            className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>+ Add 100 Blank Rows</span>
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  displayedTransactions.map((tx, idx) => {
                    const rowIndex = startIndex + idx;
                    const isRowSelected = selectedCell?.rowId === tx.id;

                    // Computed Target, Paid, and Balance for this row
                    const annualTarget = (tx.annuallyAmount && tx.annuallyAmount > 0)
                      ? tx.annuallyAmount
                      : ((tx.quarterlyAmount && tx.quarterlyAmount > 0)
                          ? tx.quarterlyAmount * 4
                          : ((tx.monthlyAmount && tx.monthlyAmount > 0) ? tx.monthlyAmount * 12 : tx.amount));
                    
                    const months = tx.monthsData || {};
                    const totalRowPaid = Object.values(months).length > 0
                      ? Object.values(months).reduce((s: number, v: any) => s + (Number(v) || 0), 0)
                      : Number(tx.amount || 0);

                    const balanceDue = Math.max(0, (annualTarget || 0) - totalRowPaid);
                    const isFullyPaid = (annualTarget > 0 && totalRowPaid >= annualTarget) || (annualTarget === 0 && totalRowPaid > 0);

                    return (
                      <tr 
                        key={tx.id}
                        className={`hover:bg-blue-50/50 dark:hover:bg-slate-800/50 transition-colors group ${
                          isRowSelected ? 'bg-blue-50/30 dark:bg-slate-800/30' : ''
                        }`}
                      >
                        {/* Row Number (1, 2, 3...) Sticky Left */}
                        <td className={`w-12 p-2 text-center font-mono font-bold border-r border-slate-300 dark:border-slate-700 sticky left-0 z-10 select-none transition-colors ${
                          selectedCell?.rowId === tx.id 
                            ? 'bg-emerald-600 text-white font-black shadow-xs' 
                            : 'bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400'
                        }`}>
                          {rowIndex + 1}
                        </td>

                        {/* Column A: Receipt No */}
                        <td 
                          id={`cell-${tx.id}-receiptNo`}
                          onClick={() => handleCellClick(tx.id, rowIndex, 'receiptNo', 'A')}
                          onDoubleClick={() => handleCellDoubleClick(tx.id, 'receiptNo')}
                          className={`p-2 border-r border-slate-200 dark:border-slate-800 font-mono font-bold text-blue-600 dark:text-blue-400 cursor-cell relative select-none ${
                            selectedCell?.rowId === tx.id && selectedCell.colKey === 'receiptNo' ? 'ring-2 ring-emerald-600 dark:ring-emerald-400 bg-emerald-100/50 dark:bg-emerald-950/40 z-10' : ''
                          }`}
                        >
                          {editingCell?.rowId === tx.id && editingCell.colKey === 'receiptNo' ? (
                            <input
                              type="text"
                              autoFocus
                              value={cellEditValue}
                              onChange={(e) => setCellEditValue(e.target.value)}
                              onBlur={() => handleCommitEdit(tx.id, 'receiptNo', cellEditValue)}
                              onKeyDown={(e) => handleTemplateCellKeyDown(e, tx.id, 'receiptNo', idx, cellEditValue)}
                              className="w-full p-1 bg-white dark:bg-slate-900 border border-emerald-500 rounded text-xs"
                            />
                          ) : (
                            <div className="flex items-center justify-between gap-1">
                              <span className="truncate">{tx.receiptNo}</span>
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleOpenVoucher(tx); }}
                                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-blue-100 dark:hover:bg-slate-700 text-slate-500"
                                title="Open Voucher"
                              >
                                <Receipt className="w-3 h-3 text-blue-500" />
                              </button>
                            </div>
                          )}
                          {selectedCell?.rowId === tx.id && selectedCell.colKey === 'receiptNo' && !editingCell && (
                            <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-emerald-600 dark:bg-emerald-400 border border-white dark:border-slate-900 pointer-events-none z-20" />
                          )}
                        </td>

                        {/* Column B: Date */}
                        <td 
                          id={`cell-${tx.id}-date`}
                          onClick={() => handleCellClick(tx.id, rowIndex, 'date', 'B')}
                          onDoubleClick={() => handleCellDoubleClick(tx.id, 'date')}
                          className={`p-2 border-r border-slate-200 dark:border-slate-800 font-mono text-center cursor-cell relative select-none ${
                            selectedCell?.rowId === tx.id && selectedCell.colKey === 'date' ? 'ring-2 ring-emerald-600 dark:ring-emerald-400 bg-emerald-100/50 dark:bg-emerald-950/40 z-10' : ''
                          }`}
                        >
                          {editingCell?.rowId === tx.id && editingCell.colKey === 'date' ? (
                            <input
                              type="date"
                              autoFocus
                              value={cellEditValue}
                              onChange={(e) => setCellEditValue(e.target.value)}
                              onBlur={() => handleCommitEdit(tx.id, 'date', cellEditValue)}
                              onKeyDown={(e) => handleTemplateCellKeyDown(e, tx.id, 'date', idx, cellEditValue)}
                              className="w-full p-1 bg-white dark:bg-slate-900 border border-emerald-500 rounded text-xs"
                            />
                          ) : (
                            tx.date
                          )}
                          {selectedCell?.rowId === tx.id && selectedCell.colKey === 'date' && !editingCell && (
                            <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-emerald-600 dark:bg-emerald-400 border border-white dark:border-slate-900 pointer-events-none z-20" />
                          )}
                        </td>

                        {/* Column C: Donor Name */}
                        <td 
                          id={`cell-${tx.id}-donorName`}
                          onClick={() => handleCellClick(tx.id, rowIndex, 'donorName', 'C')}
                          onDoubleClick={() => handleCellDoubleClick(tx.id, 'donorName')}
                          className={`p-2 border-r border-slate-200 dark:border-slate-800 cursor-cell relative select-none ${
                            selectedCell?.rowId === tx.id && selectedCell.colKey === 'donorName' ? 'ring-2 ring-emerald-600 dark:ring-emerald-400 bg-emerald-100/50 dark:bg-emerald-950/40 z-10' : ''
                          }`}
                        >
                          {editingCell?.rowId === tx.id && editingCell.colKey === 'donorName' ? (
                            <input
                              type="text"
                              autoFocus
                              value={cellEditValue}
                              onChange={(e) => setCellEditValue(e.target.value)}
                              onBlur={() => handleCommitEdit(tx.id, 'donorName', cellEditValue)}
                              onKeyDown={(e) => handleTemplateCellKeyDown(e, tx.id, 'donorName', idx, cellEditValue)}
                              className="w-full p-1 bg-white dark:bg-slate-900 border border-emerald-500 rounded text-xs"
                            />
                          ) : (
                            <span className="font-semibold text-slate-800 dark:text-slate-100">
                              {tx.donorName || tx.donorNameUrdu || '---'}
                            </span>
                          )}
                          {selectedCell?.rowId === tx.id && selectedCell.colKey === 'donorName' && !editingCell && (
                            <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-emerald-600 dark:bg-emerald-400 border border-white dark:border-slate-900 pointer-events-none z-20" />
                          )}
                        </td>

                        {/* Column D: Branch Name */}
                        <td 
                          id={`cell-${tx.id}-branchName`}
                          onClick={() => handleCellClick(tx.id, rowIndex, 'branchName', 'D')}
                          onDoubleClick={() => handleCellDoubleClick(tx.id, 'branchName')}
                          className={`p-2 border-r border-slate-200 dark:border-slate-800 cursor-cell relative select-none ${
                            selectedCell?.rowId === tx.id && selectedCell.colKey === 'branchName' ? 'ring-2 ring-emerald-600 dark:ring-emerald-400 bg-emerald-100/50 dark:bg-emerald-950/40 z-10' : ''
                          }`}
                        >
                          {editingCell?.rowId === tx.id && editingCell.colKey === 'branchName' ? (
                            <input
                              type="text"
                              autoFocus
                              value={cellEditValue}
                              onChange={(e) => setCellEditValue(e.target.value)}
                              onBlur={() => handleCommitEdit(tx.id, 'branchName', cellEditValue)}
                              onKeyDown={(e) => handleTemplateCellKeyDown(e, tx.id, 'branchName', idx, cellEditValue)}
                              className="w-full p-1 bg-white dark:bg-slate-900 border border-emerald-500 rounded text-xs"
                            />
                          ) : (
                            <span className="text-slate-600 dark:text-slate-300 truncate block">{tx.branchName || '---'}</span>
                          )}
                          {selectedCell?.rowId === tx.id && selectedCell.colKey === 'branchName' && !editingCell && (
                            <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-emerald-600 dark:bg-emerald-400 border border-white dark:border-slate-900 pointer-events-none z-20" />
                          )}
                        </td>

                        {/* Column E: Zila / District */}
                        <td 
                          id={`cell-${tx.id}-zila`}
                          onClick={() => handleCellClick(tx.id, rowIndex, 'zila', 'E')}
                          onDoubleClick={() => handleCellDoubleClick(tx.id, 'zila')}
                          className={`p-2 border-r border-slate-200 dark:border-slate-800 cursor-cell relative select-none ${
                            selectedCell?.rowId === tx.id && selectedCell.colKey === 'zila' ? 'ring-2 ring-emerald-600 dark:ring-emerald-400 bg-emerald-100/50 dark:bg-emerald-950/40 z-10' : ''
                          }`}
                        >
                          {editingCell?.rowId === tx.id && editingCell.colKey === 'zila' ? (
                            <input
                              type="text"
                              autoFocus
                              value={cellEditValue}
                              onChange={(e) => setCellEditValue(e.target.value)}
                              onBlur={() => handleCommitEdit(tx.id, 'zila', cellEditValue)}
                              onKeyDown={(e) => handleTemplateCellKeyDown(e, tx.id, 'zila', idx, cellEditValue)}
                              className="w-full p-1 bg-white dark:bg-slate-900 border border-emerald-500 rounded text-xs"
                            />
                          ) : (
                            <span className="text-slate-700 dark:text-slate-300 truncate block">{tx.zila || tx.city || '---'}</span>
                          )}
                          {selectedCell?.rowId === tx.id && selectedCell.colKey === 'zila' && !editingCell && (
                            <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-emerald-600 dark:bg-emerald-400 border border-white dark:border-slate-900 pointer-events-none z-20" />
                          )}
                        </td>

                        {/* Column F: Phone */}
                        <td 
                          id={`cell-${tx.id}-phone`}
                          onClick={() => handleCellClick(tx.id, rowIndex, 'phone', 'F')}
                          onDoubleClick={() => handleCellDoubleClick(tx.id, 'phone')}
                          className={`p-2 border-r border-slate-200 dark:border-slate-800 font-mono cursor-cell relative select-none ${
                            selectedCell?.rowId === tx.id && selectedCell.colKey === 'phone' ? 'ring-2 ring-emerald-600 dark:ring-emerald-400 bg-emerald-100/50 dark:bg-emerald-950/40 z-10' : ''
                          }`}
                        >
                          {editingCell?.rowId === tx.id && editingCell.colKey === 'phone' ? (
                            <input
                              type="tel"
                              autoFocus
                              value={cellEditValue}
                              onChange={(e) => setCellEditValue(e.target.value)}
                              onBlur={() => handleCommitEdit(tx.id, 'phone', cellEditValue)}
                              onKeyDown={(e) => handleTemplateCellKeyDown(e, tx.id, 'phone', idx, cellEditValue)}
                              className="w-full p-1 bg-white dark:bg-slate-900 border border-emerald-500 rounded text-xs font-mono"
                            />
                          ) : (
                            tx.phone || '---'
                          )}
                          {selectedCell?.rowId === tx.id && selectedCell.colKey === 'phone' && !editingCell && (
                            <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-emerald-600 dark:bg-emerald-400 border border-white dark:border-slate-900 pointer-events-none z-20" />
                          )}
                        </td>

                        {/* Column G: Monthly Pledged */}
                        <td 
                          id={`cell-${tx.id}-monthlyAmount`}
                          onClick={() => handleCellClick(tx.id, rowIndex, 'monthlyAmount', 'G')}
                          onDoubleClick={() => handleCellDoubleClick(tx.id, 'monthlyAmount')}
                          className={`p-2 border-r border-slate-200 dark:border-slate-800 text-right font-mono cursor-cell relative select-none bg-blue-50/20 dark:bg-blue-950/10 ${
                            selectedCell?.rowId === tx.id && selectedCell.colKey === 'monthlyAmount' ? 'ring-2 ring-emerald-600 dark:ring-emerald-400 bg-emerald-100/50 dark:bg-emerald-950/40 z-10' : ''
                          }`}
                        >
                          {editingCell?.rowId === tx.id && editingCell.colKey === 'monthlyAmount' ? (
                            <input
                              type="number"
                              autoFocus
                              value={cellEditValue}
                              onChange={(e) => setCellEditValue(e.target.value)}
                              onBlur={() => handleCommitEdit(tx.id, 'monthlyAmount', cellEditValue)}
                              onKeyDown={(e) => handleTemplateCellKeyDown(e, tx.id, 'monthlyAmount', idx, cellEditValue)}
                              className="w-full p-1 bg-white dark:bg-slate-900 border border-emerald-500 rounded text-xs text-right font-mono"
                            />
                          ) : (
                            <span className="font-semibold text-blue-700 dark:text-blue-400">
                              {tx.monthlyAmount && tx.monthlyAmount > 0 ? Number(tx.monthlyAmount).toLocaleString() : '—'}
                            </span>
                          )}
                          {selectedCell?.rowId === tx.id && selectedCell.colKey === 'monthlyAmount' && !editingCell && (
                            <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-emerald-600 dark:bg-emerald-400 border border-white dark:border-slate-900 pointer-events-none z-20" />
                          )}
                        </td>

                        {/* Column H: Quarterly Pledged */}
                        <td 
                          id={`cell-${tx.id}-quarterlyAmount`}
                          onClick={() => handleCellClick(tx.id, rowIndex, 'quarterlyAmount', 'H')}
                          onDoubleClick={() => handleCellDoubleClick(tx.id, 'quarterlyAmount')}
                          className={`p-2 border-r border-slate-200 dark:border-slate-800 text-right font-mono cursor-cell relative select-none bg-blue-50/20 dark:bg-blue-950/10 ${
                            selectedCell?.rowId === tx.id && selectedCell.colKey === 'quarterlyAmount' ? 'ring-2 ring-emerald-600 dark:ring-emerald-400 bg-emerald-100/50 dark:bg-emerald-950/40 z-10' : ''
                          }`}
                        >
                          {editingCell?.rowId === tx.id && editingCell.colKey === 'quarterlyAmount' ? (
                            <input
                              type="number"
                              autoFocus
                              value={cellEditValue}
                              onChange={(e) => setCellEditValue(e.target.value)}
                              onBlur={() => handleCommitEdit(tx.id, 'quarterlyAmount', cellEditValue)}
                              onKeyDown={(e) => handleTemplateCellKeyDown(e, tx.id, 'quarterlyAmount', idx, cellEditValue)}
                              className="w-full p-1 bg-white dark:bg-slate-900 border border-emerald-500 rounded text-xs text-right font-mono"
                            />
                          ) : (
                            <span className="font-semibold text-indigo-700 dark:text-indigo-400">
                              {tx.quarterlyAmount && tx.quarterlyAmount > 0 ? Number(tx.quarterlyAmount).toLocaleString() : '—'}
                            </span>
                          )}
                          {selectedCell?.rowId === tx.id && selectedCell.colKey === 'quarterlyAmount' && !editingCell && (
                            <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-emerald-600 dark:bg-emerald-400 border border-white dark:border-slate-900 pointer-events-none z-20" />
                          )}
                        </td>

                        {/* Column I: Annually Pledged */}
                        <td 
                          id={`cell-${tx.id}-annuallyAmount`}
                          onClick={() => handleCellClick(tx.id, rowIndex, 'annuallyAmount', 'I')}
                          onDoubleClick={() => handleCellDoubleClick(tx.id, 'annuallyAmount')}
                          className={`p-2 border-r border-slate-200 dark:border-slate-800 text-right font-mono cursor-cell relative select-none bg-blue-50/20 dark:bg-blue-950/10 ${
                            selectedCell?.rowId === tx.id && selectedCell.colKey === 'annuallyAmount' ? 'ring-2 ring-emerald-600 dark:ring-emerald-400 bg-emerald-100/50 dark:bg-emerald-950/40 z-10' : ''
                          }`}
                        >
                          {editingCell?.rowId === tx.id && editingCell.colKey === 'annuallyAmount' ? (
                            <input
                              type="number"
                              autoFocus
                              value={cellEditValue}
                              onChange={(e) => setCellEditValue(e.target.value)}
                              onBlur={() => handleCommitEdit(tx.id, 'annuallyAmount', cellEditValue)}
                              onKeyDown={(e) => handleTemplateCellKeyDown(e, tx.id, 'annuallyAmount', idx, cellEditValue)}
                              className="w-full p-1 bg-white dark:bg-slate-900 border border-emerald-500 rounded text-xs text-right font-mono"
                            />
                          ) : (
                            <span className="font-bold text-slate-900 dark:text-white">
                              {tx.annuallyAmount && tx.annuallyAmount > 0 ? Number(tx.annuallyAmount).toLocaleString() : '—'}
                            </span>
                          )}
                          {selectedCell?.rowId === tx.id && selectedCell.colKey === 'annuallyAmount' && !editingCell && (
                            <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-emerald-600 dark:bg-emerald-400 border border-white dark:border-slate-900 pointer-events-none z-20" />
                          )}
                        </td>

                        {/* Columns J through U: 12 Months Breakdown */}
                        {MONTH_KEYS.map((mKey, mIdx) => {
                          const letter = String.fromCharCode(74 + mIdx); // 'J' to 'U'
                          const mVal = tx.monthsData?.[mKey] || 0;
                          const isFocused = focusedMonth === mKey;
                          const isCellEditing = editingCell?.rowId === tx.id && editingCell.colKey === mKey;
                          const isCellSelected = selectedCell?.rowId === tx.id && selectedCell.colKey === mKey;

                          return (
                            <td
                              key={mKey}
                              id={`cell-${tx.id}-${mKey}`}
                              onClick={() => handleCellClick(tx.id, rowIndex, mKey as any, letter)}
                              onDoubleClick={() => handleCellDoubleClick(tx.id, mKey as any)}
                              className={`p-2 border-r border-slate-200 dark:border-slate-800 text-right font-mono cursor-cell relative select-none transition-colors ${
                                isFocused ? 'bg-emerald-100/60 dark:bg-emerald-950/40' : ''
                              } ${
                                isCellSelected ? 'ring-2 ring-emerald-600 dark:ring-emerald-400 bg-emerald-100/50 dark:bg-emerald-950/40 z-10' : ''
                              }`}
                            >
                              {isCellEditing ? (
                                <input
                                  type="number"
                                  autoFocus
                                  value={cellEditValue}
                                  onChange={(e) => setCellEditValue(e.target.value)}
                                  onBlur={() => handleCommitEdit(tx.id, mKey as any, cellEditValue)}
                                  onKeyDown={(e) => handleTemplateCellKeyDown(e, tx.id, mKey as any, idx, cellEditValue)}
                                  className="w-full p-1 bg-white dark:bg-slate-900 border border-emerald-500 rounded text-xs text-right font-mono"
                                />
                              ) : (
                                <span className={mVal > 0 ? 'font-bold text-emerald-600 dark:text-emerald-400' : 'text-slate-300 dark:text-slate-600'}>
                                  {mVal > 0 ? Number(mVal).toLocaleString() : '—'}
                                </span>
                              )}
                              {isCellSelected && !isCellEditing && (
                                <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-emerald-600 dark:bg-emerald-400 border border-white dark:border-slate-900 pointer-events-none z-20" />
                              )}
                            </td>
                          );
                        })}

                        {/* Column V: Total Paid (Calculated) */}
                        <td 
                          id={`cell-${tx.id}-amount`}
                          onClick={() => handleCellClick(tx.id, rowIndex, 'amount', 'V')}
                          className={`p-2 border-r border-slate-200 dark:border-slate-800 text-right font-mono font-bold cursor-cell relative select-none bg-emerald-50/30 dark:bg-emerald-950/10 ${
                            selectedCell?.rowId === tx.id && selectedCell.colKey === 'amount' ? 'ring-2 ring-emerald-600 dark:ring-emerald-400 bg-emerald-100/50 dark:bg-emerald-950/40 z-10' : ''
                          }`}
                        >
                          <span className="text-emerald-600 dark:text-emerald-400 font-black">
                            ₨ {Number(totalRowPaid).toLocaleString()}
                          </span>
                          {selectedCell?.rowId === tx.id && selectedCell.colKey === 'amount' && (
                            <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-emerald-600 dark:bg-emerald-400 border border-white dark:border-slate-900 pointer-events-none z-20" />
                          )}
                        </td>

                        {/* Column W: Balance Due (Calculated) */}
                        <td 
                          id={`cell-${tx.id}-balance`}
                          onClick={() => handleCellClick(tx.id, rowIndex, 'balance', 'W')}
                          className={`p-2 border-r border-slate-200 dark:border-slate-800 text-right font-mono font-bold cursor-cell relative select-none ${
                            selectedCell?.rowId === tx.id && selectedCell.colKey === 'balance' ? 'ring-2 ring-emerald-600 dark:ring-emerald-400 bg-emerald-100/50 dark:bg-emerald-950/40 z-10' : ''
                          }`}
                        >
                          {balanceDue <= 0 && isFullyPaid ? (
                            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-black">
                              ✓ Paid
                            </span>
                          ) : (
                            <span className="text-amber-600 dark:text-amber-400 font-black">
                              ₨ {Number(balanceDue).toLocaleString()}
                            </span>
                          )}
                          {selectedCell?.rowId === tx.id && selectedCell.colKey === 'balance' && (
                            <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-emerald-600 dark:bg-emerald-400 border border-white dark:border-slate-900 pointer-events-none z-20" />
                          )}
                        </td>

                        {/* Column X: Payment Mode */}
                        <td 
                          id={`cell-${tx.id}-paymentMode`}
                          onClick={() => handleCellClick(tx.id, rowIndex, 'paymentMode', 'X')}
                          className={`p-2 border-r border-slate-200 dark:border-slate-800 text-center relative select-none ${
                            selectedCell?.rowId === tx.id && selectedCell.colKey === 'paymentMode' ? 'ring-2 ring-emerald-600 dark:ring-emerald-400 bg-emerald-100/50 dark:bg-emerald-950/40 z-10' : ''
                          }`}
                        >
                          <select
                            value={tx.paymentMode || 'Cash'}
                            onChange={(e) => updateCell(tx.id, 'paymentMode', e.target.value as any)}
                            className="w-full bg-transparent border-0 text-xs font-semibold focus:outline-none cursor-pointer text-center"
                          >
                            <option value="Cash">Cash</option>
                            <option value="Online">Online Transfer</option>
                            <option value="Cheque">Cheque</option>
                            <option value="DD">Demand Draft (DD)</option>
                          </select>
                          {selectedCell?.rowId === tx.id && selectedCell.colKey === 'paymentMode' && !editingCell && (
                            <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-emerald-600 dark:bg-emerald-400 border border-white dark:border-slate-900 pointer-events-none z-20" />
                          )}
                        </td>

                        {/* Column Y: Bank Name */}
                        <td 
                          id={`cell-${tx.id}-bankName`}
                          onClick={() => handleCellClick(tx.id, rowIndex, 'bankName', 'Y')}
                          onDoubleClick={() => handleCellDoubleClick(tx.id, 'bankName')}
                          className={`p-2 border-r border-slate-200 dark:border-slate-800 cursor-cell relative select-none ${
                            selectedCell?.rowId === tx.id && selectedCell.colKey === 'bankName' ? 'ring-2 ring-emerald-600 dark:ring-emerald-400 bg-emerald-100/50 dark:bg-emerald-950/40 z-10' : ''
                          }`}
                        >
                          {editingCell?.rowId === tx.id && editingCell.colKey === 'bankName' ? (
                            <input
                              type="text"
                              autoFocus
                              value={cellEditValue}
                              onChange={(e) => setCellEditValue(e.target.value)}
                              onBlur={() => handleCommitEdit(tx.id, 'bankName', cellEditValue)}
                              onKeyDown={(e) => handleTemplateCellKeyDown(e, tx.id, 'bankName', idx, cellEditValue)}
                              className="w-full p-1 bg-white dark:bg-slate-900 border border-emerald-500 rounded text-xs"
                            />
                          ) : (
                            tx.bankName || '---'
                          )}
                          {selectedCell?.rowId === tx.id && selectedCell.colKey === 'bankName' && !editingCell && (
                            <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-emerald-600 dark:bg-emerald-400 border border-white dark:border-slate-900 pointer-events-none z-20" />
                          )}
                        </td>

                        {/* Column Z: Remarks / Notes */}
                        <td 
                          id={`cell-${tx.id}-notes`}
                          onClick={() => handleCellClick(tx.id, rowIndex, 'notes', 'Z')}
                          onDoubleClick={() => handleCellDoubleClick(tx.id, 'notes')}
                          className={`p-2 border-r border-slate-200 dark:border-slate-800 cursor-cell relative select-none ${
                            selectedCell?.rowId === tx.id && selectedCell.colKey === 'notes' ? 'ring-2 ring-emerald-600 dark:ring-emerald-400 bg-emerald-100/50 dark:bg-emerald-950/40 z-10' : ''
                          }`}
                        >
                          {editingCell?.rowId === tx.id && editingCell.colKey === 'notes' ? (
                            <input
                              type="text"
                              autoFocus
                              value={cellEditValue}
                              onChange={(e) => setCellEditValue(e.target.value)}
                              onBlur={() => handleCommitEdit(tx.id, 'notes', cellEditValue)}
                              onKeyDown={(e) => handleTemplateCellKeyDown(e, tx.id, 'notes', idx, cellEditValue)}
                              className="w-full p-1 bg-white dark:bg-slate-900 border border-emerald-500 rounded text-xs"
                            />
                          ) : (
                            <span className="text-slate-500 dark:text-slate-400 truncate block max-w-xs">{tx.notes || '---'}</span>
                          )}
                          {selectedCell?.rowId === tx.id && selectedCell.colKey === 'notes' && !editingCell && (
                            <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-emerald-600 dark:bg-emerald-400 border border-white dark:border-slate-900 pointer-events-none z-20" />
                          )}
                        </td>

                        {/* Actions */}
                        <td className="p-2 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1">
                            {/* Quick Pay Current Month */}
                            <button
                              onClick={() => handleQuickPayMonth(tx, focusedMonth || undefined)}
                              className="p-1 px-1.5 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 dark:text-emerald-300 text-[10px] font-bold flex items-center gap-0.5 shadow-2xs border border-emerald-300 dark:border-emerald-800"
                              title={`Record pledge for ${focusedMonth ? MONTH_LABELS[focusedMonth].en : 'active month'}`}
                            >
                              <Plus className="w-2.5 h-2.5" />
                              <span>Pay</span>
                            </button>
                            <button
                              onClick={() => handleOpenVoucher(tx)}
                              className="p-1 rounded hover:bg-blue-100 text-blue-600"
                              title="Print / View Voucher"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => duplicateTransaction(tx.id)}
                              className="p-1 rounded hover:bg-emerald-100 text-emerald-600"
                              title="Duplicate Row"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => deleteTransaction(tx.id)}
                              className="p-1 rounded hover:bg-rose-100 text-rose-600"
                              title="Delete Row"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>

              {/* Sticky Grand Totals Table Footer */}
              <tfoot className="sticky bottom-0 z-20 bg-slate-900 text-white font-mono font-bold text-xs border-t-2 border-slate-700 shadow-lg">
                <tr>
                  <td className="p-2.5 text-center bg-slate-950 border-r border-slate-800 sticky left-0 z-30">
                    TOTAL
                  </td>
                  <td colSpan={6} className="p-2.5 border-r border-slate-800 text-slate-300 font-sans">
                    Showing {displayedTransactions.length} of {filteredTransactions.length} members
                  </td>
                  {/* Col G: Monthly Commitments */}
                  <td className="p-2.5 text-right border-r border-slate-800 text-blue-300">
                    ₨ {summaryStats.monthlyCommitmentsSum.toLocaleString()}
                  </td>
                  {/* Col H: Quarterly Commitments */}
                  <td className="p-2.5 text-right border-r border-slate-800 text-indigo-300">
                    ₨ {summaryStats.quarterlyCommitmentsSum.toLocaleString()}
                  </td>
                  {/* Col I: Annually Commitments */}
                  <td className="p-2.5 text-right border-r border-slate-800 text-white font-black">
                    ₨ {summaryStats.annuallyCommitmentsSum.toLocaleString()}
                  </td>
                  {/* Cols J through U: 12 Month Totals */}
                  {MONTH_KEYS.map((mKey) => (
                    <td key={mKey} className="p-2 text-right border-r border-slate-800 text-emerald-400">
                      {summaryStats.monthSums[mKey] > 0 ? `₨ ${(summaryStats.monthSums[mKey] / 1000).toFixed(summaryStats.monthSums[mKey] >= 10000 ? 0 : 1)}k` : '—'}
                    </td>
                  ))}
                  {/* Col V: Total Collected */}
                  <td className="p-2.5 text-right border-r border-slate-800 text-emerald-300 font-black">
                    ₨ {summaryStats.totalPaid.toLocaleString()}
                  </td>
                  {/* Col W: Total Balance Due */}
                  <td className="p-2.5 text-right border-r border-slate-800 text-amber-300 font-black">
                    ₨ {summaryStats.totalBalance.toLocaleString()}
                  </td>
                  {/* Col X: Payment Mode Summary */}
                  <td className="p-2 text-center border-r border-slate-800 text-[10px] text-slate-400 font-sans">
                    Cash: {Math.round((summaryStats.cashTotal / (summaryStats.totalPaid || 1)) * 100)}%
                  </td>
                  {/* Col Y: Bank Summary */}
                  <td className="p-2 text-center border-r border-slate-800 text-[10px] text-slate-400 font-sans">
                    Bank: {Math.round((summaryStats.bankTotal / (summaryStats.totalPaid || 1)) * 100)}%
                  </td>
                  {/* Col Z & Actions */}
                  <td colSpan={2} className="p-2 text-center text-emerald-400 font-sans text-xs">
                    {summaryStats.collectionRate}% Realized
                  </td>
                </tr>
              </tfoot>

            </table>
          </div>

          </div>
        )}

      </div>

      {/* AUTHENTIC EXCEL / GOOGLE SHEETS STYLE FIXED BOTTOM TAB & STATUS BAR */}
      <div className="sticky bottom-0 z-30 bg-slate-100 dark:bg-slate-900 border-t border-slate-300 dark:border-slate-800 px-3 py-1.5 flex items-center justify-between shadow-md gap-3">
        {/* Left: + Add Sheet button & Sheet Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full py-0.5 scrollbar-thin">
          <button
            onClick={() => createTemplateSheet()}
            className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shrink-0 transition-colors shadow-2xs cursor-pointer whitespace-nowrap"
            title="Add New Sheet Tab"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span className="hidden sm:inline">Add Sheet</span>
          </button>
          
          <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 shrink-0 mx-1" />

          {sheetTabs.map((sheet, index) => {
            const sheetNumber = index + 1;
            const isSelected = activeSheetTabId === sheet.id;
            return (
              <div
                key={sheet.id}
                onClick={() => {
                  setActiveSheetTabId(sheet.id);
                  if (typeof window !== 'undefined') {
                    const isSheetsRoot = window.location.pathname.startsWith('/sheets');
                    const newPath = isSheetsRoot ? `/sheets/${sheet.id}` : `/dashboard/sheets/${sheet.id}`;
                    window.history.pushState({}, '', newPath);
                  }
                }}
                className={`group px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all flex items-center gap-2 border cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 border-emerald-500 shadow-2xs'
                    : 'bg-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 border-transparent'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5 shrink-0" />
                <span className="whitespace-nowrap">{sheet.name || `Sheet ${sheetNumber}`}</span>
                {sheet.cityName && !sheet.name?.toLowerCase().includes(sheet.cityName.toLowerCase()) && (
                  <span className="text-[9px] px-1 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-extrabold whitespace-nowrap">
                    📍 {sheet.cityName}
                  </span>
                )}
                {sheetTabs.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(`Are you sure you want to delete sheet "${sheet.name || `Sheet ${sheetNumber}`}"?`)) {
                        deleteSheetTab(sheet.id);
                      }
                    }}
                    className="opacity-0 group-hover:opacity-100 hover:text-rose-600 text-slate-400 p-0.5 ml-0.5 rounded transition-opacity cursor-pointer shrink-0"
                    title="Delete Sheet"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Right: Clean Status Bar Metrics */}
        <div className="hidden lg:flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400 font-mono shrink-0 pl-2">
          {!isRawMode && (
            <>
              <span className="flex items-center gap-1 font-sans font-semibold">
                <span className="text-slate-400">Records:</span>
                <span className="text-slate-900 dark:text-white font-bold">{summaryStats.count}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 font-sans font-semibold">
                <span className="text-slate-400">Collected:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">{orgConfig.currencySymbol} {summaryStats.totalPaid.toLocaleString()}</span>
              </span>
              <span>•</span>
            </>
          )}
          <span>{sheetTabs.length} sheets active</span>
          <span>•</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Cloud Synced
          </span>
        </div>
      </div>

      {/* NEW SHEET MODAL (CITY-ENABLED) */}
      {isNewSheetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Create New City Sheet Tab
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Campaign: {currentProject?.name} ({currentProject?.year || 2026})
                </p>
              </div>
              <button onClick={() => setIsNewSheetModalOpen(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleCreateSheetTab} className="space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-200">
                  City Name / شہر کا نام (Punjab District / Branch)
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-amber-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={newSheetCity}
                    onChange={(e) => {
                      setNewSheetCity(e.target.value);
                      if (!newSheetName) {
                        setNewSheetName(`${e.target.value} Worksheet`);
                      }
                    }}
                    placeholder="e.g. Lahore, Faisalabad, Rawalpindi, Multan..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    autoFocus
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 block">Select or type any city/district in Punjab</span>
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-200">
                  Sheet Display Name
                </label>
                <input
                  type="text"
                  value={newSheetName}
                  onChange={(e) => setNewSheetName(e.target.value)}
                  placeholder={`Sheet ${sheetTabs.length + 1}`}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-200">
                  Sheet Format
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewSheetFormat('template')}
                    className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all ${
                      newSheetFormat === 'template'
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 ring-1 ring-emerald-500'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-extrabold">9-Column Ledger</div>
                    <div className="text-[10px] text-slate-500 font-normal">Pre-configured with receipt, donor, amounts</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewSheetFormat('raw')}
                    className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all ${
                      newSheetFormat === 'raw'
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 ring-1 ring-emerald-500'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-extrabold">Raw Grid (A-Z)</div>
                    <div className="text-[10px] text-slate-500 font-normal">Freeform Excel spreadsheet grid</div>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsNewSheetModalOpen(false)}
                  className="px-4 py-2 rounded-xl border text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold cursor-pointer shadow-sm"
                >
                  Create Sheet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NEW PROJECT & YEAR MODAL */}
      {isNewProjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border-2 border-amber-400 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-arabic text-amber-600 font-bold text-xs">جماعت اصلاح المسلمین پنجاب</span>
                </div>
                <h3 className="font-black text-slate-900 dark:text-white text-base">
                  Create New Project / Campaign
                </h3>
              </div>
              <button onClick={() => setIsNewProjectModalOpen(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-200">
                  Project Name
                </label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="e.g. JIM Punjab Annual Campaign 2026"
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                  autoFocus
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-200">
                  Campaign Year (سال)
                </label>
                <input
                  type="text"
                  value={newProjectYear}
                  onChange={(e) => setNewProjectYear(e.target.value)}
                  placeholder="2026"
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">Enter campaign fiscal year (defaults to 2026)</span>
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-200">
                  Description / Purpose (Optional)
                </label>
                <textarea
                  rows={2}
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  placeholder="e.g. Punjab provincial district membership drive"
                  className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsNewProjectModalOpen(false)}
                  className="px-4 py-2 rounded-xl border text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black cursor-pointer shadow-sm"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BATCH MULTI-SHEET CREATOR MODAL (SAVE DIRECTLY TO CLOUD DATABASE) */}
      {isBatchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 max-w-lg w-full border-2 border-amber-400 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-3.5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-arabic text-amber-600 dark:text-amber-400 font-bold text-sm">جماعت اصلاح المسلمین پنجاب</span>
                  <span className="text-amber-500 text-xs">✦</span>
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-300">
                    PostgreSQL Synced
                  </span>
                </div>
                <h3 className="font-black text-slate-900 dark:text-white text-lg mt-0.5">
                  Multi-Sheet Creator & Cloud Database Sync
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Select how many sheets you need. All sheets will be created and saved <strong className="text-emerald-700 dark:text-emerald-400">directly into the Neon PostgreSQL cloud database</strong> (not local storage).
                </p>
              </div>
              <button 
                onClick={() => setIsBatchModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBatchSaveToDatabase} className="space-y-4 text-xs sm:text-sm">
              
              {/* 1. How Many Sheets Do You Need? */}
              <div>
                <label className="block font-black text-slate-900 dark:text-white mb-1.5">
                  How many sheets do you need? (کتنی شیٹس درکار ہیں؟)
                </label>
                
                {/* Quick Selection Chips */}
                <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                  {[1, 3, 5, 10, 15, 20, 25, 30].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setBatchCount(num)}
                      className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer ${
                        batchCount === num
                          ? 'bg-amber-500 text-slate-950 shadow-sm ring-2 ring-amber-400/50 scale-105'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {num} {num === 1 ? 'Sheet' : 'Sheets'}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={batchCount}
                    onChange={(e) => setBatchCount(Math.min(50, Math.max(1, parseInt(e.target.value, 10) || 1)))}
                    className="w-28 p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-black text-base focus:outline-none focus:ring-2 focus:ring-amber-500 text-center"
                  />
                  <span className="text-xs text-slate-500">
                    Max 50 sheets in one batch (pre-assigned with unique database IDs).
                  </span>
                </div>
              </div>

              {/* 2. Format Selection */}
              <div>
                <label className="block font-black text-slate-900 dark:text-white mb-1.5">
                  Sheet Format / ترتیب
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setBatchFormat('template')}
                    className={`p-3 rounded-2xl border text-xs font-bold text-left transition-all cursor-pointer ${
                      batchFormat === 'template'
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="font-black text-sm">9-Column Ledger</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Receipt, Donor, City, Periodic amounts, Fund Category
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBatchFormat('raw')}
                    className={`p-3 rounded-2xl border text-xs font-bold text-left transition-all cursor-pointer ${
                      batchFormat === 'raw'
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="font-black text-sm">Excel Grid (A-Z)</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Full freeform multi-column spreadsheet grid
                    </div>
                  </button>
                </div>
              </div>

              {/* 3. Punjab Cities Assignment */}
              <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/40 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-amber-950 dark:text-amber-200 select-none">
                    <input
                      type="checkbox"
                      checked={batchAutoCities}
                      onChange={(e) => setBatchAutoCities(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span>Auto-assign Punjab Cities to each sheet</span>
                  </label>
                  <span className="text-[10px] text-amber-700 dark:text-amber-400 font-mono">
                    {batchCount} cities
                  </span>
                </div>

                {batchAutoCities ? (
                  <div className="text-[11px] text-slate-600 dark:text-slate-400 flex flex-wrap gap-1 pt-1">
                    {PUNJAB_CITIES_PRESET.slice(0, batchCount).map((city, idx) => (
                      <span key={city} className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-amber-300 text-amber-900 dark:text-amber-200 font-bold">
                        {idx + 1}. {city}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="pt-1">
                    <textarea
                      rows={2}
                      value={batchCustomCities}
                      onChange={(e) => setBatchCustomCities(e.target.value)}
                      placeholder="Enter city names separated by commas (e.g. Lahore, Faisalabad, Multan...)"
                      className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                )}
              </div>

              {/* 4. Database Storage Assurance Box */}
              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs">
                <Database className="w-5 h-5 text-emerald-600 shrink-0" />
                <span className="text-[11px] font-medium leading-tight">
                  <strong>Strict Database Storage:</strong> Sheets are saved directly into the <code>sheet_tabs</code> table in Neon PostgreSQL. They will persist across devices, browsers, and remote viewers.
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsBatchModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingToDb}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-700 to-emerald-900 hover:from-emerald-600 hover:to-emerald-800 text-white font-black text-xs flex items-center gap-2 shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  <Database className="w-4 h-4 text-emerald-300" />
                  <span>
                    {isSavingToDb ? 'Saving to Database...' : `Save ${batchCount} Sheets to Database`}
                  </span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Database Save Success Notification Toast */}
      {dbSaveSuccessMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-emerald-950 via-[#022c22] to-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border-2 border-emerald-400 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-400/40">
            <Check className="w-5 h-5 stroke-[3]" />
          </div>
          <div>
            <div className="font-black text-white text-sm">Saved to Neon PostgreSQL Database!</div>
            <div className="text-emerald-200 text-xs mt-0.5">
              {dbSaveSuccessMsg}
            </div>
          </div>
        </div>
      )}
      {isLinkCopied && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2">
          <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Check className="w-4 h-4 stroke-[3]" />
          </div>
          <div>
            <div className="font-bold text-white">Shareable Link Copied!</div>
            <div className="text-slate-400 text-[11px]">
              Direct link to Sheet {currentSheetNumber} copied to clipboard. Anyone can open it directly!
            </div>
          </div>
        </div>
      )}

      {/* Gemini AI Receipt Scanner Modal */}
      <GeminiReceiptScannerModal
        isOpen={isGeminiScannerOpen}
        onClose={() => setIsGeminiScannerOpen(false)}
        onSuccess={(targetId) => {
          const effectiveSheetId = targetId || activeSheetTabId;
          if (targetId && targetId !== activeSheetTabId) {
            setActiveSheetTabId(targetId);
          }
          try {
            const savedGrid = localStorage.getItem(`jamia_raw_grid_${effectiveSheetId}`);
            if (savedGrid) {
              setRawGridData(JSON.parse(savedGrid));
            }
          } catch (e) {
            console.error(e);
          }
          setSearchQuery('');
          setSelectedZila('all');
          setSelectedBranch('all');
          setSelectedAccountingStatus('all');
          setSelectedPaymentMode('all');
          setSelectedType('all');
          setCurrentPage(1);
        }}
      />

    </div>
  );
};
