'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';

const App = dynamic(() => import('@/App'), { ssr: false });

export default function SheetsDynamicPage() {
  const params = useParams();
  const sheetId = (params?.id as string) || 'sheet1';

  return <App initialTab="sheets" targetSheetId={sheetId} isDashboardRoute={true} />;
}
