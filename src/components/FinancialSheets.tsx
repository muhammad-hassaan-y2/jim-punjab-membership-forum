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
  Check
} from 'lucide-react';
import { Transaction, SheetTab } from '../types/finance';
import { 
  exportTransactionsToExcel, 
  exportTransactionsToCSV, 
  parseExcelOrCSVFile, 
  printSheetAsPDF,
  exportRawGridToExcel,
  printRawGridAsPDF
} from '../utils/exportUtils';

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
    activeTemplate,
    loadTemplate,
    createRawBlankSheet,
    createTemplateSheet,
    addSheetTab,
    deleteSheetTab,
    setActiveTab, 
    setActiveReceiptTransaction, 
    addBlankRow,
    updateCell,
    deleteTransaction, 
    duplicateTransaction,
    clearAllTransactions,
    setIsPeriodicModalOpen,
    setIsHistoryModalOpen,
  } = useFinance();

  // Active Sheet Tab filter & Sheet Number
  const currentSheetIndex = sheetTabs.findIndex(t => t.id === activeSheetTabId);
  const currentSheetNumber = currentSheetIndex >= 0 ? currentSheetIndex + 1 : 1;
  const currentSheetTab = sheetTabs.find(t => t.id === activeSheetTabId);

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
  const [selectedCell, setSelectedCell] = useState<{ rowId: string; rowIndex: number; colKey: keyof Transaction; colLetter: string } | null>(null);
  const [editingCell, setEditingCell] = useState<{ rowId: string; colKey: keyof Transaction } | null>(null);
  const [cellEditValue, setCellEditValue] = useState<string>('');
  const [formulaBarValue, setFormulaBarValue] = useState<string>('');

  // Template gallery bar toggle
  const [showTemplateBar, setShowTemplateBar] = useState(false);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'income' | 'expense'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPaymentMode, setSelectedPaymentMode] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'receiptNo'>('receiptNo');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Pagination & Row Limiting State (Template Mode)
  const [rowLimit, setRowLimit] = useState<'25' | '50' | '100' | '250' | '500' | 'all'>('100');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [templateAddCount, setTemplateAddCount] = useState<number>(50);

  // New Sheet Tab Modal
  const [isNewSheetModalOpen, setIsNewSheetModalOpen] = useState(false);
  const [newSheetName, setNewSheetName] = useState('');
  const [newSheetCategory, setNewSheetCategory] = useState('');

  // File import ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Column definitions matching exact specified format
  const columns: { letter: string; key: keyof Transaction; titleEn: string; width: string; align?: 'left' | 'center' | 'right' }[] = [
    { letter: 'A', key: 'receiptNo', titleEn: 'Receipt No', width: 'w-40' },
    { letter: 'B', key: 'date', titleEn: 'Date', width: 'w-32', align: 'center' },
    { letter: 'C', key: 'donorName', titleEn: 'Received From', width: 'w-52' },
    { letter: 'D', key: 'address', titleEn: 'Address', width: 'w-48' },
    { letter: 'E', key: 'reference', titleEn: 'Reference', width: 'w-40' },
    { letter: 'F', key: 'amount', titleEn: 'Money', width: 'w-36', align: 'right' },
    { letter: 'G', key: 'paymentMode', titleEn: 'Cheque or CASH', width: 'w-36', align: 'center' },
    { letter: 'H', key: 'bankName', titleEn: 'Bank Name', width: 'w-44' },
    { letter: 'I', key: 'phone', titleEn: 'Mobile Number', width: 'w-36' },
    { letter: 'J', key: 'categoryId', titleEn: 'Fund Category', width: 'w-44' },
    { letter: 'K', key: 'notes', titleEn: 'Notes / Remarks', width: 'w-48' },
  ];

  // Filtered & Sorted Transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      // Sheet tab filter
      if (currentSheetTab) {
        if (currentSheetTab.categoryFilter && t.categoryId !== currentSheetTab.categoryFilter) return false;
        if (currentSheetTab.typeFilter && currentSheetTab.typeFilter !== 'all' && t.type !== currentSheetTab.typeFilter) return false;
      }

      // Filter Toolbar
      if (selectedType !== 'all' && t.type !== selectedType) return false;
      if (selectedCategory !== 'all' && t.categoryId !== selectedCategory) return false;
      if (selectedPaymentMode !== 'all' && t.paymentMode !== selectedPaymentMode) return false;

      // Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesReceipt = (t.receiptNo || '').toLowerCase().includes(query);
        const matchesName = (t.donorName || '').toLowerCase().includes(query);
        const matchesNameUrdu = (t.donorNameUrdu || '').includes(query);
        const matchesRef = (t.reference || '').toLowerCase().includes(query);
        const matchesAddress = (t.address || '').toLowerCase().includes(query);
        const matchesNotes = (t.notes || '').toLowerCase().includes(query);
        const matchesBank = (t.bankName || '').toLowerCase().includes(query);

        if (!matchesReceipt && !matchesName && !matchesNameUrdu && !matchesRef && !matchesAddress && !matchesNotes && !matchesBank) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'amount') {
        return sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount;
      }
      if (sortBy === 'receiptNo') {
        return sortOrder === 'asc' ? a.receiptNo.localeCompare(b.receiptNo) : b.receiptNo.localeCompare(a.receiptNo);
      }
      return sortOrder === 'asc' ? new Date(a.date).getTime() - new Date(b.date).getTime() : new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [transactions, currentSheetTab, selectedType, selectedCategory, selectedPaymentMode, searchQuery, sortBy, sortOrder]);

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

  // Google Sheets Quick Summary Statistics
  const summaryStats = useMemo(() => {
    const amounts = filteredTransactions.filter(t => t.type === 'income' && t.status !== 'cancelled').map(t => Number(t.amount || 0));
    const sum = amounts.reduce((a, b) => a + b, 0);
    const count = amounts.length;
    const avg = count > 0 ? sum / count : 0;
    const min = count > 0 ? Math.min(...amounts) : 0;
    const max = count > 0 ? Math.max(...amounts) : 0;

    const expenseAmounts = filteredTransactions.filter(t => t.type === 'expense' && t.status !== 'cancelled').map(t => Number(t.amount || 0));
    const totalExp = expenseAmounts.reduce((a, b) => a + b, 0);

    return {
      sum,
      totalExp,
      net: sum - totalExp,
      avg,
      min,
      max,
      count: filteredTransactions.length,
    };
  }, [filteredTransactions]);

  // Handle cell click selection
  const handleCellClick = (rowId: string, rowIndex: number, colKey: keyof Transaction, colLetter: string) => {
    const tx = transactions.find(t => t.id === rowId);
    if (!tx) return;
    setSelectedCell({ rowId, rowIndex, colKey, colLetter });
    setFormulaBarValue(String(tx[colKey] !== undefined ? tx[colKey] : ''));
  };

  // Handle cell double click for inline editing
  const handleCellDoubleClick = (rowId: string, colKey: keyof Transaction) => {
    const tx = transactions.find(t => t.id === rowId);
    if (!tx) return;
    setEditingCell({ rowId, colKey });
    setCellEditValue(String(tx[colKey] !== undefined ? tx[colKey] : ''));
  };

  // Commit inline edit
  const handleCommitEdit = (rowId: string, colKey: keyof Transaction, value: string) => {
    let finalVal: any = value;
    if (colKey === 'amount') {
      finalVal = parseFloat(value) || 0;
    }
    updateCell(rowId, colKey, finalVal);
    setEditingCell(null);
    setFormulaBarValue(String(finalVal));
  };

  // Google Sheets keyboard navigation (Enter moves down, Tab moves right) in Template Mode
  const handleTemplateCellKeyDown = (
    e: React.KeyboardEvent,
    rowId: string,
    colKey: keyof Transaction,
    currentIdx: number,
    value: string
  ) => {
    if (e.key === 'Enter') {
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
        setFormulaBarValue(String(nextTx[colKey] !== undefined ? nextTx[colKey] : ''));
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      handleCommitEdit(rowId, colKey, value);
      const colIdx = columns.findIndex(c => c.key === colKey);
      if (colIdx + 1 < columns.length) {
        const nextCol = columns[colIdx + 1];
        const curTx = displayedTransactions[currentIdx];
        setSelectedCell({
          rowId: curTx.id,
          rowIndex: startIndex + currentIdx,
          colKey: nextCol.key,
          colLetter: nextCol.letter
        });
        setFormulaBarValue(String(curTx[nextCol.key] !== undefined ? curTx[nextCol.key] : ''));
      }
    } else if (e.key === 'Escape') {
      setEditingCell(null);
    }
  };

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
      let finalVal: any = formulaBarValue;
      if (selectedCell.colKey === 'amount') {
        finalVal = parseFloat(formulaBarValue) || 0;
      }
      updateCell(selectedCell.rowId, selectedCell.colKey, finalVal);
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
    const tabName = newSheetName || `Sheet ${sheetTabs.length + 1}`;
    addSheetTab(tabName, newSheetCategory || undefined);
    setIsNewSheetModalOpen(false);
    setNewSheetName('');
    setNewSheetCategory('');
  };

  const activeCellCoord = isRawMode
    ? (selectedRawCell ? `${selectedRawCell.col}${selectedRawCell.row}` : 'A1')
    : (selectedCell ? `${selectedCell.colLetter}${selectedCell.rowIndex + 1}` : 'A1');

  return (
    <div className="space-y-4 pb-12">
      
      {/* SPREADSHEET CARD */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        
        {/* Title Bar: Dashboard Button & Sheet Info & Mode Switcher */}
        <div className="flex flex-wrap items-center justify-between p-3.5 border-b border-slate-100 dark:border-slate-800 gap-3">
          
          <div className="flex items-center gap-3">
            {/* Direct Dashboard Button - Fully Available only when NOT in standalone share view */}
            {!isStandaloneShareView ? (
              <>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className="flex items-center gap-2 px-4 py-2 sm:px-4.5 sm:py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white dark:bg-slate-100 dark:hover:bg-white dark:text-slate-950 font-black text-xs sm:text-sm transition-all shadow-md hover:shadow-lg active:scale-95 cursor-pointer"
                  title="Return to Main Dashboard"
                >
                  <ArrowLeft className="w-4 h-4 stroke-[3]" />
                  <span>Dashboard</span>
                </button>
                <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />
              </>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Shared Sheet View</span>
              </div>
            )}

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight">
                    Sheet {currentSheetNumber}
                  </h2>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300">
                    {isRawMode ? 'Raw Excel / Google Grid' : 'Institutional Ledger'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  {isRawMode ? `${rawRowCount} rows × 26 columns (A-Z)` : `${filteredTransactions.length} records recorded`}
                </p>
              </div>
            </div>
          </div>

          {/* Mode Switcher Toggle: [Excel/Google Grid (A-Z)] vs [9-Column Template] */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
            <button
              onClick={() => setViewModeOverride('raw')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                isRawMode
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
              title="Switch to raw Excel / Google Sheet freeform grid with all columns (A-Z)"
            >
              <Grid3X3 className="w-3.5 h-3.5" />
              <span>Excel Grid (A-Z)</span>
            </button>
            <button
              onClick={() => setViewModeOverride('template')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                !isRawMode
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
              title="Switch to 9-Column pre-configured Institutional Ledger Template"
            >
              <TableProperties className="w-3.5 h-3.5" />
              <span>9-Column Template</span>
            </button>
          </div>

          {/* Action Buttons: Add, Share, Download Excel, Print PDF, Import, Clear */}
          <div className="flex flex-wrap items-center gap-2">
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".xlsx,.xls,.csv"
              className="hidden"
            />

            {/* Shareable Link Button */}
            <button
              onClick={handleShareSheet}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-bold transition-all shadow-2xs ${
                isLinkCopied
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/20'
                  : 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60'
              }`}
              title="Copy shareable link to this sheet"
            >
              {isLinkCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Share Sheet</span>
                </>
              )}
            </button>

            {/* Add Row Button & Quick Presets */}
            {isRawMode ? (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleAddRawRows(100)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white shadow-sm transition-all hover:scale-105 active:scale-95 bg-emerald-600 hover:bg-emerald-700"
                  title="Add 100 more rows to raw sheet"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add 100 Rows</span>
                </button>
                <button
                  onClick={() => handleAddRawRows(50)}
                  className="hidden sm:inline-flex px-2.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-200 text-xs font-bold"
                  title="Add 50 rows"
                >
                  +50
                </button>
                <button
                  onClick={() => handleAddRawRows(200)}
                  className="hidden md:inline-flex px-2.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-200 text-xs font-bold"
                  title="Add 200 rows"
                >
                  +200
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => addBlankRow(1)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white shadow-sm transition-all hover:scale-105 active:scale-95 bg-emerald-600 hover:bg-emerald-700"
                  title="Add 1 row to ledger"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add Row</span>
                </button>
                <button
                  onClick={() => addBlankRow(10)}
                  className="hidden sm:inline-flex px-2.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-200 text-xs font-bold"
                  title="Add 10 rows"
                >
                  +10
                </button>
                <button
                  onClick={() => addBlankRow(50)}
                  className="hidden sm:inline-flex px-2.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-200 text-xs font-bold"
                  title="Add 50 rows"
                >
                  +50
                </button>
                <button
                  onClick={() => addBlankRow(100)}
                  className="hidden md:inline-flex px-2.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-200 text-xs font-bold"
                  title="Add 100 rows"
                >
                  +100
                </button>
              </div>
            )}

            {/* Download Sheet (Excel) */}
            <button
              onClick={() => {
                if (isRawMode) {
                  exportRawGridToExcel(currentSheetTab?.name || `Sheet_${currentSheetNumber}`, rawGridData, rawRowCount, RAW_COLUMNS);
                } else {
                  exportTransactionsToExcel(filteredTransactions, categories, orgConfig, currentSheetTab?.name || `Sheet_${currentSheetNumber}`);
                }
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 text-xs font-semibold shadow-2xs hover:border-emerald-500 hover:text-emerald-600 transition-colors"
              title="Download Sheet as formatted Excel (.xlsx)"
            >
              <Download className="w-4 h-4 text-emerald-500" />
              <span>Download Excel</span>
            </button>

            {/* Print in PDF */}
            <button
              onClick={() => {
                if (isRawMode) {
                  printRawGridAsPDF(currentSheetTab?.name || `Sheet ${currentSheetNumber}`, rawGridData, rawRowCount, RAW_COLUMNS, orgConfig);
                } else {
                  printSheetAsPDF(currentSheetTab?.name || `Sheet ${currentSheetNumber}`, filteredTransactions, categories, orgConfig);
                }
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 text-xs font-semibold shadow-2xs hover:border-blue-500 hover:text-blue-600 transition-colors"
              title="Print Sheet in PDF (Landscape format with official headers)"
            >
              <Printer className="w-4 h-4 text-blue-500" />
              <span>Print PDF</span>
            </button>

            {/* Import Google Sheet / Excel */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 text-xs font-semibold shadow-2xs"
              title="Import from Google Sheets / Excel (.xlsx / .csv)"
            >
              <Upload className="w-4 h-4 text-indigo-500" />
              <span className="hidden sm:inline">Import</span>
            </button>

            {/* Clear Sheet */}
            <button
              onClick={() => {
                if (window.confirm('Clear all data on this sheet and reset?')) {
                  if (isRawMode) {
                    setRawGridData({});
                    localStorage.removeItem(`jamia_raw_grid_${activeSheetTabId}`);
                  } else {
                    clearAllTransactions();
                  }
                }
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 hover:bg-rose-100 text-xs font-semibold transition-colors"
              title="Reset this sheet"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear</span>
            </button>

          </div>
        </div>

        {/* TEMPLATE FILTER BAR (When in Template Mode) */}
        {!isRawMode && (
          <div className="flex flex-wrap items-center justify-between p-2 bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 gap-2 text-xs">
            
            <div className="flex flex-wrap items-center gap-1.5">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as any)}
                className="py-1 px-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold"
              >
                <option value="all">All Types</option>
                <option value="income">Income Only</option>
                <option value="expense">Expense Only</option>
              </select>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="py-1 px-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold max-w-[170px]"
              >
                <option value="all">All Fund Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.nameEnglish}</option>
                ))}
              </select>

              <select
                value={selectedPaymentMode}
                onChange={(e) => setSelectedPaymentMode(e.target.value)}
                className="py-1 px-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold"
              >
                <option value="all">All Payment Modes</option>
                <option value="Online">Online Transfer</option>
                <option value="Cash">Cash</option>
                <option value="Cheque">Cheque</option>
                <option value="DD">Demand Draft (DD)</option>
              </select>

              {/* Rows Per Page Limit Selector in Filter Bar */}
              <div className="flex items-center gap-1 pl-1 border-l border-slate-300 dark:border-slate-700">
                <span className="text-slate-400 font-bold hidden sm:inline">Limit:</span>
                <select
                  value={rowLimit}
                  onChange={(e) => {
                    setRowLimit(e.target.value as any);
                    setCurrentPage(1);
                  }}
                  className="py-1 px-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-blue-600 dark:text-blue-400"
                  title="Limit rows per page"
                >
                  <option value="25">25 rows</option>
                  <option value="50">50 rows</option>
                  <option value="100">100 rows</option>
                  <option value="250">250 rows</option>
                  <option value="500">500 rows</option>
                  <option value="all">All ({totalTemplateRows})</option>
                </select>
              </div>

              {/* Quick Prev / Next Pagination in Filter Bar */}
              {rowLimit !== 'all' && totalPages > 1 && (
                <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-1.5 py-0.5">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={safePage <= 1}
                    className="text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:text-blue-600 font-bold px-1"
                    title="Previous page"
                  >
                    ◀
                  </button>
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    {safePage}/{totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={safePage >= totalPages}
                    className="text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:text-blue-600 font-bold px-1"
                    title="Next page"
                  >
                    ▶
                  </button>
                </div>
              )}
            </div>

            {/* Search Box */}
            <div className="relative min-w-[220px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute top-2.5 left-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search in ledger..."
                className="w-full py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none pl-8 pr-2"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute top-2 right-2 text-slate-400"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
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
                  let finalVal: any = val;
                  if (selectedCell.colKey === 'amount') {
                    finalVal = parseFloat(val) || 0;
                  }
                  updateCell(selectedCell.rowId, selectedCell.colKey, finalVal);
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
                      <td className="w-12 p-2 text-center font-mono font-bold text-slate-500 dark:text-slate-400 border-r border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 sticky left-0 z-10">
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
                            onClick={() => {
                              setSelectedRawCell({ row: rowNum, col });
                              setFormulaBarValue(cellVal);
                            }}
                            onDoubleClick={() => {
                              setSelectedRawCell({ row: rowNum, col });
                              setEditingRawCell({ row: rowNum, col });
                              setRawCellEditValue(cellVal);
                              setFormulaBarValue(cellVal);
                            }}
                            className={`p-1.5 border-r border-slate-200 dark:border-slate-800 cursor-cell relative min-h-[28px] overflow-hidden truncate max-w-[180px] ${
                              isSelected ? 'ring-2 ring-emerald-500 bg-emerald-50/25 dark:bg-emerald-950/20 z-10' : ''
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
                                    if (rowNum < rawRowCount) {
                                      setSelectedRawCell({ row: rowNum + 1, col });
                                      setFormulaBarValue(rawGridData[rowNum + 1]?.[col] || '');
                                    }
                                  } else if (e.key === 'Escape') {
                                    setEditingRawCell(null);
                                  } else if (e.key === 'Tab') {
                                    e.preventDefault();
                                    handleRawCellChange(rowNum, col, rawCellEditValue);
                                    setEditingRawCell(null);
                                    const nextColIdx = RAW_COLUMNS.indexOf(col) + 1;
                                    if (nextColIdx < RAW_COLUMNS.length) {
                                      const nextCol = RAW_COLUMNS[nextColIdx];
                                      setSelectedRawCell({ row: rowNum, col: nextCol });
                                      setFormulaBarValue(rawGridData[rowNum]?.[nextCol] || '');
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
          /* MODE B: 9-COLUMN INSTITUTIONAL SPREADSHEET TEMPLATE                       */
          /* ========================================================================= */
          <div className="overflow-x-auto max-h-[620px] bg-white dark:bg-slate-950">
            <table className="w-full text-left border-collapse font-sans text-xs">
            
            {/* Column Letter & Title Headers */}
            <thead className="sticky top-0 z-20 bg-slate-100 dark:bg-slate-800 border-b-2 border-slate-300 dark:border-slate-700 select-none shadow-xs">
              <tr>
                {/* Row Number Corner Box (Sticky Left) */}
                <th className="w-12 p-2 text-center border-r border-slate-300 dark:border-slate-700 text-slate-500 font-mono text-[11px] bg-slate-200/90 dark:bg-slate-900 sticky left-0 z-30">
                  #
                </th>

                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={`p-2 border-r border-slate-300 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-200 ${col.width} hover:bg-slate-200/70 dark:hover:bg-slate-700/60 transition-colors text-center`}
                  >
                    <div className="flex flex-col items-center justify-center gap-0.5">
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 font-black text-xs">{col.letter}</span>
                      <span className="text-[11px] font-sans font-bold text-slate-700 dark:text-slate-200 truncate">{col.titleEn}</span>
                    </div>
                  </th>
                ))}

                {/* Actions Header */}
                <th className="w-24 p-2 text-center font-bold text-slate-700 dark:text-slate-200 text-xs">
                  Actions
                </th>
              </tr>
            </thead>

            {/* Spreadsheet Rows */}
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {displayedTransactions.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 2} className="py-16 px-4 text-center">
                    <div className="max-w-md mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
                        <FileSpreadsheet className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-700 dark:text-slate-200 text-sm">
                          {currentSheetTab?.name || 'Sheet'} is currently empty
                        </h4>
                        <p className="text-xs text-slate-400 mt-1">
                          No records recorded in this ledger yet. Add rows directly or generate a monthly/weekly periodic template.
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
                        <button
                          onClick={() => setIsPeriodicModalOpen(true)}
                          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Setup Monthly/Weekly Ledger</span>
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                displayedTransactions.map((tx, idx) => {
                  const rowIndex = startIndex + idx;
                  const isRowSelected = selectedCell?.rowId === tx.id;

                  return (
                    <tr 
                      key={tx.id}
                      className={`hover:bg-blue-50/50 dark:hover:bg-slate-800/50 transition-colors group ${
                        isRowSelected ? 'bg-blue-50/30 dark:bg-slate-800/30' : ''
                      }`}
                    >
                      {/* Row Number (1, 2, 3...) Sticky Left */}
                      <td className="w-12 p-2 text-center font-mono font-bold text-slate-500 dark:text-slate-400 border-r border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 sticky left-0 z-10 select-none">
                        {rowIndex + 1}
                      </td>

                      {/* Column A: Receipt No */}
                      <td 
                        onClick={() => handleCellClick(tx.id, rowIndex, 'receiptNo', 'A')}
                        onDoubleClick={() => handleCellDoubleClick(tx.id, 'receiptNo')}
                        className={`p-2 border-r border-slate-200 dark:border-slate-800 font-mono font-bold text-blue-600 dark:text-blue-400 cursor-cell relative ${
                          selectedCell?.rowId === tx.id && selectedCell.colKey === 'receiptNo' ? 'ring-2 ring-emerald-500 bg-emerald-50/20' : ''
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
                      </td>

                      {/* Column B: Date */}
                      <td 
                        onClick={() => handleCellClick(tx.id, rowIndex, 'date', 'B')}
                        onDoubleClick={() => handleCellDoubleClick(tx.id, 'date')}
                        className={`p-2 border-r border-slate-200 dark:border-slate-800 font-mono text-center cursor-cell ${
                          selectedCell?.rowId === tx.id && selectedCell.colKey === 'date' ? 'ring-2 ring-emerald-500 bg-emerald-50/20' : ''
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
                      </td>

                      {/* Column C: Donor / Payee Name (English) */}
                      <td 
                        onClick={() => handleCellClick(tx.id, rowIndex, 'donorName', 'C')}
                        onDoubleClick={() => handleCellDoubleClick(tx.id, 'donorName')}
                        className={`p-2 border-r border-slate-200 dark:border-slate-800 cursor-cell ${
                          selectedCell?.rowId === tx.id && selectedCell.colKey === 'donorName' ? 'ring-2 ring-emerald-500 bg-emerald-50/20' : ''
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
                          <span className="font-semibold">{tx.donorName || tx.donorNameUrdu || '---'}</span>
                        )}
                      </td>

                      {/* Column D: Address */}
                      <td 
                        onClick={() => handleCellClick(tx.id, rowIndex, 'address', 'D')}
                        onDoubleClick={() => handleCellDoubleClick(tx.id, 'address')}
                        className={`p-2 border-r border-slate-200 dark:border-slate-800 cursor-cell ${
                          selectedCell?.rowId === tx.id && selectedCell.colKey === 'address' ? 'ring-2 ring-emerald-500 bg-emerald-50/20' : ''
                        }`}
                      >
                        {editingCell?.rowId === tx.id && editingCell.colKey === 'address' ? (
                          <input
                            type="text"
                            autoFocus
                            value={cellEditValue}
                            onChange={(e) => setCellEditValue(e.target.value)}
                            onBlur={() => handleCommitEdit(tx.id, 'address', cellEditValue)}
                            onKeyDown={(e) => handleTemplateCellKeyDown(e, tx.id, 'address', idx, cellEditValue)}
                            className="w-full p-1 bg-white dark:bg-slate-900 border border-emerald-500 rounded text-xs"
                          />
                        ) : (
                          <span className="text-slate-600 dark:text-slate-300 truncate block max-w-xs">{tx.address || '---'}</span>
                        )}
                      </td>

                      {/* Column E: Reference */}
                      <td 
                        onClick={() => handleCellClick(tx.id, rowIndex, 'reference', 'E')}
                        onDoubleClick={() => handleCellDoubleClick(tx.id, 'reference')}
                        className={`p-2 border-r border-slate-200 dark:border-slate-800 cursor-cell ${
                          selectedCell?.rowId === tx.id && selectedCell.colKey === 'reference' ? 'ring-2 ring-emerald-500 bg-emerald-50/20' : ''
                        }`}
                      >
                        {editingCell?.rowId === tx.id && editingCell.colKey === 'reference' ? (
                          <input
                            type="text"
                            autoFocus
                            value={cellEditValue}
                            onChange={(e) => setCellEditValue(e.target.value)}
                            onBlur={() => handleCommitEdit(tx.id, 'reference', cellEditValue)}
                            onKeyDown={(e) => handleTemplateCellKeyDown(e, tx.id, 'reference', idx, cellEditValue)}
                            className="w-full p-1 bg-white dark:bg-slate-900 border border-emerald-500 rounded text-xs"
                          />
                        ) : (
                          tx.reference || '---'
                        )}
                      </td>

                      {/* Column F: Money (Amount) */}
                      <td 
                        onClick={() => handleCellClick(tx.id, rowIndex, 'amount', 'F')}
                        onDoubleClick={() => handleCellDoubleClick(tx.id, 'amount')}
                        className={`p-2 border-r border-slate-200 dark:border-slate-800 text-right font-mono font-bold cursor-cell ${
                          selectedCell?.rowId === tx.id && selectedCell.colKey === 'amount' ? 'ring-2 ring-emerald-500 bg-emerald-50/20' : ''
                        }`}
                      >
                        {editingCell?.rowId === tx.id && editingCell.colKey === 'amount' ? (
                          <input
                            type="number"
                            autoFocus
                            value={cellEditValue}
                            onChange={(e) => setCellEditValue(e.target.value)}
                            onBlur={() => handleCommitEdit(tx.id, 'amount', cellEditValue)}
                            onKeyDown={(e) => handleTemplateCellKeyDown(e, tx.id, 'amount', idx, cellEditValue)}
                            className="w-full p-1 bg-white dark:bg-slate-900 border border-emerald-500 rounded text-xs text-right font-mono"
                          />
                        ) : (
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                            {Number(tx.amount || 0).toLocaleString()}
                          </span>
                        )}
                      </td>

                      {/* Column G: Cheque or CASH */}
                      <td 
                        onClick={() => handleCellClick(tx.id, rowIndex, 'paymentMode', 'G')}
                        className={`p-2 border-r border-slate-200 dark:border-slate-800 text-center ${
                          selectedCell?.rowId === tx.id && selectedCell.colKey === 'paymentMode' ? 'ring-2 ring-emerald-500 bg-emerald-50/20' : ''
                        }`}
                      >
                        <select
                          value={tx.paymentMode || 'Cash'}
                          onChange={(e) => updateCell(tx.id, 'paymentMode', e.target.value as any)}
                          className="w-full bg-transparent border-0 text-xs font-semibold focus:outline-none cursor-pointer text-center"
                        >
                          <option value="Cash">Cash</option>
                          <option value="Cheque">Cheque</option>
                          <option value="Online">Online Transfer</option>
                          <option value="DD">Demand Draft (DD)</option>
                        </select>
                      </td>

                      {/* Column H: Bank Name */}
                      <td 
                        onClick={() => handleCellClick(tx.id, rowIndex, 'bankName', 'H')}
                        onDoubleClick={() => handleCellDoubleClick(tx.id, 'bankName')}
                        className={`p-2 border-r border-slate-200 dark:border-slate-800 cursor-cell ${
                          selectedCell?.rowId === tx.id && selectedCell.colKey === 'bankName' ? 'ring-2 ring-emerald-500 bg-emerald-50/20' : ''
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
                      </td>

                      {/* Column I: Mobile Number */}
                      <td 
                        onClick={() => handleCellClick(tx.id, rowIndex, 'phone', 'I')}
                        onDoubleClick={() => handleCellDoubleClick(tx.id, 'phone')}
                        className={`p-2 border-r border-slate-200 dark:border-slate-800 font-mono cursor-cell ${
                          selectedCell?.rowId === tx.id && selectedCell.colKey === 'phone' ? 'ring-2 ring-emerald-500 bg-emerald-50/20' : ''
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
                      </td>

                      {/* Column J: Fund Category */}
                      <td 
                        onClick={() => handleCellClick(tx.id, rowIndex, 'categoryId', 'J')}
                        className={`p-2 border-r border-slate-200 dark:border-slate-800 cursor-pointer ${
                          selectedCell?.rowId === tx.id && selectedCell.colKey === 'categoryId' ? 'ring-2 ring-emerald-500 bg-emerald-50/20' : ''
                        }`}
                      >
                        <select
                          value={tx.categoryId}
                          onChange={(e) => updateCell(tx.id, 'categoryId', e.target.value)}
                          className="w-full bg-transparent border-0 text-xs font-semibold focus:outline-none cursor-pointer"
                        >
                          {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.nameEnglish} ({c.nameUrdu})
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Column K: Notes / Remarks */}
                      <td 
                        onClick={() => handleCellClick(tx.id, rowIndex, 'notes', 'K')}
                        onDoubleClick={() => handleCellDoubleClick(tx.id, 'notes')}
                        className={`p-2 border-r border-slate-200 dark:border-slate-800 cursor-cell ${
                          selectedCell?.rowId === tx.id && selectedCell.colKey === 'notes' ? 'ring-2 ring-emerald-500 bg-emerald-50/20' : ''
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
                      </td>


                      {/* Actions */}
                      <td className="p-2 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
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

          </table>

          {/* GOOGLE SHEETS CLONE STYLE BOTTOM ROW CONTROLS (Template Mode) */}
          <div className="p-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
            
            {/* Left: Add rows input + presets (Google Sheet Clone Pattern) */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-slate-600 dark:text-slate-300 font-bold">Add rows at bottom:</span>
              <div className="flex items-center border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-800 shadow-2xs">
                <input
                  type="number"
                  min="1"
                  max="2000"
                  value={templateAddCount}
                  onChange={(e) => setTemplateAddCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-16 p-1.5 text-center font-bold text-slate-900 dark:text-white bg-transparent border-0 focus:outline-none"
                />
                <button
                  onClick={() => addBlankRow(templateAddCount)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Rows</span>
                </button>
              </div>

              {/* Quick presets */}
              <div className="flex items-center gap-1">
                {[10, 25, 50, 100, 200, 500].map(cnt => (
                  <button
                    key={cnt}
                    onClick={() => addBlankRow(cnt)}
                    className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-200 font-bold hover:border-emerald-500 hover:text-emerald-600 transition-colors"
                    title={`Add ${cnt} rows`}
                  >
                    +{cnt}
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Limit Selector & Pagination Controls */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Rows per page:</span>
                <select
                  value={rowLimit}
                  onChange={(e) => {
                    setRowLimit(e.target.value as any);
                    setCurrentPage(1);
                  }}
                  className="py-1 px-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold focus:outline-none"
                >
                  <option value="25">25 rows</option>
                  <option value="50">50 rows</option>
                  <option value="100">100 rows</option>
                  <option value="250">250 rows</option>
                  <option value="500">500 rows</option>
                  <option value="all">All rows ({totalTemplateRows})</option>
                </select>
              </div>

              <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                Showing {totalTemplateRows === 0 ? 0 : startIndex + 1}–{endIndex} of {totalTemplateRows} records
              </span>

              {rowLimit !== 'all' && totalPages > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={safePage <= 1}
                    className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 font-bold"
                  >
                    ◀ Prev
                  </button>
                  <span className="px-2 font-bold text-slate-700 dark:text-slate-200">
                    Page {safePage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={safePage >= totalPages}
                    className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 font-bold"
                  >
                    Next ▶
                  </button>
                </div>
              )}
            </div>

          </div>

        </div>
        )}

        {/* GOOGLE SHEETS MULTI-SHEET TABS BAR (BOTTOM) */}
        <div className="flex flex-wrap items-center justify-between p-2 bg-slate-100 dark:bg-slate-900 border-t border-slate-300 dark:border-slate-800 gap-2">
          
          {/* Sheet Tabs List - Dynamic single Sheet 1 by default, or loaded template tabs */}
          <div className="flex items-center gap-1 overflow-x-auto">
            
            {/* Add New Sheet Tab Button */}
            <button
              onClick={() => createTemplateSheet()}
              className="p-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 shadow-xs flex items-center gap-1 text-xs font-bold"
              title="Add New Sheet"
            >
              <Plus className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline text-[11px]">Sheet {sheetTabs.length + 1}</span>
            </button>

            {sheetTabs.map((tab, idx) => {
              const isActive = activeSheetTabId === tab.id;
              const sheetNum = idx + 1;
              return (
                <div
                  key={tab.id}
                  onClick={() => setActiveSheetTabId(tab.id)}
                  className={`group flex items-center gap-2 px-4 py-2 rounded-t-lg text-xs font-bold cursor-pointer transition-all border-t-2 ${
                    isActive
                      ? 'bg-white dark:bg-slate-950 text-slate-900 dark:text-white border-blue-600 shadow-sm'
                      : 'bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-transparent hover:bg-slate-200'
                  }`}
                >
                  <FileSpreadsheet className={`w-3.5 h-3.5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>Sheet {sheetNum}</span>
                  {tab.periodType === 'raw' && (
                    <span className="text-[9px] px-1 rounded bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-300">A-Z</span>
                  )}
                  {sheetTabs.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSheetTab(tab.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 hover:text-rose-500 text-slate-400 p-0.5 ml-1"
                      title="Close Tab"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}

          </div>

          {/* Quick Row Count & Status Indicator in Tabs Bar */}
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400 px-2">
            <span>
              {isRawMode 
                ? `${displayedRawRowCount}/${rawRowCount} rows`
                : `${totalTemplateRows} records`}
            </span>
          </div>

        </div>

      </div>

      {/* GOOGLE SHEETS BOTTOM QUICK FORMULA & STATS WIDGET (Template Mode) */}
      {!isRawMode && (
        <div className="bg-slate-900 text-white rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 text-xs font-mono shadow-md">
          
          <div className="flex flex-wrap items-center gap-4 text-slate-300">
            <div className="flex items-center gap-1.5">
              <span className="text-emerald-400 font-bold">●</span>
              <span className="font-sans font-bold text-slate-200">COUNT: </span>
              <span className="text-white font-bold">{summaryStats.count}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-emerald-400 font-bold">●</span>
              <span className="font-sans font-bold text-slate-200">SUM: </span>
              <span className="text-emerald-400 font-bold">{orgConfig.currencySymbol} {summaryStats.sum.toLocaleString()}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-rose-400 font-bold">●</span>
              <span className="font-sans font-bold text-slate-200">EXPENSES: </span>
              <span className="text-rose-400 font-bold">{orgConfig.currencySymbol} {summaryStats.totalExp.toLocaleString()}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-amber-400 font-bold">●</span>
              <span className="font-sans font-bold text-slate-200">AVG: </span>
              <span className="text-white">{orgConfig.currencySymbol} {Math.round(summaryStats.avg).toLocaleString()}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-amber-300 font-bold font-sans">
              NET BALANCE: 
            </span>
            <span className="text-base font-black text-amber-400">
              {orgConfig.currencySymbol} {summaryStats.net.toLocaleString()}
            </span>
          </div>

        </div>
      )}

      {/* NEW SHEET MODAL */}
      {isNewSheetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white">
                Create New Sheet Tab
              </h3>
              <button onClick={() => setIsNewSheetModalOpen(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleCreateSheetTab} className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block font-bold mb-1">
                  Sheet Name
                </label>
                <input
                  type="text"
                  value={newSheetName}
                  onChange={(e) => setNewSheetName(e.target.value)}
                  placeholder={`Sheet ${sheetTabs.length + 1}`}
                  className="w-full p-2.5 rounded-xl border"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">
                  Optional Category Filter
                </label>
                <select
                  value={newSheetCategory}
                  onChange={(e) => setNewSheetCategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl border"
                >
                  <option value="">No Filter (All Entries)</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.nameEnglish}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsNewSheetModalOpen(false)}
                  className="px-4 py-2 rounded-xl border text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  Add Sheet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification when shareable link is copied */}
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

    </div>
  );
};
