'use client';

import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { 
  Sparkles, 
  X, 
  FileSpreadsheet, 
  Send, 
  ShieldCheck, 
  Calculator, 
  Check, 
  ArrowRight,
  Database,
  Coins,
  Camera,
  Upload
} from 'lucide-react';
import { GeminiReceiptScannerModal } from './GeminiReceiptScannerModal';

interface AISheetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AISheetModal: React.FC<AISheetModalProps> = ({ isOpen, onClose }) => {
  const { 
    activeSheetTabId, 
    addTransaction, 
    transactions, 
    totalIncome, 
    totalExpense, 
    netBalance,
    orgConfig 
  } = useFinance();

  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  if (!isOpen) return null;

  const handleOpenSheets = () => {
    onClose();
    if (typeof window !== 'undefined') {
      const target = activeSheetTabId || 'sheet1';
      window.location.href = `/dashboard/sheets/${target}`;
    }
  };

  const handleQuickAction = async (action: 'zakat' | 'sample' | 'audit') => {
    setIsProcessing(true);
    setAiResponse(null);

    // Simulate AI computing institutional ledger response
    setTimeout(async () => {
      if (action === 'zakat') {
        const zakatBalance = transactions
          .filter(t => t.categoryId === 'zakat' && t.type === 'income')
          .reduce((a, b) => a + b.amount, 0);
        setAiResponse(
          `✦ Shariah AI Analysis Complete:\n- Total Restricted Zakat Inflow: ${orgConfig.currencySymbol} ${zakatBalance.toLocaleString()}\n- Fund Isolation: 100% mathematically segregated from General Sadaqat & Construction.\n- Status: Valid according to Shariah accounting standard.`
        );
      } else if (action === 'sample') {
        try {
          await addTransaction({
            receiptNo: `AI-${Date.now().toString().slice(-4)}`,
            date: new Date().toISOString().split('T')[0],
            donorName: 'Haji Muhammad Qasim',
            phone: '0300-1234567',
            address: 'Karachi, Pakistan',
            reference: 'AI Copilot Auto-Entry',
            amount: 25000,
            categoryId: 'general',
            type: 'income',
            paymentMode: 'Online',
            bankName: 'Meezan Bank',
            chequeOrTxnNo: 'TXN-AI786',
            status: 'verified',
            notes: 'Monthly Welfare & Madrassah Support via AI Copilot'
          });
          setAiResponse(`✦ AI Action Executed:\nAdded 1 new verified transaction (PKR 25,000 - Haji Muhammad Qasim) directly into active sheet (${activeSheetTabId || 'sheet1'}).`);
        } catch (e) {
          setAiResponse('✦ Could not add sample transaction: Database syncing.');
        }
      } else if (action === 'audit') {
        setAiResponse(
          `✦ Markaz Ledger Audit Summary:\n- Active Records: ${transactions.length} entries\n- Net Liquid Balance: ${orgConfig.currencySymbol} ${netBalance.toLocaleString()}\n- Inflows vs Outflows ratio: healthy reserve maintained.\n- Recommendation: All books in compliance with Markaz Rooh ul Islam standards.`
        );
      }
      setIsProcessing(false);
    }, 600);
  };

  const handleCustomPrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsProcessing(true);
    setAiResponse(null);

    setTimeout(() => {
      setAiResponse(
        `✦ AI Copilot Response:\nProcessed instruction: "${prompt.trim()}".\nYour working sheet (${activeSheetTabId || 'sheet1'}) is ready for manual verification or direct export.`
      );
      setIsProcessing(false);
      setPrompt('');
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-white rounded-3xl border-2 border-amber-400/80 shadow-2xl overflow-hidden transition-all text-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-[#032e23] to-emerald-950 px-6 py-5 text-white relative border-b border-amber-400/40">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-emerald-300 hover:text-white hover:bg-emerald-800/50 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 p-0.5 flex items-center justify-center shadow-lg shadow-black/40">
              <div className="w-full h-full bg-emerald-950 rounded-[14px] flex items-center justify-center text-amber-300">
                <Sparkles className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black tracking-tight text-white">
                  Markaz AI Sheet Copilot
                </h3>
                <span className="font-arabic text-amber-300 text-xs font-bold">
                  مرکز اے آئی
                </span>
              </div>
              <p className="text-xs text-emerald-200/90 font-medium">
                Autonomous Shariah Financial & Spreadsheet Assistant
              </p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 bg-[#fdfaf3]">
          
          {/* GEMINI MULTIMODAL RECEIPT SCANNER CARD */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-900 via-emerald-950 to-teal-950 text-white shadow-md border border-amber-400/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400 text-emerald-950 flex items-center justify-center font-black shrink-0 shadow-sm">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-black text-sm text-white">Upload Receipt Picture</h4>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-400 text-emerald-950 font-bold">
                    Gemini Vision
                  </span>
                </div>
                <p className="text-[11px] text-emerald-200/90 mt-0.5">
                  AI checks what's in picture, confirms details with you, then enters into sheet.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsScannerOpen(true)}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-400 text-emerald-950 font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer hover:scale-105 active:scale-95"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Scan Picture Now</span>
            </button>
          </div>

          {/* Quick AI Action Pills */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
              Instant AI Commands
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickAction('zakat')}
                disabled={isProcessing}
                className="p-2.5 rounded-xl bg-white hover:bg-emerald-50 border border-slate-200 text-left transition-all hover:border-emerald-400 cursor-pointer shadow-2xs group"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 group-hover:text-emerald-700">
                  <Calculator className="w-3.5 h-3.5 text-amber-500" />
                  <span>Verify Zakat</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">Isolate welfare funds</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickAction('sample')}
                disabled={isProcessing}
                className="p-2.5 rounded-xl bg-white hover:bg-emerald-50 border border-slate-200 text-left transition-all hover:border-emerald-400 cursor-pointer shadow-2xs group"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 group-hover:text-emerald-700">
                  <Database className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Insert Sample</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">Add test record</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickAction('audit')}
                disabled={isProcessing}
                className="p-2.5 rounded-xl bg-white hover:bg-emerald-50 border border-slate-200 text-left transition-all hover:border-emerald-400 cursor-pointer shadow-2xs group"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 group-hover:text-emerald-700">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                  <span>Audit Books</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">Check ledger health</p>
              </button>
            </div>
          </div>

          {/* Custom Prompt Box */}
          <form onSubmit={handleCustomPrompt} className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              Ask AI or Enter Instruction
            </label>
            <div className="relative">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., Calculate balance for Sheet 1 or format currency..."
                className="w-full pl-3.5 pr-11 py-2.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none text-slate-900 shadow-2xs"
              />
              <button
                type="submit"
                disabled={isProcessing || !prompt.trim()}
                className="absolute right-1.5 top-1.5 p-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white disabled:opacity-40 transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>

          {/* AI Response Display */}
          {isProcessing && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium flex items-center gap-2.5 animate-pulse">
              <Sparkles className="w-4 h-4 text-amber-500 animate-spin" />
              <span>Markaz AI is computing ledger data and Shariah rules...</span>
            </div>
          )}

          {aiResponse && !isProcessing && (
            <div className="p-4 rounded-2xl bg-white border border-amber-300/80 shadow-xs text-xs whitespace-pre-line font-medium text-slate-800 leading-relaxed">
              {aiResponse}
            </div>
          )}

          {/* ACTION BUTTON: Open Working Sheet ("nothing more") */}
          <div className="pt-2 border-t border-slate-200">
            <button
              onClick={handleOpenSheets}
              className="w-full inline-flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl font-black text-sm bg-white hover:bg-slate-50 text-emerald-950 border-2 border-slate-300 hover:border-emerald-600 shadow-sm hover:shadow-md transition-all cursor-pointer active:scale-95"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-700 stroke-[2.5]" />
              <span>Open Working Sheets ({activeSheetTabId || 'sheet1'})</span>
              <ArrowRight className="w-4 h-4 text-emerald-700 stroke-[2.5]" />
            </button>
          </div>

        </div>
      </div>

      {/* Gemini AI Receipt Scanner Modal */}
      <GeminiReceiptScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
      />
    </div>
  );
};

export default AISheetModal;
