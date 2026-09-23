import React from 'react';
import { Transaction, OrganizationConfig, FundCategory, AppTheme } from '../types/finance';

interface PrintableVoucherProps {
  transaction: Transaction;
  orgConfig: OrganizationConfig;
  categories: FundCategory[];
  theme?: AppTheme;
  id?: string;
  isCompact?: boolean;
}

export const PrintableVoucher: React.FC<PrintableVoucherProps> = ({
  transaction,
  orgConfig,
  categories,
  theme = 'blue',
  id = 'printable-voucher-element',
  isCompact = false,
}) => {
  // Parse date into DD MM YYYY
  const dateObj = new Date(transaction.date || new Date().toISOString().slice(0, 10));
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = String(dateObj.getFullYear());
  const dateDigits = [...day.split(''), ...month.split(''), ...year.split('')];

  // Theme color accents for voucher
  const themeStyles = {
    blue: {
      border: 'border-[#0088cc]',
      accentBg: 'bg-[#0088cc]',
      accentText: 'text-[#0088cc]',
      badgeBg: 'bg-[#0088cc]',
      lightBg: 'bg-[#f0f9ff]',
      boxBorder: 'border-[#0088cc]',
      gradient: 'from-[#0088cc] to-[#006699]',
      glow: 'shadow-[#0088cc]/20',
      stampColor: '#1d4ed8',
    },
    green: {
      border: 'border-[#059669]',
      accentBg: 'bg-[#059669]',
      accentText: 'text-[#059669]',
      badgeBg: 'bg-[#059669]',
      lightBg: 'bg-[#f0fdf4]',
      boxBorder: 'border-[#059669]',
      gradient: 'from-[#059669] to-[#047857]',
      glow: 'shadow-[#059669]/20',
      stampColor: '#047857',
    },
    'black-gold': {
      border: 'border-[#d4af37]',
      accentBg: 'bg-[#d4af37]',
      accentText: 'text-[#d4af37]',
      badgeBg: 'bg-[#242b3d]',
      lightBg: 'bg-[#181f2c]',
      boxBorder: 'border-[#d4af37]',
      gradient: 'from-[#d4af37] to-[#cca43b]',
      glow: 'shadow-[#d4af37]/20',
      stampColor: '#d4af37',
    },
  }[theme];

  // Voucher fund category items
  const voucherFundList = [
    { id: 'zakat', ur: 'زکوٰۃ', en: 'Zakat' },
    { id: 'fitrana', ur: 'فطراۃ', en: 'Fitrana' },
    { id: 'sadaqat', ur: 'صدقات', en: 'Sadaqat' },
    { id: 'khairat', ur: 'خیرات', en: 'Khairat' },
    { id: 'charm_qurbani', ur: 'چرم قربانی', en: 'Charm Qurbani' },
    { id: 'membership', ur: 'ممبر شپ', en: 'Membership' },
    { id: 'madrasa', ur: 'مدرسہ', en: 'Madrasa' },
    { id: 'construction', ur: 'تعمیرات', en: 'Construction' },
  ];

  return (
    <div
      id={id}
      className={`relative w-full max-w-[860px] mx-auto bg-white text-slate-900 border-4 sm:border-8 md:border-[10px] ${themeStyles.border} shadow-xl rounded-sm p-3 sm:p-5 md:p-6 overflow-hidden select-none transition-all print:border-8 print:p-4 print:shadow-none print:max-w-full`}
      style={{
        fontFamily: '"Plus Jakarta Sans", sans-serif',
        background: theme === 'black-gold' ? '#0e1117' : '#ffffff',
        color: theme === 'black-gold' ? '#f8fafc' : '#0f172a',
      }}
    >
      {/* Decorative Border Overlay */}
      <div className="absolute inset-0 pointer-events-none border-2 sm:border-4 border-dashed opacity-20" style={{ borderColor: theme === 'black-gold' ? '#d4af37' : theme === 'green' ? '#059669' : '#0088cc' }} />

      {/* HEADER SECTION */}
      <div className="relative flex flex-col md:flex-row items-center justify-between gap-3 border-b-2 pb-3 mb-3" style={{ borderColor: theme === 'black-gold' ? '#2e384d' : '#bae6fd' }}>
        
        {/* Left / Center: Jamia Titles (English & Arabic) */}
        <div className="flex-1 text-center md:text-left w-full">
          {/* English Header */}
          <h1 
            className="text-lg sm:text-2xl md:text-3xl font-extrabold tracking-wider uppercase drop-shadow-sm text-center md:text-left leading-tight"
            style={{
              color: theme === 'black-gold' ? '#f6d365' : theme === 'green' ? '#047857' : '#0088cc',
              fontFamily: 'Outfit, sans-serif'
            }}
          >
            {orgConfig.nameEnglish || 'Markaz Rooh ul Islam'}
          </h1>

          {/* Arabic Large Title */}
          <h2 
            className="text-2xl sm:text-3xl md:text-4xl font-bold font-arabic-title my-1 text-center leading-tight"
            style={{
              color: theme === 'black-gold' ? '#d4af37' : theme === 'green' ? '#059669' : '#0088cc',
              textShadow: theme === 'black-gold' ? '0 0 10px rgba(212, 175, 55, 0.4)' : '1px 1px 2px rgba(0, 136, 204, 0.3)',
            }}
            dir="rtl"
          >
            {orgConfig.nameUrdu || 'مرکز روح الاسلام'}
          </h2>

          {/* Subheader Banner (Pill) */}
          <div className="flex justify-center my-1">
            <div 
              className={`inline-block px-3 sm:px-6 py-0.5 sm:py-1 rounded-full text-white text-xs sm:text-sm md:text-base font-nastaliq font-semibold shadow-md bg-gradient-to-r ${themeStyles.gradient} text-center max-w-full truncate`}
              dir="rtl"
            >
              {orgConfig.subHeaderUrdu || 'درگاہ اللہ آباد شریف کنڈیارو ضلع نوشہرو فیروز'}
            </div>
          </div>
        </div>

        {/* Right Seal / Emblem */}
        <div className="flex flex-col items-center justify-center p-1">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-28 md:h-28 rounded-full border-2 sm:border-4 border-amber-500/80 p-0.5 sm:p-1 flex items-center justify-center shadow-md bg-gradient-to-br from-amber-50 to-amber-200 text-amber-900">
            <div className="w-full h-full rounded-full border border-dashed border-amber-600 flex flex-col items-center justify-center text-center p-0.5 sm:p-1">
              <span className="text-[7px] sm:text-[9px] md:text-[10px] font-bold uppercase tracking-tighter">الجامعة الغفارية</span>
              <div className="text-xs sm:text-base md:text-xl my-0.5">📖</div>
              <span className="text-[6px] sm:text-[7px] md:text-[8px] font-semibold">ESTD. 1985</span>
              <span className="text-[5px] sm:text-[6px] md:text-[7px] text-amber-800">کندیارو سندھ</span>
            </div>
          </div>
        </div>
      </div>

      {/* RECEIPT NUMBER & DATE ROW */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mb-3 text-xs sm:text-sm md:text-base font-semibold">
        {/* Receipt No */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
          <span className={`italic font-bold text-xs sm:text-sm ${themeStyles.accentText}`}>Receipt No</span>
          <span className="px-2 py-0.5 font-mono font-extrabold tracking-wider border-b-2 border-slate-400 text-xs sm:text-sm">
            {transaction.receiptNo || 'MARKAZI OFFICE/AUG/26/61'}
          </span>
        </div>

        {/* Date with DD MM YYYY Boxes */}
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="text-right">
            <div className="text-[10px] sm:text-xs text-slate-500 font-nastaliq leading-none">تاریخ</div>
            <div className={`font-bold ${themeStyles.accentText} text-xs sm:text-sm`}>Date</div>
          </div>
          <div className="flex items-center gap-0.5 sm:gap-1">
            {dateDigits.map((digit, index) => (
              <React.Fragment key={index}>
                <div 
                  className={`w-5 h-6 sm:w-6 sm:h-7 md:w-7 md:h-8 flex items-center justify-center border font-bold text-xs sm:text-sm md:text-base bg-slate-50 ${themeStyles.boxBorder} rounded-sm shadow-inner`}
                  style={{ background: theme === 'black-gold' ? '#181f2c' : '#f8fafc' }}
                >
                  {digit}
                </div>
                {(index === 1 || index === 3) && <span className="text-slate-400 font-bold px-0.5">/</span>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* FORM FIELDS BODY */}
      <div className="space-y-2 sm:space-y-3.5 text-xs sm:text-sm md:text-base">
        
        {/* Row 1: Received with thanks from / اسم گرامی محترم جناب */}
        <div className="flex flex-col sm:flex-row items-baseline gap-1 sm:gap-2">
          <span className={`italic font-bold text-xs sm:text-sm whitespace-nowrap ${themeStyles.accentText}`}>
            Received with thanks from
          </span>
          <div className="flex-1 border-b border-dashed sm:border-b-2 sm:border-dotted border-slate-400 px-2 py-0.5 font-nastaliq text-sm sm:text-lg font-bold text-center sm:text-right w-full" dir="rtl">
            {transaction.donorNameUrdu || transaction.donorName || (isCompact ? '---' : '')}
          </div>
          <span className="hidden sm:inline text-xs sm:text-sm font-nastaliq font-bold text-slate-600 whitespace-nowrap" dir="rtl">
            اسم گرامی محترم جناب
          </span>
        </div>

        {/* Row 2: Address / مکمل پتہ */}
        <div className="flex flex-col sm:flex-row items-baseline gap-1 sm:gap-2">
          <span className={`italic font-bold text-xs sm:text-sm whitespace-nowrap ${themeStyles.accentText}`}>
            Address
          </span>
          <div className="flex-1 border-b border-dashed sm:border-b-2 sm:border-dotted border-slate-400 px-2 py-0.5 font-nastaliq text-xs sm:text-base text-center sm:text-right w-full" dir="rtl">
            {transaction.address || (isCompact ? '---' : '')}
          </div>
          <span className="hidden sm:inline text-xs sm:text-sm font-nastaliq font-bold text-slate-600 whitespace-nowrap" dir="rtl">
            مکمل پتہ
          </span>
        </div>

        {/* Row 3: Reference / بتوسط */}
        <div className="flex flex-col sm:flex-row items-baseline gap-1 sm:gap-2">
          <span className={`italic font-bold text-xs sm:text-sm whitespace-nowrap ${themeStyles.accentText}`}>
            Reference
          </span>
          <div className="flex-1 border-b border-dashed sm:border-b-2 sm:border-dotted border-slate-400 px-2 py-0.5 font-nastaliq text-xs sm:text-base text-center sm:text-right w-full" dir="rtl">
            {transaction.reference || (isCompact ? '---' : '')}
          </div>
          <span className="hidden sm:inline text-xs sm:text-sm font-nastaliq font-bold text-slate-600 whitespace-nowrap" dir="rtl">
            بتوسط
          </span>
        </div>

        {/* Row 4: Sum of Rupees (Words) & Amount in Numbers Box */}
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
          <div className="flex flex-1 items-baseline gap-2 w-full">
            <span className={`italic font-bold text-xs sm:text-sm whitespace-nowrap ${themeStyles.accentText}`}>
              Sum of Rupees
            </span>
            <div className="flex-1 border-b border-dashed sm:border-b-2 sm:border-dotted border-slate-400 px-2 py-0.5 font-nastaliq text-sm sm:text-lg font-extrabold text-center sm:text-right text-emerald-800" dir="rtl" style={{ color: theme === 'black-gold' ? '#f6d365' : undefined }}>
              {transaction.amountInWordsUrdu || (transaction.amount ? `${transaction.amount} روپے` : '')}
            </div>
          </div>

          {/* Amount Box `=/ 2000` */}
          <div 
            className={`flex items-center justify-center px-3 sm:px-4 py-1 sm:py-1.5 border-2 ${themeStyles.boxBorder} rounded-lg min-w-[120px] sm:min-w-[150px] shadow-sm font-mono font-black text-lg sm:text-2xl`}
            style={{
              background: theme === 'black-gold' ? '#181f2c' : '#f0f9ff',
              color: theme === 'black-gold' ? '#f6d365' : theme === 'green' ? '#047857' : '#0088cc',
            }}
          >
            <span className="mr-1">=/</span>
            <span>{Number(transaction.amount || 0).toLocaleString()}</span>
          </div>
        </div>

        {/* Row 5: Payment Mode, Mobile No, Bank Name */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 sm:pt-2 items-center text-xs">
          
          {/* Payment Mode */}
          <div className="flex items-center gap-1.5">
            <span className={`italic font-bold whitespace-nowrap ${themeStyles.accentText}`}>
              Payment Mode:
            </span>
            <span className="font-semibold border-b border-slate-400 px-1 flex-1 text-center truncate">
              {transaction.paymentMode === 'Online' ? 'Online Account' : (transaction.paymentMode || 'Cash')}
            </span>
          </div>

          {/* Mobile No */}
          <div className="flex items-center gap-1.5">
            <span className={`font-bold ${themeStyles.accentText}`}>Mobile:</span>
            <span className="font-mono border-b border-slate-400 px-1 flex-1 text-center truncate">
              {transaction.phone || orgConfig.phone || ''}
            </span>
          </div>

          {/* Bank Name */}
          <div className="flex items-center gap-1.5">
            <span className={`italic font-bold ${themeStyles.accentText}`}>Bank:</span>
            <span className="font-nastaliq border-b border-slate-400 px-1 flex-1 text-center truncate" dir="rtl">
              {transaction.bankName || (orgConfig.bankAccounts?.[0]?.bankNameUrdu || orgConfig.bankAccounts?.[0]?.bankName || '')}
            </span>
          </div>
        </div>
      </div>

      {/* DUA & STAMP / SIGNATURE ROW */}
      <div className="relative flex flex-col sm:flex-row items-center justify-between mt-3 sm:mt-4 pt-2 border-t border-slate-200 gap-2" style={{ borderColor: theme === 'black-gold' ? '#2e384d' : '#e2e8f0' }}>
        
        {/* Realistic Stamp & Signature Simulation */}
        <div className="relative p-1 sm:p-2 transform -rotate-2 sm:-rotate-3 scale-90 sm:scale-95 opacity-90 select-none">
          <div 
            className="border-2 border-dashed rounded-md p-1 sm:p-1.5 text-[8px] sm:text-[9px] font-black uppercase text-center leading-tight tracking-tighter"
            style={{
              borderColor: themeStyles.stampColor,
              color: themeStyles.stampColor,
            }}
          >
            <div className="font-extrabold">{orgConfig.signatoryName || 'AUTHORIZED SIGNATORY'}</div>
            <div>{orgConfig.signatoryTitle || 'FINANCE OFFICE'}</div>
            <div className="truncate max-w-[150px]">{orgConfig.subHeaderEnglish || orgConfig.locationEnglish || ''}</div>
            <div>PH# {orgConfig.phone || ''}</div>
            
            {/* Signature stroke */}
            <div className="text-xs sm:text-base font-serif italic my-0.5 font-extrabold tracking-widest" style={{ color: themeStyles.stampColor }}>
              ✍ {orgConfig.signatoryName ? orgConfig.signatoryName.split(' ')[0] : 'Authorized'}
            </div>
          </div>
        </div>

        {/* Islamic Dua */}
        <div className="flex-1 text-center px-2 sm:px-4 py-1" dir="rtl">
          <p 
            className="font-arabic-title text-sm sm:text-base md:text-lg font-bold tracking-wide"
            style={{
              color: theme === 'black-gold' ? '#d4af37' : theme === 'green' ? '#047857' : '#0088cc',
            }}
          >
            {orgConfig.duaUrdu || 'جَزَاكُمُ اللَّهُ خَيْرًا كَثِيرًا وَأَجْرًا كَبِيرًا وَأَحْسَنَ الْجَزَاءَ فِي الدُّنْيَا وَالْآخِرَةِ'}
          </p>
          <span className="text-[9px] sm:text-[10px] text-slate-400 font-sans italic">
            Official Electronic Record Voucher
          </span>
        </div>
      </div>

      {/* BOTTOM FUND CATEGORY BADGES / PILLS (Dynamic from Categories) */}
      <div className="mt-3 sm:mt-4 pt-2 sm:pt-3 border-t-2 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-1 sm:gap-1.5" style={{ borderColor: theme === 'black-gold' ? '#2e384d' : '#0088cc' }}>
        {(categories && categories.length > 0 ? categories.slice(0, 8) : voucherFundList).map((fund: any) => {
          const isSelected = transaction.categoryId === fund.id;
          const fundName = fund.nameUrdu || fund.ur || fund.nameEnglish || fund.en;
          return (
            <div
              key={fund.id}
              className={`relative flex items-center justify-between px-1.5 sm:px-2 py-1 sm:py-1.5 rounded border text-[11px] sm:text-xs transition-all font-nastaliq font-bold ${
                isSelected
                  ? `${themeStyles.accentBg} text-white shadow-md scale-105`
                  : `border-slate-300 text-slate-700 hover:border-slate-400 ${theme === 'black-gold' ? 'text-slate-300 border-slate-700' : 'bg-slate-50'}`
              }`}
              dir="rtl"
            >
              <span className="truncate">{fundName}</span>
              {/* Radio checkmark circle */}
              <div 
                className={`w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full border flex items-center justify-center ml-1 ${
                  isSelected ? 'border-white bg-white' : 'border-slate-400 bg-white'
                }`}
              >
                {isSelected && (
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-slate-900" />
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
