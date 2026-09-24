'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const App = dynamic(() => import('@/App'), { ssr: false });

export default function SheetsPage() {
  return <App initialTab="sheets" targetSheetId="sheet1" isDashboardRoute={true} />;
}
