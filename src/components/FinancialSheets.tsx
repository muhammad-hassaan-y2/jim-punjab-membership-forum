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
  MoreHorizontal,
  Maximize2,
  Minimize2,
  WrapText,
  ArrowRight,
  FunctionSquare,
  ChevronsUpDown,
  Rows3
} from 'lucide-react';
import { 
  Transaction, 
  SheetTab, 
  FinancialProject, 
  MONTH_KEYS, 
  MONTH_LABELS, 
  MonthKey, 
  COMMON_PROFESSIONS,
  getTransactionTargetAmount,
  parseNumericAmount,
  isTickValue,
  isCrossValue
} from '../types/finance';
import { evaluateFormula, isFormula, EXCEL_FORMULA_DOCS, colLetterToIndex, indexToColLetter } from '../utils/formulaEngine';

export type AccountingColKey = 
  | 'donorName' 
  | 'branchName' 
  | 'zila' 
  | 'phone' 
  | 'receiptNo' 
  | 'sarparastAla' 
  | 'profession'
  | 'monthlyAmount' 
  | 'quarterlyAmount' 
  | 'annuallyAmount' 
  | 'jan' | 'feb' | 'mar' | 'apr' | 'may' | 'jun' | 'jul' | 'aug' | 'sep' | 'oct' | 'nov' | 'dec' 
  | 'amount' 
  | 'targetAmount' 
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
import { api } from '../services/api';

const PUNJAB_CITIES_PRESET = [
  'Lahore', 'Faisalabad', 'Rawalpindi', 'Gujranwala', 'Multan',
  'Bahawalpur', 'Sargodha', 'Sialkot', 'Sheikhupura', 'Rahim Yar Khan',
  'Jhang', 'Dera Ghazi Khan', 'Gujrat', 'Sahiwal', 'Wah Cantt',
  'Kasur', 'Okara', 'Mianwali', 'Chiniot', 'Kamoke',
  'Hafizabad', 'Sadiqabad', 'Burewala', 'Khanewal', 'Muzaffargarh'
];

export const parseMoneyInput = (val: any): number => {
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  if (!val) return 0;
  const cleaned = String(val).replace(/,/g, '').replace(/[^\d.-]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

// 28 Complete Accounting Columns (A-AB) matching exact requested format
export const ACCOUNTING_COLUMNS: { 
  letter: string; 
  key: AccountingColKey; 
  titleEn: string; 
  titleUr: string; 
  width: string; 
  align?: 'left' | 'center' | 'right' 
}[] = [
  { letter: 'A', key: 'donorName', titleEn: 'Name', titleUr: 'نام دہندہ / ممبر', width: 'w-48' },
  { letter: 'B', key: 'branchName', titleEn: 'Branch', titleUr: 'شاخ / برانچ', width: 'w-32' },
  { letter: 'C', key: 'zila', titleEn: 'Zila', titleUr: 'ضلع', width: 'w-28' },
  { letter: 'D', key: 'phone', titleEn: 'Phone', titleUr: 'فون نمبر', width: 'w-28' },
  { letter: 'E', key: 'receiptNo', titleEn: 'Receipt No', titleUr: 'رسید نمبر', width: 'w-24', align: 'center' },
  { letter: 'F', key: 'sarparastAla', titleEn: 'Sarparast-e-Ala', titleUr: 'سرپرست اعلیٰ', width: 'w-36' },
  { letter: 'G', key: 'profession', titleEn: 'Profession', titleUr: 'شعبہ / پیشہ', width: 'w-36' },
  { letter: 'H', key: 'monthlyAmount', titleEn: 'Monthly', titleUr: 'ماہانہ (✓ / ✗)', width: 'w-24', align: 'center' },
  { letter: 'I', key: 'quarterlyAmount', titleEn: 'Quarterly', titleUr: 'سہ ماہی (✓ / ✗)', width: 'w-24', align: 'center' },
  { letter: 'J', key: 'annuallyAmount', titleEn: 'Annually', titleUr: 'سالانہ (✓ / ✗)', width: 'w-24', align: 'center' },
  { letter: 'K', key: 'jan', titleEn: 'Jan', titleUr: 'جنوری', width: 'w-20', align: 'right' },
  { letter: 'L', key: 'feb', titleEn: 'Feb', titleUr: 'فروری', width: 'w-20', align: 'right' },
  { letter: 'M', key: 'mar', titleEn: 'Mar', titleUr: 'مارچ', width: 'w-20', align: 'right' },
  { letter: 'N', key: 'apr', titleEn: 'Apr', titleUr: 'اپریل', width: 'w-20', align: 'right' },
  { letter: 'O', key: 'may', titleEn: 'May', titleUr: 'مئی', width: 'w-20', align: 'right' },
  { letter: 'P', key: 'jun', titleEn: 'Jun', titleUr: 'جون', width: 'w-20', align: 'right' },
  { letter: 'Q', key: 'jul', titleEn: 'Jul', titleUr: 'جولائی', width: 'w-20', align: 'right' },
  { letter: 'R', key: 'aug', titleEn: 'Aug', titleUr: 'اگست', width: 'w-20', align: 'right' },
  { letter: 'S', key: 'sep', titleEn: 'Sep', titleUr: 'ستمبر', width: 'w-20', align: 'right' },
  { letter: 'T', key: 'oct', titleEn: 'Oct', titleUr: 'اکتوبر', width: 'w-20', align: 'right' },
  { letter: 'U', key: 'nov', titleEn: 'Nov', titleUr: 'نومبر', width: 'w-20', align: 'right' },
  { letter: 'V', key: 'dec', titleEn: 'Dec', titleUr: 'دسمبر', width: 'w-20', align: 'right' },
  { letter: 'W', key: 'amount', titleEn: 'Money Paid', titleUr: 'کل وصولی', width: 'w-28', align: 'right' },
  { letter: 'X', key: 'targetAmount', titleEn: 'Target Money', titleUr: 'معینہ ہدف', width: 'w-28', align: 'right' },
  { letter: 'Y', key: 'balance', titleEn: 'Total Remaining', titleUr: 'بقایا واجب الادا', width: 'w-28', align: 'right' },
  { letter: 'Z', key: 'paymentMode', titleEn: 'Mode', titleUr: 'طریقہ', width: 'w-24', align: 'center' },
  { letter: 'AA', key: 'bankName', titleEn: 'Bank Name', titleUr: 'بینک کا نام', width: 'w-32' },
  { letter: 'AB', key: 'notes', titleEn: 'Remarks', titleUr: 'کیفیات', width: 'w-36' },
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

  const rawSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleRawCellChange = (row: number, col: string, val: string) => {
    let evalVal = val;
    if (isFormula(val)) {
      const { result, error } = evaluateFormula(val, (cStr, rNum) => {
        return rawGridData[rNum]?.[cStr.toUpperCase()] ?? 0;
      }, { colStr: col, rowNum: row });
      if (error) console.warn('Raw formula error:', error);
      evalVal = String(result);
      setCellFormulas(prev => ({ ...prev, [`raw_${row}_${col}`]: val }));
    } else {
      setCellFormulas(prev => {
        const next = { ...prev };
        delete next[`raw_${row}_${col}`];
        return next;
      });
    }

    setRawGridData(prev => {
      const updated = {
        ...prev,
        [row]: {
          ...(prev[row] || {}),
          [col]: evalVal
        }
      };
      try {
        localStorage.setItem(`jamia_raw_grid_${activeSheetTabId}`, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }

      // Debounced background sync to Neon DB shared storage
      if (rawSaveTimerRef.current) clearTimeout(rawSaveTimerRef.current);
      rawSaveTimerRef.current = setTimeout(() => {
        const sheetName = currentSheetTab?.name || `Sheet ${currentSheetNumber}`;
        api.saveSharedSheet(activeSheetTabId, sheetName, updated, rawRowCount).catch(err => {
          console.error('Failed to sync raw sheet to Neon DB:', err);
        });
      }, 700);

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
      const sheetName = currentSheetTab?.name || `Sheet ${currentSheetNumber}`;
      api.saveSharedSheet(activeSheetTabId, sheetName, rawGridData, next).catch(err => {
        console.error('Failed to update row count in Neon DB:', err);
      });
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
  
  // Cell Expand State
  const [expandedCell, setExpandedCell] = useState<{
    rowId: string;
    colKey: AccountingColKey;
    value: string;
    title: string;
    donorName?: string;
    zila?: string;
    colLetter?: string;
    rect?: DOMRect | null;
  } | null>(null);
  const [expandedCellEditValue, setExpandedCellEditValue] = useState<string>('');
  const [copiedCellSuccess, setCopiedCellSuccess] = useState<boolean>(false);
  const [isWrapCells, setIsWrapCells] = useState<boolean>(false);

  // Column resize state — stores custom pixel widths per column key
  const defaultColWidths: Record<string, number> = useMemo(() => {
    const twMap: Record<string, number> = { 'w-20': 80, 'w-24': 96, 'w-28': 112, 'w-32': 128, 'w-36': 144, 'w-44': 176, 'w-48': 192 };
    const map: Record<string, number> = {};
    ACCOUNTING_COLUMNS.forEach(c => { map[c.key] = twMap[c.width] || 120; });
    return map;
  }, []);
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => ({ ...defaultColWidths }));
  const resizingRef = useRef<{ key: string; startX: number; startW: number } | null>(null);
  // Row Heights, Density, & Table Width State
  const [rowHeights, setRowHeights] = useState<Record<string, number>>({});
  const [rowDensity, setRowDensity] = useState<'compact' | 'normal' | 'expanded'>('normal');
  const rowResizingRef = useRef<{ rowId: string; startY: number; startH: number } | null>(null);

  // Cell Formulas State (stores raw formula e.g. '=SUM(K1:V1)' for cells)
  const [cellFormulas, setCellFormulas] = useState<Record<string, string>>({});
  const [showFormulaHelper, setShowFormulaHelper] = useState<boolean>(false);
  const [formulaSearch, setFormulaSearch] = useState<string>('');

  // Total table width calculated dynamically from all column widths (with 52px sticky # corner)
  const totalTableWidth = useMemo(() => {
    let sum = 52; // # sticky left row index column
    ACCOUNTING_COLUMNS.forEach(col => {
      sum += columnWidths[col.key] || defaultColWidths[col.key] || 120;
    });
    return sum;
  }, [columnWidths, defaultColWidths]);

  const handleResizeStart = (e: React.MouseEvent, colKey: string) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startW = columnWidths[colKey] || defaultColWidths[colKey] || 120;
    resizingRef.current = { key: colKey, startX, startW };

    const onMove = (ev: MouseEvent) => {
      if (!resizingRef.current) return;
      const delta = ev.clientX - resizingRef.current.startX;
      const newW = Math.max(50, resizingRef.current.startW + delta);
      setColumnWidths(prev => ({ ...prev, [resizingRef.current!.key]: newW }));
    };
    const onUp = () => {
      resizingRef.current = null;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  const handleResetColWidth = (colKey: string) => {
    setColumnWidths(prev => ({ ...prev, [colKey]: defaultColWidths[colKey] || 120 }));
  };

  const handleRowResizeStart = (e: React.MouseEvent, rowId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const startY = e.clientY;
    const startH = rowHeights[rowId] || (rowDensity === 'compact' ? 32 : rowDensity === 'expanded' ? 70 : 40);
    rowResizingRef.current = { rowId, startY, startH };

    const onMove = (ev: MouseEvent) => {
      if (!rowResizingRef.current) return;
      const delta = ev.clientY - rowResizingRef.current.startY;
      const newH = Math.max(28, Math.min(300, rowResizingRef.current.startH + delta));
      setRowHeights(prev => ({ ...prev, [rowResizingRef.current!.rowId]: newH }));
    };
    const onUp = () => {
      rowResizingRef.current = null;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';
  };

  const handleToggleRowExpand = (rowId: string) => {
    setRowHeights(prev => {
      const curH = prev[rowId] || 40;
      return {
        ...prev,
        [rowId]: curH > 55 ? 40 : 85,
      };
    });
  };

  const handleExpandAllRows = () => {
    setRowDensity(prev => {
      if (prev === 'expanded') {
        setIsWrapCells(false);
        return 'normal';
      }
      setIsWrapCells(true);
      return 'expanded';
    });
  };

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

  // 27 Complete Accounting Columns (A-AA) matching exact requested format
  const columns = ACCOUNTING_COLUMNS;

  // Helper to extract or compute cell values
  const getCellValue = (tx: Transaction, colKey: AccountingColKey): any => {
    if (MONTH_KEYS.includes(colKey as any)) {
      return tx.monthsData?.[colKey as MonthKey] || 0;
    }
    if (colKey === 'amount') {
      const paid = tx.monthsData && Object.values(tx.monthsData).length > 0
        ? Object.values(tx.monthsData).reduce((s: number, v: any) => s + (Number(v) || 0), 0)
        : Number(tx.amount || 0);
      return paid;
    }
    if (colKey === 'targetAmount') {
      return getTransactionTargetAmount(tx);
    }
    if (colKey === 'balance') {
      const tgt = getTransactionTargetAmount(tx);
      const paid = tx.monthsData && Object.values(tx.monthsData).length > 0
        ? Object.values(tx.monthsData).reduce((s: number, v: any) => s + (Number(v) || 0), 0)
        : Number(tx.amount || 0);
      return Math.max(0, tgt - paid);
    }
    return (tx as any)[colKey] || '';
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
        const target = getTransactionTargetAmount(t);
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
      monthlyCommitmentsSum += parseNumericAmount(t.monthlyAmount);
      quarterlyCommitmentsSum += parseNumericAmount(t.quarterlyAmount);
      annuallyCommitmentsSum += parseNumericAmount(t.annuallyAmount);

      const target = getTransactionTargetAmount(t);
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

  // Universal cell value resolver for Excel formulas (K1, V2, A5, etc.)
  const getUniversalCellValue = (colStr: string, rowNum: number): any => {
    if (isRawMode) {
      return rawGridData[rowNum]?.[colStr.toUpperCase()] ?? 0;
    } else {
      const tx = displayedTransactions[rowNum - 1];
      if (!tx) return 0;
      const colDef = ACCOUNTING_COLUMNS.find(c => c.letter.toUpperCase() === colStr.toUpperCase());
      if (!colDef) return 0;
      return getCellValue(tx, colDef.key);
    }
  };

  // Handle cell click selection
  const handleCellClick = (rowId: string, rowIndex: number, colKey: AccountingColKey, colLetter: string) => {
    const tx = transactions.find(t => t.id === rowId);
    if (!tx) return;
    setSelectedCell({ rowId, rowIndex, colKey, colLetter });
    const formula = cellFormulas[`${rowId}:${colKey}`];
    setFormulaBarValue(formula || String(getCellValue(tx, colKey)));
  };

  // Handle cell double click for inline editing
  const handleCellDoubleClick = (rowId: string, colKey: AccountingColKey) => {
    if (colKey === 'balance' || colKey === 'amount') return; // Read-only calculated totals
    const tx = transactions.find(t => t.id === rowId);
    if (!tx) return;
    setEditingCell({ rowId, colKey });
    const formula = cellFormulas[`${rowId}:${colKey}`];
    setCellEditValue(formula || String(getCellValue(tx, colKey)));
  };

  // Expand cell to show full content in a popup / modal
  const handleOpenExpandCell = (e?: React.MouseEvent, rowId?: string, colKey?: AccountingColKey) => {
    if (e) {
      e.stopPropagation();
    }
    const targetRowId = rowId || selectedCell?.rowId || displayedTransactions[0]?.id;
    const targetColKey = colKey || selectedCell?.colKey || 'donorName';
    if (!targetRowId) return;

    const tx = transactions.find(t => t.id === targetRowId);
    if (!tx) return;
    const col = ACCOUNTING_COLUMNS.find(c => c.key === targetColKey);
    const cellVal = String(getCellValue(tx, targetColKey) ?? '');
    setExpandedCellEditValue(cellVal);
    setCopiedCellSuccess(false);
    setExpandedCell({
      rowId: targetRowId,
      colKey: targetColKey,
      value: cellVal,
      title: col ? `Col ${col.letter}: ${col.titleEn} (${col.titleUr})` : targetColKey,
      colLetter: col?.letter,
      donorName: tx.donorName || tx.donorNameUrdu || undefined,
      zila: tx.zila || undefined,
    });
  };

  const handleExpandCell = handleOpenExpandCell;

  const handleNavigateExpandedCell = (direction: 'prev' | 'next') => {
    if (!expandedCell) return;
    const colIndex = ACCOUNTING_COLUMNS.findIndex(c => c.key === expandedCell.colKey);
    const rowIndex = displayedTransactions.findIndex(t => t.id === expandedCell.rowId);
    if (colIndex === -1 || rowIndex === -1) return;

    let nextColIdx = colIndex;
    let nextRowIdx = rowIndex;
    if (direction === 'next') {
      if (colIndex < ACCOUNTING_COLUMNS.length - 1) {
        nextColIdx++;
      } else if (rowIndex < displayedTransactions.length - 1) {
        nextRowIdx++;
        nextColIdx = 0;
      }
    } else {
      if (colIndex > 0) {
        nextColIdx--;
      } else if (rowIndex > 0) {
        nextRowIdx--;
        nextColIdx = ACCOUNTING_COLUMNS.length - 1;
      }
    }
    const nextCol = ACCOUNTING_COLUMNS[nextColIdx];
    const nextTx = displayedTransactions[nextRowIdx];
    if (nextCol && nextTx) {
      handleOpenExpandCell(undefined, nextTx.id, nextCol.key);
      setSelectedCell({
        rowId: nextTx.id,
        rowIndex: nextRowIdx,
        colKey: nextCol.key,
        colLetter: nextCol.letter,
      });
      setFormulaBarValue(String(getCellValue(nextTx, nextCol.key) ?? ''));
    }
  };

  const handleSaveExpandedCell = () => {
    if (!expandedCell) return;
    handleCommitEdit(expandedCell.rowId, expandedCell.colKey, expandedCellEditValue);
    setExpandedCell(prev => prev ? { ...prev, value: expandedCellEditValue } : null);
  };

  // Commit inline edit with Excel formula evaluation support
  const handleCommitEdit = (rowId: string, colKey: AccountingColKey, value: string) => {
    let rawInput = value;
    let evalVal = value;
    
    // Evaluate Excel formula if starts with '='
    if (isFormula(value)) {
      const rIdx = displayedTransactions.findIndex(t => t.id === rowId);
      const colLetter = ACCOUNTING_COLUMNS.find(c => c.key === colKey)?.letter;
      const { result, error } = evaluateFormula(value, getUniversalCellValue, {
        colStr: colLetter,
        rowNum: rIdx !== -1 ? rIdx + 1 : 1,
      });
      if (error) {
        console.warn('Excel Formula Error:', error);
      }
      setCellFormulas(prev => ({ ...prev, [`${rowId}:${colKey}`]: value }));
      evalVal = String(result);
    } else {
      setCellFormulas(prev => {
        const next = { ...prev };
        delete next[`${rowId}:${colKey}`];
        return next;
      });
    }

    if (MONTH_KEYS.includes(colKey as any)) {
      const mKey = colKey as MonthKey;
      const numVal = parseMoneyInput(evalVal);
      const tx = transactions.find(t => t.id === rowId);
      const currentMonths = tx?.monthsData || {};
      const updatedMonths = { ...currentMonths, [mKey]: numVal };
      const totalSum = Object.values(updatedMonths).reduce((acc: number, v: any) => acc + (Number(v) || 0), 0);
      updateTransaction(rowId, {
        monthsData: updatedMonths,
        amount: totalSum,
      });
      setEditingCell(null);
      setFormulaBarValue(rawInput);
      return;
    }

    if (['monthlyAmount', 'quarterlyAmount', 'halfYearlyAmount', 'annuallyAmount'].includes(colKey as string)) {
      const trimmed = String(evalVal ?? '').trim();
      const isTick = isTickValue(trimmed);
      const isCross = isCrossValue(trimmed);

      let finalVal: string | number = trimmed;
      if (isTick) {
        finalVal = '✓';
      } else if (isCross) {
        finalVal = '✗';
      } else {
        const parsedNum = parseMoneyInput(trimmed);
        if (parsedNum > 0 && !isNaN(Number(trimmed.replace(/,/g, '')))) {
          finalVal = parsedNum;
        } else {
          finalVal = trimmed;
        }
      }

      updateCell(rowId, colKey as keyof Transaction, finalVal);

      if (colKey === 'monthlyAmount') {
        const num = typeof finalVal === 'number' ? finalVal : 0;
        const tx = transactions.find(t => t.id === rowId);
        updateTransaction(rowId, {
          monthlyAmount: finalVal,
          quarterlyAmount: num > 0 ? num * 3 : (tx?.quarterlyAmount || ''),
          annuallyAmount: num > 0 ? num * 12 : (tx?.annuallyAmount || ''),
          preferredPeriod: isTick ? 'Monthly' : (tx?.preferredPeriod || 'Monthly'),
        });
      } else if (colKey === 'quarterlyAmount') {
        const num = typeof finalVal === 'number' ? finalVal : 0;
        const tx = transactions.find(t => t.id === rowId);
        updateTransaction(rowId, {
          quarterlyAmount: finalVal,
          monthlyAmount: num > 0 ? Math.round(num / 3) : (tx?.monthlyAmount || ''),
          annuallyAmount: num > 0 ? num * 4 : (tx?.annuallyAmount || ''),
          preferredPeriod: isTick ? 'Quarterly' : (tx?.preferredPeriod || 'Quarterly'),
        });
      } else if (colKey === 'annuallyAmount') {
        const num = typeof finalVal === 'number' ? finalVal : 0;
        const tx = transactions.find(t => t.id === rowId);
        updateTransaction(rowId, {
          annuallyAmount: finalVal,
          targetAmount: num > 0 ? num : (tx?.targetAmount || 0),
          monthlyAmount: num > 0 ? Math.round(num / 12) : (tx?.monthlyAmount || 0),
          quarterlyAmount: num > 0 ? Math.round(num / 4) : (tx?.quarterlyAmount || 0),
          preferredPeriod: isTick ? 'Annually' : (tx?.preferredPeriod || 'Annually'),
        });
      }

      setEditingCell(null);
      setFormulaBarValue(rawInput);
      return;
    }

    let finalVal: any = evalVal;
    if (colKey === 'targetAmount') {
      finalVal = parseMoneyInput(evalVal);
      updateTransaction(rowId, {
        targetAmount: finalVal,
        annuallyAmount: finalVal > 0 ? finalVal : '',
      });
    } else {
      updateCell(rowId, colKey as keyof Transaction, finalVal);
    }

    setEditingCell(null);
    setFormulaBarValue(rawInput);
  };

  // Quick-Pay action: Record donor's monthly pledge for active or current month
  const handleQuickPayMonth = (tx: Transaction, monthKey?: MonthKey) => {
    const curMonthIndex = new Date().getMonth();
    const targetMonth: MonthKey = monthKey || (MONTH_KEYS[curMonthIndex] || 'jan');
    const mNum = parseNumericAmount(tx.monthlyAmount);
    const qNum = parseNumericAmount(tx.quarterlyAmount);
    const amt = mNum > 0 
      ? mNum 
      : (qNum > 0 ? Math.round(qNum / 3) : 500);
    const updatedMonths = { ...(tx.monthsData || {}), [targetMonth]: amt };
    const totalSum = Object.values(updatedMonths).reduce((acc: number, v: any) => acc + (Number(v) || 0), 0);
    updateTransaction(tx.id, {
      monthsData: updatedMonths,
      amount: totalSum,
    });
  };

  // Helper to render Monthly, Quarterly, Annually cells with Tick/Cross options and custom text/amounts
  const renderPledgePeriodCell = (
    tx: Transaction,
    colKey: 'monthlyAmount' | 'quarterlyAmount' | 'annuallyAmount',
    colLetter: string,
    rowIndex: number,
    idx: number,
    rowHeightClass: string,
    rowHeightStyle?: React.CSSProperties
  ) => {
    const rawVal = tx[colKey];
    const isSelected = selectedCell?.rowId === tx.id && selectedCell.colKey === colKey;
    const isEditing = editingCell?.rowId === tx.id && editingCell.colKey === colKey;
    const isTick = isTickValue(rawVal);
    const isCross = isCrossValue(rawVal);
    const numAmt = parseNumericAmount(rawVal);
    const hasFormula = Boolean(cellFormulas[`${tx.id}:${colKey}`]);

    return (
      <td
        key={colKey}
        id={`cell-${tx.id}-${colKey}`}
        style={rowHeightStyle}
        onClick={() => handleCellClick(tx.id, rowIndex, colKey, colLetter)}
        onDoubleClick={() => handleCellDoubleClick(tx.id, colKey)}
        className={`p-1.5 border-r border-slate-200 dark:border-slate-800 text-center font-mono cursor-cell relative select-none group/pledge bg-blue-50/15 dark:bg-blue-950/10 ${rowHeightClass} ${
          isSelected ? 'ring-2 ring-emerald-600 dark:ring-emerald-400 bg-emerald-100/50 dark:bg-emerald-950/40 z-10' : ''
        }`}
      >
        {isEditing ? (
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Quick 1-click Tick & Cross Popover Toolbar */}
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 px-1.5 py-1 rounded-md shadow-xl z-50 whitespace-nowrap">
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleCommitEdit(tx.id, colKey, '✓');
                }}
                className="px-2 py-0.5 bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-bold rounded flex items-center gap-1 shadow-2xs transition-colors"
                title="Tick (✓)"
              >
                <Check size={11} strokeWidth={3} /> Tick
              </button>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleCommitEdit(tx.id, colKey, '✗');
                }}
                className="px-2 py-0.5 bg-rose-500 hover:bg-rose-600 text-white text-[11px] font-bold rounded flex items-center gap-1 shadow-2xs transition-colors"
                title="Cross (✗)"
              >
                <X size={11} strokeWidth={3} /> Cross
              </button>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleCommitEdit(tx.id, colKey, '');
                }}
                className="px-1.5 py-0.5 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 text-[10px] rounded transition-colors"
                title="Clear value"
              >
                Clear
              </button>
            </div>

            <input
              type="text"
              autoFocus
              value={cellEditValue}
              onChange={(e) => setCellEditValue(e.target.value)}
              onBlur={() => handleCommitEdit(tx.id, colKey, cellEditValue)}
              onKeyDown={(e) => handleTemplateCellKeyDown(e, tx.id, colKey, idx, cellEditValue)}
              placeholder="✓, ✗, or write..."
              className="w-full p-1 bg-white dark:bg-slate-900 border border-emerald-500 rounded text-xs text-center font-bold"
            />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center relative">
            {isTick ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 shadow-2xs">
                <Check size={12} strokeWidth={3.5} className="text-emerald-600 dark:text-emerald-400" />
                <span>✓</span>
              </span>
            ) : isCross ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-700 shadow-2xs">
                <X size={12} strokeWidth={3.5} className="text-rose-600 dark:text-rose-400" />
                <span>✗</span>
              </span>
            ) : numAmt > 0 ? (
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {numAmt.toLocaleString()}
              </span>
            ) : rawVal && String(rawVal).trim() !== '' ? (
              <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[90px] block" title={String(rawVal)}>
                {String(rawVal)}
              </span>
            ) : (
              <span className="text-slate-300 dark:text-slate-600 font-mono text-xs">—</span>
            )}

            {/* Quick 1-click Hover Action Buttons (for instant Tick/Cross without editing) */}
            <div className="absolute inset-y-0 right-0 flex items-center gap-0.5 opacity-0 group-hover/pledge:opacity-100 transition-opacity bg-white/90 dark:bg-slate-900/90 px-0.5 rounded backdrop-blur-2xs shadow-xs z-20">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCommitEdit(tx.id, colKey, isTick ? '' : '✓');
                }}
                className={`p-1 rounded transition-colors ${
                  isTick 
                    ? 'bg-emerald-600 text-white' 
                    : 'hover:bg-emerald-100 dark:hover:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
                }`}
                title={isTick ? 'Remove Tick' : 'Tick (✓)'}
              >
                <Check size={11} strokeWidth={3} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCommitEdit(tx.id, colKey, isCross ? '' : '✗');
                }}
                className={`p-1 rounded transition-colors ${
                  isCross 
                    ? 'bg-rose-600 text-white' 
                    : 'hover:bg-rose-100 dark:hover:bg-rose-950 text-rose-600 dark:text-rose-400'
                }`}
                title={isCross ? 'Remove Cross' : 'Cross (✗)'}
              >
                <X size={11} strokeWidth={3} />
              </button>
            </div>
          </div>
        )}

        {hasFormula && (
          <span className="absolute top-0.5 left-0.5 w-1.5 h-1.5 bg-emerald-500 rounded-full" title={`Formula: ${cellFormulas[`${tx.id}:${colKey}`]}`} />
        )}

        {isSelected && !isEditing && (
          <>
            <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-emerald-600 dark:bg-emerald-400 border border-white dark:border-slate-900 pointer-events-none z-20" />
            <button
              onClick={(e) => handleExpandCell(e, tx.id, colKey)}
              className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full flex items-center justify-center z-30 shadow-md transition-all hover:scale-110"
              title="Expand cell"
            >
              <Eye size={10} />
            </button>
          </>
        )}
      </td>
    );
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
        colKey: 'donorName',
        colLetter: 'A'
      });
      setFormulaBarValue(String(first.donorName || ''));
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
        } else if (currentIdx > 0) {
          const nextCol = columns[columns.length - 1];
          const prevTx = displayedTransactions[currentIdx - 1];
          setSelectedCell({
            rowId: prevTx.id,
            rowIndex: startIndex + currentIdx - 1,
            colKey: nextCol.key,
            colLetter: nextCol.letter
          });
          setFormulaBarValue(String(getCellValue(prevTx, nextCol.key)));
          scrollToCell(`cell-${prevTx.id}-${nextCol.key}`);
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
        } else if (currentIdx + 1 < displayedTransactions.length) {
          const nextCol = columns[0];
          const nextTx = displayedTransactions[currentIdx + 1];
          setSelectedCell({
            rowId: nextTx.id,
            rowIndex: startIndex + currentIdx + 1,
            colKey: nextCol.key,
            colLetter: nextCol.letter
          });
          setFormulaBarValue(String(getCellValue(nextTx, nextCol.key)));
          scrollToCell(`cell-${nextTx.id}-${nextCol.key}`);
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
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
        
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
        <div className="flex flex-wrap items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 gap-2 bg-white dark:bg-slate-900">
          
          {/* Left: Back button + Sheet Title */}
          <div className="flex items-center gap-3">
            {!isStandaloneShareView ? (
              <button
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.location.href = '/dashboard';
                  } else {
                    setActiveTab('dashboard');
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-colors cursor-pointer"
                title="Return to Main Dashboard"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Shared Sheet</span>
              </div>
            )}

            <div className="flex items-center gap-2">
              {isEditingSheetName ? (
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    autoFocus
                    value={sheetNameInput}
                    onChange={(e) => setSheetNameInput(e.target.value)}
                    onKeyDown={handleRenameKeyDown}
                    onBlur={handleSaveRename}
                    className="px-2.5 py-1 text-sm font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-800 border-2 border-emerald-500 rounded-lg outline-none w-44 sm:w-56"
                    placeholder="Sheet / City name..."
                  />
                  <button
                    onMouseDown={(e) => { e.preventDefault(); handleSaveRename(); }}
                    className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
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
                <div className="flex items-center gap-1.5">
                  <h2 
                    onClick={handleStartRename}
                    className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-tight cursor-pointer hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1 py-0.5 px-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 group"
                    title="Click to rename"
                  >
                    <span>{currentSheetTitle}</span>
                    <Pencil className="w-3 h-3 opacity-0 group-hover:opacity-100 text-slate-400 transition-opacity" />
                  </h2>

                  <span className="text-[11px] font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                    {isRawMode ? `${rawRowCount} rows` : `${filteredTransactions.length} records`}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right: Essential Actions Only */}
          <div className="flex items-center gap-1.5">
            
            {/* + Add Row */}
            <button
              onClick={() => isRawMode ? handleAddRawRows(50) : addBlankRow(1)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors cursor-pointer"
              title="Add new row"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add Row</span>
            </button>

            {/* Delete Selected Row — only visible when a row is selected */}
            {selectedCell && !isRawMode && (
              <button
                onClick={() => {
                  const tx = transactions.find(t => t.id === selectedCell.rowId);
                  const label = tx?.donorName || tx?.receiptNo || 'this row';
                  if (window.confirm(`Delete row "${label}"?`)) {
                    deleteTransaction(selectedCell.rowId);
                    setSelectedCell(null);
                    setEditingCell(null);
                  }
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                title="Delete selected row"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Delete</span>
              </button>
            )}

            {/* Divider */}
            <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 mx-0.5 hidden sm:block" />

            {/* AI Scan */}
            <button
              onClick={() => setIsGeminiScannerOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-amber-800 bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:hover:bg-amber-900/50 transition-colors cursor-pointer"
              title="Scan document with AI"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">AI Scan</span>
            </button>

            {/* Excel Download */}
            <button
              onClick={() => {
                if (isRawMode) {
                  exportRawGridToExcel(currentSheetTab?.name || `Sheet_${currentSheetNumber}`, rawGridData, rawRowCount, RAW_COLUMNS);
                } else {
                  exportTransactionsToExcel(filteredTransactions, categories, orgConfig, currentSheetTab?.name || `Sheet_${currentSheetNumber}`);
                }
              }}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-emerald-600 hover:border-emerald-300 transition-colors cursor-pointer"
              title="Download Excel"
            >
              <Download className="w-3.5 h-3.5" />
            </button>

            {/* Print */}
            <button
              onClick={() => {
                if (isRawMode) {
                  printRawGridAsPDF(currentSheetTab?.name || `Sheet ${currentSheetNumber}`, rawGridData, rawRowCount, RAW_COLUMNS, orgConfig);
                } else {
                  printSheetAsPDF(currentSheetTab?.name || `Sheet ${currentSheetNumber}`, filteredTransactions, categories, orgConfig);
                }
              }}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-600 hover:border-blue-300 transition-colors cursor-pointer"
              title="Print PDF"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>

            {/* Share */}
            <button
              onClick={handleShareSheet}
              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                isLinkCopied
                  ? 'bg-emerald-50 border-emerald-400 text-emerald-600'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-indigo-600 hover:border-indigo-300'
              }`}
              title={isLinkCopied ? "Link copied!" : "Copy shareable link"}
            >
              {isLinkCopied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
            </button>

            {/* More Actions Menu */}
            <div className="relative">
              <button
                onClick={() => setIsMoreActionsOpen(!isMoreActionsOpen)}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors cursor-pointer"
                title="More actions"
              >
                <MoreHorizontal className="w-3.5 h-3.5" />
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
          <div className="flex flex-wrap items-center justify-between px-4 py-2 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 gap-2 text-xs">
            
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

        {/* FORMULA BAR WITH FULL EXCEL FORMULAS */}
        <div className="relative px-4 py-1.5 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 text-xs font-mono">
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Active Cell Name Box (e.g. B4) */}
            <div className="w-16 py-1 px-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-center font-bold text-slate-700 dark:text-slate-300 text-xs shrink-0 select-none">
              {activeCellCoord}
            </div>

            {/* fx Excel Formulas Dropdown Button */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setShowFormulaHelper(!showFormulaHelper)}
                className={`px-2 py-1 rounded border text-xs font-bold italic transition-all flex items-center gap-1 shadow-2xs ${
                  showFormulaHelper
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                }`}
                title="Open Excel Formulas Helper (SUM, AVERAGE, IF, COUNT, etc.)"
              >
                <span>fx</span>
                <ChevronDown size={11} className={`transition-transform duration-150 ${showFormulaHelper ? 'rotate-180' : ''}`} />
              </button>

              {/* Excel Formulas Helper Popover */}
              {showFormulaHelper && (
                <div 
                  className="absolute left-0 top-full mt-1.5 w-80 sm:w-96 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-emerald-300 dark:border-emerald-700 z-50 overflow-hidden font-sans"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-3 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/50 dark:to-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <FunctionSquare size={16} className="text-emerald-600 dark:text-emerald-400" />
                      <span className="font-bold text-xs text-emerald-900 dark:text-emerald-200">Excel Formulas Library</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowFormulaHelper(false)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  {/* Formula Search Input */}
                  <div className="p-2 border-b border-slate-100 dark:border-slate-750">
                    <div className="relative">
                      <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        autoFocus
                        value={formulaSearch}
                        onChange={(e) => setFormulaSearch(e.target.value)}
                        placeholder="Search formulas e.g. SUM, AVG, IF, COUNT..."
                        className="w-full pl-8 pr-3 py-1 bg-slate-50 dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Quick Preset Buttons */}
                  <div className="px-2.5 py-1.5 bg-slate-50/60 dark:bg-slate-850 border-b border-slate-100 dark:border-slate-750 flex flex-wrap gap-1 text-[10px]">
                    <span className="text-slate-400 font-bold self-center pr-1">Presets:</span>
                    <button
                      type="button"
                      onClick={() => {
                        const r = isRawMode ? (selectedRawCell?.row || 1) : (selectedCell ? selectedCell.rowIndex + 1 : 1);
                        const f = `=SUM(K${r}:V${r})`;
                        setFormulaBarValue(f);
                        setShowFormulaHelper(false);
                      }}
                      className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 font-mono text-emerald-700 dark:text-emerald-300 font-bold"
                    >
                      =SUM(K:V)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const r = isRawMode ? (selectedRawCell?.row || 1) : (selectedCell ? selectedCell.rowIndex + 1 : 1);
                        const f = `=AVERAGE(K${r}:V${r})`;
                        setFormulaBarValue(f);
                        setShowFormulaHelper(false);
                      }}
                      className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 font-mono text-blue-700 dark:text-blue-300 font-bold"
                    >
                      =AVERAGE(K:V)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const r = isRawMode ? (selectedRawCell?.row || 1) : (selectedCell ? selectedCell.rowIndex + 1 : 1);
                        const f = `=H${r}*12`;
                        setFormulaBarValue(f);
                        setShowFormulaHelper(false);
                      }}
                      className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 font-mono text-indigo-700 dark:text-indigo-300 font-bold"
                    >
                      =H*12
                    </button>
                  </div>

                  {/* Formula List */}
                  <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-750 p-1">
                    {EXCEL_FORMULA_DOCS
                      .filter(f => !formulaSearch || f.name.toLowerCase().includes(formulaSearch.toLowerCase()) || f.description.toLowerCase().includes(formulaSearch.toLowerCase()))
                      .map(f => {
                        const r = isRawMode ? (selectedRawCell?.row || 1) : (selectedCell ? selectedCell.rowIndex + 1 : 1);
                        const readyTemplate = f.template.replace(/\{row\}/g, String(r));
                        return (
                          <div 
                            key={f.name}
                            onClick={() => {
                              setFormulaBarValue(readyTemplate);
                              setShowFormulaHelper(false);
                            }}
                            className="p-2 rounded-lg hover:bg-emerald-50/80 dark:hover:bg-slate-750 transition-colors cursor-pointer group"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-mono font-bold text-xs text-emerald-700 dark:text-emerald-400 group-hover:text-emerald-800">
                                {f.name}
                              </span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-700 text-slate-500 font-semibold">
                                {f.category}
                              </span>
                            </div>
                            <div className="font-mono text-[10px] text-slate-600 dark:text-slate-300 font-semibold mt-0.5">
                              {f.syntax}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                              {f.description}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>

            {/* Live Formula / Value Input */}
            <form onSubmit={handleFormulaBarSubmit} className="flex-1 min-w-[200px]">
              <input
                type="text"
                value={formulaBarValue}
                onChange={(e) => setFormulaBarValue(e.target.value)}
                onBlur={() => {
                  if (isRawMode && selectedRawCell) {
                    handleRawCellChange(selectedRawCell.row, selectedRawCell.col, formulaBarValue);
                  } else if (!isRawMode && selectedCell) {
                    handleCommitEdit(selectedCell.rowId, selectedCell.colKey, formulaBarValue);
                  }
                }}
                placeholder="Type value or Excel formula e.g. =SUM(K1:V1), =AVERAGE(K1:V1), =H1*12, =IF(Y1>0, 'DUE', 'PAID')..."
                className="w-full py-1 px-2.5 rounded bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs font-mono placeholder:text-slate-400"
              />
            </form>

            {/* Controls: Expand Cell, Row Height Density, & Wrap Text */}
            <div className="flex items-center gap-1.5 shrink-0">
              
              {/* Expand Active Cell Button */}
              <button
                type="button"
                onClick={() => handleOpenExpandCell()}
                className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 transition-all font-sans font-bold text-[11px] shadow-2xs hover:shadow-xs active:scale-95"
                title="Expand active cell into full window (view, edit, format, navigate)"
              >
                <Maximize2 size={12} />
                <span>Expand Cell</span>
              </button>

              {/* Row & Cell Density (Compact / Normal / Expanded) */}
              {!isRawMode && (
                <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-md border border-slate-200 dark:border-slate-700 text-[10px] font-sans font-bold">
                  <button
                    type="button"
                    onClick={() => { setRowDensity('compact'); setIsWrapCells(false); }}
                    className={`px-1.5 py-0.5 rounded transition-colors ${rowDensity === 'compact' ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-2xs font-extrabold' : 'text-slate-500 hover:text-slate-800'}`}
                    title="Compact rows (32px)"
                  >
                    Compact
                  </button>
                  <button
                    type="button"
                    onClick={() => { setRowDensity('normal'); setIsWrapCells(false); }}
                    className={`px-1.5 py-0.5 rounded transition-colors ${rowDensity === 'normal' ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-2xs font-extrabold' : 'text-slate-500 hover:text-slate-800'}`}
                    title="Normal rows (40px)"
                  >
                    Normal
                  </button>
                  <button
                    type="button"
                    onClick={handleExpandAllRows}
                    className={`px-1.5 py-0.5 rounded transition-colors ${rowDensity === 'expanded' || isWrapCells ? 'bg-emerald-600 text-white shadow-2xs font-extrabold' : 'text-slate-500 hover:text-slate-800'}`}
                    title="Expand all rows & wrap text (shows complete cell content)"
                  >
                    Expanded
                  </button>
                </div>
              )}

              {/* Wrap Text Toggle */}
              {!isRawMode && (
                <button
                  type="button"
                  onClick={() => setIsWrapCells(!isWrapCells)}
                  className={`flex items-center gap-1 px-2 py-1 rounded-md border transition-all font-sans text-[11px] font-semibold active:scale-95 ${
                    isWrapCells 
                      ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs' 
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-750 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                  title={isWrapCells ? "Currently wrapping cell text. Click to compact." : "Expand all cells to show full text without truncation"}
                >
                  <WrapText size={12} />
                  <span>{isWrapCells ? 'Wrapped' : 'Wrap'}</span>
                </button>
              )}

            </div>

          </div>
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
              <table 
                className="text-left border-collapse font-sans text-xs table-fixed"
                style={{ width: `${totalTableWidth}px`, minWidth: '100%' }}
              >
                <colgroup>
                  <col style={{ width: '52px' }} />
                  {ACCOUNTING_COLUMNS.map((col) => (
                    <col key={col.key} style={{ width: `${columnWidths[col.key] || defaultColWidths[col.key] || 120}px` }} />
                  ))}
                </colgroup>
              
              {/* Column Letter & Title Headers */}
              <thead className="sticky top-0 z-20 bg-slate-100 dark:bg-slate-800 border-b-2 border-slate-300 dark:border-slate-700 select-none shadow-xs">
                <tr>
                  {/* Row Number Corner Box (Sticky Left) */}
                  <th rowSpan={2} className="w-[52px] p-2 text-center border-r border-b border-slate-300 dark:border-slate-700 text-slate-500 font-mono text-[11px] bg-slate-200/90 dark:bg-slate-900 sticky left-0 z-30 align-middle">
                    #
                  </th>

                  {/* Col A: Name */}
                  <th rowSpan={2} className="p-2 border-r border-b border-slate-300 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-700/60 transition-colors text-center align-middle relative" style={{ width: columnWidths.donorName, minWidth: 50 }}>
                    <div className="flex flex-col items-center justify-center gap-0.5">
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 font-black text-xs">A</span>
                      <span className="text-[11px] font-sans font-bold text-slate-700 dark:text-slate-200 truncate">Name</span>
                      <span className="text-[9px] text-slate-400">نام دہندہ / ممبر</span>
                    </div>
                    <div onMouseDown={(e) => handleResizeStart(e, 'donorName')} className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-emerald-500/50 active:bg-emerald-500 z-40 group"><div className="absolute right-0 top-0 w-0.5 h-full bg-slate-300 group-hover:bg-emerald-500 transition-colors" /></div>
                  </th>

                  {/* Col B: Branch */}
                  <th rowSpan={2} className="p-2 border-r border-b border-slate-300 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-700/60 transition-colors text-center align-middle relative" style={{ width: columnWidths.branchName, minWidth: 50 }}>
                    <div className="flex flex-col items-center justify-center gap-0.5">
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 font-black text-xs">B</span>
                      <span className="text-[11px] font-sans font-bold text-slate-700 dark:text-slate-200 truncate">Branch</span>
                      <span className="text-[9px] text-slate-400">شاخ / برانچ</span>
                    </div>
                    <div onMouseDown={(e) => handleResizeStart(e, 'branchName')} className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-emerald-500/50 active:bg-emerald-500 z-40 group"><div className="absolute right-0 top-0 w-0.5 h-full bg-slate-300 group-hover:bg-emerald-500 transition-colors" /></div>
                  </th>

                  {/* Col C: Zila */}
                  <th rowSpan={2} className="p-2 border-r border-b border-slate-300 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-700/60 transition-colors text-center align-middle relative" style={{ width: columnWidths.zila, minWidth: 50 }}>
                    <div className="flex flex-col items-center justify-center gap-0.5">
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 font-black text-xs">C</span>
                      <span className="text-[11px] font-sans font-bold text-slate-700 dark:text-slate-200 truncate">Zila</span>
                      <span className="text-[9px] text-slate-400">ضلع</span>
                    </div>
                    <div onMouseDown={(e) => handleResizeStart(e, 'zila')} className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-emerald-500/50 active:bg-emerald-500 z-40 group"><div className="absolute right-0 top-0 w-0.5 h-full bg-slate-300 group-hover:bg-emerald-500 transition-colors" /></div>
                  </th>

                  {/* Col D: Phone */}
                  <th rowSpan={2} className="p-2 border-r border-b border-slate-300 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-700/60 transition-colors text-center align-middle relative" style={{ width: columnWidths.phone, minWidth: 50 }}>
                    <div className="flex flex-col items-center justify-center gap-0.5">
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 font-black text-xs">D</span>
                      <span className="text-[11px] font-sans font-bold text-slate-700 dark:text-slate-200 truncate">Phone</span>
                      <span className="text-[9px] text-slate-400">فون نمبر</span>
                    </div>
                    <div onMouseDown={(e) => handleResizeStart(e, 'phone')} className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-emerald-500/50 active:bg-emerald-500 z-40 group"><div className="absolute right-0 top-0 w-0.5 h-full bg-slate-300 group-hover:bg-emerald-500 transition-colors" /></div>
                  </th>

                  {/* Col E: Receipt No */}
                  <th rowSpan={2} className="p-2 border-r border-b border-slate-300 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-700/60 transition-colors text-center align-middle relative" style={{ width: columnWidths.receiptNo, minWidth: 50 }}>
                    <div className="flex flex-col items-center justify-center gap-0.5">
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 font-black text-xs">E</span>
                      <span className="text-[11px] font-sans font-bold text-slate-700 dark:text-slate-200 truncate">Receipt No</span>
                      <span className="text-[9px] text-slate-400">رسید نمبر</span>
                    </div>
                    <div onMouseDown={(e) => handleResizeStart(e, 'receiptNo')} className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-emerald-500/50 active:bg-emerald-500 z-40 group"><div className="absolute right-0 top-0 w-0.5 h-full bg-slate-300 group-hover:bg-emerald-500 transition-colors" /></div>
                  </th>

                  {/* Col F: Sarparast-e-Ala */}
                  <th rowSpan={2} className="p-2 border-r border-b border-slate-300 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-700/60 transition-colors text-center align-middle relative" style={{ width: columnWidths.sarparastAla, minWidth: 50 }}>
                    <div className="flex flex-col items-center justify-center gap-0.5">
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 font-black text-xs">F</span>
                      <span className="text-[11px] font-sans font-bold text-slate-700 dark:text-slate-200 truncate">Sarparast-e-Ala</span>
                      <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold">سرپرست اعلیٰ</span>
                    </div>
                    <div onMouseDown={(e) => handleResizeStart(e, 'sarparastAla')} onDoubleClick={() => handleResetColWidth('sarparastAla')} title="Drag to resize, double-click to reset" className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-emerald-500/50 active:bg-emerald-500 z-40 group"><div className="absolute right-0 top-0 w-0.5 h-full bg-slate-300 group-hover:bg-emerald-500 transition-colors" /></div>
                  </th>

                  {/* Col G: Profession */}
                  <th rowSpan={2} className="p-2 border-r border-b border-slate-300 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-700/60 transition-colors text-center align-middle relative" style={{ width: columnWidths.profession, minWidth: 50 }}>
                    <div className="flex flex-col items-center justify-center gap-0.5">
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 font-black text-xs">G</span>
                      <span className="text-[11px] font-sans font-bold text-slate-700 dark:text-slate-200 truncate">Profession</span>
                      <span className="text-[9px] text-slate-400">شعبہ / پیشہ</span>
                    </div>
                    <div onMouseDown={(e) => handleResizeStart(e, 'profession')} onDoubleClick={() => handleResetColWidth('profession')} title="Drag to resize, double-click to reset" className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-emerald-500/50 active:bg-emerald-500 z-40 group"><div className="absolute right-0 top-0 w-0.5 h-full bg-slate-300 group-hover:bg-emerald-500 transition-colors" /></div>
                  </th>

                  {/* Multi-Tier Group Header: Pledged Commitments (Spans 3 cols: H, I, J) */}
                  <th colSpan={3} className="p-1.5 border-r border-b border-slate-300 dark:border-slate-700 font-extrabold text-center bg-gradient-to-r from-blue-100/90 via-indigo-100/90 to-blue-100/90 dark:from-blue-950/80 dark:via-indigo-950/80 dark:to-blue-950/80 text-blue-900 dark:text-blue-200">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-[11px] uppercase tracking-wider font-black">Pledged Target</span>
                      <span className="text-[9px] px-2 py-0.2 rounded-full bg-blue-600 text-white font-bold">معینہ ہدف</span>
                    </div>
                  </th>

                  {/* Multi-Tier Group Header: 2026 Monthly Breakdown (Spans 12 cols: K through V) */}
                  <th colSpan={12} className="p-1.5 border-r border-b border-slate-300 dark:border-slate-700 font-extrabold text-center bg-gradient-to-r from-emerald-100/90 via-teal-100/90 to-emerald-100/90 dark:from-emerald-950/80 dark:via-teal-950/80 dark:to-emerald-950/80 text-emerald-900 dark:text-emerald-200">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-[11px] uppercase tracking-wider font-black">2026 Monthly Contributions</span>
                      <span className="text-[9px] px-2 py-0.2 rounded-full bg-emerald-600 text-white font-bold">ماہانہ وصولیاں برائے 2026</span>
                    </div>
                  </th>

                  {/* Col W: Money Paid */}
                  <th rowSpan={2} className="p-2 border-r border-b border-slate-300 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-700/60 transition-colors text-center align-middle relative" style={{ width: columnWidths.amount, minWidth: 50 }}>
                    <div className="flex flex-col items-center justify-center gap-0.5">
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 font-black text-xs">W</span>
                      <span className="text-[11px] font-sans font-bold text-slate-700 dark:text-slate-200 truncate">Money Paid</span>
                      <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold">کل وصولی</span>
                    </div>
                    <div onMouseDown={(e) => handleResizeStart(e, 'amount')} onDoubleClick={() => handleResetColWidth('amount')} title="Drag to resize, double-click to reset" className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-emerald-500/50 active:bg-emerald-500 z-40 group"><div className="absolute right-0 top-0 w-0.5 h-full bg-slate-300 group-hover:bg-emerald-500 transition-colors" /></div>
                  </th>

                  {/* Col X: Target Money */}
                  <th rowSpan={2} className="p-2 border-r border-b border-slate-300 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-700/60 transition-colors text-center align-middle relative" style={{ width: columnWidths.targetAmount, minWidth: 50 }}>
                    <div className="flex flex-col items-center justify-center gap-0.5">
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 font-black text-xs">X</span>
                      <span className="text-[11px] font-sans font-bold text-slate-700 dark:text-slate-200 truncate">Target Money</span>
                      <span className="text-[9px] text-blue-600 dark:text-blue-400 font-bold">معینہ ہدف</span>
                    </div>
                    <div onMouseDown={(e) => handleResizeStart(e, 'targetAmount')} onDoubleClick={() => handleResetColWidth('targetAmount')} title="Drag to resize, double-click to reset" className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-emerald-500/50 active:bg-emerald-500 z-40 group"><div className="absolute right-0 top-0 w-0.5 h-full bg-slate-300 group-hover:bg-emerald-500 transition-colors" /></div>
                  </th>

                  {/* Col Y: Total Remaining */}
                  <th rowSpan={2} className="p-2 border-r border-b border-slate-300 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-700/60 transition-colors text-center align-middle relative" style={{ width: columnWidths.balance, minWidth: 50 }}>
                    <div className="flex flex-col items-center justify-center gap-0.5">
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 font-black text-xs">Y</span>
                      <span className="text-[11px] font-sans font-bold text-slate-700 dark:text-slate-200 truncate">Total Remaining</span>
                      <span className="text-[9px] text-amber-600 dark:text-amber-400 font-bold">بقایا واجب الادا</span>
                    </div>
                    <div onMouseDown={(e) => handleResizeStart(e, 'balance')} onDoubleClick={() => handleResetColWidth('balance')} title="Drag to resize, double-click to reset" className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-emerald-500/50 active:bg-emerald-500 z-40 group"><div className="absolute right-0 top-0 w-0.5 h-full bg-slate-300 group-hover:bg-emerald-500 transition-colors" /></div>
                  </th>

                  {/* Col Z: Mode */}
                  <th rowSpan={2} className="p-2 border-r border-b border-slate-300 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-700/60 transition-colors text-center align-middle relative" style={{ width: columnWidths.paymentMode, minWidth: 50 }}>
                    <div className="flex flex-col items-center justify-center gap-0.5">
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 font-black text-xs">Z</span>
                      <span className="text-[11px] font-sans font-bold text-slate-700 dark:text-slate-200 truncate">Mode</span>
                      <span className="text-[9px] text-slate-400">طریقہ</span>
                    </div>
                    <div onMouseDown={(e) => handleResizeStart(e, 'paymentMode')} onDoubleClick={() => handleResetColWidth('paymentMode')} title="Drag to resize, double-click to reset" className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-emerald-500/50 active:bg-emerald-500 z-40 group"><div className="absolute right-0 top-0 w-0.5 h-full bg-slate-300 group-hover:bg-emerald-500 transition-colors" /></div>
                  </th>

                  {/* Col AA: Bank Name */}
                  <th rowSpan={2} className="p-2 border-r border-b border-slate-300 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-700/60 transition-colors text-center align-middle relative" style={{ width: columnWidths.bankName, minWidth: 50 }}>
                    <div className="flex flex-col items-center justify-center gap-0.5">
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 font-black text-xs">AA</span>
                      <span className="text-[11px] font-sans font-bold text-slate-700 dark:text-slate-200 truncate">Bank Name</span>
                      <span className="text-[9px] text-slate-400">بینک کا نام</span>
                    </div>
                    <div onMouseDown={(e) => handleResizeStart(e, 'bankName')} onDoubleClick={() => handleResetColWidth('bankName')} title="Drag to resize, double-click to reset" className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-emerald-500/50 active:bg-emerald-500 z-40 group"><div className="absolute right-0 top-0 w-0.5 h-full bg-slate-300 group-hover:bg-emerald-500 transition-colors" /></div>
                  </th>

                  {/* Col AB: Remarks */}
                  <th rowSpan={2} className="p-2 border-r border-b border-slate-300 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-700/60 transition-colors text-center align-middle relative" style={{ width: columnWidths.notes, minWidth: 50 }}>
                    <div className="flex flex-col items-center justify-center gap-0.5">
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 font-black text-xs">AB</span>
                      <span className="text-[11px] font-sans font-bold text-slate-700 dark:text-slate-200 truncate">Remarks</span>
                      <span className="text-[9px] text-slate-400">کیفیات</span>
                    </div>
                    <div onMouseDown={(e) => handleResizeStart(e, 'notes')} onDoubleClick={() => handleResetColWidth('notes')} title="Drag to resize, double-click to reset" className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-emerald-500/50 active:bg-emerald-500 z-40 group"><div className="absolute right-0 top-0 w-0.5 h-full bg-slate-300 group-hover:bg-emerald-500 transition-colors" /></div>
                  </th>
                </tr>

                {/* Subheaders Row: H, I, J (Targets) and K to V (12 Months) */}
                <tr className="bg-slate-50 dark:bg-slate-850">
                  {/* Col H: Monthly */}
                  <th className="p-1 border-r border-b border-slate-300 dark:border-slate-700 text-center bg-blue-50/50 dark:bg-blue-950/30 relative" style={{ width: columnWidths.monthlyAmount, minWidth: 40 }}>
                    <div className="flex flex-col items-center justify-center">
                      <span className="font-mono text-blue-700 dark:text-blue-400 font-black text-[10px]">H</span>
                      <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200">Monthly</span>
                      <span className="text-[8px] text-slate-500">ماہانہ</span>
                    </div>
                    <div onMouseDown={(e) => handleResizeStart(e, 'monthlyAmount')} onDoubleClick={() => handleResetColWidth('monthlyAmount')} title="Drag to resize, double-click to reset" className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-blue-500/50 active:bg-blue-500 z-40 group"><div className="absolute right-0 top-0 w-0.5 h-full bg-slate-300 group-hover:bg-blue-500 transition-colors" /></div>
                  </th>

                  {/* Col I: Quarterly */}
                  <th className="p-1 border-r border-b border-slate-300 dark:border-slate-700 text-center bg-blue-50/50 dark:bg-blue-950/30 relative" style={{ width: columnWidths.quarterlyAmount, minWidth: 40 }}>
                    <div className="flex flex-col items-center justify-center">
                      <span className="font-mono text-blue-700 dark:text-blue-400 font-black text-[10px]">I</span>
                      <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200">Quarterly</span>
                      <span className="text-[8px] text-slate-500">سہ ماہی</span>
                    </div>
                    <div onMouseDown={(e) => handleResizeStart(e, 'quarterlyAmount')} onDoubleClick={() => handleResetColWidth('quarterlyAmount')} title="Drag to resize, double-click to reset" className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-blue-500/50 active:bg-blue-500 z-40 group"><div className="absolute right-0 top-0 w-0.5 h-full bg-slate-300 group-hover:bg-blue-500 transition-colors" /></div>
                  </th>

                  {/* Col J: Annually */}
                  <th className="p-1 border-r border-b border-slate-300 dark:border-slate-700 text-center bg-blue-50/50 dark:bg-blue-950/30 relative" style={{ width: columnWidths.annuallyAmount, minWidth: 40 }}>
                    <div className="flex flex-col items-center justify-center">
                      <span className="font-mono text-blue-700 dark:text-blue-400 font-black text-[10px]">J</span>
                      <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200">Annually</span>
                      <span className="text-[8px] text-slate-500">سالانہ</span>
                    </div>
                    <div onMouseDown={(e) => handleResizeStart(e, 'annuallyAmount')} onDoubleClick={() => handleResetColWidth('annuallyAmount')} title="Drag to resize, double-click to reset" className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-blue-500/50 active:bg-blue-500 z-40 group"><div className="absolute right-0 top-0 w-0.5 h-full bg-slate-300 group-hover:bg-blue-500 transition-colors" /></div>
                  </th>

                  {/* Cols K through V: 12 Months */}
                  {MONTH_KEYS.map((mKey, mIdx) => {
                    const letter = String.fromCharCode(75 + mIdx); // 75 is 'K'
                    const mLabel = MONTH_LABELS[mKey];
                    const isFocused = focusedMonth === mKey;
                    return (
                      <th
                        key={mKey}
                        style={{ width: columnWidths[mKey], minWidth: 40 }}
                        className={`p-1 border-r border-b border-slate-300 dark:border-slate-700 text-center transition-colors relative ${
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
                        <div onMouseDown={(e) => handleResizeStart(e, mKey)} onDoubleClick={() => handleResetColWidth(mKey)} title="Drag to resize, double-click to reset" className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-emerald-500/50 active:bg-emerald-500 z-40 group"><div className="absolute right-0 top-0 w-0.5 h-full bg-slate-300 group-hover:bg-emerald-500 transition-colors" /></div>
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
                    const annualTarget = getTransactionTargetAmount(tx);
                    
                    const months = tx.monthsData || {};
                    const totalRowPaid = Object.values(months).length > 0
                      ? Object.values(months).reduce((s: number, v: any) => s + (Number(v) || 0), 0)
                      : Number(tx.amount || 0);

                    const balanceDue = Math.max(0, (annualTarget || 0) - totalRowPaid);
                    const isFullyPaid = (annualTarget > 0 && totalRowPaid >= annualTarget) || (annualTarget === 0 && totalRowPaid > 0);

                    const customRowH = rowHeights[tx.id];
                    const rowHeightStyle = customRowH ? { height: `${customRowH}px` } : undefined;
                    const isExpandedRow = rowDensity === 'expanded' || isWrapCells || (customRowH && customRowH > 55);
                    const rowHeightClass = customRowH 
                      ? '' 
                      : rowDensity === 'compact' 
                        ? 'h-8' 
                        : isExpandedRow 
                          ? 'min-h-[72px]' 
                          : 'h-10';

                    return (
                      <tr 
                        key={tx.id}
                        style={rowHeightStyle}
                        className={`hover:bg-blue-50/50 dark:hover:bg-slate-800/50 transition-colors group/row ${rowHeightClass} ${
                          isRowSelected ? 'bg-blue-50/30 dark:bg-slate-800/30' : ''
                        }`}
                      >
                        {/* Row Number Sticky Left with Draggable Bottom Resize Handle & Expand Toggle */}
                        <td 
                          style={rowHeightStyle}
                          className={`w-[52px] p-1 text-center font-mono font-bold border-r border-b border-slate-300 dark:border-slate-700 sticky left-0 z-10 select-none transition-colors relative group/idx ${rowHeightClass} ${
                            selectedCell?.rowId === tx.id 
                              ? 'bg-emerald-600 text-white font-black shadow-xs' 
                              : 'bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          <div className="flex items-center justify-center gap-1">
                            <span>{rowIndex + 1}</span>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); handleToggleRowExpand(tx.id); }}
                              className="opacity-0 group-hover/idx:opacity-100 hover:text-emerald-500 transition-opacity p-0.5 rounded text-slate-400"
                              title="Toggle expand row height"
                            >
                              <Maximize2 size={8} />
                            </button>
                          </div>
                          {/* Draggable bottom border to resize row height */}
                          <div
                            onMouseDown={(e) => handleRowResizeStart(e, tx.id)}
                            onDoubleClick={() => handleToggleRowExpand(tx.id)}
                            title="Drag to resize row height, double-click to toggle expand"
                            className="absolute bottom-0 left-0 w-full h-1.5 cursor-row-resize hover:bg-emerald-500 active:bg-emerald-600 z-30 group/handle"
                          >
                            <div className="w-full h-0.5 bg-slate-300 dark:bg-slate-700 group-hover/handle:bg-emerald-500 transition-colors" />
                          </div>
                        </td>

                        {/* Column A: Donor Name */}
                        <td 
                          id={`cell-${tx.id}-donorName`}
                          style={rowHeightStyle}
                          onClick={() => handleCellClick(tx.id, rowIndex, 'donorName', 'A')}
                          onDoubleClick={() => handleCellDoubleClick(tx.id, 'donorName')}
                          className={`p-2 border-r border-b border-slate-200 dark:border-slate-800 cursor-cell relative select-none ${rowHeightClass} ${
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
                            <span className={`font-semibold text-slate-800 dark:text-slate-100 ${isExpandedRow ? 'whitespace-normal break-words leading-relaxed' : 'truncate block'}`}>
                              {tx.donorName || tx.donorNameUrdu || '---'}
                            </span>
                          )}
                          {cellFormulas[`${tx.id}:donorName`] && (
                            <span className="absolute top-0.5 left-0.5 w-1.5 h-1.5 bg-emerald-500 rounded-full" title={`Formula: ${cellFormulas[`${tx.id}:donorName`]}`} />
                          )}
                          {selectedCell?.rowId === tx.id && selectedCell.colKey === 'donorName' && !editingCell && (
                            <><div className="absolute -bottom-1 -right-1 w-2 h-2 bg-emerald-600 dark:bg-emerald-400 border border-white dark:border-slate-900 pointer-events-none z-20" />
                            <button onClick={(e) => handleOpenExpandCell(e, tx.id, 'donorName')} className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full flex items-center justify-center z-30 shadow-md transition-all hover:scale-110 active:scale-95" title="Expand cell in full window"><Maximize2 size={10} /></button></>
                          )}
                        </td>

                        {/* Column B: Branch Name */}
                        <td 
                          id={`cell-${tx.id}-branchName`}
                          onClick={() => handleCellClick(tx.id, rowIndex, 'branchName', 'B')}
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
                            <span className={`text-slate-600 dark:text-slate-300 ${isWrapCells ? 'whitespace-normal break-words leading-relaxed' : 'truncate block'}`}>{tx.branchName || '---'}</span>
                          )}
                          {selectedCell?.rowId === tx.id && selectedCell.colKey === 'branchName' && !editingCell && (
                            <><div className="absolute -bottom-1 -right-1 w-2 h-2 bg-emerald-600 dark:bg-emerald-400 border border-white dark:border-slate-900 pointer-events-none z-20" />
                            <button onClick={(e) => handleExpandCell(e, tx.id, selectedCell!.colKey)} className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full flex items-center justify-center z-30 shadow-md transition-all hover:scale-110" title="Expand cell"><Eye size={10} /></button></>
                          )}
                        </td>

                        {/* Column C: Zila */}
                        <td 
                          id={`cell-${tx.id}-zila`}
                          onClick={() => handleCellClick(tx.id, rowIndex, 'zila', 'C')}
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
                            <span className={`text-slate-700 dark:text-slate-300 ${isWrapCells ? 'whitespace-normal break-words leading-relaxed' : 'truncate block'}`}>{tx.zila || tx.city || '---'}</span>
                          )}
                          {selectedCell?.rowId === tx.id && selectedCell.colKey === 'zila' && !editingCell && (
                            <><div className="absolute -bottom-1 -right-1 w-2 h-2 bg-emerald-600 dark:bg-emerald-400 border border-white dark:border-slate-900 pointer-events-none z-20" />
                            <button onClick={(e) => handleExpandCell(e, tx.id, selectedCell!.colKey)} className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full flex items-center justify-center z-30 shadow-md transition-all hover:scale-110" title="Expand cell"><Eye size={10} /></button></>
                          )}
                        </td>

                        {/* Column D: Phone */}
                        <td 
                          id={`cell-${tx.id}-phone`}
                          onClick={() => handleCellClick(tx.id, rowIndex, 'phone', 'D')}
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
                            <><div className="absolute -bottom-1 -right-1 w-2 h-2 bg-emerald-600 dark:bg-emerald-400 border border-white dark:border-slate-900 pointer-events-none z-20" />
                            <button onClick={(e) => handleExpandCell(e, tx.id, selectedCell!.colKey)} className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full flex items-center justify-center z-30 shadow-md transition-all hover:scale-110" title="Expand cell"><Eye size={10} /></button></>
                          )}
                        </td>

                        {/* Column E: Receipt No */}
                        <td 
                          id={`cell-${tx.id}-receiptNo`}
                          onClick={() => handleCellClick(tx.id, rowIndex, 'receiptNo', 'E')}
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
                            <><div className="absolute -bottom-1 -right-1 w-2 h-2 bg-emerald-600 dark:bg-emerald-400 border border-white dark:border-slate-900 pointer-events-none z-20" />
                            <button onClick={(e) => handleExpandCell(e, tx.id, selectedCell!.colKey)} className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full flex items-center justify-center z-30 shadow-md transition-all hover:scale-110" title="Expand cell"><Eye size={10} /></button></>
                          )}
                        </td>

                        {/* Column F: Sarparast-e-Ala */}
                        <td 
                          id={`cell-${tx.id}-sarparastAla`}
                          onClick={() => handleCellClick(tx.id, rowIndex, 'sarparastAla', 'F')}
                          onDoubleClick={() => handleCellDoubleClick(tx.id, 'sarparastAla')}
                          className={`p-2 border-r border-slate-200 dark:border-slate-800 cursor-cell relative select-none ${
                            selectedCell?.rowId === tx.id && selectedCell.colKey === 'sarparastAla' ? 'ring-2 ring-emerald-600 dark:ring-emerald-400 bg-emerald-100/50 dark:bg-emerald-950/40 z-10' : ''
                          }`}
                        >
                          {editingCell?.rowId === tx.id && editingCell.colKey === 'sarparastAla' ? (
                            <input
                              type="text"
                              autoFocus
                              value={cellEditValue}
                              onChange={(e) => setCellEditValue(e.target.value)}
                              onBlur={() => handleCommitEdit(tx.id, 'sarparastAla', cellEditValue)}
                              onKeyDown={(e) => handleTemplateCellKeyDown(e, tx.id, 'sarparastAla', idx, cellEditValue)}
                              className="w-full p-1 bg-white dark:bg-slate-900 border border-emerald-500 rounded text-xs"
                            />
                          ) : (
                            <span className="font-semibold text-emerald-800 dark:text-emerald-300">
                              {tx.sarparastAla || '---'}
                            </span>
                          )}
                          {selectedCell?.rowId === tx.id && selectedCell.colKey === 'sarparastAla' && !editingCell && (
                            <><div className="absolute -bottom-1 -right-1 w-2 h-2 bg-emerald-600 dark:bg-emerald-400 border border-white dark:border-slate-900 pointer-events-none z-20" />
                            <button onClick={(e) => handleExpandCell(e, tx.id, selectedCell!.colKey)} className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full flex items-center justify-center z-30 shadow-md transition-all hover:scale-110" title="Expand cell"><Eye size={10} /></button></>
                          )}
                        </td>

                        {/* Column G: Profession (شعبہ / پیشہ) */}
                        <td 
                          id={`cell-${tx.id}-profession`}
                          onClick={() => handleCellClick(tx.id, rowIndex, 'profession', 'G')}
                          onDoubleClick={() => handleCellDoubleClick(tx.id, 'profession')}
                          className={`p-2 border-r border-slate-200 dark:border-slate-800 cursor-cell relative select-none ${
                            selectedCell?.rowId === tx.id && selectedCell.colKey === 'profession' ? 'ring-2 ring-emerald-600 dark:ring-emerald-400 bg-emerald-100/50 dark:bg-emerald-950/40 z-10' : ''
                          }`}
                        >
                          {editingCell?.rowId === tx.id && editingCell.colKey === 'profession' ? (
                            <input
                              type="text"
                              autoFocus
                              list="profession-list"
                              value={cellEditValue}
                              onChange={(e) => setCellEditValue(e.target.value)}
                              onBlur={() => handleCommitEdit(tx.id, 'profession', cellEditValue)}
                              onKeyDown={(e) => handleTemplateCellKeyDown(e, tx.id, 'profession', idx, cellEditValue)}
                              className="w-full p-1 bg-white dark:bg-slate-900 border border-emerald-500 rounded text-xs"
                              placeholder="Select or enter profession..."
                            />
                          ) : (
                            <span className="font-medium text-slate-700 dark:text-slate-300">
                              {tx.profession || '—'}
                            </span>
                          )}
                          {selectedCell?.rowId === tx.id && selectedCell.colKey === 'profession' && !editingCell && (
                            <><div className="absolute -bottom-1 -right-1 w-2 h-2 bg-emerald-600 dark:bg-emerald-400 border border-white dark:border-slate-900 pointer-events-none z-20" />
                            <button onClick={(e) => handleExpandCell(e, tx.id, selectedCell!.colKey)} className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full flex items-center justify-center z-30 shadow-md transition-all hover:scale-110" title="Expand cell"><Eye size={10} /></button></>
                          )}
                        </td>

                        {/* Column H: Monthly Pledged (✓ / ✗ / amount / custom text) */}
                        {renderPledgePeriodCell(tx, 'monthlyAmount', 'H', rowIndex, idx, rowHeightClass, rowHeightStyle)}

                        {/* Column I: Quarterly Pledged (✓ / ✗ / amount / custom text) */}
                        {renderPledgePeriodCell(tx, 'quarterlyAmount', 'I', rowIndex, idx, rowHeightClass, rowHeightStyle)}

                        {/* Column J: Annually Pledged (✓ / ✗ / amount / custom text) */}
                        {renderPledgePeriodCell(tx, 'annuallyAmount', 'J', rowIndex, idx, rowHeightClass, rowHeightStyle)}

                        {/* Columns K through V: 12 Months Breakdown */}
                        {MONTH_KEYS.map((mKey, mIdx) => {
                          const letter = String.fromCharCode(75 + mIdx); // 'K' to 'V'
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
                                <><div className="absolute -bottom-1 -right-1 w-2 h-2 bg-emerald-600 dark:bg-emerald-400 border border-white dark:border-slate-900 pointer-events-none z-20" />
                            <button onClick={(e) => handleExpandCell(e, tx.id, selectedCell!.colKey)} className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full flex items-center justify-center z-30 shadow-md transition-all hover:scale-110" title="Expand cell"><Eye size={10} /></button></>
                              )}
                            </td>
                          );
                        })}

                        {/* Column W: Money Paid (Calculated) */}
                        <td 
                          id={`cell-${tx.id}-amount`}
                          onClick={() => handleCellClick(tx.id, rowIndex, 'amount', 'W')}
                          className={`p-2 border-r border-slate-200 dark:border-slate-800 text-right font-mono font-bold cursor-cell relative select-none bg-emerald-50/30 dark:bg-emerald-950/10 ${
                            selectedCell?.rowId === tx.id && selectedCell.colKey === 'amount' ? 'ring-2 ring-emerald-600 dark:ring-emerald-400 bg-emerald-100/50 dark:bg-emerald-950/40 z-10' : ''
                          }`}
                        >
                          <span className="text-emerald-600 dark:text-emerald-400 font-black">
                            ₨ {Number(totalRowPaid).toLocaleString()}
                          </span>
                          {selectedCell?.rowId === tx.id && selectedCell.colKey === 'amount' && (
                            <><div className="absolute -bottom-1 -right-1 w-2 h-2 bg-emerald-600 dark:bg-emerald-400 border border-white dark:border-slate-900 pointer-events-none z-20" />
                            <button onClick={(e) => handleExpandCell(e, tx.id, selectedCell!.colKey)} className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full flex items-center justify-center z-30 shadow-md transition-all hover:scale-110" title="Expand cell"><Eye size={10} /></button></>
                          )}
                        </td>

                        {/* Column X: Target Money */}
                        <td 
                          id={`cell-${tx.id}-targetAmount`}
                          onClick={() => handleCellClick(tx.id, rowIndex, 'targetAmount', 'X')}
                          onDoubleClick={() => handleCellDoubleClick(tx.id, 'targetAmount')}
                          className={`p-2 border-r border-slate-200 dark:border-slate-800 text-right font-mono font-bold cursor-cell relative select-none bg-blue-50/20 dark:bg-blue-950/10 ${
                            selectedCell?.rowId === tx.id && selectedCell.colKey === 'targetAmount' ? 'ring-2 ring-emerald-600 dark:ring-emerald-400 bg-emerald-100/50 dark:bg-emerald-950/40 z-10' : ''
                          }`}
                        >
                          {editingCell?.rowId === tx.id && editingCell.colKey === 'targetAmount' ? (
                            <input
                              type="number"
                              autoFocus
                              value={cellEditValue}
                              onChange={(e) => setCellEditValue(e.target.value)}
                              onBlur={() => handleCommitEdit(tx.id, 'targetAmount', cellEditValue)}
                              onKeyDown={(e) => handleTemplateCellKeyDown(e, tx.id, 'targetAmount', idx, cellEditValue)}
                              className="w-full p-1 bg-white dark:bg-slate-900 border border-emerald-500 rounded text-xs text-right font-mono"
                            />
                          ) : (
                            <span className="font-bold text-blue-700 dark:text-blue-300">
                              ₨ {Number(annualTarget).toLocaleString()}
                            </span>
                          )}
                          {selectedCell?.rowId === tx.id && selectedCell.colKey === 'targetAmount' && !editingCell && (
                            <><div className="absolute -bottom-1 -right-1 w-2 h-2 bg-emerald-600 dark:bg-emerald-400 border border-white dark:border-slate-900 pointer-events-none z-20" />
                            <button onClick={(e) => handleExpandCell(e, tx.id, selectedCell!.colKey)} className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full flex items-center justify-center z-30 shadow-md transition-all hover:scale-110" title="Expand cell"><Eye size={10} /></button></>
                          )}
                        </td>

                        {/* Column Y: Total Remaining (Balance Due) */}
                        <td 
                          id={`cell-${tx.id}-balance`}
                          onClick={() => handleCellClick(tx.id, rowIndex, 'balance', 'Y')}
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
                            <><div className="absolute -bottom-1 -right-1 w-2 h-2 bg-emerald-600 dark:bg-emerald-400 border border-white dark:border-slate-900 pointer-events-none z-20" />
                            <button onClick={(e) => handleExpandCell(e, tx.id, selectedCell!.colKey)} className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full flex items-center justify-center z-30 shadow-md transition-all hover:scale-110" title="Expand cell"><Eye size={10} /></button></>
                          )}
                        </td>

                        {/* Column Z: Mode */}
                        <td 
                          id={`cell-${tx.id}-paymentMode`}
                          onClick={() => handleCellClick(tx.id, rowIndex, 'paymentMode', 'Z')}
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
                            <><div className="absolute -bottom-1 -right-1 w-2 h-2 bg-emerald-600 dark:bg-emerald-400 border border-white dark:border-slate-900 pointer-events-none z-20" />
                            <button onClick={(e) => handleExpandCell(e, tx.id, selectedCell!.colKey)} className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full flex items-center justify-center z-30 shadow-md transition-all hover:scale-110" title="Expand cell"><Eye size={10} /></button></>
                          )}
                        </td>

                        {/* Column AA: Bank Name */}
                        <td 
                          id={`cell-${tx.id}-bankName`}
                          onClick={() => handleCellClick(tx.id, rowIndex, 'bankName', 'AA')}
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
                            <><div className="absolute -bottom-1 -right-1 w-2 h-2 bg-emerald-600 dark:bg-emerald-400 border border-white dark:border-slate-900 pointer-events-none z-20" />
                            <button onClick={(e) => handleExpandCell(e, tx.id, selectedCell!.colKey)} className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full flex items-center justify-center z-30 shadow-md transition-all hover:scale-110" title="Expand cell"><Eye size={10} /></button></>
                          )}
                        </td>

                        {/* Column AB: Remarks */}
                        <td 
                          id={`cell-${tx.id}-notes`}
                          onClick={() => handleCellClick(tx.id, rowIndex, 'notes', 'AB')}
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
                            <span className={`text-slate-500 dark:text-slate-400 ${isWrapCells ? 'whitespace-normal break-words leading-relaxed' : 'truncate block max-w-xs'}`}>{tx.notes || '---'}</span>
                          )}
                          {selectedCell?.rowId === tx.id && selectedCell.colKey === 'notes' && !editingCell && (
                            <><div className="absolute -bottom-1 -right-1 w-2 h-2 bg-emerald-600 dark:bg-emerald-400 border border-white dark:border-slate-900 pointer-events-none z-20" />
                            <button onClick={(e) => handleExpandCell(e, tx.id, selectedCell!.colKey)} className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full flex items-center justify-center z-30 shadow-md transition-all hover:scale-110" title="Expand cell"><Eye size={10} /></button></>
                          )}
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
                  <td colSpan={7} className="p-2.5 border-r border-slate-800 text-slate-300 font-sans">
                    Showing {displayedTransactions.length} of {filteredTransactions.length} members
                  </td>
                  {/* Col H: Monthly Commitments */}
                  <td className="p-2.5 text-right border-r border-slate-800 text-blue-300">
                    ₨ {summaryStats.monthlyCommitmentsSum.toLocaleString()}
                  </td>
                  {/* Col I: Quarterly Commitments */}
                  <td className="p-2.5 text-right border-r border-slate-800 text-indigo-300">
                    ₨ {summaryStats.quarterlyCommitmentsSum.toLocaleString()}
                  </td>
                  {/* Col J: Annually Commitments */}
                  <td className="p-2.5 text-right border-r border-slate-800 text-white font-black">
                    ₨ {summaryStats.annuallyCommitmentsSum.toLocaleString()}
                  </td>
                  {/* Cols K through V: 12 Month Totals */}
                  {MONTH_KEYS.map((mKey) => (
                    <td key={mKey} className="p-2 text-right border-r border-slate-800 text-emerald-400">
                      {summaryStats.monthSums[mKey] > 0 ? `₨ ${(summaryStats.monthSums[mKey] / 1000).toFixed(summaryStats.monthSums[mKey] >= 10000 ? 0 : 1)}k` : '—'}
                    </td>
                  ))}
                  {/* Col W: Total Collected (Money Paid) */}
                  <td className="p-2.5 text-right border-r border-slate-800 text-emerald-300 font-black">
                    ₨ {summaryStats.totalPaid.toLocaleString()}
                  </td>
                  {/* Col X: Target Money Total */}
                  <td className="p-2.5 text-right border-r border-slate-800 text-blue-300 font-black">
                    ₨ {summaryStats.totalPledged.toLocaleString()}
                  </td>
                  {/* Col Y: Total Remaining */}
                  <td className="p-2.5 text-right border-r border-slate-800 text-amber-300 font-black">
                    ₨ {summaryStats.totalBalance.toLocaleString()}
                  </td>
                  {/* Col Z: Payment Mode Summary */}
                  <td className="p-2 text-center border-r border-slate-800 text-[10px] text-slate-400 font-sans">
                    Cash: {Math.round((summaryStats.cashTotal / (summaryStats.totalPaid || 1)) * 100)}%
                  </td>
                  {/* Col AA: Bank Summary */}
                  <td className="p-2 text-center border-r border-slate-800 text-[10px] text-slate-400 font-sans">
                    Bank: {Math.round((summaryStats.bankTotal / (summaryStats.totalPaid || 1)) * 100)}%
                  </td>
                  {/* Col AB: Remarks */}
                  <td className="p-2 text-center text-emerald-400 font-sans text-xs">
                    {summaryStats.collectionRate}% Realized
                  </td>
                </tr>
              </tfoot>

            </table>

            {/* Datalist autocomplete for Profession column */}
            <datalist id="profession-list">
              {COMMON_PROFESSIONS.map((p) => (
                <option key={p} value={p} />
              ))}
            </datalist>
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

      {/* Expanded Cell Modal Window */}
      {expandedCell && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150" onClick={() => setExpandedCell(null)}>
          <div 
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-emerald-300 dark:border-emerald-700 max-w-xl w-full overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-emerald-50 via-teal-50 to-white dark:from-emerald-950/40 dark:via-slate-800 dark:to-slate-800">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-mono font-bold text-sm shadow-xs shrink-0">
                  {expandedCell.colLetter || <Maximize2 size={16} />}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 truncate">
                    {expandedCell.title}
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                    {expandedCell.donorName && (
                      <span className="font-semibold text-emerald-700 dark:text-emerald-300 truncate">
                        Member: {expandedCell.donorName}
                      </span>
                    )}
                    {expandedCell.zila && (
                      <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        {expandedCell.zila}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons: Prev, Next, Copy, Close */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => handleNavigateExpandedCell('prev')}
                  className="p-1.5 rounded-lg hover:bg-emerald-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                  title="Previous cell in row (Left)"
                >
                  <ArrowLeft size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => handleNavigateExpandedCell('next')}
                  className="p-1.5 rounded-lg hover:bg-emerald-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                  title="Next cell in row (Right)"
                >
                  <ArrowRight size={15} />
                </button>
                <div className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-1" />
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(expandedCellEditValue || '');
                    setCopiedCellSuccess(true);
                    setTimeout(() => setCopiedCellSuccess(false), 2000);
                  }}
                  className="p-1.5 rounded-lg hover:bg-emerald-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors relative"
                  title="Copy cell value"
                >
                  {copiedCellSuccess ? <Check size={15} className="text-emerald-600" /> : <Copy size={15} />}
                </button>
                <button
                  type="button"
                  onClick={() => setExpandedCell(null)}
                  className="p-1.5 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/40 text-slate-500 hover:text-rose-600 transition-colors"
                  title="Close modal (Esc)"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Modal Body / Text Editor */}
            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold uppercase tracking-wider text-[10px] text-emerald-700 dark:text-emerald-400">
                  Cell Value (Expanded Content)
                </span>
                <span>
                  {expandedCellEditValue.length} characters • {expandedCellEditValue.trim() ? expandedCellEditValue.trim().split(/\s+/).length : 0} words
                </span>
              </div>

              {['monthlyAmount', 'quarterlyAmount', 'annuallyAmount'].includes(expandedCell.colKey) && (
                <div className="flex flex-wrap items-center gap-2 p-2.5 bg-blue-50/50 dark:bg-slate-800/80 border border-blue-200/60 dark:border-slate-700 rounded-xl">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Quick Selection:</span>
                  <button
                    type="button"
                    onClick={() => setExpandedCellEditValue('✓')}
                    className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-bold text-xs flex items-center gap-1 shadow-2xs transition-colors"
                  >
                    <Check size={13} strokeWidth={3} /> Tick (✓)
                  </button>
                  <button
                    type="button"
                    onClick={() => setExpandedCellEditValue('✗')}
                    className="px-3 py-1 bg-rose-500 hover:bg-rose-600 text-white rounded-lg font-bold text-xs flex items-center gap-1 shadow-2xs transition-colors"
                  >
                    <X size={13} strokeWidth={3} /> Cross (✗)
                  </button>
                  <button
                    type="button"
                    onClick={() => setExpandedCellEditValue('')}
                    className="px-2.5 py-1 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-lg text-xs transition-colors"
                  >
                    Clear
                  </button>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 ml-auto">
                    (Or type any amount / custom text below)
                  </span>
                </div>
              )}

              <textarea
                value={expandedCellEditValue}
                onChange={(e) => setExpandedCellEditValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    handleSaveExpandedCell();
                  } else if (e.key === 'Escape') {
                    setExpandedCell(null);
                  }
                }}
                rows={6}
                placeholder="Enter or edit cell content..."
                className="w-full p-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-y"
              />

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-400">
                  Tip: Press <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-[10px] font-mono">Ctrl+Enter</kbd> to save
                </span>
                
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setExpandedCell(null)}
                    className="px-3.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveExpandedCell}
                    className="px-4 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs hover:shadow-md transition-all flex items-center gap-1.5"
                  >
                    <Check size={14} />
                    <span>Save Changes</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
