'use client';

import React, { useState, useRef } from 'react';
import { useFinance } from '../context/FinanceContext';
import { api } from '../services/api';
import { 
  Sparkles, 
  Upload, 
  X, 
  Check, 
  AlertCircle, 
  FileText, 
  RefreshCw, 
  CheckCircle2, 
  Eye, 
  Building2, 
  Calendar, 
  Coins, 
  User, 
  MapPin, 
  Phone, 
  Tag, 
  CreditCard,
  Camera,
  Image as ImageIcon,
  FileCode,
  ExternalLink,
  Layers,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Transaction, MonthlyContributions, MONTH_KEYS, MonthKey } from '../types/finance';

function cleanAmount(val: any): number {
  if (typeof val === 'number') return isNaN(val) ? 0 : Math.abs(val);
  if (!val) return 0;
  const s = String(val).replace(/,/g, '').replace(/[^0-9.]/g, '');
  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
}

interface GeminiReceiptScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (targetSheetId: string) => void;
}

interface ExtractedEntry {
  receiptNo: string;
  date: string;
  donorName: string;
  donorNameUrdu?: string | null;
  branchName: string;
  zila: string;
  phone: string;
  address: string;
  city: string;
  preferredPeriod: 'Monthly' | 'Quarterly' | 'Half Yearly' | 'Annually';
  monthlyAmount: number;
  quarterlyAmount: number;
  halfYearlyAmount: number;
  annuallyAmount: number;
  targetMonth?: string | null;
  amount: number;
  paymentMode: 'Cash' | 'Cheque' | 'Online' | 'DD';
  bankName: string;
  categoryId: string;
  notes: string;
}

export const GeminiReceiptScannerModal: React.FC<GeminiReceiptScannerModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { 
    categories, 
    generateNextReceiptNumber, 
    addTransaction, 
    sheetTabs,
    activeSheetTabId,
    setActiveSheetTabId,
    orgConfig 
  } = useFinance();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Workflow states: 'upload' -> 'scanning' -> 'confirm' -> 'success'
  const [step, setStep] = useState<'upload' | 'scanning' | 'confirm' | 'success'>('upload');
  
  // File state
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [fileMimeType, setFileMimeType] = useState<string>('image/jpeg');
  const [fileName, setFileName] = useState<string>('');
  const [fileSizeStr, setFileSizeStr] = useState<string>('');
  const [isPdf, setIsPdf] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [aiSummary, setAiSummary] = useState<string>('');

  // Target destination sheet
  const [targetSheetId, setTargetSheetId] = useState<string>(activeSheetTabId || 'sheet1');

  // Single vs Multiple Entries state
  const [entries, setEntries] = useState<ExtractedEntry[]>([]);
  const [activeEntryIndex, setActiveEntryIndex] = useState<number>(0);

  if (!isOpen) return null;

  const currentTargetSheet = sheetTabs.find(t => t.id === targetSheetId) || sheetTabs[0];

  // Helper to format file size
  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Process selected file (Document or Image)
  const processUploadedFile = (file: File) => {
    const isFilePdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const isFileImage = file.type.startsWith('image/');

    if (!isFilePdf && !isFileImage) {
      setErrorMessage('Please upload a supported document (PDF) or picture (PNG, JPG, WEBP).');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setErrorMessage('File size exceeds 20MB limit. Please upload a smaller document.');
      return;
    }

    setIsPdf(isFilePdf);
    setFileName(file.name);
    setFileSizeStr(formatBytes(file.size));
    const mime = isFilePdf ? 'application/pdf' : (file.type || 'image/jpeg');
    setFileMimeType(mime);

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setFilePreview(result);
      setErrorMessage(null);
      startScanning(result, mime, file.name);
    };
    reader.readAsDataURL(file);
  };

  // Handle File Input Change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processUploadedFile(file);
  };

  // Handle Drag and Drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    processUploadedFile(file);
  };

  // Run Gemini AI Document Pipeline
  const startScanning = async (base64Data: string, mime: string, name: string) => {
    setStep('scanning');
    setErrorMessage(null);

    try {
      const res = await fetch('/api/ai/scan-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Data,
          mimeType: mime,
          fileName: name,
          categories: categories.map(c => ({ id: c.id, nameEnglish: c.nameEnglish, nameUrdu: c.nameUrdu }))
        }),
      });

      const json = await res.json();

      if (!json.success || !json.data) {
        throw new Error(json.error || 'Gemini could not detect data from the document');
      }

      const extractedEntries = json.data.entries || [];
      const summary = json.data.rawSummary || 'Successfully recognized document data.';

      if (extractedEntries.length === 0) {
        throw new Error('No financial records found in document.');
      }

      // Map categories and fill defaults
      const mappedEntries: ExtractedEntry[] = extractedEntries.map((raw: any, idx: number) => {
        let matchedCat = categories[0]?.id || 'general';
        if (raw.categoryId) {
          const found = categories.find(
            c => c.id.toLowerCase() === String(raw.categoryId).toLowerCase() ||
                 c.nameEnglish.toLowerCase().includes(String(raw.categoryId).toLowerCase())
          );
          if (found) matchedCat = found.id;
        }

        const amt = cleanAmount(raw.amount);
        const period: 'Monthly' | 'Quarterly' | 'Half Yearly' | 'Annually' = 
          ['Monthly', 'Quarterly', 'Half Yearly', 'Annually'].includes(raw.preferredPeriod)
            ? raw.preferredPeriod
            : 'Monthly';

        const monthlyAmt = cleanAmount(raw.monthlyAmount) || (period === 'Monthly' ? amt : 0);
        const quarterlyAmt = cleanAmount(raw.quarterlyAmount) || (period === 'Quarterly' ? amt : 0);
        const halfYearlyAmt = cleanAmount(raw.halfYearlyAmount) || (period === 'Half Yearly' ? amt : 0);
        const annuallyAmt = cleanAmount(raw.annuallyAmount) || (period === 'Annually' ? amt : 0);
        const finalAmt = amt || monthlyAmt || quarterlyAmt || halfYearlyAmt || annuallyAmt || 0;

        return {
          receiptNo: raw.receiptNo ? String(raw.receiptNo) : '',
          date: raw.date || new Date().toISOString().split('T')[0],
          donorName: raw.donorName || `Donor #${idx + 1}`,
          donorNameUrdu: raw.donorNameUrdu || null,
          branchName: raw.branchName || 'Main Branch',
          zila: raw.zila || raw.city || 'Lahore',
          phone: raw.phone || '',
          address: raw.address || '',
          city: raw.city || 'Lahore',
          preferredPeriod: period,
          monthlyAmount: monthlyAmt,
          quarterlyAmount: quarterlyAmt,
          halfYearlyAmount: halfYearlyAmt,
          annuallyAmount: annuallyAmt,
          targetMonth: raw.targetMonth || null,
          amount: finalAmt,
          paymentMode: ['Cash', 'Cheque', 'Online', 'DD'].includes(raw.paymentMode) ? raw.paymentMode : 'Cash',
          bankName: raw.bankName || '',
          categoryId: 'membership',
          notes: raw.notes || 'Verified from document via Gemini AI',
        };
      });

      setEntries(mappedEntries);
      setActiveEntryIndex(0);
      setAiSummary(summary);
      setStep('confirm');
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Error processing document with Gemini. You can review or enter details manually.');
      // Create fallback entry so user isn't blocked
      setEntries([{
        receiptNo: generateNextReceiptNumber(),
        date: new Date().toISOString().split('T')[0],
        donorName: 'Generous Contributor (خیر خواہ)',
        branchName: 'Main Branch',
        zila: 'Lahore',
        phone: '',
        address: '',
        city: 'Lahore',
        preferredPeriod: 'Monthly',
        monthlyAmount: 0,
        quarterlyAmount: 0,
        halfYearlyAmount: 0,
        annuallyAmount: 0,
        targetMonth: null,
        amount: 0,
        paymentMode: 'Cash',
        bankName: '',
        categoryId: 'membership',
        notes: 'Document manual entry fallback',
      }]);
      setActiveEntryIndex(0);
      setStep('confirm');
    }
  };

  // Sample voucher for one-click testing
  const handleLoadSample = (sampleType: 'zakat' | 'sadaqat' | 'pdf_multi') => {
    if (sampleType === 'pdf_multi') {
      // Test sample PDF containing multiple donations
      setIsPdf(true);
      setFileName('Markaz_Donations_Register_2026.pdf');
      setFileSizeStr('45.2 KB');
      setFileMimeType('application/pdf');
      
      const samplePdfBase64 = 'JVBERi0xLjQKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFszIDAgUl0KL0NvdW50IDEKPj4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAyIDAgUgovTWVkaWFCb3ggWzAgMCA2MTIgNzkyXQovQ29udGVudHMgNCAwIFIKPj4KZW5kb2JqCjQgMCBvYmoKPDwKL0xlbmd0aCA0NQo+PgpzdHJlYW0KQlQKL0YxIDI0IFRmCjEwMCA3MDAgVGROCihNYXJrYXogUm9vaCB1bCBJc2xhbSBEb25hdGlvbiBSZWdpc3RlcjogUmVjZWlwdCAjMTAxIFJzIDUwMDAsIFJlY2VpcHQgIzEwMiBScyAxMjAwMCkgVGoKRVQKZW5kc3RyZWFtCmVuZG9iagp4cmVmCjAgNQowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMDkgMDAwMDAgbiAKMDAwMDAwMDA1OCAwMDAwMCBuIAowMDAwMDAwMTE1IDAwMDAwIG4gCjAwMDAwMDAyMDEgMDAwMDAgbiAKdHJhaWxlcgo8PAovU2l6ZSA1Ci9Sb290IDEgMCBSCj4+CnN0YXJ0eHJlZgorMTkKJSVFT0Y=';
      const dataUri = `data:application/pdf;base64,${samplePdfBase64}`;
      setFilePreview(dataUri);
      startScanning(dataUri, 'application/pdf', 'Markaz_Donations_Register_2026.pdf');
      return;
    }

    setIsPdf(false);
    setFileName(sampleType === 'zakat' ? 'Zakat_Monthly_Slip.png' : 'Welfare_Voucher.png');
    setFileSizeStr('18.4 KB');
    setFileMimeType('image/png');

    const canvas = document.createElement('canvas');
    canvas.width = 650;
    canvas.height = 420;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Paper background
      ctx.fillStyle = '#fefce8';
      ctx.fillRect(0, 0, 650, 420);
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 4;
      ctx.strokeRect(12, 12, 626, 396);

      // Header
      ctx.fillStyle = '#064e3b';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText('MARKAZ ROOH UL ISLAM - OFFICIAL RECEIPT', 60, 55);

      ctx.fillStyle = '#854d0e';
      ctx.font = '16px sans-serif';
      ctx.fillText('چندہ رسید برائے فنڈ و عطیات', 240, 85);

      ctx.fillStyle = '#0f172a';
      ctx.font = '14px sans-serif';
      if (sampleType === 'zakat') {
        ctx.fillText('Receipt No: REC-1088', 60, 130);
        ctx.fillText('Date: 2026-09-25', 400, 130);
        ctx.fillText('Received From: Haji Muhammad Tariq (حاجی محمد طارق)', 60, 170);
        ctx.fillText('Address: Tariq Road, PECHS Block 2', 60, 210);
        ctx.fillText('City: Karachi', 400, 210);
        ctx.fillText('Preferred Period: Monthly (ماہانہ)', 60, 250);
        ctx.fillText('Amount: Rs. 25,000 (Twenty Five Thousand Only)', 60, 290);
        ctx.fillText('Fund: Zakat & Madrasa Fund (زکوٰۃ)', 60, 330);
        ctx.fillText('Mode: Online Transfer - Meezan Bank', 60, 370);
      } else {
        ctx.fillText('Receipt No: REC-2041', 60, 130);
        ctx.fillText('Date: 2026-09-25', 400, 130);
        ctx.fillText('Received From: Al-Syed Construction Trust', 60, 170);
        ctx.fillText('Address: Main Boulevard, Gulberg III', 60, 210);
        ctx.fillText('City: Lahore', 400, 210);
        ctx.fillText('Preferred Period: Annually (سالانہ)', 60, 250);
        ctx.fillText('Amount: Rs. 100,000 (One Hundred Thousand Only)', 60, 290);
        ctx.fillText('Fund: General Sadaqat & Welfare', 60, 330);
        ctx.fillText('Mode: Cash', 60, 370);
      }
    }

    const dataUrl = canvas.toDataURL('image/png');
    setFilePreview(dataUrl);
    startScanning(dataUrl, 'image/png', fileName);
  };

  // Update specific field for currently active entry
  const updateCurrentEntry = (field: keyof ExtractedEntry, value: any) => {
    setEntries(prev => {
      const updated = [...prev];
      const cur = { ...updated[activeEntryIndex], [field]: value };
      
      // Auto-synchronize period amounts
      if (field === 'preferredPeriod') {
        cur.monthlyAmount = value === 'Monthly' ? cur.amount : 0;
        cur.quarterlyAmount = value === 'Quarterly' ? cur.amount : 0;
        cur.halfYearlyAmount = value === 'Half Yearly' ? cur.amount : 0;
        cur.annuallyAmount = value === 'Annually' ? cur.amount : 0;
      } else if (field === 'amount') {
        const val = cleanAmount(value);
        cur.amount = val;
        if (cur.preferredPeriod === 'Monthly') cur.monthlyAmount = val;
        if (cur.preferredPeriod === 'Quarterly') cur.quarterlyAmount = val;
        if (cur.preferredPeriod === 'Half Yearly') cur.halfYearlyAmount = val;
        if (cur.preferredPeriod === 'Annually') cur.annuallyAmount = val;
      }
      
      updated[activeEntryIndex] = cur;
      return updated;
    });
  };

  // User Confirms Data -> Enters Records Directly into Active Sheet
  const handleConfirmAndEnter = async () => {
    if (entries.length === 0) return;

    try {
      // Switch active tab if user chose a different sheet
      if (targetSheetId && targetSheetId !== activeSheetTabId) {
        setActiveSheetTabId(targetSheetId);
      }

      let startSeq = 1;
      try {
        const nextStr = generateNextReceiptNumber();
        const parsed = parseInt(nextStr.replace(/\D/g, ''), 10);
        if (!isNaN(parsed)) startSeq = parsed;
      } catch (e) {
        // default 1
      }

      // Insert all verified entries
      for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
        const assignedReceiptNo = entry.receiptNo && entry.receiptNo.trim() !== '' 
          ? entry.receiptNo 
          : String(startSeq + i);

        // Determine month key based on targetMonth or receipt date
        let monthKey: MonthKey = 'jan';
        if (entry.targetMonth && MONTH_KEYS.includes(entry.targetMonth as any)) {
          monthKey = entry.targetMonth as MonthKey;
        } else if (entry.date) {
          const parsedM = new Date(entry.date).getMonth();
          if (!isNaN(parsedM) && MONTH_KEYS[parsedM]) {
            monthKey = MONTH_KEYS[parsedM];
          }
        }

        const initialMonthsData: MonthlyContributions = {
          jan: 0, feb: 0, mar: 0, apr: 0, may: 0, jun: 0,
          jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0,
          [monthKey]: Number(entry.amount) || 0,
        };

        const targetBranch = entry.branchName || currentTargetSheet?.name || 'Main Branch';
        const targetZila = entry.zila || entry.city || currentTargetSheet?.cityName || 'Lahore';

        // Add to FinanceContext (Neon DB & template state)
        await addTransaction({
          receiptNo: assignedReceiptNo,
          date: entry.date,
          donorName: entry.donorName,
          donorNameUrdu: entry.donorNameUrdu || undefined,
          branchName: targetBranch,
          zila: targetZila,
          phone: entry.phone,
          address: entry.address,
          city: entry.city,
          preferredPeriod: entry.preferredPeriod,
          monthlyAmount: entry.monthlyAmount,
          quarterlyAmount: entry.quarterlyAmount,
          halfYearlyAmount: entry.halfYearlyAmount,
          annuallyAmount: entry.annuallyAmount,
          monthsData: initialMonthsData,
          amount: Number(entry.amount) || 0,
          categoryId: 'membership',
          paymentMode: entry.paymentMode,
          bankName: entry.bankName,
          chequeOrTxnNo: `AI-${Date.now().toString().slice(-4)}-${i + 1}`,
          type: 'income',
          status: 'verified',
          notes: entry.notes,
        });

        // Also update rawGridData in Neon DB shared sheet so raw grid view stays synced
        try {
          const sheetRes = await api.getSharedSheet(targetSheetId);
          const currentRaw = sheetRes?.data ? { ...sheetRes.data } : {};
          const existingRows = Object.keys(currentRaw).map(k => parseInt(k, 10)).filter(n => !isNaN(n));
          const nextRow = existingRows.length > 0 ? Math.max(...existingRows) + 1 : 1;
          
          currentRaw[nextRow] = {
            'A': assignedReceiptNo,
            'B': entry.date,
            'C': entry.donorName,
            'D': targetBranch,
            'E': targetZila,
            'F': entry.phone,
            'G': entry.monthlyAmount ? String(entry.monthlyAmount) : '',
            'H': entry.quarterlyAmount ? String(entry.quarterlyAmount) : '',
            'I': entry.annuallyAmount ? String(entry.annuallyAmount) : '',
            'V': String(entry.amount),
            'W': '0',
            'X': entry.paymentMode,
            'Y': entry.bankName,
            'Z': entry.notes,
          };
          const sheetName = sheetRes?.name || 'Sheet';
          const newRowCount = Math.max(sheetRes?.rowCount || 100, nextRow);
          await api.saveSharedSheet(targetSheetId, sheetName, currentRaw, newRowCount);
        } catch (e) {
          console.error('Failed to sync scanned receipt to Neon DB raw sheet:', e);
        }
      }

      // Confetti celebration
      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // ignore
      }

      setStep('success');
      setTimeout(() => {
        if (onSuccess) onSuccess(targetSheetId);
        onClose();
      }, 1500);
    } catch (err: any) {
      alert('Error entering transactions: ' + (err.message || 'Unknown error'));
    }
  };

  const resetAll = () => {
    setStep('upload');
    setFilePreview(null);
    setFileName('');
    setFileSizeStr('');
    setIsPdf(false);
    setErrorMessage(null);
    setAiSummary('');
    setEntries([]);
    setActiveEntryIndex(0);
  };

  const currentEntry = entries[activeEntryIndex] || entries[0];
  const totalAmountSum = entries.reduce((acc, cur) => acc + (Number(cur.amount) || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[94vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-emerald-900 via-emerald-950 to-slate-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-200 text-emerald-950 flex items-center justify-center font-black shadow-md">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg text-white tracking-tight">
                  Gemini AI Document &amp; Receipt Pipeline
                </h3>
                <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-emerald-950 uppercase tracking-wider">
                  Multimodal AI
                </span>
              </div>
              <p className="text-xs text-emerald-200/90 font-medium">
                Upload PDF documents or images &bull; Gemini analyzes contents &bull; Confirm &amp; enter into sheet
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">

          {/* ==============================================================
              STEP 1: UPLOAD DOCUMENT OR PICTURE
              ============================================================== */}
          {step === 'upload' && (
            <div className="space-y-5">
              
              {/* Drag & Drop Upload Card */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="group border-2 border-dashed border-emerald-400/60 hover:border-emerald-500 rounded-2xl p-8 sm:p-12 text-center cursor-pointer bg-emerald-50/40 hover:bg-emerald-50/80 dark:bg-slate-800/40 dark:hover:bg-slate-800/70 transition-all flex flex-col items-center justify-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform mb-4">
                  <Upload className="w-8 h-8" />
                </div>

                <h4 className="text-base sm:text-lg font-black text-slate-800 dark:text-slate-100">
                  Upload Financial Document, PDF, Voucher, or Receipt
                </h4>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mt-1">
                  Drag &amp; drop your file here, or click to browse. Supports PDF documents, scanned pages, donation receipts (چندہ پرچی), vouchers, and bank slips.
                </p>

                <div className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all">
                  <FileText className="w-4 h-4" />
                  <span>Select Document (PDF / Images)</span>
                </div>

                <div className="mt-3 text-[11px] text-slate-400 flex items-center gap-3">
                  <span>PDF Document</span>
                  <span>•</span>
                  <span>PNG / JPG / WEBP</span>
                  <span>•</span>
                  <span>Up to 20MB</span>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf,image/*,.pdf,.png,.jpg,.jpeg,.webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Instant One-Click Samples */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50 dark:bg-slate-800/50">
                <div className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Quick Test with Instant Sample Documents:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleLoadSample('pdf_multi')}
                    className="px-3 py-1.5 rounded-lg border border-purple-300 bg-white dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-slate-700 text-purple-800 dark:text-purple-300 font-bold text-xs shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Test Sample 1: PDF Document (Multi-Donation Register)</span>
                  </button>
                  <button
                    onClick={() => handleLoadSample('zakat')}
                    className="px-3 py-1.5 rounded-lg border border-emerald-300 bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-700 text-emerald-800 dark:text-emerald-300 font-bold text-xs shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Test Sample 2: Zakat Receipt Slip (Rs. 25,000)</span>
                  </button>
                  <button
                    onClick={() => handleLoadSample('sadaqat')}
                    className="px-3 py-1.5 rounded-lg border border-amber-300 bg-white dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-slate-700 text-amber-800 dark:text-amber-300 font-bold text-xs shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Test Sample 3: Annual Welfare Voucher (Rs. 100,000)</span>
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* ==============================================================
              STEP 2: SCANNING WITH GEMINI AI ANIMATION
              ============================================================== */}
          {step === 'scanning' && (
            <div className="py-12 px-4 text-center space-y-6">
              <div className="relative w-24 h-24 mx-auto">
                <div className="absolute inset-0 rounded-3xl bg-emerald-500/20 animate-ping" />
                <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-amber-400 text-white flex items-center justify-center shadow-xl">
                  {isPdf ? <FileText className="w-12 h-12 animate-pulse" /> : <Sparkles className="w-12 h-12 animate-spin" />}
                </div>
              </div>

              <div>
                <h4 className="text-lg font-black text-slate-800 dark:text-slate-100">
                  Gemini AI is Checking Document: {fileName || 'Uploaded Document'}
                </h4>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
                  Parsing {isPdf ? 'PDF document layout' : 'image pixels'}, extracting receipt number, donor names, addresses, cities, periods, and amounts into the 15-column format.
                </p>
              </div>

              {filePreview && (
                <div className="max-w-xs mx-auto rounded-xl overflow-hidden border-2 border-emerald-400 shadow-md p-2 bg-slate-50 dark:bg-slate-800">
                  {isPdf ? (
                    <div className="p-4 flex items-center gap-3 text-left">
                      <FileText className="w-8 h-8 text-rose-500 shrink-0" />
                      <div className="overflow-hidden">
                        <div className="font-bold text-xs truncate text-slate-800 dark:text-slate-200">{fileName}</div>
                        <div className="text-[11px] text-slate-400">{fileSizeStr} &bull; PDF Document</div>
                      </div>
                    </div>
                  ) : (
                    <img src={filePreview} alt="Receipt Preview" className="w-full h-36 object-cover rounded-lg opacity-85" />
                  )}
                </div>
              )}
            </div>
          )}

          {/* ==============================================================
              STEP 3: ASK USER TO CONFIRM DATA ("CONFIRMATION STEP")
              ============================================================== */}
          {step === 'confirm' && currentEntry && (
            <div className="space-y-4">
              
              {/* AI Recognition Notification Banner */}
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-200 dark:border-emerald-800 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-extrabold text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
                      <span>Document Inspected by Gemini AI — Please Confirm</span>
                      {entries.length > 1 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-700 text-white">
                          {entries.length} Records Found
                        </span>
                      )}
                    </div>
                    <div className="text-emerald-700 dark:text-emerald-300/90 text-[11px] mt-0.5">
                      {aiSummary}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={resetAll}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300 cursor-pointer flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Scan Another</span>
                  </button>
                </div>
              </div>

              {/* Multi-Record Tabs if document contains multiple entries */}
              {entries.length > 1 && (
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                  <div className="flex items-center gap-1.5 overflow-x-auto">
                    <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5" /> Records:
                    </span>
                    {entries.map((entry, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveEntryIndex(idx)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          activeEntryIndex === idx
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        #{idx + 1}: {entry.donorName.slice(0, 15)} ({orgConfig.currencySymbol} {entry.amount.toLocaleString()})
                      </button>
                    ))}
                  </div>

                  <div className="text-xs font-black text-emerald-700 dark:text-emerald-300 shrink-0 ml-2">
                    Total: {orgConfig.currencySymbol} {totalAmountSum.toLocaleString()}
                  </div>
                </div>
              )}

              {/* Two-Column Review Layout: Left (Document View) & Right (Editable Form) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                
                {/* Left: Original Document / Picture Preview */}
                <div className="lg:col-span-5 flex flex-col space-y-2">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      {isPdf ? <FileText className="w-3.5 h-3.5 text-rose-500" /> : <ImageIcon className="w-3.5 h-3.5 text-slate-400" />}
                      <span>{isPdf ? 'Uploaded PDF Document' : 'Uploaded Image'}</span>
                    </span>
                    <span className="text-[10px] text-slate-400">{fileName} ({fileSizeStr})</span>
                  </div>

                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-950 flex-1 flex flex-col items-center justify-center p-2 min-h-[260px] max-h-[540px]">
                    {isPdf && filePreview ? (
                      <div className="w-full h-full flex flex-col">
                        <iframe 
                          src={filePreview} 
                          title="PDF Preview"
                          className="w-full h-[460px] rounded-lg border border-slate-200 dark:border-slate-800 bg-white" 
                        />
                        <div className="mt-2 text-center">
                          <a 
                            href={filePreview} 
                            target="_blank" 
                            rel="noreferrer"
                            className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1"
                          >
                            <span>Open PDF in new window</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    ) : filePreview ? (
                      <img 
                        src={filePreview} 
                        alt="Scanned Receipt" 
                        className="max-h-[500px] w-full object-contain rounded-lg shadow-xs" 
                      />
                    ) : (
                      <div className="text-xs text-slate-400">No document preview available</div>
                    )}
                  </div>
                </div>

                {/* Right: Confirmation Form Fields */}
                <div className="lg:col-span-7 space-y-3">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        {entries.length > 1 ? `Edit Record ${activeEntryIndex + 1} of ${entries.length}` : 'Extracted Fields (Editable)'}
                      </span>
                    </span>

                    {/* Destination Sheet Selector */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-slate-400 font-medium">Destination:</span>
                      <select
                        value={targetSheetId}
                        onChange={(e) => setTargetSheetId(e.target.value)}
                        className="px-2 py-0.5 rounded-lg border border-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 font-bold text-[11px] cursor-pointer"
                      >
                        {sheetTabs.map(tab => (
                          <option key={tab.id} value={tab.id}>
                            {tab.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50/70 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                    
                    {/* Receipt No */}
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Receipt No (رسید نمبر)
                      </label>
                      <input
                        type="text"
                        value={currentEntry.receiptNo}
                        onChange={(e) => updateCurrentEntry('receiptNo', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="Auto (e.g. 1)"
                      />
                    </div>

                    {/* Date */}
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Date (تاریخ)
                      </label>
                      <input
                        type="date"
                        value={currentEntry.date}
                        onChange={(e) => updateCurrentEntry('date', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    {/* Received From */}
                    <div className="sm:col-span-2">
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Received From (وصول کنندہ / اسم گرامی)
                      </label>
                      <input
                        type="text"
                        value={currentEntry.donorName}
                        onChange={(e) => updateCurrentEntry('donorName', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="Contributor name in English / Urdu"
                      />
                    </div>

                    {/* Address */}
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Address (مکمل پتہ)
                      </label>
                      <input
                        type="text"
                        value={currentEntry.address}
                        onChange={(e) => updateCurrentEntry('address', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="Street or Area"
                      />
                    </div>

                    {/* City */}
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        City (شہر)
                      </label>
                      <input
                        type="text"
                        value={currentEntry.city}
                        onChange={(e) => updateCurrentEntry('city', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="e.g. Karachi, Lahore..."
                      />
                    </div>

                    {/* Preferred Period with Tick (✓) & Cross (✗) Only */}
                    <div className="sm:col-span-2">
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                        <span>Preferred Period (مدت / میعاد — ٹک ✓ اور کراس ✗)</span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">Click to tick (✓), others automatically become cross (✗)</span>
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                          { key: 'Monthly', titleEn: 'Monthly', titleUr: 'ماہانہ' },
                          { key: 'Quarterly', titleEn: 'Quarterly', titleUr: 'سہ ماہی' },
                          { key: 'Half Yearly', titleEn: 'Half Yearly', titleUr: 'شش ماہی' },
                          { key: 'Annually', titleEn: 'Annually', titleUr: 'سالانہ' },
                        ].map((p) => {
                          const isTicked = currentEntry.preferredPeriod === p.key;
                          return (
                            <button
                              key={p.key}
                              type="button"
                              onClick={() => updateCurrentEntry('preferredPeriod', p.key)}
                              className={`p-2.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                                isTicked
                                  ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-900 dark:text-emerald-100 shadow-xs ring-2 ring-emerald-500/40'
                                  : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                              }`}
                            >
                              <div className="text-left">
                                <div className="font-extrabold text-xs">{p.titleEn}</div>
                                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-urdu">{p.titleUr}</div>
                              </div>
                              <span
                                className={`inline-flex items-center justify-center w-6 h-6 rounded-lg text-xs font-black shrink-0 ${
                                  isTicked
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'bg-rose-50 dark:bg-rose-950/40 text-rose-500 border border-rose-200 dark:border-rose-900/60'
                                }`}
                              >
                                {isTicked ? '✓' : '✗'}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Total Amount as Period */}
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Total Amount as Period ({orgConfig.currencySymbol}) (کل رقم)
                      </label>
                      <input
                        type="number"
                        value={currentEntry.amount}
                        onChange={(e) => updateCurrentEntry('amount', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border-2 border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-mono font-black text-sm focus:outline-none"
                        placeholder="0"
                      />
                    </div>

                    {/* Payment Mode */}
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Cheque or CASH (ذریعہ ادائیگی)
                      </label>
                      <select
                        value={currentEntry.paymentMode}
                        onChange={(e) => updateCurrentEntry('paymentMode', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                      >
                        <option value="Cash">Cash</option>
                        <option value="Cheque">Cheque</option>
                        <option value="Online">Online Transfer</option>
                        <option value="DD">Demand Draft (DD)</option>
                      </select>
                    </div>

                    {/* Bank Name */}
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Bank Name (بینک کا نام)
                      </label>
                      <input
                        type="text"
                        value={currentEntry.bankName}
                        onChange={(e) => updateCurrentEntry('bankName', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="e.g. Meezan Bank, ABL, HBL"
                      />
                    </div>

                    {/* Mobile Number */}
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Mobile Number (موبائل نمبر)
                      </label>
                      <input
                        type="text"
                        value={currentEntry.phone}
                        onChange={(e) => updateCurrentEntry('phone', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="0300-1234567"
                      />
                    </div>

                    {/* Branch Name */}
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Branch Name (شاخ / برانچ)
                      </label>
                      <input
                        type="text"
                        value={currentEntry.branchName}
                        onChange={(e) => updateCurrentEntry('branchName', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="e.g. Main Branch, Lahore"
                      />
                    </div>

                    {/* Zila / District */}
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Zila / District (ضلع)
                      </label>
                      <input
                        type="text"
                        value={currentEntry.zila}
                        onChange={(e) => updateCurrentEntry('zila', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="e.g. Lahore, Faisalabad"
                      />
                    </div>

                    {/* Notes / Remarks */}
                    <div className="sm:col-span-2">
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Notes / Remarks (تفصیل / کیفیات)
                      </label>
                      <input
                        type="text"
                        value={currentEntry.notes}
                        onChange={(e) => updateCurrentEntry('notes', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="Purpose of donation or remarks"
                      />
                    </div>

                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ==============================================================
              STEP 4: SUCCESS CONFIRMATION
              ============================================================== */}
          {step === 'success' && (
            <div className="py-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-xl animate-in zoom-in">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-xl font-black text-slate-800 dark:text-slate-100">
                {entries.length > 1 
                  ? `${entries.length} Transactions Entered Successfully!` 
                  : 'Transaction Entered Successfully!'}
              </h4>
              <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
                {entries.length > 1
                  ? `${entries.length} verified records (Total: ${orgConfig.currencySymbol} ${totalAmountSum.toLocaleString()}) entered into ${currentTargetSheet.name}.`
                  : `Receipt #${currentEntry.receiptNo || 'auto'} (${orgConfig.currencySymbol} ${currentEntry.amount.toLocaleString()}) has been verified and entered into ${currentTargetSheet.name}.`}
              </p>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          {step === 'confirm' && (
            <div className="flex items-center gap-2">
              <button
                onClick={resetAll}
                className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 cursor-pointer"
              >
                Upload Different File
              </button>

              <button
                onClick={handleConfirmAndEnter}
                className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>
                  {entries.length > 1 
                    ? `Yes, Confirm & Enter All (${entries.length}) into Sheet` 
                    : 'Yes, Confirm & Enter into Sheet'}
                </span>
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
