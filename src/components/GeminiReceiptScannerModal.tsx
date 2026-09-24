'use client';

import React, { useState, useRef } from 'react';
import { useFinance } from '../context/FinanceContext';
import { 
  Sparkles, 
  Upload, 
  X, 
  Check, 
  AlertCircle, 
  FileText, 
  Receipt, 
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
  Image as ImageIcon
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface GeminiReceiptScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
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
    activeSheetTabId,
    orgConfig 
  } = useFinance();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Workflow states: 'upload' -> 'scanning' -> 'confirm' -> 'success'
  const [step, setStep] = useState<'upload' | 'scanning' | 'confirm' | 'success'>('upload');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string>('image/jpeg');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [aiSummary, setAiSummary] = useState<string>('');

  // Editable Form Data for Confirmation Step
  const [formData, setFormData] = useState({
    receiptNo: '',
    date: new Date().toISOString().split('T')[0],
    donorName: '',
    address: '',
    city: 'Karachi',
    preferredPeriod: 'Monthly' as 'Monthly' | 'Quarterly' | 'Half Yearly' | 'Annually',
    monthlyAmount: 0,
    quarterlyAmount: 0,
    halfYearlyAmount: 0,
    annuallyAmount: 0,
    amount: 0,
    paymentMode: 'Cash' as 'Cash' | 'Cheque' | 'Online' | 'DD',
    bankName: '',
    phone: '',
    categoryId: 'zakat',
    notes: '',
  });

  if (!isOpen) return null;

  // Handle File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }

    setImageMimeType(file.type);
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setImagePreview(result);
      setErrorMessage(null);
      // Automatically trigger scan once image is loaded
      startScanning(result, file.type);
    };
    reader.readAsDataURL(file);
  };

  // Drag and drop handler
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please drop an image file (PNG, JPG, WEBP).');
      return;
    }

    setImageMimeType(file.type);
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setImagePreview(result);
      setErrorMessage(null);
      startScanning(result, file.type);
    };
    reader.readAsDataURL(file);
  };

  // Run Gemini AI Vision Pipeline
  const startScanning = async (base64Img: string, mime: string) => {
    setStep('scanning');
    setErrorMessage(null);

    try {
      const res = await fetch('/api/ai/scan-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Img,
          mimeType: mime,
        }),
      });

      const json = await res.json();

      if (!json.success || !json.data) {
        throw new Error(json.error || 'Gemini could not detect receipt data');
      }

      const extracted = json.data;
      const nextReceipt = generateNextReceiptNumber();

      // Match category
      let matchedCategory = categories[0]?.id || 'general';
      if (extracted.categoryId) {
        const found = categories.find(
          c => c.id.toLowerCase() === extracted.categoryId.toLowerCase() ||
               c.nameEnglish.toLowerCase().includes(extracted.categoryId.toLowerCase())
        );
        if (found) matchedCategory = found.id;
      }

      // Populate confirmation form
      setFormData({
        receiptNo: extracted.receiptNo && extracted.receiptNo.trim() !== '' ? extracted.receiptNo : nextReceipt,
        date: extracted.date || new Date().toISOString().split('T')[0],
        donorName: extracted.donorName || 'Generous Donor (خیر خواہ)',
        address: extracted.address || '',
        city: extracted.city || 'Karachi',
        preferredPeriod: (extracted.preferredPeriod as any) || 'Monthly',
        monthlyAmount: extracted.monthlyAmount || (extracted.preferredPeriod === 'Monthly' ? extracted.amount : 0) || 0,
        quarterlyAmount: extracted.quarterlyAmount || (extracted.preferredPeriod === 'Quarterly' ? extracted.amount : 0) || 0,
        halfYearlyAmount: extracted.halfYearlyAmount || (extracted.preferredPeriod === 'Half Yearly' ? extracted.amount : 0) || 0,
        annuallyAmount: extracted.annuallyAmount || (extracted.preferredPeriod === 'Annually' ? extracted.amount : 0) || 0,
        amount: Number(extracted.amount) || 0,
        paymentMode: (extracted.paymentMode as any) || 'Cash',
        bankName: extracted.bankName || '',
        phone: extracted.phone || '',
        categoryId: matchedCategory,
        notes: extracted.notes || 'Verified via Gemini AI Multimodal Vision Scan',
      });

      setAiSummary(extracted.rawSummary || 'Successfully recognized financial details from receipt picture.');
      setStep('confirm');
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Error communicating with Gemini AI. You can enter details manually.');
      setStep('confirm'); // Let user confirm/edit manually
    }
  };

  // Sample voucher for one-click testing
  const handleLoadSample = (sampleType: 'zakat' | 'sadaqat') => {
    // Generate an SVG receipt data URL for instant visual test
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Receipt background
      ctx.fillStyle = '#fefce8';
      ctx.fillRect(0, 0, 600, 400);
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 4;
      ctx.strokeRect(10, 10, 580, 380);

      // Header
      ctx.fillStyle = '#064e3b';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText('MARKAZ ROOH UL ISLAM - OFFICIAL RECEIPT', 50, 50);

      ctx.fillStyle = '#854d0e';
      ctx.font = '16px sans-serif';
      ctx.fillText('چندہ رسید برائے فنڈ و عطیات', 220, 80);

      // Receipt details
      ctx.fillStyle = '#0f172a';
      ctx.font = '14px sans-serif';
      if (sampleType === 'zakat') {
        ctx.fillText('Receipt No: REC-1088', 50, 120);
        ctx.fillText('Date: 2026-09-24', 380, 120);
        ctx.fillText('Received From: Haji Muhammad Tariq (حاجی محمد طارق)', 50, 160);
        ctx.fillText('Address: Tariq Road, PECHS Block 2', 50, 200);
        ctx.fillText('City: Karachi', 380, 200);
        ctx.fillText('Preferred Period: Monthly (ماہانہ)', 50, 240);
        ctx.fillText('Amount: Rs. 25,000 (Twenty Five Thousand Only)', 50, 280);
        ctx.fillText('Fund: Zakat & Madrasa Fund (زکوٰۃ)', 50, 320);
        ctx.fillText('Mode: Online Transfer - Meezan Bank', 50, 360);
      } else {
        ctx.fillText('Receipt No: REC-2041', 50, 120);
        ctx.fillText('Date: 2026-09-24', 380, 120);
        ctx.fillText('Received From: Al-Syed Construction Trust', 50, 160);
        ctx.fillText('Address: Main Boulevard, Gulberg III', 50, 200);
        ctx.fillText('City: Lahore', 380, 200);
        ctx.fillText('Preferred Period: Annually (سالانہ)', 50, 240);
        ctx.fillText('Amount: Rs. 100,000 (One Hundred Thousand Only)', 50, 280);
        ctx.fillText('Fund: General Sadaqat & Welfare', 50, 320);
        ctx.fillText('Mode: Cash', 50, 360);
      }
    }

    const dataUrl = canvas.toDataURL('image/png');
    setImagePreview(dataUrl);
    setImageMimeType('image/png');
    startScanning(dataUrl, 'image/png');
  };

  // User Confirms Data -> Enters Row Directly into Active Sheet
  const handleConfirmAndEnter = async () => {
    try {
      await addTransaction({
        receiptNo: formData.receiptNo,
        date: formData.date,
        donorName: formData.donorName,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        preferredPeriod: formData.preferredPeriod,
        monthlyAmount: formData.monthlyAmount,
        quarterlyAmount: formData.quarterlyAmount,
        halfYearlyAmount: formData.halfYearlyAmount,
        annuallyAmount: formData.annuallyAmount,
        amount: Number(formData.amount) || 0,
        categoryId: formData.categoryId,
        paymentMode: formData.paymentMode,
        bankName: formData.bankName,
        chequeOrTxnNo: `AI-${Date.now().toString().slice(-4)}`,
        type: 'income',
        status: 'verified',
        notes: formData.notes,
      });

      // Celebration confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // ignore
      }

      setStep('success');
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1400);
    } catch (err: any) {
      alert('Error entering transaction: ' + (err.message || 'Unknown error'));
    }
  };

  const resetAll = () => {
    setStep('upload');
    setImagePreview(null);
    setErrorMessage(null);
    setAiSummary('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-emerald-900 via-emerald-950 to-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-200 text-emerald-950 flex items-center justify-center font-black shadow-md">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg text-white tracking-tight">
                  Gemini AI Receipt Scanner
                </h3>
                <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-emerald-950 uppercase tracking-wider">
                  Vision Pipeline
                </span>
              </div>
              <p className="text-xs text-emerald-200/90 font-medium">
                Upload any receipt picture &bull; AI checks details &bull; Confirm &amp; enter into sheet
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
        <div className="flex-1 overflow-y-auto p-5">

          {/* ==============================================================
              STEP 1: UPLOAD PICTURE
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
                  <Camera className="w-8 h-8" />
                </div>

                <h4 className="text-base sm:text-lg font-black text-slate-800 dark:text-slate-100">
                  Upload Receipt, Voucher, or Slip Picture
                </h4>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mt-1">
                  Drag &amp; drop your image here, or browse files. Supports donation receipts (چندہ پرچی), hand-written vouchers, bank slips, and checks.
                </p>

                <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all">
                  <Upload className="w-4 h-4" />
                  <span>Choose Picture from Device</span>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
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
                  <span>Quick Test with Generated Sample Slips:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleLoadSample('zakat')}
                    className="px-3 py-1.5 rounded-lg border border-emerald-300 bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-700 text-emerald-800 dark:text-emerald-300 font-bold text-xs shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Sample 1: Zakat Monthly Slip (Rs. 25,000)</span>
                  </button>
                  <button
                    onClick={() => handleLoadSample('sadaqat')}
                    className="px-3 py-1.5 rounded-lg border border-amber-300 bg-white dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-slate-700 text-amber-800 dark:text-amber-300 font-bold text-xs shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Sample 2: Annual Welfare Donation (Rs. 100,000)</span>
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
                  <Sparkles className="w-12 h-12 animate-spin" />
                </div>
              </div>

              <div>
                <h4 className="text-lg font-black text-slate-800 dark:text-slate-100">
                  Gemini AI is Analyzing Picture...
                </h4>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
                  Extracting receipt number, donor name, address, city, preferred period, and Shariah fund classification.
                </p>
              </div>

              {imagePreview && (
                <div className="max-w-xs mx-auto rounded-xl overflow-hidden border-2 border-emerald-400 shadow-md">
                  <img src={imagePreview} alt="Receipt Preview" className="w-full h-36 object-cover opacity-80" />
                </div>
              )}
            </div>
          )}

          {/* ==============================================================
              STEP 3: ASK USER TO CONFIRM DATA ("CONFIRMATION STEP")
              ============================================================== */}
          {step === 'confirm' && (
            <div className="space-y-4">
              
              {/* AI Recognition Notification Banner */}
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-200 dark:border-emerald-800 text-xs flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-extrabold text-emerald-900 dark:text-emerald-200">
                    Data Extracted from Picture — Please Confirm:
                  </div>
                  <div className="text-emerald-700 dark:text-emerald-300/90 text-[11px] mt-0.5 leading-relaxed">
                    {aiSummary || 'Please verify the extracted transaction fields below before entering into the spreadsheet.'}
                  </div>
                </div>
                <button
                  onClick={resetAll}
                  className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300 cursor-pointer"
                >
                  Upload Another
                </button>
              </div>

              {/* Two-Column Review Layout: Left (Image) & Right (Form) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                
                {/* Left: Original Receipt Image Preview */}
                <div className="lg:col-span-4 flex flex-col space-y-2">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
                    <span>Uploaded Picture</span>
                  </div>
                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-950 flex-1 flex items-center justify-center p-2 min-h-[220px]">
                    {imagePreview ? (
                      <img 
                        src={imagePreview} 
                        alt="Scanned Receipt" 
                        className="max-h-72 w-full object-contain rounded-lg shadow-xs" 
                      />
                    ) : (
                      <div className="text-xs text-slate-400">No image preview</div>
                    )}
                  </div>
                </div>

                {/* Right: Confirmation Form Fields */}
                <div className="lg:col-span-8 space-y-3">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      <span>Extracted Fields (Editable)</span>
                    </span>
                    <span className="text-[11px] text-emerald-600 font-semibold">
                      Target: Sheet ({activeSheetTabId || 'sheet1'})
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    
                    {/* Receipt No */}
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Receipt No (رسید نمبر)
                      </label>
                      <input
                        type="text"
                        value={formData.receiptNo}
                        onChange={(e) => setFormData({ ...formData, receiptNo: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="e.g. 1"
                      />
                    </div>

                    {/* Date */}
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Date (تاریخ)
                      </label>
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
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
                        value={formData.donorName}
                        onChange={(e) => setFormData({ ...formData, donorName: e.target.value })}
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
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
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
                        list="modal-pakistan-cities"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="e.g. Karachi, Lahore..."
                      />
                      <datalist id="modal-pakistan-cities">
                        <option value="Karachi" />
                        <option value="Lahore" />
                        <option value="Rawalpindi" />
                        <option value="Islamabad" />
                        <option value="Faisalabad" />
                        <option value="Multan" />
                        <option value="Hyderabad" />
                        <option value="Kandiaro" />
                        <option value="Sukkur" />
                        <option value="Peshawar" />
                        <option value="Quetta" />
                      </datalist>
                    </div>

                    {/* Preferred Period */}
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Preferred Period (مدت / میعاد)
                      </label>
                      <select
                        value={formData.preferredPeriod}
                        onChange={(e) => {
                          const p = e.target.value as any;
                          setFormData({
                            ...formData,
                            preferredPeriod: p,
                            monthlyAmount: p === 'Monthly' ? formData.amount : 0,
                            quarterlyAmount: p === 'Quarterly' ? formData.amount : 0,
                            halfYearlyAmount: p === 'Half Yearly' ? formData.amount : 0,
                            annuallyAmount: p === 'Annually' ? formData.amount : 0,
                          });
                        }}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                      >
                        <option value="Monthly">Monthly (ماہانہ)</option>
                        <option value="Quarterly">Quarterly (سہ ماہی)</option>
                        <option value="Half Yearly">Half Yearly (شش ماہی)</option>
                        <option value="Annually">Annually (سالانہ)</option>
                      </select>
                    </div>

                    {/* Total Amount as Period */}
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Total Amount as Period ({orgConfig.currencySymbol}) (کل رقم)
                      </label>
                      <input
                        type="number"
                        value={formData.amount}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setFormData({
                            ...formData,
                            amount: val,
                            monthlyAmount: formData.preferredPeriod === 'Monthly' ? val : formData.monthlyAmount,
                            quarterlyAmount: formData.preferredPeriod === 'Quarterly' ? val : formData.quarterlyAmount,
                            halfYearlyAmount: formData.preferredPeriod === 'Half Yearly' ? val : formData.halfYearlyAmount,
                            annuallyAmount: formData.preferredPeriod === 'Annually' ? val : formData.annuallyAmount,
                          });
                        }}
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
                        value={formData.paymentMode}
                        onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value as any })}
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
                        value={formData.bankName}
                        onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
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
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="0300-1234567"
                      />
                    </div>

                    {/* Fund Category */}
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Fund Category (مد / کھاتہ)
                      </label>
                      <select
                        value={formData.categoryId}
                        onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.nameEnglish} ({c.nameUrdu})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Notes / Remarks */}
                    <div className="sm:col-span-2">
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Notes / Remarks (تفصیل / کیفیات)
                      </label>
                      <input
                        type="text"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
                Transaction Entered Successfully!
              </h4>
              <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
                Receipt #{formData.receiptNo} ({orgConfig.currencySymbol} {formData.amount.toLocaleString()}) has been verified and added into your active working sheet.
              </p>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
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
                Scan Different Picture
              </button>

              <button
                onClick={handleConfirmAndEnter}
                className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Yes, Confirm &amp; Enter into Sheet</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
