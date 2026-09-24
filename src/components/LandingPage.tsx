'use client';

import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { ArrowRight, ShieldCheck, Database, FileSpreadsheet, Sparkles } from 'lucide-react';

/* ==========================================================================
   SACRED QURANIC AYAT BANNER (EMERALD & GOLD LUXURY COMPONENT)
   ========================================================================== */
export const AyatBanner: React.FC = () => {
  return (
    <div className="relative w-full max-w-xl mx-auto rounded-3xl border border-amber-400/70 shadow-[0_15px_35px_rgba(6,78,59,0.3),inset_0_0_30px_rgba(16,185,129,0.15)] overflow-hidden transition-all duration-300 hover:scale-[1.01] bg-gradient-to-br from-emerald-950 via-[#032e23] to-[#011c15] p-5 sm:p-6 text-white group">
      
      {/* Intricate Islamic Geometric Background Pattern */}
      <div 
        className="absolute inset-0 opacity-15 pointer-events-none transition-opacity group-hover:opacity-25"
        style={{
          backgroundImage: `radial-gradient(circle at center, #f59e0b 1px, transparent 1px),
                            radial-gradient(circle at 0% 0%, #10b981 1.5px, transparent 1.5px)`,
          backgroundSize: '24px 24px'
        }}
      />

      {/* Decorative Golden Corner Filigree (SVG) */}
      <div className="absolute top-2 left-2 w-7 h-7 sm:w-8 sm:h-8 text-amber-400 opacity-90 pointer-events-none">
        <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
          <path d="M2 38 V12 C2 6 6 2 12 2 H38" stroke="currentColor" strokeWidth="2.5" />
          <circle cx="12" cy="12" r="3.5" fill="currentColor" />
          <path d="M2 18 C8 18 14 12 14 6" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </div>
      <div className="absolute top-2 right-2 w-7 h-7 sm:w-8 sm:h-8 text-amber-400 opacity-90 pointer-events-none scale-x-[-1]">
        <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
          <path d="M2 38 V12 C2 6 6 2 12 2 H38" stroke="currentColor" strokeWidth="2.5" />
          <circle cx="12" cy="12" r="3.5" fill="currentColor" />
          <path d="M2 18 C8 18 14 12 14 6" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </div>
      <div className="absolute bottom-2 left-2 w-7 h-7 sm:w-8 sm:h-8 text-amber-400 opacity-90 pointer-events-none scale-y-[-1]">
        <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
          <path d="M2 38 V12 C2 6 6 2 12 2 H38" stroke="currentColor" strokeWidth="2.5" />
          <circle cx="12" cy="12" r="3.5" fill="currentColor" />
          <path d="M2 18 C8 18 14 12 14 6" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </div>
      <div className="absolute bottom-2 right-2 w-7 h-7 sm:w-8 sm:h-8 text-amber-400 opacity-90 pointer-events-none scale-[-1]">
        <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
          <path d="M2 38 V12 C2 6 6 2 12 2 H38" stroke="currentColor" strokeWidth="2.5" />
          <circle cx="12" cy="12" r="3.5" fill="currentColor" />
          <path d="M2 18 C8 18 14 12 14 6" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </div>

      <div className="relative z-10 flex flex-col items-center text-center space-y-2 px-2 sm:px-4">
        
        {/* 1. Bismillah Calligraphy */}
        <div className="font-arabic text-2xl sm:text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-300 to-amber-100 tracking-wider select-none dir-rtl drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </div>

        {/* Delicate Golden Divider */}
        <div className="flex items-center justify-center gap-3 w-full my-0.5 opacity-90">
          <span className="h-[1px] w-12 sm:w-24 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
          <span className="text-xs text-amber-300">✦</span>
          <span className="h-[1px] w-12 sm:w-24 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
        </div>

        {/* 2. Sacred Quranic Verse: Surah Hud 88 */}
        <div className="font-arabic text-lg sm:text-2xl md:text-3xl font-bold text-emerald-50 leading-relaxed select-none dir-rtl drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]">
          إِنْ أُرِيدُ إِلَّا الْإِصْلَاحَ مَا اسْتَطَعْتُ ۚ وَمَا تَوْفِيقِي إِلَّا بِاللَّهِ
        </div>

        {/* 3. English Meaning & Reference */}
        <div className="text-[11px] sm:text-xs text-amber-200/80 font-medium italic tracking-wide pt-1 border-t border-emerald-800/40 w-full">
          "I only intend reform to the best of my ability; and my success is only by Allah" (Surah Hud 88)
        </div>

      </div>
    </div>
  );
};

export const LandingPage: React.FC = () => {
  const { setActiveTab } = useFinance();

  return (
    <div className="relative py-4 sm:py-8 md:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full transition-colors duration-200">
      
      {/* 
        ========================================================================
        IMMERSIVE ISLAMIC ARABESQUE GOLDEN-CREAM BACKGROUND
        ========================================================================
      */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.065] -z-10"
        style={{
          backgroundImage: `
            radial-gradient(circle at center, #b48325 2px, transparent 2px),
            linear-gradient(45deg, transparent 46%, #b48325 48%, #b48325 52%, transparent 54%),
            linear-gradient(-45deg, transparent 46%, #b48325 48%, #b48325 52%, transparent 54%)
          `,
          backgroundSize: '44px 44px'
        }}
      />

      {/* Warm Golden Cream Radial Glow Highlights */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-r from-amber-200/30 via-yellow-100/40 to-amber-200/30 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-12 right-10 w-96 h-96 bg-emerald-700/5 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Traditional Ornate Islamic Arch Vectors (Gold Accent) */}
      <div className="absolute top-0 left-0 w-32 h-32 pointer-events-none opacity-20 hidden md:block">
        <svg viewBox="0 0 120 120" fill="none" className="w-full h-full text-amber-700">
          <path d="M0 0 H120 V20 C60 20 20 60 20 120 H0 Z" fill="currentColor" opacity="0.15" />
          <path d="M10 10 H110 V20 C55 20 20 55 20 110 H10 Z" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="35" cy="35" r="4" fill="currentColor" />
        </svg>
      </div>
      <div className="absolute top-0 right-0 w-32 h-32 pointer-events-none opacity-20 hidden md:block scale-x-[-1]">
        <svg viewBox="0 0 120 120" fill="none" className="w-full h-full text-amber-700">
          <path d="M0 0 H120 V20 C60 20 20 60 20 120 H0 Z" fill="currentColor" opacity="0.15" />
          <path d="M10 10 H110 V20 C55 20 20 55 20 110 H10 Z" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="35" cy="35" r="4" fill="currentColor" />
        </svg>
      </div>

      {/* 
        ========================================================================
        HERO SECTION: REFINED LUXURY COMPOSITION
        ========================================================================
      */}
      <section className="relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* LEFT COLUMN: Ayat Component, Brand Identity, Text, CTA */}
          <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6 order-1">
            
            {/* 1. Green & Gold Ayat Banner */}
            <AyatBanner />

            {/* 2. Brand Identity: CENTERED ARABIC + CRISP ENGLISH */}
            <div className="space-y-2 pt-1 w-full text-center">
              
              {/* Centered Arabic Title */}
              <div className="relative inline-block mx-auto">
                <h1 className="font-arabic text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-emerald-950 dark:text-emerald-300 leading-tight tracking-normal">
                  مرکز روح الاسلام
                </h1>
                <div className="h-1 w-24 sm:w-32 mx-auto mt-2 rounded-full bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
              </div>

              {/* English Name */}
              <h2 className="text-xs sm:text-sm md:text-base font-extrabold tracking-[0.2em] text-emerald-700 dark:text-emerald-400 uppercase pt-1">
                MARKAZ ROOH UL ISLAM
              </h2>
            </div>

            {/* 3. Subheading */}
            <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug w-full text-center lg:text-left">
              Complete Fund and Accounts Management.
            </h3>

            {/* 4. Description Paragraph */}
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 font-normal leading-relaxed max-w-xl w-full text-center lg:text-left">
              Centralized and transparent accounting for Markaz Rooh ul Islam. Manage funds, calculate donations, and track records efficiently, under the spiritual guidance of Hazrat Tahir Mehboob Sajjan Saeen.
            </p>

            {/* 5. Trust / Shariah Indicators with Golden-Cream Luxury Badges */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-1 text-xs text-emerald-950 font-semibold">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-50 to-amber-100/80 border border-amber-300/80 shadow-xs text-amber-900 font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                Shariah-Compliant Funds
              </span>
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-50 to-amber-100/80 border border-amber-300/80 shadow-xs text-amber-900 font-bold">
                <Sparkles className="w-4 h-4 text-amber-600" />
                Instant Voucher Studio
              </span>
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-50 to-amber-100/80 border border-amber-300/80 shadow-xs text-amber-900 font-bold">
                <Database className="w-4 h-4 text-emerald-700" />
                Cloud Database Sync
              </span>
            </div>

            {/* 6. Call-To-Action Button: ONLY Get Started in better colors */}
            <div className="pt-2 sm:pt-4 w-full flex justify-center lg:justify-start">
              <button
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.location.href = '/dashboard';
                  } else {
                    setActiveTab('sheets');
                  }
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3.5 px-9 py-4 sm:px-11 sm:py-4.5 rounded-2xl font-black text-base sm:text-lg text-emerald-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-[0_10px_30px_rgba(245,158,11,0.35)] hover:shadow-[0_15px_35px_rgba(245,158,11,0.45)] transition-all duration-300 hover:scale-[1.04] active:scale-95 cursor-pointer border-2 border-amber-200/80 ring-4 ring-amber-400/20"
                title="Launch Financial Portal & Sheets"
              >
                <span>Get Started</span>
                <ArrowRight className="w-5 h-5 text-emerald-950 stroke-[3]" />
              </button>
            </div>

          </div>

          {/* RIGHT COLUMN: Official Photograph of Hazrat Tahir Mehboob Sajjan Saeen in LUXURY GREEN & GOLD FRAME */}
          <div className="lg:col-span-5 flex justify-center order-2 w-full">
            <div className="relative group w-full max-w-xs sm:max-w-sm md:max-w-md rounded-3xl overflow-hidden border-2 border-amber-400 shadow-2xl bg-gradient-to-b from-emerald-900 via-emerald-950 to-[#02241b] p-3.5 sm:p-4 transition-all duration-500 hover:shadow-[0_25px_50px_rgba(6,78,59,0.4)]">
              
              {/* Subtle Glowing Islamic Background Watermark */}
              <div 
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                  backgroundImage: `radial-gradient(circle at center, #fbbf24 1.5px, transparent 1.5px)`,
                  backgroundSize: '18px 18px'
                }}
              />

              {/* Ornate Corner Accents for Huzoor Component */}
              <div className="absolute top-2 left-2 w-6 h-6 text-amber-400 opacity-90 pointer-events-none">
                <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
                  <path d="M2 22 V6 C2 3.8 3.8 2 6 2 H22" stroke="currentColor" strokeWidth="2.5" />
                  <circle cx="6" cy="6" r="2" fill="currentColor" />
                </svg>
              </div>
              <div className="absolute top-2 right-2 w-6 h-6 text-amber-400 opacity-90 pointer-events-none scale-x-[-1]">
                <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
                  <path d="M2 22 V6 C2 3.8 3.8 2 6 2 H22" stroke="currentColor" strokeWidth="2.5" />
                  <circle cx="6" cy="6" r="2" fill="currentColor" />
                </svg>
              </div>
              <div className="absolute bottom-2 left-2 w-6 h-6 text-amber-400 opacity-90 pointer-events-none scale-y-[-1]">
                <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
                  <path d="M2 22 V6 C2 3.8 3.8 2 6 2 H22" stroke="currentColor" strokeWidth="2.5" />
                  <circle cx="6" cy="6" r="2" fill="currentColor" />
                </svg>
              </div>
              <div className="absolute bottom-2 right-2 w-6 h-6 text-amber-400 opacity-90 pointer-events-none scale-[-1]">
                <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
                  <path d="M2 22 V6 C2 3.8 3.8 2 6 2 H22" stroke="currentColor" strokeWidth="2.5" />
                  <circle cx="6" cy="6" r="2" fill="currentColor" />
                </svg>
              </div>

              {/* Photo Frame with Emerald & Golden Border Accent */}
              <div className="relative overflow-hidden rounded-2xl bg-emerald-950 shadow-inner border border-amber-400/50">
                <img 
                  src="/hazrat-sajjan-saeen.png" 
                  alt="Hazrat Tahir Mehboob Sajjan Saeen" 
                  className="w-full h-auto max-h-[460px] sm:max-h-[520px] object-cover object-top rounded-2xl block mx-auto transition-transform duration-700 group-hover:scale-[1.03]" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/80 via-transparent to-transparent opacity-40 pointer-events-none" />
              </div>

              {/* Dignified Caption Plaque: NOTICEABLY BIGGER & ILLUMINATED */}
              <div className="mt-3.5 px-4 py-3.5 sm:px-5 sm:py-4 rounded-2xl bg-emerald-950/95 border border-amber-400/60 text-center shadow-xl backdrop-blur-md">
                {/* English Name */}
                <div className="text-base sm:text-lg md:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-300 to-amber-100 tracking-tight leading-tight drop-shadow-xs">
                  Hazrat Tahir Mehboob Sajjan Saeen
                </div>
                {/* Urdu Honorific & Title */}
                <div className="font-arabic text-sm sm:text-base md:text-lg text-emerald-100 font-bold dir-rtl mt-1.5 leading-normal drop-shadow-xs">
                  حفظہ اللہ تعالی و مدظلہ العالی • سرپرستِ اعلیٰ
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

    </div>
  );
};

export default LandingPage;
